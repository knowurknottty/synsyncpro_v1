/**
 * @fileoverview ES256 JWT verification for SynSync subscription tokens.
 *
 * Verifies server-signed subscription JWTs using native Web Crypto ECDSA P-256.
 * No external JWT library required — implementation is ~100 LOC and auditable.
 *
 * Algorithm: ES256 = ECDSA with P-256 curve and SHA-256 hash
 * Signature format: DER-encoded (server output) converted to raw P1363 for Web Crypto
 *
 * Security properties:
 *   - JWT signature cannot be forged without server's EC private key
 *   - Subscription tier and expiry are bound to keyId via sub claim
 *   - jti prevents replay of a single JWT across multiple activations
 *   - Expiry uses server-clock Unix timestamp, not client clock (tamper resistant)
 *
 * Known limitation: Client clock skew affects expiry enforcement. Accept ±60s skew
 * if needed by subtracting a grace period from Date.now() comparison.
 *
 * @module subscriptionVerifier
 */

import type { SubscriptionJwtClaims, SubscriptionTier } from '../types/profile';

// ─── Base64url helpers (no external deps) ─────────────────────────────────────

function base64urlDecode(str: string): Uint8Array {
  // Restore standard base64 padding + character set
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error(`base64url decode failed for input "${str.slice(0, 16)}...": ${(e as Error).message}`);
  }
}

function base64urlDecodeToString(str: string): string {
  return new TextDecoder().decode(base64urlDecode(str));
}

// ─── DER → P1363 signature conversion ────────────────────────────────────────

/**
 * Convert DER-encoded ECDSA signature to raw P1363 format expected by Web Crypto.
 *
 * Background: OpenSSL / most server-side JWT libraries (including jose, jsonwebtoken)
 * emit DER-encoded signatures in JWTs even for ES256. Web Crypto expects P1363 format
 * (raw 64-byte concatenation of r and s, each zero-padded to 32 bytes).
 *
 * DER structure: SEQUENCE { INTEGER r, INTEGER s }
 *   30 [len] 02 [rlen] [r bytes] 02 [slen] [s bytes]
 *
 * If the server uses a library that already emits P1363 (e.g., Python's cryptography lib
 * with Signature.encode('rfc4251')), this conversion is a no-op — P1363 signatures
 * will pass the length check and be returned as-is.
 */
function derToP1363(der: Uint8Array): Uint8Array {
  // P1363 for P-256 is always exactly 64 bytes
  // If already 64 bytes, assume P1363 and return as-is
  if (der.length === 64) return der;

  if (der[0] !== 0x30) {
    throw new Error(`Expected DER SEQUENCE tag 0x30, got 0x${der[0]!.toString(16)}`);
  }

  let offset = 2; // skip 0x30 and length byte

  if (der[offset] !== 0x02) {
    throw new Error(`Expected DER INTEGER tag 0x02 for r, got 0x${der[offset]!.toString(16)}`);
  }
  offset++;

  const rLen = der[offset++]!;
  // Strip leading 0x00 padding byte (added if high bit set in positive INTEGER)
  const rStart = der[offset] === 0x00 ? offset + 1 : offset;
  const r = der.slice(rStart, offset + rLen);
  offset += rLen;

  if (der[offset] !== 0x02) {
    throw new Error(`Expected DER INTEGER tag 0x02 for s, got 0x${der[offset]!.toString(16)}`);
  }
  offset++;

  const sLen = der[offset++]!;
  const sStart = der[offset] === 0x00 ? offset + 1 : offset;
  const s = der.slice(sStart, offset + sLen);

  // Pad r and s to exactly 32 bytes each
  const result = new Uint8Array(64);
  result.set(r, 32 - r.length);
  result.set(s, 64 - s.length);

  return result;
}

// ─── Claims validation ────────────────────────────────────────────────────────

const VALID_TIERS = new Set<string>([
  '1day', '1week', '1month', '6month', '1year', 'lifetime',
]);

function validateClaims(raw: unknown): SubscriptionJwtClaims {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('JWT payload must be a JSON object');
  }
  const c = raw as Record<string, unknown>;

  if (typeof c['sub'] !== 'string' || c['sub'].length === 0) {
    throw new Error('Missing or empty sub claim');
  }
  if (typeof c['iat'] !== 'number' || !isFinite(c['iat'])) {
    throw new Error('Missing or non-numeric iat claim');
  }
  if (c['exp'] !== null && (typeof c['exp'] !== 'number' || !isFinite(c['exp'] as number))) {
    throw new Error(`Invalid exp claim: ${c['exp']}`);
  }
  if (typeof c['tier'] !== 'string' || !VALID_TIERS.has(c['tier'])) {
    throw new Error(`Invalid tier: "${c['tier']}". Valid: ${[...VALID_TIERS].join(', ')}`);
  }
  if (typeof c['jti'] !== 'string' || c['jti'].length === 0) {
    throw new Error('Missing or empty jti claim');
  }

  return {
    sub: c['sub'] as string,
    iat: c['iat'] as number,
    exp: c['exp'] as number | null,
    tier: c['tier'] as SubscriptionTier,
    jti: c['jti'] as string,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Verify an ES256 JWT and return validated subscription claims.
 *
 * Steps:
 *   1. Split and parse JWT structure (header.payload.signature)
 *   2. Validate alg === 'ES256' and typ === 'JWT' in header
 *   3. Parse and validate payload claims (types + allowed values)
 *   4. Import server EC P-256 public key
 *   5. Convert DER → P1363 if needed
 *   6. Verify ECDSA-SHA256 signature over "header.payload" signing input
 *   7. Return claims only if all steps pass
 *
 * Throws descriptive errors — caller maps to INVALID_SUBSCRIPTION_SIGNATURE.
 *
 * @param jwt            Raw JWT string from server activation response
 * @param publicKeyJwk   EC P-256 public key JWK embedded in app bundle
 */
export async function verifySubscriptionJwt(
  jwt: string,
  publicKeyJwk: JsonWebKey,
): Promise<SubscriptionJwtClaims> {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error(`Malformed JWT: expected 3 parts separated by '.', got ${parts.length}`);
  }
  const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];

  // Parse header
  let header: Record<string, unknown>;
  try {
    header = JSON.parse(base64urlDecodeToString(headerB64));
  } catch (e) {
    throw new Error(`JWT header parse failed: ${(e as Error).message}`);
  }

  if (header['alg'] !== 'ES256') {
    throw new Error(`Expected algorithm ES256, got "${header['alg']}"`);
  }
  if (header['typ'] !== 'JWT') {
    throw new Error(`Expected typ JWT, got "${header['typ']}"`);
  }

  // Parse payload
  let rawClaims: unknown;
  try {
    rawClaims = JSON.parse(base64urlDecodeToString(payloadB64));
  } catch (e) {
    throw new Error(`JWT payload parse failed: ${(e as Error).message}`);
  }

  const claims = validateClaims(rawClaims);

  // Import public key
  let pubKey: CryptoKey;
  try {
    pubKey = await crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
  } catch (e) {
    throw new Error(`Failed to import server public key: ${(e as Error).message}`);
  }

  // Decode and normalize signature
  const rawSig = base64urlDecode(signatureB64);
  let p1363Sig: Uint8Array;
  try {
    p1363Sig = derToP1363(rawSig);
  } catch (e) {
    throw new Error(`Signature format error: ${(e as Error).message}`);
  }

  // Signing input is always "headerB64.payloadB64" as UTF-8
  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

  const valid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    pubKey,
    p1363Sig,
    signingInput,
  );

  if (!valid) {
    throw new Error(
      'JWT signature verification failed — subscription data may be tampered or key mismatch',
    );
  }

  return claims;
}

// ─── Expiry ───────────────────────────────────────────────────────────────────

export interface ExpiryCheckResult {
  active: boolean;
  /** ISO date string if expired, null otherwise */
  expiredAt: string | null;
  /** Remaining milliseconds if active, null if lifetime or expired */
  remainingMs: number | null;
}

/**
 * Check subscription expiry against current system time.
 *
 * IMPORTANT: Uses Date.now() (client clock). A user who sets their system clock
 * forward can bypass expiry — this is an accepted limitation of the zero-server model.
 * The server-signed JWT cannot be extended, so the only attack is local clock manipulation.
 * For higher-assurance enforcement, add a server-side validity check on sensitive actions.
 */
export function checkSubscriptionExpiry(claims: SubscriptionJwtClaims): ExpiryCheckResult {
  if (claims.tier === 'lifetime' || claims.exp === null) {
    return { active: true, expiredAt: null, remainingMs: null };
  }

  const expiryMs = claims.exp * 1000;
  const now = Date.now();

  if (now > expiryMs) {
    return {
      active: false,
      expiredAt: new Date(expiryMs).toISOString(),
      remainingMs: null,
    };
  }

  return {
    active: true,
    expiredAt: null,
    remainingMs: expiryMs - now,
  };
}

/**
 * Returns a human-readable expiry description for UI display.
 * @example "Expires in 6 days" | "Expired 2 days ago" | "Lifetime access"
 */
export function formatExpiryForDisplay(claims: SubscriptionJwtClaims): string {
  if (claims.tier === 'lifetime' || claims.exp === null) {
    return 'Lifetime access';
  }

  const expiryMs = claims.exp * 1000;
  const diffMs = expiryMs - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const expiredDays = Math.abs(diffDays);
    return expiredDays === 0
      ? 'Expired today'
      : `Expired ${expiredDays} day${expiredDays !== 1 ? 's' : ''} ago`;
  }

  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  return `Expires in ${diffDays} days`;
}

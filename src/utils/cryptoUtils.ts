/**
 * @fileoverview Cryptographic primitives for SynSync profile encryption.
 *
 * All operations use native Web Crypto API — zero external dependencies.
 *
 * File binary layout (all offsets from byte 0):
 *   Offset  Size  Field
 *   0       4     Magic bytes: 0x53 0x59 0x4E 0x43 ("SYNC")
 *   4       1     File version: 0x01
 *   5       32    userSecret (plaintext — file possession IS the credential)
 *   37      16    HKDF salt (random per write)
 *   53      12    AES-GCM IV (random per write)
 *   65      var   AES-GCM ciphertext + 16-byte GCM auth tag
 *
 * Why userSecret is plaintext in the header:
 *   OPFS is origin-private; no cross-origin read access is possible at the
 *   browser level. Physical device access grants OPFS access regardless of
 *   encryption — the credential model is file possession, not password knowledge.
 *   The GCM auth tag provides tamper detection for the ciphertext.
 *   The server-signed JWT provides subscription tamper protection independent
 *   of the file encryption layer.
 *
 * Key derivation:
 *   baseKey  = HKDF(secret=userSecret, hash=SHA-256)
 *   aesKey   = baseKey.deriveKey(salt, info="SynSync-Profile-v1") → AES-GCM-256
 *
 * HKDF is used (not PBKDF2) because userSecret is already uniformly random
 * (server-generated CSPRNG output). PBKDF2's iteration cost is irrelevant
 * when the input has full 256-bit entropy.
 */

export const FILE_MAGIC = new Uint8Array([0x53, 0x59, 0x4e, 0x43]); // "SYNC"
export const FILE_VERSION = 0x01;
export const USER_SECRET_BYTES = 32;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const GCM_TAG_BYTES = 16;
export const HEADER_SIZE = FILE_MAGIC.length + 1 + USER_SECRET_BYTES + SALT_BYTES + IV_BYTES; // 65B

/** HKDF info string — changing this invalidates all existing files */
const HKDF_INFO = new TextEncoder().encode('SynSync-Profile-v1');

// ─── Key Derivation ───────────────────────────────────────────────────────────

/**
 * Derives AES-GCM-256 key from userSecret via HKDF-SHA-256.
 * Key is non-extractable — cannot be serialized out of the crypto subsystem.
 *
 * @param userSecret  32-byte server-issued random secret
 * @param salt        16-byte random salt (stored in file header, per-write)
 */
export async function deriveEncryptionKey(
  userSecret: Uint8Array,
  salt: Uint8Array,
): Promise<CryptoKey> {
  if (userSecret.length !== USER_SECRET_BYTES) {
    throw new Error(`userSecret must be ${USER_SECRET_BYTES} bytes, got ${userSecret.length}`);
  }
  if (salt.length !== SALT_BYTES) {
    throw new Error(`salt must be ${SALT_BYTES} bytes, got ${salt.length}`);
  }

  const baseKey = await crypto.subtle.importKey(
    'raw',
    userSecret,
    { name: 'HKDF' },
    false, // non-extractable
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: HKDF_INFO,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt'],
  );
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

/**
 * AES-GCM-256 encryption.
 * Returns ciphertext with 16-byte auth tag appended by the Web Crypto implementation.
 * IV must be unique per encryption operation — caller provides fresh random IV.
 *
 * @throws DOMException if key is wrong type or IV is reused (undetectable by API)
 */
export async function encryptPayload(
  key: CryptoKey,
  iv: Uint8Array,
  plaintext: Uint8Array,
): Promise<Uint8Array> {
  if (iv.length !== IV_BYTES) {
    throw new Error(`AES-GCM IV must be ${IV_BYTES} bytes`);
  }
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    plaintext,
  );
  return new Uint8Array(ciphertext);
}

/**
 * AES-GCM-256 decryption.
 * Throws if auth tag validation fails — this is the tamper detection mechanism.
 * Failure modes: wrong key, corrupted ciphertext, modified auth tag.
 *
 * @throws DOMException with name 'OperationError' on auth failure
 */
export async function decryptPayload(
  key: CryptoKey,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Promise<Uint8Array> {
  if (ciphertext.length <= GCM_TAG_BYTES) {
    throw new Error('Ciphertext too short — truncated or empty');
  }
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}

// ─── File Serialization ───────────────────────────────────────────────────────

/**
 * Serialize a profile object + userSecret into the binary file format.
 *
 * Generates fresh salt + IV on every call — this means:
 * 1. Re-encrypting the same profile produces a different ciphertext each time (semantic security)
 * 2. Even if IV is somehow predictable, salt rotation prevents key reuse
 *
 * @param userSecret  32-byte secret (from server activation response)
 * @param profile     Arbitrary JSON-serializable object
 * @returns           Binary blob ready for OPFS/IndexedDB storage
 */
export async function serializeProfileFile(
  userSecret: Uint8Array,
  profile: unknown,
): Promise<Uint8Array> {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(iv);

  const key = await deriveEncryptionKey(userSecret, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(profile));
  const ciphertext = await encryptPayload(key, iv, plaintext);

  const out = new Uint8Array(HEADER_SIZE + ciphertext.length);
  let offset = 0;

  out.set(FILE_MAGIC, offset);
  offset += FILE_MAGIC.length;

  out[offset++] = FILE_VERSION;

  out.set(userSecret, offset);
  offset += USER_SECRET_BYTES;

  out.set(salt, offset);
  offset += SALT_BYTES;

  out.set(iv, offset);
  offset += IV_BYTES;

  out.set(ciphertext, offset);

  return out;
}

export interface DeserializedFile {
  userSecret: Uint8Array;
  profile: unknown;
}

/**
 * Deserialize + decrypt a binary profile file.
 *
 * Failure taxonomy (thrown as Error, caller maps to ProfileError):
 *   - 'Invalid file magic'       → INVALID_FILE_FORMAT
 *   - 'Unsupported version'      → INVALID_FILE_FORMAT
 *   - 'File too small'           → INVALID_FILE_FORMAT
 *   - 'Decryption failed'        → TAMPERED (GCM auth tag failure)
 *   - 'JSON parse failed'        → DECRYPT_FAILED (key mismatch produced garbage)
 */
export async function deserializeProfileFile(
  fileBytes: Uint8Array,
): Promise<DeserializedFile> {
  // Minimum viable file: header + at least 1 byte ciphertext + 16 byte GCM tag
  if (fileBytes.length < HEADER_SIZE + GCM_TAG_BYTES + 1) {
    throw new Error(
      `File too small: ${fileBytes.length}B, minimum ${HEADER_SIZE + GCM_TAG_BYTES + 1}B`,
    );
  }

  // Magic validation
  for (let i = 0; i < FILE_MAGIC.length; i++) {
    if (fileBytes[i] !== FILE_MAGIC[i]) {
      throw new Error(
        `Invalid file magic at byte ${i}: expected 0x${FILE_MAGIC[i]!.toString(16)}, ` +
        `got 0x${fileBytes[i]!.toString(16)}. Not a SynSync profile file.`,
      );
    }
  }

  const version = fileBytes[4]!;
  if (version !== FILE_VERSION) {
    throw new Error(
      `Unsupported profile file version: 0x${version.toString(16)}. ` +
      `Expected 0x${FILE_VERSION.toString(16)}. App may need update.`,
    );
  }

  let offset = 5;

  const userSecret = fileBytes.slice(offset, offset + USER_SECRET_BYTES);
  offset += USER_SECRET_BYTES;

  const salt = fileBytes.slice(offset, offset + SALT_BYTES);
  offset += SALT_BYTES;

  const iv = fileBytes.slice(offset, offset + IV_BYTES);
  offset += IV_BYTES;

  const ciphertext = fileBytes.slice(offset);

  const key = await deriveEncryptionKey(userSecret, salt);

  let plaintext: Uint8Array;
  try {
    plaintext = await decryptPayload(key, iv, ciphertext);
  } catch (e) {
    throw new Error(
      `Decryption failed — file may be corrupted or tampered: ${(e as Error).message}`,
    );
  }

  let profile: unknown;
  try {
    profile = JSON.parse(new TextDecoder().decode(plaintext));
  } catch (e) {
    throw new Error(
      `Profile JSON parse failed after decryption — key mismatch or malformed payload: ${(e as Error).message}`,
    );
  }

  return { userSecret, profile };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export async function generateUserSecret(): Promise<Uint8Array> {
  const secret = new Uint8Array(USER_SECRET_BYTES);
  crypto.getRandomValues(secret);
  return secret;
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length !== USER_SECRET_BYTES * 2) {
    throw new Error(`Expected ${USER_SECRET_BYTES * 2} hex chars, got ${hex.length}`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (isNaN(byte)) throw new Error(`Invalid hex at position ${i * 2}`);
    bytes[i] = byte;
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Timing-safe comparison for Uint8Array equality.
 * Prevents timing attacks when comparing HMACs or secrets.
 * Always iterates all bytes regardless of early mismatch.
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

/**
 * Quick pre-flight checksum validation for activation key files.
 * Computes SHA-256 of "${keyId}:${tier}:${issuedAt}" and compares to embedded checksum.
 * NOT a security boundary — server performs authoritative validation.
 *
 * @returns true if checksum matches
 */
export async function validateActivationChecksum(
  keyId: string,
  tier: string,
  issuedAt: string,
  expectedChecksum: string,
): Promise<boolean> {
  const data = new TextEncoder().encode(`${keyId}:${tier}:${issuedAt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const actualHex = bytesToHex(new Uint8Array(hashBuffer));
  return actualHex === expectedChecksum.toLowerCase();
}

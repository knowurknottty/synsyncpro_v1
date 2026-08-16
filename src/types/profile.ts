/**
 * @fileoverview SynSync Pro — Profile System Type Definitions
 *
 * Security model:
 *   - File possession = access credential (no password required)
 *   - Subscription integrity via server-signed ES256 JWT (tamper-proof by cryptographic guarantee)
 *   - At-rest encryption via AES-GCM 256-bit (tamper-detectable via auth tag)
 *   - Zero-server storage: all data in OPFS (primary) or IndexedDB (fallback)
 *
 * Binary file layout:
 *   [MAGIC: 4B "SYNC"][VERSION: 1B][USER_SECRET: 32B][SALT: 16B][IV: 12B][AES-GCM ciphertext+tag]
 *
 * Key derivation:
 *   masterKey = HKDF(userSecret, salt, info="SynSync-Profile-v1", SHA-256, 256-bit)
 */

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionTier =
  | '1day'
  | '1week'
  | '1month'
  | '6month'
  | '1year'
  | 'lifetime';

export interface SubscriptionJwtClaims {
  sub: string;
  iat: number;
  exp: number | null;
  tier: SubscriptionTier;
  jti: string;
}

// ─── Profile Data ─────────────────────────────────────────────────────────────

export interface Prescription {
  id: string;
  protocolId: string;
  prescribedAt: string;
  parameters: Record<string, unknown>;
  notes?: string;
}

export interface SessionData {
  preSessionRating?: number;
  postSessionRating?: number;
  metrics?: Record<string, number | string | boolean>;
  [key: string]: unknown;
}

export interface SessionRecord {
  id: string;
  timestamp: string;
  protocolId: string;
  duration: number;
  completed: boolean;
  data: SessionData;
}

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'system';
  volume?: number;
  spatialAudio?: boolean;
  seizureProtection?: boolean;
  outputMode?: 'headphones' | 'speakers';
  defaultCarrierHz?: number;
  [key: string]: unknown;
}

export interface UserProfileData {
  preferences: UserPreferences;
  prescriptions: Prescription[];
}

export interface UserProfile {
  version: '1.0';
  userId: string;
  subscription: {
    jwt: string;
    claims: SubscriptionJwtClaims;
  };
  userData: UserProfileData;
  sessions: SessionRecord[];
  createdAt: string;
  lastModified: string;
}

// ─── Activation ───────────────────────────────────────────────────────────────

export interface ActivationKeyFile {
  version: '1.0';
  keyId: string;
  tier: SubscriptionTier;
  activationToken: string;
  issuedAt: string;
  checksum: string;
}

export interface ServerActivationResponse {
  userSecret: string;
  subscriptionJwt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ProfileManagerConfig {
  serverActivationUrl: string;
  serverPublicKeyJwk: JsonWebKey;
  maxSessions?: number;
  opfsFileName?: string;
}

// ─── Results ──────────────────────────────────────────────────────────────────

export type ProfileResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: ProfileError };

export type ProfileError =
  | { code: 'NO_PROFILE' }
  | { code: 'DECRYPT_FAILED'; message: string }
  | { code: 'TAMPERED'; message: string }
  | { code: 'SUBSCRIPTION_EXPIRED'; expiredAt: string; tier: SubscriptionTier }
  | { code: 'INVALID_SUBSCRIPTION_SIGNATURE' }
  | { code: 'INVALID_FILE_FORMAT' }
  | { code: 'ACTIVATION_FAILED'; message: string }
  | { code: 'STORAGE_UNAVAILABLE'; message: string }
  | { code: 'INSECURE_CONTEXT' }
  | { code: 'INVALID_ACTIVATION_KEY'; message: string }
  | { code: 'UNKNOWN'; message: string };

export interface BackupExportOptions {
  stripSessions?: boolean;
  stripPrescriptions?: boolean;
}

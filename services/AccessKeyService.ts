/**
 * AccessKeyService — file-based membership system
 *
 * Each user receives a .syns file that contains:
 *   - A HMAC-SHA256 signed token (membership plan + expiry)
 *   - AES-GCM encrypted user-data (personal database)
 *
 * Security model: the master sign key is baked into the client bundle.
 * This is intentional — the goal is convenient access control, not
 * military-grade protection.  Anyone who reverse-engineers the key can
 * forge tokens, but ordinary users cannot.
 */

import { MembershipPlan, AccessToken, UserData, AccessSession, SessionRecord } from '../types.ts';

// ─── Internal constants ───────────────────────────────────────────────────────

// 32-byte HMAC signing secret.  Change this string to invalidate all issued files.
const MASTER_SIGN_SECRET = 'SynSync_Pro_v1_HMAC_MasterKey_2026$@!';
// Salt used when deriving per-user AES-GCM keys
const DATA_SALT = 'SynSync_UserData_AES_Salt_v1';

const PLAN_DURATIONS_MS: Record<MembershipPlan, number | null> = {
  day:      24 * 60 * 60 * 1000,
  week:  7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
  lifetime: null,
};

// ─── Base64-url helpers ───────────────────────────────────────────────────────

function b64Encode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64Decode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const raw = atob(padded + '='.repeat(pad));
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function getSignKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(MASTER_SIGN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function getDataKey(uid: string): Promise<CryptoKey> {
  const km = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(uid),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode(DATA_SALT), iterations: 50_000, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function signToken(payload: string): Promise<string> {
  const key = await getSignKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64Encode(sig);
}

async function verifyToken(payload: string, sig: string): Promise<boolean> {
  const key = await getSignKey();
  return crypto.subtle.verify('HMAC', key, b64Decode(sig), new TextEncoder().encode(payload));
}

async function encryptUserData(uid: string, data: UserData): Promise<string> {
  const key = await getDataKey(uid);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(data)),
  );
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ct), iv.byteLength);
  return b64Encode(combined);
}

async function decryptUserData(uid: string, encoded: string): Promise<UserData> {
  const key = await getDataKey(uid);
  const combined = b64Decode(encoded);
  const iv = combined.slice(0, 12);
  const ct = combined.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plain)) as UserData;
}

// ─── UUID v4 ──────────────────────────────────────────────────────────────────

function generateUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 2);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Default data factory ─────────────────────────────────────────────────────

function makeDefaultUserData(): UserData {
  return {
    displayName: '',
    favoriteProtocols: [],
    sessionsCompleted: 0,
    totalMinutes: 0,
    lastProtocolId: null,
    notes: '',
    preferences: {},
    history: [] as SessionRecord[],
    createdAt: Date.now(),
    lastSeen: Date.now(),
  };
}

// ─── Serialise / deserialise the .syns file ───────────────────────────────────

interface SynsFile {
  v: number;
  /** signed token: base64url(payload).base64url(hmac) */
  t: string;
  /** base64url(iv + AES-GCM ciphertext) */
  d: string;
}

async function buildFileBlob(signedToken: string, uid: string, data: UserData): Promise<Blob> {
  const encData = await encryptUserData(uid, data);
  const content: SynsFile = { v: 1, t: signedToken, d: encData };
  return new Blob([JSON.stringify(content)], { type: 'application/octet-stream' });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const AccessKeyService = {

  // ── ADMIN: generate a new access file ──────────────────────────────────────

  async generateAccessFile(plan: MembershipPlan): Promise<{ blob: Blob; filename: string }> {
    const uid = generateUID();
    const iat = Date.now();
    const duration = PLAN_DURATIONS_MS[plan];
    const exp = duration ? iat + duration : null;

    const token: AccessToken = { uid, iat, exp, plan };
    const payloadB64 = b64Encode(new TextEncoder().encode(JSON.stringify(token)));
    const sig = await signToken(payloadB64);
    const signedToken = `${payloadB64}.${sig}`;

    const data = makeDefaultUserData();
    const blob = await buildFileBlob(signedToken, uid, data);
    const filename = `synsync-${plan}-${uid.slice(0, 8)}.syns`;
    return { blob, filename };
  },

  async createDemoSession(): Promise<AccessSession> {
    const uid = 'synsync-public-demo';
    const iat = Date.now();
    const token: AccessToken = { uid, iat, exp: null, plan: 'lifetime' };
    const payloadB64 = b64Encode(new TextEncoder().encode(JSON.stringify(token)));
    const sig = await signToken(payloadB64);
    const signedToken = `${payloadB64}.${sig}`;
    const existing = AccessKeyService.getLocalUserData(uid);
    const userData: UserData = {
      ...(existing ?? makeDefaultUserData()),
      displayName: existing?.displayName || 'Demo Explorer',
      preferences: {
        ...(existing?.preferences ?? {}),
        demoMode: true,
        onboardingCompleted: true,
        onboardingCompletedAt: existing?.preferences?.onboardingCompletedAt ?? Date.now(),
      },
      lastSeen: Date.now(),
    };
    const fileBlob = await buildFileBlob(signedToken, uid, userData);
    AccessKeyService.setLocalUserData(uid, userData);
    AccessKeyService.cacheSession(token);
    return {
      token,
      userData,
      fileBlob,
      filename: 'synsync-demo.syns',
    };
  },

  // ── USER: load & validate an uploaded .syns file ────────────────────────────

  async loadAccessFile(file: File): Promise<{ session: AccessSession | null; error?: string }> {
    try {
      const raw = await file.text();
      let parsed: SynsFile;
      try {
        parsed = JSON.parse(raw) as SynsFile;
      } catch {
        return { session: null, error: 'Not a valid SynSync access file.' };
      }
      if (!parsed.v || !parsed.t || !parsed.d) {
        return { session: null, error: 'Invalid SynSync access file structure.' };
      }

      // Verify HMAC signature
      const dotIdx = parsed.t.lastIndexOf('.');
      if (dotIdx < 0) return { session: null, error: 'Malformed access token.' };
      const payloadB64 = parsed.t.slice(0, dotIdx);
      const sig       = parsed.t.slice(dotIdx + 1);

      const valid = await verifyToken(payloadB64, sig);
      if (!valid) {
        return { session: null, error: 'Access token is invalid or has been tampered with.' };
      }

      // Decode token payload
      const token = JSON.parse(
        new TextDecoder().decode(b64Decode(payloadB64)),
      ) as AccessToken;

      // Check expiry
      if (token.exp !== null && Date.now() > token.exp) {
        const d = new Date(token.exp).toLocaleDateString();
        return { session: null, error: `Your SynSync access expired on ${d}. Contact the issuer for a new file.` };
      }

      // Decrypt user data (fall back to defaults if corrupted)
      let userData: UserData;
      try {
        userData = await decryptUserData(token.uid, parsed.d);
      } catch {
        userData = makeDefaultUserData();
      }

      // Merge newer localStorage copy if it exists
      const local = AccessKeyService.getLocalUserData(token.uid);
      if (local && local.lastSeen > userData.lastSeen) {
        userData = local;
      }
      userData.lastSeen = Date.now();

      const fileBlob = await buildFileBlob(parsed.t, token.uid, userData);

      AccessKeyService.setLocalUserData(token.uid, userData);
      AccessKeyService.cacheSession(token);

      return {
        session: {
          token,
          userData,
          fileBlob,
          filename: file.name,
        },
      };
    } catch {
      return { session: null, error: 'Could not read the file. Make sure it is a valid .syns file.' };
    }
  },

  // ── Save updated user data (returns new session with fresh blob) ─────────────

  async saveUserData(session: AccessSession, patch: Partial<UserData>): Promise<AccessSession> {
    const newData: UserData = { ...session.userData, ...patch, lastSeen: Date.now() };
    const raw = await session.fileBlob.text();
    const parsed = JSON.parse(raw) as SynsFile;
    const fileBlob = await buildFileBlob(parsed.t, session.token.uid, newData);
    AccessKeyService.setLocalUserData(session.token.uid, newData);
    return { ...session, userData: newData, fileBlob };
  },

  // ── localStorage helpers ─────────────────────────────────────────────────────

  getLocalUserData(uid: string): UserData | null {
    try {
      const raw = localStorage.getItem(`synsync_ud_${uid}`);
      return raw ? (JSON.parse(raw) as UserData) : null;
    } catch { return null; }
  },

  setLocalUserData(uid: string, data: UserData): void {
    try { localStorage.setItem(`synsync_ud_${uid}`, JSON.stringify(data)); } catch { /* quota */ }
  },

  // ── Session cache (survives page reload, re-checked for expiry) ──────────────

  cacheSession(token: AccessToken): void {
    localStorage.setItem('synsync_session', JSON.stringify({
      uid: token.uid, exp: token.exp, plan: token.plan,
    }));
  },

  getCachedSessionMeta(): Pick<AccessToken, 'uid' | 'exp' | 'plan'> | null {
    try {
      const raw = localStorage.getItem('synsync_session');
      if (!raw) return null;
      const s = JSON.parse(raw) as Pick<AccessToken, 'uid' | 'exp' | 'plan'>;
      if (s.exp !== null && Date.now() > s.exp) {
        localStorage.removeItem('synsync_session');
        return null;
      }
      return s;
    } catch { return null; }
  },

  clearSession(): void {
    localStorage.removeItem('synsync_session');
  },

  // ── Display helpers ──────────────────────────────────────────────────────────

  formatExpiry(exp: number | null, plan: MembershipPlan): string {
    if (exp === null || plan === 'lifetime') return 'Lifetime Access';
    const ms = exp - Date.now();
    if (ms <= 0) return 'Expired';
    const days = Math.ceil(ms / 86_400_000);
    if (days === 1) return '1 day remaining';
    if (days <= 7) return `${days} days remaining`;
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} · expires ${new Date(exp).toLocaleDateString()}`;
  },

  planLabel(plan: MembershipPlan): string {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  },
};

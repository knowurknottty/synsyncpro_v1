/**
 * Security Utilities for Protocol Plan System
 *
 * SHA-256 hashing and tamper detection using Web Crypto API
 */

import type { ProtocolPlan } from '../types/plan';

/**
 * Calculate SHA-256 hash of protocol plan
 * Excludes the security section to avoid circular dependency
 */
export async function calculatePlanHash(plan: ProtocolPlan): Promise<string> {
  // Create a copy without the security section
  const planWithoutSecurity = {
    schema_version: plan.schema_version,
    type: plan.type,
    meta: plan.meta,
    plan: plan.plan,
    schedule: plan.schedule,
    protocols: plan.protocols,
    tracking: plan.tracking,
    conditional_logic: plan.conditional_logic,
    instructions: plan.instructions,
    consent: plan.consent,
  };

  // Serialize to canonical JSON (sorted keys, no whitespace)
  const canonicalJson = canonicalizeJSON(planWithoutSecurity);

  // Convert to UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalJson);

  // Calculate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  return bufferToHex(hashBuffer);
}

/**
 * Verify that plan hash matches expected value
 */
export async function verifyPlanHash(
  plan: ProtocolPlan,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await calculatePlanHash(plan);
  return actualHash === expectedHash;
}

/**
 * Detect if plan has been tampered with
 * Returns true if hash mismatch detected
 */
export async function detectTampering(plan: ProtocolPlan): Promise<boolean> {
  if (!plan.security?.plan_hash) {
    // No hash provided - cannot verify
    return false;
  }

  const isValid = await verifyPlanHash(plan, plan.security.plan_hash);
  return !isValid;
}

/**
 * Canonicalize JSON for consistent hashing
 * Sorts keys recursively and removes whitespace
 */
function canonicalizeJSON(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJSON).join(',') + ']';
  }

  // Sort object keys and recursively canonicalize
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    const value = canonicalizeJSON(obj[key]);
    return `"${key}":${value}`;
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a new hash for a plan (for practitioner tools)
 * This is used when creating a new plan JSON
 */
export async function generatePlanHash(planData: Omit<ProtocolPlan, 'security'>): Promise<string> {
  const tempPlan = {
    ...planData,
    security: { plan_hash: '' }, // Temporary
  } as ProtocolPlan;

  return calculatePlanHash(tempPlan);
}

/**
 * Validate hash format (64 hex characters)
 */
export function isValidHashFormat(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Generate a unique plan ID (for database storage)
 */
export function generatePlanId(): string {
  // Use timestamp + random bytes for uniqueness
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  const randomHex = bufferToHex(randomBytes.buffer);
  return `plan_${timestamp}_${randomHex.slice(0, 12)}`;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.getRandomValues(new Uint8Array(6));
  const randomHex = bufferToHex(randomBytes.buffer);
  return `session_${timestamp}_${randomHex.slice(0, 8)}`;
}

/**
 * Sanitize user input for storage (prevent XSS)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Max 10k characters
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate ISO 8601 date string
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

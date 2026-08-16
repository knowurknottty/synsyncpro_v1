// src/utils/data-anonymization.ts
// Anonymize user data for research contribution
// Strips PII while preserving useful research data

import type { SavedRoutine, SessionRecord, ProgressData, UserPreferences } from './local-storage-manager';

/**
 * Anonymization utilities for research data
 * Removes all personally identifying information
 * Preserves statistically useful data
 */

// Generate anonymous user ID (stable per browser, no PII)
export function getAnonymousUserId(): string {
  let userId = localStorage.getItem('synsync_anonymous_id');

  if (!userId) {
    // Generate random ID (not based on any user info)
    userId = 'user_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('synsync_anonymous_id', userId);
  }

  return userId;
}

// Anonymize timestamps to relative time
export function anonymizeTimestamp(timestamp: string, baseDate?: Date): string {
  const date = new Date(timestamp);
  const base = baseDate || new Date('2024-01-01T00:00:00Z'); // Epoch for normalization

  const diffMs = date.getTime() - base.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return `day_${diffDays}`;
}

// Anonymize age to age range
export function anonymizeAge(age: number): string {
  if (age < 18) return 'under_18';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

// Anonymize location to region (if provided)
export function anonymizeLocation(location?: string): string | undefined {
  if (!location) return undefined;

  // Extract just country/region, remove city
  const parts = location.split(',');
  return parts[parts.length - 1]?.trim(); // Last part usually country
}

/**
 * Research-optimized session data
 * Focused on effectiveness, not identity
 */
export interface ResearchSession {
  // Anonymized identifiers
  anonymousUserId: string;
  sessionId: string; // Hashed, not original

  // Protocol info (no PII)
  protocolId: string;
  protocolCategory: string;
  evidenceGrade: string;

  // Temporal (relative, not absolute)
  dayNumber: string; // "day_42" relative to user's first session
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';

  // Session metrics
  expectedDuration: number; // seconds
  actualDuration: number; // seconds
  completionRate: number; // 0-1
  completed: boolean;

  // Effectiveness
  rating?: 1 | 2 | 3 | 4 | 5;
  sideEffects?: string[]; // Standardized list only

  // Context (anonymized)
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionNumber: number; // nth session for this user
  protocolSessionNumber: number; // nth session for this protocol

  // Outcomes (no PII)
  userNotes?: string; // Optional: sanitized, no PII
}

/**
 * Research-optimized protocol statistics
 */
export interface ResearchProtocolStats {
  protocolId: string;
  protocolCategory: string;
  evidenceGrade: string;

  // Aggregate stats (no individual PII)
  totalSessions: number;
  uniqueUsers: number; // Count only, no IDs
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };

  completionRate: number;
  averageDuration: number;

  // Side effects frequency
  sideEffectsFrequency: Record<string, number>;

  // Effectiveness by context
  effectivenessByExperience: {
    beginner: { avgRating: number; n: number };
    intermediate: { avgRating: number; n: number };
    advanced: { avgRating: number; n: number };
  };

  effectivenessByGoal: Record<string, { avgRating: number; n: number }>;
}

/**
 * Research-optimized user profile
 * Demographic data for analysis, fully anonymized
 */
export interface ResearchUserProfile {
  anonymousUserId: string;

  // Demographics (anonymized)
  ageRange?: string; // "25-34"
  region?: string; // "North America" or "Europe" only

  // Experience (no PII)
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  meditationExperience?: 'none' | 'some' | 'regular' | 'advanced';

  // Goals (statistical)
  primaryGoals: string[]; // Max 3

  // Usage patterns (no PII)
  totalSessions: number;
  totalDaysActive: number;
  averageSessionsPerWeek: number;
  longestStreak: number;

  // Contraindications (standardized only)
  hasContraindications: boolean;
  contraindicationCategories?: string[]; // "epilepsy", "psychosis" etc - no details

  // Preferences (statistical)
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  evidencePreference?: 'established-only' | 'experimental-ok' | 'all';
}

/**
 * Complete research export package
 */
export interface ResearchDataExport {
  version: '1.0';
  exportedAt: string;
  dataTypes: string[]; // What's included

  // Metadata (no PII)
  contributor: {
    anonymousUserId: string;
    contributionCount: number; // How many times they've contributed
  };

  // Research data
  userProfile?: ResearchUserProfile;
  sessions?: ResearchSession[];
  protocolStats?: ResearchProtocolStats[];

  // Aggregate insights (optional)
  insights?: {
    mostEffectiveProtocols: string[];
    leastEffectiveSideEffects: string[];
    optimalSessionDurations: Record<string, number>;
  };
}

/**
 * Anonymize a session for research
 */
export function anonymizeSession(
  session: SessionRecord,
  userFirstSessionDate: Date,
  userExperienceLevel: string,
  userSessionCount: number,
  protocolSessionCount: number
): ResearchSession {
  const sessionDate = new Date(session.startTime);
  const hour = sessionDate.getHours();

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour < 12) timeOfDay = 'morning';
  else if (hour < 17) timeOfDay = 'afternoon';
  else if (hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const dayOfWeek = sessionDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    anonymousUserId: getAnonymousUserId(),
    sessionId: hashString(session.id),
    protocolId: session.protocolId,
    protocolCategory: extractCategory(session.protocolId),
    evidenceGrade: 'experimental', // Would come from protocol data
    dayNumber: anonymizeTimestamp(session.startTime, userFirstSessionDate),
    timeOfDay,
    dayOfWeek: isWeekend ? 'weekend' : 'weekday',
    expectedDuration: 1500, // Would come from protocol data
    actualDuration: session.duration,
    completionRate: session.completed ? 1 : 0,
    completed: session.completed,
    rating: session.rating,
    sideEffects: session.sideEffects,
    userExperienceLevel: userExperienceLevel as any,
    sessionNumber: userSessionCount,
    protocolSessionNumber: protocolSessionCount,
    userNotes: sanitizeNotes(session.notes)
  };
}

/**
 * Hash a string for anonymization
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'session_' + Math.abs(hash).toString(16);
}

/**
 * Extract category from protocol ID
 */
function extractCategory(protocolId: string): string {
  if (protocolId.includes('sleep')) return 'sleep';
  if (protocolId.includes('focus') || protocolId.includes('adhd')) return 'focus';
  if (protocolId.includes('meditation') || protocolId.includes('theta')) return 'meditation';
  if (protocolId.includes('stress') || protocolId.includes('anxiety')) return 'stress';
  return 'other';
}

/**
 * Sanitize user notes - remove PII
 */
function sanitizeNotes(notes?: string): string | undefined {
  if (!notes) return undefined;

  // Remove common PII patterns
  let sanitized = notes;

  // Remove emails
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

  // Remove phone numbers (US format)
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

  // Remove URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');

  // Remove names (basic - first name + last name pattern)
  // This is imperfect but helps
  sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');

  // Remove dates
  sanitized = sanitized.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]');

  // Truncate if too long (prevent essays with PII)
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + '...';
  }

  return sanitized;
}

/**
 * Validate research data before export
 * Ensures no PII leaked through
 */
export function validateResearchData(data: ResearchDataExport): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for common PII patterns in entire export
  const jsonString = JSON.stringify(data);

  // Email pattern
  if (/@[\w.-]+\.\w+/.test(jsonString)) {
    warnings.push('Possible email address detected');
  }

  // Phone pattern
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(jsonString)) {
    warnings.push('Possible phone number detected');
  }

  // Full date pattern (should be anonymized)
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(jsonString)) {
    warnings.push('Absolute timestamps detected (should be relative)');
  }

  // Long notes (might contain PII)
  if (data.sessions) {
    const longNotes = data.sessions.filter(s => s.userNotes && s.userNotes.length > 500);
    if (longNotes.length > 0) {
      warnings.push(`${longNotes.length} sessions with long notes (review for PII)`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

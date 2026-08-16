// src/utils/protocol-matcher.ts
// Protocol matching types and recommendation engine

import type { Protocol } from '../../types';

export interface UserPreferences {
  primaryGoal?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  evidencePreference: 'scientific' | 'speculative' | 'any';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  sessionDuration?: number; // minutes
  contraindications?: string[];
}

export interface DailyRoutine {
  id: string;
  protocols: Protocol[];
  totalDuration: number; // seconds
  schedule?: {
    timeOfDay: string;
    protocolId: string;
  }[];
}

export interface ProtocolRecommendation {
  protocol: Protocol;
  score: number;
  reasons: string[];
  warnings?: string[];
}

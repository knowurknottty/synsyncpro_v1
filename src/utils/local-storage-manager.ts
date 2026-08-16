// src/utils/local-storage-manager.ts
// Privacy-first local storage - all data stays on user's device

import type { DailyRoutine, UserPreferences } from './protocol-matcher';

export type { UserPreferences } from './protocol-matcher';

/**
 * Privacy-first storage manager
 * - All data stored locally on device
 * - No tracking, no analytics
 * - User has full control
 * - Can export/delete all data
 */

// Storage keys
const STORAGE_KEYS = {
  SAVED_ROUTINES: 'synsync_saved_routines',
  ACTIVE_ROUTINE: 'synsync_active_routine',
  SESSION_HISTORY: 'synsync_session_history',
  USER_PREFERENCES: 'synsync_user_preferences',
  PROGRESS_DATA: 'synsync_progress_data',
  SETTINGS: 'synsync_settings',
} as const;

// Types
export interface SavedRoutine {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  routine: DailyRoutine;
  preferences: UserPreferences;
  tags?: string[];
}

export interface SessionRecord {
  id: string;
  protocolId: string;
  protocolTitle: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  completed: boolean;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  sideEffects?: string[];
}

export interface ProgressData {
  totalSessions: number;
  totalDuration: number; // seconds
  currentStreak: number; // days
  longestStreak: number; // days
  lastSessionDate?: string;
  protocolStats: Record<string, {
    sessions: number;
    totalDuration: number;
    averageRating?: number;
    completionRate: number;
  }>;
  weeklyGoal?: number; // sessions per week
  weeklyProgress: number; // current week sessions
}

export interface UserSettings {
  dataRetentionDays?: number; // Auto-delete old data
  analyticsEnabled: boolean; // Local analytics only
  exportReminders: boolean; // Remind to export data
  privacyMode: 'standard' | 'strict'; // strict = minimal data storage
}

/**
 * Local Storage Manager
 * All methods are synchronous and use localStorage
 */
export class LocalStorageManager {
  // ============================================
  // Saved Routines
  // ============================================

  static getSavedRoutines(): SavedRoutine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_ROUTINES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading saved routines:', error);
      return [];
    }
  }

  static saveRoutine(routine: DailyRoutine, preferences: UserPreferences, name?: string): SavedRoutine {
    const routines = this.getSavedRoutines();
    const newRoutine: SavedRoutine = {
      id: Date.now().toString(),
      name: name || `Routine ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      routine,
      preferences,
      tags: this.generateTags(preferences)
    };

    routines.push(newRoutine);
    localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(routines));
    return newRoutine;
  }

  static deleteRoutine(id: string): boolean {
    try {
      const routines = this.getSavedRoutines();
      const filtered = routines.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting routine:', error);
      return false;
    }
  }

  static updateRoutine(id: string, updates: Partial<SavedRoutine>): boolean {
    try {
      const routines = this.getSavedRoutines();
      const index = routines.findIndex(r => r.id === id);
      if (index === -1) return false;

      routines[index] = { ...routines[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(routines));
      return true;
    } catch (error) {
      console.error('Error updating routine:', error);
      return false;
    }
  }

  // ============================================
  // Active Routine
  // ============================================

  static getActiveRoutine(): SavedRoutine | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROUTINE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading active routine:', error);
      return null;
    }
  }

  static setActiveRoutine(routine: SavedRoutine): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROUTINE, JSON.stringify(routine));
    this.updateRoutine(routine.id, { lastUsed: new Date().toISOString() });
  }

  static clearActiveRoutine(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROUTINE);
  }

  // ============================================
  // Session History
  // ============================================

  static getSessionHistory(limit?: number): SessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      const sessions = data ? JSON.parse(data) : [];

      // Sort by start time (newest first)
      sessions.sort((a: SessionRecord, b: SessionRecord) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      return limit ? sessions.slice(0, limit) : sessions;
    } catch (error) {
      console.error('Error reading session history:', error);
      return [];
    }
  }

  static startSession(protocolId: string, protocolTitle: string): SessionRecord {
    const session: SessionRecord = {
      id: Date.now().toString(),
      protocolId,
      protocolTitle,
      startTime: new Date().toISOString(),
      duration: 0,
      completed: false
    };

    const sessions = this.getSessionHistory();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(sessions));

    return session;
  }

  static endSession(sessionId: string, completed: boolean, notes?: string): boolean {
    try {
      const sessions = this.getSessionHistory();
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index === -1) return false;

      const session = sessions[index];
      const endTime = new Date().toISOString();
      const duration = Math.floor(
        (new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 1000
      );

      sessions[index] = {
        ...session,
        endTime,
        duration,
        completed,
        notes
      };

      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(sessions));

      // Update progress data
      this.updateProgressData(sessions[index]);

      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }

  static rateSession(sessionId: string, rating: 1 | 2 | 3 | 4 | 5, sideEffects?: string[]): boolean {
    try {
      const sessions = this.getSessionHistory();
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index === -1) return false;

      sessions[index] = {
        ...sessions[index],
        rating,
        sideEffects
      };

      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(sessions));

      // Update progress stats
      this.updateProgressData(sessions[index]);

      return true;
    } catch (error) {
      console.error('Error rating session:', error);
      return false;
    }
  }

  // ============================================
  // Progress Data
  // ============================================

  static getProgressData(): ProgressData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS_DATA);
      if (!data) {
        return this.initializeProgressData();
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading progress data:', error);
      return this.initializeProgressData();
    }
  }

  private static initializeProgressData(): ProgressData {
    return {
      totalSessions: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      protocolStats: {},
      weeklyProgress: 0
    };
  }

  private static updateProgressData(session: SessionRecord): void {
    const progress = this.getProgressData();

    // Update totals
    if (session.completed) {
      progress.totalSessions += 1;
      progress.totalDuration += session.duration;
    }

    // Update protocol stats
    if (!progress.protocolStats[session.protocolId]) {
      progress.protocolStats[session.protocolId] = {
        sessions: 0,
        totalDuration: 0,
        completionRate: 0
      };
    }

    const stats = progress.protocolStats[session.protocolId];
    stats.sessions += 1;
    stats.totalDuration += session.duration;
    stats.completionRate = session.completed
      ? (stats.completionRate * (stats.sessions - 1) + 1) / stats.sessions
      : (stats.completionRate * (stats.sessions - 1)) / stats.sessions;

    if (session.rating) {
      const prevAvg = stats.averageRating || 0;
      const prevCount = stats.sessions - 1;
      stats.averageRating = (prevAvg * prevCount + session.rating) / stats.sessions;
    }

    // Update streaks
    progress.lastSessionDate = session.startTime;
    this.calculateStreaks(progress);

    // Update weekly progress
    this.calculateWeeklyProgress(progress);

    localStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(progress));
  }

  private static calculateStreaks(progress: ProgressData): void {
    const sessions = this.getSessionHistory();
    const completedSessions = sessions.filter(s => s.completed);

    if (completedSessions.length === 0) {
      progress.currentStreak = 0;
      return;
    }

    // Sort by date
    completedSessions.sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Calculate current streak
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = completedSessions.length - 1; i > 0; i--) {
      const current = new Date(completedSessions[i].startTime);
      const previous = new Date(completedSessions[i - 1].startTime);

      const daysDiff = Math.floor(
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        if (i === completedSessions.length - 1) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    progress.currentStreak = currentStreak;
    progress.longestStreak = Math.max(longestStreak, progress.longestStreak);
  }

  private static calculateWeeklyProgress(progress: ProgressData): void {
    const sessions = this.getSessionHistory();
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= startOfWeek && s.completed;
    });

    progress.weeklyProgress = thisWeekSessions.length;
  }

  // ============================================
  // Settings
  // ============================================

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error reading settings:', error);
      return this.getDefaultSettings();
    }
  }

  private static getDefaultSettings(): UserSettings {
    return {
      analyticsEnabled: true, // Local only
      exportReminders: true,
      privacyMode: 'standard'
    };
  }

  static updateSettings(updates: Partial<UserSettings>): void {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  // ============================================
  // Data Management
  // ============================================

  static exportAllData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      savedRoutines: this.getSavedRoutines(),
      sessionHistory: this.getSessionHistory(),
      progressData: this.getProgressData(),
      settings: this.getSettings()
    };

    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      // Validate version
      if (!data.version || data.version !== '1.0') {
        throw new Error('Incompatible data version');
      }

      // Import each section
      if (data.savedRoutines) {
        localStorage.setItem(STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(data.savedRoutines));
      }
      if (data.sessionHistory) {
        localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.sessionHistory));
      }
      if (data.progressData) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(data.progressData));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static getStorageSize(): number {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += new Blob([item]).size;
      }
    });
    return total; // bytes
  }

  // ============================================
  // Helper Methods
  // ============================================

  private static generateTags(preferences: UserPreferences): string[] {
    const tags: string[] = [];

    if (preferences.primaryGoal) {
      tags.push(preferences.primaryGoal);
    }

    tags.push(preferences.experienceLevel);
    tags.push(preferences.evidencePreference);

    if (preferences.timeOfDay && preferences.timeOfDay !== 'flexible') {
      tags.push(preferences.timeOfDay);
    }

    return tags;
  }
}

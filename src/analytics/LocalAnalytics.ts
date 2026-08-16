/**
 * Local Analytics — Zero-Tracking Analytics System
 * 
 * Philosophy: "Your usage data stays on YOUR device unless YOU choose to share it."
 * 
 * Features:
 * - All data stored in localStorage (never leaves device)
 * - No external requests
 * - No personally identifiable information
 * - User can view, export, or delete all data
 * - Optional anonymized summary generation for feedback
 */

export interface LocalAnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, string | number>;
}

export class LocalAnalytics {
  private static STORAGE_KEY = 'synsync_local_analytics';
  private static MAX_EVENTS = 1000; // Rolling window

  /**
   * Track an event locally. Never leaves the device.
   * 
   * @example
   * LocalAnalytics.track('protocol_start', { protocolId: 'deep_sleep', duration: 60 });
   * LocalAnalytics.track('protocol_complete', { protocolId: 'deep_sleep', actualDuration: 58 });
   * LocalAnalytics.track('settings_change', { setting: 'volume', value: 0.7 });
   */
  static track(event: string, data?: Record<string, string | number>): void {
    try {
      const events = this.getEvents();
      events.push({
        event,
        timestamp: Date.now(),
        data,
      });

      // Keep only last N events
      while (events.length > this.MAX_EVENTS) {
        events.shift();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage full or unavailable — fail silently
      // This is a feature: analytics never breaks the app
    }
  }

  /**
   * Get all locally stored events.
   */
  static getEvents(): LocalAnalyticsEvent[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Generate an anonymized usage summary the user can CHOOSE to share.
   * No personally identifiable information included.
   * 
   * This enables:
   * - User-initiated feedback ("Send usage stats to help improve SynSync")
   * - Product improvement without violating privacy
   * - Transparent data practices
   */
  static generateAnonymousSummary(): object {
    const events = this.getEvents();

    // Aggregate only — no timestamps, no session data
    const protocolCounts: Record<string, number> = {};
    const completionRates: Record<string, { started: number; completed: number }> = {};
    const settingsChanges: Record<string, number> = {};
    let totalSessions = 0;

    for (const e of events) {
      if (e.event === 'protocol_start') {
        totalSessions++;
        const id = e.data?.protocolId as string;
        if (id) {
          protocolCounts[id] = (protocolCounts[id] || 0) + 1;
          if (!completionRates[id]) {
            completionRates[id] = { started: 0, completed: 0 };
          }
          completionRates[id].started++;
        }
      }
      if (e.event === 'protocol_complete') {
        const id = e.data?.protocolId as string;
        if (id && completionRates[id]) {
          completionRates[id].completed++;
        }
      }
      if (e.event === 'settings_change') {
        const setting = e.data?.setting as string;
        if (setting) {
          settingsChanges[setting] = (settingsChanges[setting] || 0) + 1;
        }
      }
    }

    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalSessions,
      protocolPopularity: protocolCounts,
      completionRates,
      settingsChanges,
      // NO device info, NO IP, NO location, NO precise timestamps
    };
  }

  /**
   * Get statistics for display to user (transparency).
   */
  static getStats(): {
    totalEvents: number;
    oldestEvent: number | null;
    newestEvent: number | null;
    storageSize: number;
  } {
    const events = this.getEvents();
    const timestamps = events.map(e => e.timestamp);
    const storageSize = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;

    return {
      totalEvents: events.length,
      oldestEvent: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEvent: timestamps.length > 0 ? Math.max(...timestamps) : null,
      storageSize,
    };
  }

  /**
   * Export all analytics data as JSON (for user transparency).
   */
  static exportData(): string {
    return JSON.stringify(this.getEvents(), null, 2);
  }

  /**
   * Delete all local analytics data.
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get dashboard-friendly metrics for usage over time.
   */
  static getMetrics() {
    const events = this.getEvents();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return {
      totalSessions: events.filter(e => e.event === 'protocol_start').length,
      last7Days: events.filter(e => e.event === 'protocol_start' && (now - e.timestamp) < 7 * dayMs).length,
      last30Days: events.filter(e => e.event === 'protocol_start' && (now - e.timestamp) < 30 * dayMs).length,
    };
  }
}

/**
 * FIX #11: Local-Only Analytics (Option C)
 * ==========================================
 * No external requests. Track usage locally on user's device.
 * Optional anonymized sharing at user's choice.
 *
 * @version 2.0.0
 */

export interface LocalAnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, string | number>;
}

export class LocalAnalytics {
  private static STORAGE_KEY = 'synsync_local_analytics';
  private static MAX_EVENTS = 1000;

  static track(event: string, data?: Record<string, string | number>): void {
    try {
      const events = this.getEvents();
      events.push({ event, timestamp: Date.now(), data });
      while (events.length > this.MAX_EVENTS) events.shift();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage full or unavailable
    }
  }

  static getEvents(): LocalAnalyticsEvent[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static generateAnonymousSummary(): object {
    const events = this.getEvents();
    const protocolCounts: Record<string, number> = {};
    const completionRates: Record<string, { started: number; completed: number }> = {};
    let totalSessions = 0;

    for (const e of events) {
      if (e.event === 'protocol_start') {
        totalSessions++;
        const id = e.data?.protocolId as string;
        if (id) {
          protocolCounts[id] = (protocolCounts[id] || 0) + 1;
          if (!completionRates[id]) completionRates[id] = { started: 0, completed: 0 };
          completionRates[id].started++;
        }
      }
      if (e.event === 'protocol_complete') {
        const id = e.data?.protocolId as string;
        if (id && completionRates[id]) completionRates[id].completed++;
      }
    }

    return { version: '1.0', generatedAt: new Date().toISOString(), totalSessions, protocolPopularity: protocolCounts, completionRates };
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

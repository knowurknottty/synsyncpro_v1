/**
 * FIX #11: Replace Google Tag Manager with Privacy-Respecting Analytics
 * 
 * PROBLEM: Google Tag Manager (GTM-WFFG6HG9) is installed, which loads
 * Google Analytics scripts. Default GA4 collects: IP addresses, device
 * fingerprints, session data, behavioral patterns, geographic location.
 * 
 * This directly contradicts SynSync's core marketing message:
 *   "zero data collection, zero tracking, your brain data stays yours"
 * 
 * A technically savvy user (your core biohacker audience) WILL inspect
 * network requests and find google-analytics.com, googletagmanager.com,
 * and doubleclick.net pinging on every page load. This is the single
 * highest credibility risk on the platform.
 * 
 * PRIORITY: CRITICAL — fix before any marketing push
 * 
 * SOLUTION: Three options ranked by privacy alignment:
 */

// ============================================================
// OPTION A: ZERO ANALYTICS (Maximum Privacy — Recommended)
// ============================================================

/**
 * Remove all analytics. Ship it clean.
 * 
 * Pros:
 * - Absolute privacy claim is 100% defensible
 * - Zero external requests beyond your own domain
 * - Simplest implementation
 * - Fastest page loads
 * 
 * Cons:
 * - No usage data for product decisions
 * - Can't measure which protocols are popular
 * - Can't track funnel conversion
 * 
 * Implementation:
 * 1. Remove GTM script tags from index.html
 * 2. Remove any GA/GTM initialization code
 * 3. Remove any analytics-related event calls
 * 
 * Files to modify:
 *   index.html — Remove:
 *     <!-- Google Tag Manager -->
 *     <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-WFFG6HG9');</script>
 *     <!-- End Google Tag Manager -->
 *   
 *   index.html — Remove:
 *     <!-- Google Tag Manager (noscript) -->
 *     <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WFFG6HG9"...></noscript>
 *     <!-- End Google Tag Manager (noscript) -->
 */

// ============================================================
// OPTION B: PRIVACY-RESPECTING ANALYTICS (Balanced — Good Alternative)
// ============================================================

/**
 * Use a GDPR/CCPA-compliant, no-cookie analytics service.
 * These services process data on EU servers, don't use cookies,
 * don't fingerprint, don't sell data, and are specifically designed
 * for privacy-conscious products.
 * 
 * Recommended services (ranked):
 * 
 * 1. Plausible Analytics (https://plausible.io)
 *    - EU-hosted, no cookies, no personal data
 *    - <1KB script (vs ~45KB GA4)
 *    - Open source (can self-host)
 *    - $9/month for 10K pageviews
 *    - CLAIM: "We don't track individuals, we track aggregate patterns"
 * 
 * 2. Umami (https://umami.is)
 *    - Self-hosted, fully open source
 *    - Zero cost if self-hosted
 *    - No cookies, GDPR compliant
 *    - Can run on Vercel/Netlify free tier
 * 
 * 3. Fathom (https://usefathom.com)
 *    - EU isolation mode
 *    - No cookies, no personal data
 *    - $14/month for 100K pageviews
 * 
 * Implementation (Plausible example):
 */

// Replace GTM in index.html with:
const PLAUSIBLE_SCRIPT = `
<!-- Privacy-respecting analytics: Plausible (no cookies, no personal data) -->
<script defer data-domain="synsyncpro.netlify.app" src="https://plausible.io/js/script.js"></script>
`;

// Or for self-hosted Umami on Netlify:
const UMAMI_SCRIPT = `
<!-- Privacy-respecting analytics: Umami (self-hosted, open source) -->
<script defer src="https://your-umami-instance.netlify.app/script.js" 
  data-website-id="YOUR_SITE_ID"></script>
`;

// ============================================================
// OPTION C: LOCAL-ONLY ANALYTICS (Maximum Control)
// ============================================================

/**
 * No external requests at all. Track usage locally on the user's
 * device and optionally let them CHOOSE to share anonymized data.
 * 
 * This is the most aligned with SynSync's philosophy:
 * "Your data stays on your device unless you explicitly share it."
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
   */
  static generateAnonymousSummary(): object {
    const events = this.getEvents();

    // Aggregate only — no timestamps, no session data
    const protocolCounts: Record<string, number> = {};
    const completionRates: Record<string, { started: number; completed: number }> = {};
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
    }

    return {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalSessions,
      protocolPopularity: protocolCounts,
      completionRates,
      // NO device info, NO IP, NO location, NO timestamps
    };
  }

  /**
   * Delete all local analytics data.
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// ============================================================
// REMOVAL CHECKLIST
// ============================================================
/**
 * Regardless of which option you choose, FIRST remove GTM:
 * 
 * □ Remove GTM <script> tag from <head> in index.html
 * □ Remove GTM <noscript> iframe from <body> in index.html
 * □ Search codebase for 'gtag', 'dataLayer', 'GTM-', 'google' and remove
 * □ Check for any GA event calls (gtag('event', ...))
 * □ Verify with browser DevTools Network tab: zero requests to:
 *   - googletagmanager.com
 *   - google-analytics.com
 *   - doubleclick.net
 *   - googleapis.com (analytics-related)
 * □ Run Lighthouse — should show no third-party analytics scripts
 * □ Update Privacy Policy to reflect actual (zero) data collection
 * □ Consider adding a "Privacy Audit" page showing exactly what
 *   network requests the app makes (transparency flex)
 * 
 * RECOMMENDATION: Start with Option A (zero analytics).
 * Add Option C (local analytics) for your own product insights.
 * Add Option B (Plausible) only if you need aggregate web traffic data
 * and are willing to add a single external request.
 */

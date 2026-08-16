/**
 * FIX #8: Throttled Stochastic Modulation Rate
 * 
 * PROBLEM: Stochastic modulation runs on every requestAnimationFrame
 * callback (~60Hz). At 60 updates/second, random frequency deviations
 * create audible artifacts — essentially amplitude modulation at 60Hz
 * which manifests as a buzzy, "dirty" quality overlaid on the
 * entrainment tone. The brain cannot track 60Hz random changes as
 * meaningful frequency variation.
 * 
 * For stochastic jitter to feel "natural" (mimicking real EEG drift),
 * it should update at 1-5Hz — roughly the rate at which actual neural
 * oscillation frequencies drift in a resting brain.
 * 
 * SOLUTION: Frame-rate-independent throttle using elapsed time tracking.
 * The animation loop still runs at 60Hz for smooth spatial motion and
 * visualization, but stochastic updates are gated to a configurable
 * rate (default 3Hz).
 * 
 * Also applies to spatial motion (FIX #9 prerequisite): spatial panning
 * doesn't need 60Hz updates either — 30Hz is perceptually smooth.
 */

// ============================================================
// THROTTLED UPDATE SCHEDULER
// ============================================================

export class ThrottledScheduler {
  private timers: Map<string, { lastUpdate: number; intervalMs: number }> = new Map();

  /**
   * Register a named update channel with a target rate.
   * @param name - Channel identifier (e.g., 'stochastic', 'spatial', 'visualization')
   * @param rateHz - Target update rate in Hz
   */
  register(name: string, rateHz: number): void {
    this.timers.set(name, {
      lastUpdate: 0,
      intervalMs: 1000 / Math.max(0.1, rateHz),
    });
  }

  /**
   * Check if a named channel should update this frame.
   * Call this inside requestAnimationFrame. Returns true when
   * enough time has elapsed since the last update.
   * 
   * @param name - Channel identifier
   * @param currentTimeMs - performance.now() or Date.now()
   * @returns true if this channel should execute this frame
   */
  shouldUpdate(name: string, currentTimeMs: number): boolean {
    const timer = this.timers.get(name);
    if (!timer) return true; // Unregistered channels always update

    if (currentTimeMs - timer.lastUpdate >= timer.intervalMs) {
      timer.lastUpdate = currentTimeMs;
      return true;
    }
    return false;
  }

  /**
   * Update the rate for a channel (e.g., when phase changes).
   */
  setRate(name: string, rateHz: number): void {
    const timer = this.timers.get(name);
    if (timer) {
      timer.intervalMs = 1000 / Math.max(0.1, rateHz);
    }
  }

  /**
   * Reset all timers (e.g., on protocol start).
   */
  reset(): void {
    for (const timer of this.timers.values()) {
      timer.lastUpdate = 0;
    }
  }
}

// ============================================================
// DEFAULT CHANNEL CONFIGURATION
// ============================================================

/**
 * Recommended update rates for each subsystem.
 * Based on perceptual requirements and CPU efficiency.
 */
export const UPDATE_RATES = {
  // Stochastic jitter: 2-5Hz mimics natural EEG drift rate
  // Lower = more natural, higher = more variation perceived
  STOCHASTIC: 3,       // Hz

  // Spatial motion: 30Hz is perceptually smooth for panning
  // No benefit above 30Hz — human spatial hearing has ~5ms resolution
  SPATIAL: 30,          // Hz

  // Visualization: 30Hz for canvas rendering
  // Reduces CPU load by 50% vs 60Hz with no visible difference
  VISUALIZATION: 30,    // Hz

  // Frequency sweep interpolation: 10Hz is fine for smooth sweeps
  // The ear cannot detect frequency changes faster than ~20ms
  FREQUENCY_SWEEP: 10,  // Hz

  // Gain envelope: 30Hz for smooth fades
  GAIN_ENVELOPE: 30,    // Hz

  // QA metrics collection: 2Hz is sufficient for monitoring
  QA_METRICS: 2,        // Hz
};

// ============================================================
// INTEGRATION INTO modulatePhase()
// ============================================================
/**
 * Create scheduler once in AudioEngine constructor:
 * 
 *   this.scheduler = new ThrottledScheduler();
 *   this.scheduler.register('stochastic', UPDATE_RATES.STOCHASTIC);
 *   this.scheduler.register('spatial', UPDATE_RATES.SPATIAL);
 *   this.scheduler.register('visualization', UPDATE_RATES.VISUALIZATION);
 *   this.scheduler.register('sweep', UPDATE_RATES.FREQUENCY_SWEEP);
 *   this.scheduler.register('envelope', UPDATE_RATES.GAIN_ENVELOPE);
 *   this.scheduler.register('qa', UPDATE_RATES.QA_METRICS);
 * 
 * Then in the animation frame loop:
 * 
 *   const animate = (timestamp: number) => {
 *     // Stochastic jitter — 3Hz update rate
 *     if (this.scheduler.shouldUpdate('stochastic', timestamp)) {
 *       this.applyStochasticJitter(phase, nodes);
 *     }
 *     
 *     // Spatial motion — 30Hz update rate
 *     if (this.scheduler.shouldUpdate('spatial', timestamp)) {
 *       this.animateSpatialMotion(phase, nodes, timestamp);
 *     }
 *     
 *     // Visualization — 30Hz update rate
 *     if (this.scheduler.shouldUpdate('visualization', timestamp)) {
 *       this.updateVisualization();
 *     }
 *     
 *     // Frequency sweep — 10Hz for smooth progression
 *     if (this.scheduler.shouldUpdate('sweep', timestamp)) {
 *       this.interpolateFrequency(phase, elapsed);
 *     }
 *     
 *     requestAnimationFrame(animate);
 *   };
 * 
 * CPU SAVINGS ESTIMATE:
 * - Stochastic: 60Hz → 3Hz = 95% reduction
 * - Spatial: 60Hz → 30Hz = 50% reduction
 * - Visualization: 60Hz → 30Hz = 50% reduction
 * - Overall animation loop: ~40-60% CPU reduction
 * 
 * This is significant on mobile devices where battery life matters
 * for 90-minute sleep protocols.
 */

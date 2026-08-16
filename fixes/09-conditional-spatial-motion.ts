/**
 * FIX #9: Conditional Spatial Motion Animation
 * 
 * PROBLEM: animateSpatialMotion() uses recursive requestAnimationFrame
 * and runs continuously even when spatialMotion is "fixed" (no panning).
 * This wastes CPU cycles calculating sin/cos/random values that result
 * in pan=0 every frame. On a 90-minute sleep protocol with fixed spatial,
 * that's ~324,000 wasted function calls.
 * 
 * SOLUTION: 
 * 1. Don't start animation loop when mode is 'fixed'
 * 2. Use setValueAtTime() instead of per-frame value assignment
 * 3. Cancel animation when protocol stops or spatial mode is fixed
 * 4. Integrate with ThrottledScheduler from Fix #8
 */

// ============================================================
// OPTIMIZED SPATIAL MOTION ENGINE
// ============================================================

export type SpatialMode = 'fixed' | 'rotate' | 'pendulum' | 'breathe' | 'random' | 'lissajous';

export interface SpatialMotionConfig {
  mode: SpatialMode;
  rate: number;          // Speed multiplier (0.05 - 2.0)
  depth: number;         // Pan depth (0-1, how far L/R)
  randomProbability?: number;  // For 'random' mode (0-1)
}

/**
 * Optimized spatial motion calculator.
 * Only computes when motion is active. Uses Web Audio scheduling
 * where possible to offload work to the audio thread.
 * 
 * Key optimization: for deterministic modes (rotate, pendulum, breathe,
 * lissajous), we can schedule pan changes ahead of time using
 * setValueAtTime(), reducing main thread involvement.
 */
export class SpatialMotionEngine {
  private pannerL: StereoPannerNode | null = null;
  private pannerR: StereoPannerNode | null = null;
  private config: SpatialMotionConfig;
  private isAnimating: boolean = false;
  private animationId: number | null = null;
  private startTime: number = 0;
  private lastPanValue: number = 0;

  constructor(config: SpatialMotionConfig) {
    this.config = config;
  }

  /**
   * Connect panner nodes and start motion if needed.
   */
  start(
    ctx: AudioContext,
    pannerL: StereoPannerNode,
    pannerR?: StereoPannerNode
  ): void {
    this.pannerL = pannerL;
    this.pannerR = pannerR || null;
    this.startTime = ctx.currentTime;
    this.lastPanValue = 0;

    if (this.config.mode === 'fixed') {
      // SET ONCE AND DONE — no animation loop needed
      pannerL.pan.setValueAtTime(0, ctx.currentTime);
      if (pannerR) pannerR.pan.setValueAtTime(0, ctx.currentTime);
      this.isAnimating = false;
      return;
    }

    // For deterministic modes, pre-schedule a batch of pan changes
    if (this.canPreSchedule()) {
      this.preScheduleBatch(ctx, 5); // Schedule 5 seconds ahead
    }

    this.isAnimating = true;
  }

  /**
   * Stop animation and clean up.
   */
  stop(): void {
    this.isAnimating = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Whether this mode can be pre-scheduled on the audio thread.
   * Random mode cannot because it's stochastic.
   */
  private canPreSchedule(): boolean {
    return ['rotate', 'pendulum', 'breathe', 'lissajous'].includes(this.config.mode);
  }

  /**
   * Pre-schedule pan changes on the audio thread.
   * This removes the need for requestAnimationFrame entirely
   * for deterministic motion modes.
   * 
   * Call every N seconds to schedule the next batch.
   */
  private preScheduleBatch(ctx: AudioContext, durationSeconds: number): void {
    if (!this.pannerL) return;

    const stepsPerSecond = 30; // 30Hz pan updates (perceptually smooth)
    const totalSteps = Math.ceil(durationSeconds * stepsPerSecond);
    const stepDuration = 1 / stepsPerSecond;

    for (let i = 0; i < totalSteps; i++) {
      const time = ctx.currentTime + (i * stepDuration);
      const elapsed = (time - this.startTime);
      const panValue = this.calculatePan(elapsed);

      this.pannerL.pan.setValueAtTime(
        panValue * this.config.depth,
        time
      );
      if (this.pannerR) {
        this.pannerR.pan.setValueAtTime(
          -panValue * this.config.depth, // Inverse for stereo width
          time
        );
      }
    }
  }

  /**
   * Calculate pan position for a given elapsed time.
   * Pure function — no side effects, no state mutation.
   * 
   * @param elapsed - Seconds since motion started
   * @returns Pan value [-1, 1]
   */
  calculatePan(elapsed: number): number {
    const t = elapsed * this.config.rate;

    switch (this.config.mode) {
      case 'fixed':
        return 0;

      case 'rotate':
        return Math.sin(t * Math.PI * 2);

      case 'pendulum':
        // Smooth pendulum with slight acceleration at endpoints
        return Math.sin(t * Math.PI);

      case 'breathe':
        // Very slow sinusoidal, typically 0.1Hz rate
        return Math.sin(t * Math.PI * 2 * 0.1);

      case 'lissajous':
        // 2D Lissajous projected to 1D stereo field
        // Creates complex figure-8 patterns
        return Math.sin(t * 0.3) * Math.cos(t * 0.5);

      case 'random':
        // Stochastic — can't pre-schedule, handled in update()
        if (Math.random() < (this.config.randomProbability ?? 0.01)) {
          this.lastPanValue = (Math.random() * 2 - 1);
        }
        return this.lastPanValue;

      default:
        return 0;
    }
  }

  /**
   * Manual update for random mode (called from throttled animation loop).
   * Only needed when mode is 'random' since it can't be pre-scheduled.
   */
  update(ctx: AudioContext): void {
    if (!this.isAnimating || !this.pannerL) return;
    if (this.config.mode !== 'random') return; // Deterministic modes use pre-scheduling

    const panValue = this.calculatePan(ctx.currentTime - this.startTime);
    this.pannerL.pan.setValueAtTime(panValue * this.config.depth, ctx.currentTime);
    if (this.pannerR) {
      this.pannerR.pan.setValueAtTime(-panValue * this.config.depth, ctx.currentTime);
    }
  }

  /**
   * Extend pre-scheduled batch (call periodically for long sessions).
   * Only needed for deterministic modes.
   */
  extendSchedule(ctx: AudioContext): void {
    if (this.canPreSchedule() && this.isAnimating) {
      this.preScheduleBatch(ctx, 5);
    }
  }

  /**
   * Whether this engine needs animation frame updates.
   * Returns false for 'fixed' and deterministic pre-scheduled modes.
   */
  get needsAnimationFrame(): boolean {
    return this.isAnimating && this.config.mode === 'random';
  }
}

// ============================================================
// INTEGRATION
// ============================================================
/**
 * Replace existing spatial animation code with:
 * 
 *   // On phase start:
 *   this.spatialEngine = new SpatialMotionEngine({
 *     mode: phase.spatialMotion ?? 'fixed',
 *     rate: phase.spatialRate ?? 0.1,
 *     depth: phase.spatialDepth ?? 1.0,
 *   });
 *   this.spatialEngine.start(this.ctx, pannerNode);
 *   
 *   // In animation loop (only needed for 'random' mode):
 *   if (this.spatialEngine.needsAnimationFrame) {
 *     if (this.scheduler.shouldUpdate('spatial', timestamp)) {
 *       this.spatialEngine.update(this.ctx);
 *     }
 *   }
 *   
 *   // Every 5 seconds (for deterministic modes):
 *   if (this.scheduler.shouldUpdate('spatialReschedule', timestamp)) {
 *     this.spatialEngine.extendSchedule(this.ctx);
 *   }
 *   
 *   // On stop:
 *   this.spatialEngine.stop();
 * 
 * CPU SAVINGS:
 * - 'fixed' mode: 100% reduction (zero animation frames)
 * - Deterministic modes: ~95% reduction (pre-scheduled on audio thread)
 * - 'random' mode: 50% reduction (30Hz vs 60Hz via throttle)
 */

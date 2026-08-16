/**
 * FIX #9: Conditional Spatial Motion Animation
 * ==============================================
 * Eliminates wasted function calls for 'fixed' mode.
 * Pre-schedules deterministic modes on the audio thread.
 * Only uses requestAnimationFrame for 'random' mode.
 *
 * @version 2.0.0
 */

export type SpatialMode = 'fixed' | 'rotate' | 'pendulum' | 'breathe' | 'random' | 'lissajous';

export interface SpatialMotionConfig {
  mode: SpatialMode;
  rate: number;
  depth: number;
  randomProbability?: number;
}

export class SpatialMotionEngine {
  private pannerL: StereoPannerNode | null = null;
  private pannerR: StereoPannerNode | null = null;
  private config: SpatialMotionConfig;
  private isAnimating: boolean = false;
  private startTime: number = 0;
  private lastPanValue: number = 0;

  constructor(config: SpatialMotionConfig) {
    this.config = config;
  }

  start(ctx: AudioContext, pannerL: StereoPannerNode, pannerR?: StereoPannerNode): void {
    this.pannerL = pannerL;
    this.pannerR = pannerR || null;
    this.startTime = ctx.currentTime;
    this.lastPanValue = 0;

    if (this.config.mode === 'fixed') {
      pannerL.pan.setValueAtTime(0, ctx.currentTime);
      if (pannerR) pannerR.pan.setValueAtTime(0, ctx.currentTime);
      this.isAnimating = false;
      return;
    }

    if (this.canPreSchedule()) {
      this.preScheduleBatch(ctx, 5);
    }

    this.isAnimating = true;
  }

  stop(): void {
    this.isAnimating = false;
  }

  private canPreSchedule(): boolean {
    return ['rotate', 'pendulum', 'breathe', 'lissajous'].includes(this.config.mode);
  }

  private preScheduleBatch(ctx: AudioContext, durationSeconds: number): void {
    if (!this.pannerL) return;
    const stepsPerSecond = 30;
    const totalSteps = Math.ceil(durationSeconds * stepsPerSecond);
    const stepDuration = 1 / stepsPerSecond;

    for (let i = 0; i < totalSteps; i++) {
      const time = ctx.currentTime + (i * stepDuration);
      const elapsed = time - this.startTime;
      const panValue = this.calculatePan(elapsed);

      // Use linearRampToValueAtTime so the audio thread interpolates smoothly
      // between steps instead of creating a staircase pattern (which clicks)
      this.pannerL.pan.linearRampToValueAtTime(panValue * this.config.depth, time);
      if (this.pannerR) {
        this.pannerR.pan.linearRampToValueAtTime(-panValue * this.config.depth, time);
      }
    }
  }

  calculatePan(elapsed: number): number {
    const t = elapsed * this.config.rate;
    switch (this.config.mode) {
      case 'fixed': return 0;
      case 'rotate': return Math.sin(t * Math.PI * 2);
      case 'pendulum': return Math.sin(t * Math.PI);
      case 'breathe': return Math.sin(t * Math.PI * 2 * 0.1);
      case 'lissajous': return Math.sin(t * 0.3) * Math.cos(t * 0.5);
      case 'random':
        if (Math.random() < (this.config.randomProbability ?? 0.01)) {
          this.lastPanValue = (Math.random() * 2 - 1);
        }
        return this.lastPanValue;
      default: return 0;
    }
  }

  update(ctx: AudioContext): void {
    if (!this.isAnimating || !this.pannerL) return;
    if (this.config.mode !== 'random') return;

    const panValue = this.calculatePan(ctx.currentTime - this.startTime);
    // Smooth transition to random pan value to avoid click on instant jump
    this.pannerL.pan.setTargetAtTime(panValue * this.config.depth, ctx.currentTime, 0.05);
    if (this.pannerR) {
      this.pannerR.pan.setTargetAtTime(-panValue * this.config.depth, ctx.currentTime, 0.05);
    }
  }

  extendSchedule(ctx: AudioContext): void {
    if (this.canPreSchedule() && this.isAnimating) {
      this.preScheduleBatch(ctx, 5);
    }
  }

  get needsAnimationFrame(): boolean {
    return this.isAnimating && this.config.mode === 'random';
  }
}

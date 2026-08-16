/**
 * @module BinauralBeatStereoWidthAnimator
 * @group Spatial Audio & Immersion (Group 5)
 * @evidenceGrade ⚠️Speculative
 * @description Dynamically spatializes binaural beat differential across 180° soundstage using
 * HRTF-based panning. Creates immersive 'rotating' beat sensation that enhances engagement
 * and reduces adaptation.
 *
 * SAFETY WARNINGS:
 * - Motion sensitivity: Some users may experience disorientation from spatial movement
 * - Start conservatively: Begin with slow pendulum (0.05 Hz), increase if tolerated
 * - User controls: Enable/disable animation, adjust speed, choose pattern
 * - SPL limits: Assumes upstream level manager enforces <85 dB
 *
 * EXPERIMENTAL STATUS:
 * This is an engagement hypothesis, NOT a proven entrainment enhancement. Spatial movement
 * may interfere with entrainment efficacy. Requires N-of-1 validation.
 *
 * @browserConstraints
 * - HRTF panning: Chrome, Firefox, Safari (all modern browsers)
 * - Different browsers use different HRTF datasets (MIT KEMAR vs proprietary)
 * - Elevation rendering less accurate than azimuth in most implementations
 *
 * @performanceTarget <2% CPU on iPhone 12 / Pixel 6
 */

export type RotationPattern = 'circular' | 'pendulum' | 'figure_eight' | 'random_walk' | 'static';

export interface SpatialPosition {
  azimuth: number; // degrees: -180 to +180
  elevation: number; // degrees: -90 to +90
  distance: number; // meters: optimal HRTF range 1-3m
}

export interface AnimationOptions {
  speed: number; // Hz: 0.05-0.2 (20-5 second period)
  radius: number; // meters
  initialAzimuth?: number;
  elevation?: number;
}

/**
 * Binaural Beat Stereo Width Animator
 *
 * Uses Web Audio API PannerNode with HRTF panning model to create 3D spatial movement
 * of binaural beat sources. Supports multiple rotation patterns for varied engagement.
 */
export class BinauralBeatStereoWidthAnimator {
  private context: AudioContext;
  private listener: AudioListener;
  private leftPanner: PannerNode;
  private rightPanner: PannerNode;

  private rotationSpeed: number = 0.1; // Hz
  private rotationRadius: number = 2; // meters
  private rotationPattern: RotationPattern = 'static';
  private animationStartTime: number = 0;
  private isAnimating: boolean = false;
  private animationFrameId: number | null = null;

  // Safety limits
  private readonly MAX_SPEED = 0.2; // Hz
  private readonly MAX_ELEVATION = 30; // degrees

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.listener = audioContext.listener;

    // Create panner nodes for left and right carriers
    this.leftPanner = new PannerNode(this.context, {
      panningModel: 'HRTF',
      distanceModel: 'linear',
      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
    });

    this.rightPanner = new PannerNode(this.context, {
      panningModel: 'HRTF',
      distanceModel: 'linear',
      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
    });

    // Set listener position (user's head at origin)
    this.listener.positionX.value = 0;
    this.listener.positionY.value = 0;
    this.listener.positionZ.value = 0;
    this.listener.forwardX.value = 0;
    this.listener.forwardY.value = 0;
    this.listener.forwardZ.value = -1;
    this.listener.upX.value = 0;
    this.listener.upY.value = 1;
    this.listener.upZ.value = 0;
  }

  /**
   * Connect audio sources to spatial panners
   */
  connect(leftSource: AudioNode, rightSource: AudioNode, destination: AudioNode): void {
    leftSource.connect(this.leftPanner);
    rightSource.connect(this.rightPanner);
    this.leftPanner.connect(destination);
    this.rightPanner.connect(destination);
  }

  /**
   * Start spatial animation with specified pattern
   */
  startAnimation(pattern: RotationPattern = 'circular', options?: Partial<AnimationOptions>): void {
    this.rotationPattern = pattern;
    if (options?.speed) this.rotationSpeed = Math.min(options.speed, this.MAX_SPEED);
    if (options?.radius) this.rotationRadius = options.radius;

    this.animationStartTime = this.context.currentTime;
    this.isAnimating = true;
    this.animate();
  }

  /**
   * Stop animation and return to center
   */
  stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.setStaticPosition(0, 0);
  }

  /**
   * Set static spatial position
   */
  setStaticPosition(azimuthDegrees: number, elevationDegrees: number = 0): void {
    const azimuth = azimuthDegrees * (Math.PI / 180);
    const elevation = Math.min(Math.abs(elevationDegrees), this.MAX_ELEVATION) * (Math.PI / 180) * Math.sign(elevationDegrees);

    // Simulate inter-aural separation
    const separation = 0.15; // meters (half of typical 30cm head width)

    const leftX = -separation + this.rotationRadius * Math.sin(azimuth) * Math.cos(elevation);
    const leftY = this.rotationRadius * Math.sin(elevation);
    const leftZ = -this.rotationRadius * Math.cos(azimuth) * Math.cos(elevation);

    const rightX = separation + this.rotationRadius * Math.sin(azimuth) * Math.cos(elevation);
    const rightY = this.rotationRadius * Math.sin(elevation);
    const rightZ = -this.rotationRadius * Math.cos(azimuth) * Math.cos(elevation);

    this.leftPanner.positionX.value = leftX;
    this.leftPanner.positionY.value = leftY;
    this.leftPanner.positionZ.value = leftZ;

    this.rightPanner.positionX.value = rightX;
    this.rightPanner.positionY.value = rightY;
    this.rightPanner.positionZ.value = rightZ;
  }

  /**
   * Animation loop using requestAnimationFrame
   */
  private animate = (): void => {
    if (!this.isAnimating) return;

    const currentTime = this.context.currentTime;
    const elapsed = currentTime - this.animationStartTime;

    let azimuth: number;
    let elevation: number;

    switch (this.rotationPattern) {
      case 'circular':
        azimuth = (elapsed * this.rotationSpeed * 360) % 360 - 180;
        elevation = 0;
        break;

      case 'pendulum':
        azimuth = 90 * Math.sin(2 * Math.PI * this.rotationSpeed * elapsed);
        elevation = 0;
        break;

      case 'figure_eight':
        azimuth = 90 * Math.sin(2 * Math.PI * this.rotationSpeed * elapsed);
        elevation = 30 * Math.sin(2 * 2 * Math.PI * this.rotationSpeed * elapsed);
        break;

      case 'random_walk':
        // Bounded Brownian motion
        const currentAz = this.leftPanner.positionX.value;
        azimuth = Math.max(-90, Math.min(90, currentAz + (Math.random() - 0.5) * 20));
        elevation = (Math.random() - 0.5) * 10;
        break;

      case 'static':
      default:
        azimuth = 0;
        elevation = 0;
    }

    this.setStaticPosition(azimuth, elevation);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.stopAnimation();
    this.leftPanner.disconnect();
    this.rightPanner.disconnect();
  }
}

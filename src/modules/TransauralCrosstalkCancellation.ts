/**
 * @module TransauralCrosstalkCancellation
 * @group Spatial Audio & Immersion (Group 5)
 * @evidenceGrade Speculative
 * @description Implements simplified crosstalk cancellation for speaker playback.
 *
 * SAFETY WARNINGS:
 * - Crosstalk cancellation only works in a narrow sweet spot.
 * - Head movement out of the sweet spot significantly degrades cancellation.
 * - Room reflections degrade performance; use near-field or treated spaces.
 * - SPL limits must be enforced upstream.
 */

export interface SpeakerSetup {
  angle: number;
  distance: number;
  height: number;
}

export interface HeadPosition {
  azimuth: number;
  elevation: number;
  distance: number;
}

export class TransauralCrosstalkCancellation {
  public readonly input: GainNode;
  public readonly output: GainNode;

  private readonly context: AudioContext;
  private readonly splitter: ChannelSplitterNode;
  private readonly merger: ChannelMergerNode;
  private readonly leftDirect: BiquadFilterNode;
  private readonly leftCrosstalkCancel: BiquadFilterNode;
  private readonly leftDelay: DelayNode;
  private readonly leftMix: GainNode;
  private readonly rightDirect: BiquadFilterNode;
  private readonly rightCrosstalkCancel: BiquadFilterNode;
  private readonly rightDelay: DelayNode;
  private readonly rightMix: GainNode;

  private speakerAngle: number;
  private earDistance = 0.18;
  private headTrackingEnabled = false;
  private currentHeadAzimuth = 0;
  private orientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;

  private readonly MIN_SPEAKER_ANGLE = 10;
  private readonly MAX_SPEAKER_ANGLE = 60;
  private readonly MIN_EAR_DISTANCE = 0.15;
  private readonly MAX_EAR_DISTANCE = 0.25;
  private readonly MAX_ITD = 0.0006;

  constructor(
    audioContext: AudioContext,
    speakerSetup: SpeakerSetup = { angle: 60, distance: 1.5, height: 0 }
  ) {
    this.context = audioContext;
    this.assertSpeakerAngle(speakerSetup.angle);
    this.speakerAngle = speakerSetup.angle;

    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.splitter = this.context.createChannelSplitter(2);
    this.merger = this.context.createChannelMerger(2);

    this.leftDirect = this.createShelf(3);
    this.leftCrosstalkCancel = this.createShelf(-6);
    this.leftDelay = this.context.createDelay(0.1);
    this.leftDelay.delayTime.value = 0.0002;
    this.leftMix = this.context.createGain();

    this.rightDirect = this.createShelf(3);
    this.rightCrosstalkCancel = this.createShelf(-6);
    this.rightDelay = this.context.createDelay(0.1);
    this.rightDelay.delayTime.value = 0.0002;
    this.rightMix = this.context.createGain();

    this.routeStereoInput(this.input, this.output);
  }

  connect(leftInput: AudioNode, rightInput: AudioNode, destination: AudioNode): void {
    this.routeInputs(leftInput, rightInput, destination);
  }

  setSpeakerAngle(angleDegrees: number): void {
    this.assertSpeakerAngle(angleDegrees);
    this.speakerAngle = angleDegrees;
    this.updateFiltersForHeadPosition(this.currentHeadAzimuth);
  }

  setEarDistance(distanceMeters: number): void {
    if (
      !Number.isFinite(distanceMeters) ||
      distanceMeters < this.MIN_EAR_DISTANCE ||
      distanceMeters > this.MAX_EAR_DISTANCE
    ) {
      throw new Error(`Ear distance must be between ${this.MIN_EAR_DISTANCE}m and ${this.MAX_EAR_DISTANCE}m`);
    }

    this.earDistance = distanceMeters;
    this.updateFiltersForHeadPosition(this.currentHeadAzimuth);
  }

  enableHeadTracking(): boolean {
    if (this.headTrackingEnabled) return true;

    if (typeof DeviceOrientationEvent === 'undefined') {
      console.warn('DeviceOrientationEvent not supported');
      return false;
    }

    const orientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    };

    if (typeof orientationEvent.requestPermission === 'function') {
      orientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            this.startHeadTracking();
          } else {
            console.warn('Device orientation permission denied');
          }
        })
        .catch((error: Error) => {
          console.error('Error requesting device orientation permission:', error);
        });
    } else {
      this.startHeadTracking();
    }

    return true;
  }

  disableHeadTracking(): void {
    if (this.orientationHandler) {
      window.removeEventListener('deviceorientation', this.orientationHandler);
      this.orientationHandler = null;
    }

    this.headTrackingEnabled = false;
    this.currentHeadAzimuth = 0;
    this.updateFiltersForHeadPosition(0);
  }

  getHeadPosition(): HeadPosition {
    return {
      azimuth: this.currentHeadAzimuth,
      elevation: 0,
      distance: 0,
    };
  }

  isInSweetSpot(): boolean {
    return Math.abs(this.currentHeadAzimuth) < 15;
  }

  disconnect(): void {
    this.disableHeadTracking();

    [
      this.input,
      this.output,
      this.splitter,
      this.leftDirect,
      this.leftCrosstalkCancel,
      this.leftDelay,
      this.leftMix,
      this.rightDirect,
      this.rightCrosstalkCancel,
      this.rightDelay,
      this.rightMix,
      this.merger,
    ].forEach((node) => node.disconnect());
  }

  private createShelf(gain: number): BiquadFilterNode {
    const filter = this.context.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 2000;
    filter.gain.value = gain;
    return filter;
  }

  private routeStereoInput(source: AudioNode, destination: AudioNode): void {
    source.connect(this.splitter);
    this.routeInputs(this.splitter, this.splitter, destination, 0, 1);
  }

  private routeInputs(
    leftInput: AudioNode,
    rightInput: AudioNode,
    destination: AudioNode,
    leftOutputIndex?: number,
    rightOutputIndex?: number
  ): void {
    leftInput.connect(this.leftDirect, leftOutputIndex);
    rightInput.connect(this.leftCrosstalkCancel, rightOutputIndex);
    this.leftCrosstalkCancel.connect(this.leftDelay);
    this.leftDirect.connect(this.leftMix);
    this.leftDelay.connect(this.leftMix);
    this.leftMix.connect(this.merger, 0, 0);

    rightInput.connect(this.rightDirect, rightOutputIndex);
    leftInput.connect(this.rightCrosstalkCancel, leftOutputIndex);
    this.rightCrosstalkCancel.connect(this.rightDelay);
    this.rightDirect.connect(this.rightMix);
    this.rightDelay.connect(this.rightMix);
    this.rightMix.connect(this.merger, 0, 1);

    this.merger.connect(destination);
  }

  private startHeadTracking(): void {
    this.orientationHandler = (event: DeviceOrientationEvent) => {
      if (event.alpha === null) return;

      let azimuth = event.alpha;
      if (azimuth > 180) azimuth -= 360;

      this.currentHeadAzimuth = azimuth;
      this.updateFiltersForHeadPosition(azimuth);
    };

    window.addEventListener('deviceorientation', this.orientationHandler);
    this.headTrackingEnabled = true;
  }

  private updateFiltersForHeadPosition(azimuth: number): void {
    const speakerAngleScale = this.speakerAngle / this.MAX_SPEAKER_ANGLE;
    const earDistanceScale = this.earDistance / 0.18;
    const azimuthRad = azimuth * (Math.PI / 180);
    const leftITD = this.MAX_ITD * speakerAngleScale * earDistanceScale * Math.sin(azimuthRad);

    // Smooth toward the new ITD instead of jumping — instantaneous delay
    // changes click audibly during head movement.
    const now = this.context.currentTime;
    const SMOOTHING = 0.02; // seconds
    if (leftITD >= 0) {
      this.leftDelay.delayTime.setTargetAtTime(leftITD, now, SMOOTHING);
      this.rightDelay.delayTime.setTargetAtTime(0.0001, now, SMOOTHING);
    } else {
      this.leftDelay.delayTime.setTargetAtTime(0.0001, now, SMOOTHING);
      this.rightDelay.delayTime.setTargetAtTime(-leftITD, now, SMOOTHING);
    }
  }

  private assertSpeakerAngle(angleDegrees: number): void {
    if (
      !Number.isFinite(angleDegrees) ||
      angleDegrees < this.MIN_SPEAKER_ANGLE ||
      angleDegrees > this.MAX_SPEAKER_ANGLE
    ) {
      throw new Error(`Speaker angle must be between ${this.MIN_SPEAKER_ANGLE} and ${this.MAX_SPEAKER_ANGLE} degrees`);
    }
  }
}

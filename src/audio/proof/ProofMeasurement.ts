import {
  SignalProofTap,
  type StereoSnapshot,
  type ToneMeasurement,
} from './SignalProofTap.ts';

export type ProofMeasurementStatus =
  | 'ok'
  | 'insufficient-audio'
  | 'signal-unavailable'
  | 'out-of-tolerance';

export interface ProofMeasurementRequest {
  expectedLeftHz?: number;
  expectedRightHz?: number;
  carrierToleranceHz?: number;
  beatToleranceHz?: number;
}

export interface ChannelProof {
  prescribedHz: number | null;
  measuredHz: number | null;
  magnitude: number | null;
  errorHz: number | null;
  withinTolerance: boolean | null;
}

export interface StereoProofMeasurement {
  status: ProofMeasurementStatus;
  sampleRate: number;
  endFrame: number;
  left: ChannelProof;
  right: ChannelProof;
  prescribedBeatHz: number | null;
  measuredBeatHz: number | null;
  beatErrorHz: number | null;
  beatWithinTolerance: boolean | null;
}

const finitePositive = (value: number | undefined): number | null =>
  value !== undefined && Number.isFinite(value) && value > 0 ? value : null;

const measureChannel = (
  signal: Float32Array,
  sampleRate: number,
  prescribedHz: number | null,
  toleranceHz: number,
): ChannelProof => {
  const measurement: ToneMeasurement | null = prescribedHz
    ? SignalProofTap.measureTone(signal, prescribedHz, sampleRate)
    : SignalProofTap.acquireTone(signal, sampleRate);

  if (!measurement) {
    return {
      prescribedHz,
      measuredHz: null,
      magnitude: null,
      errorHz: null,
      withinTolerance: null,
    };
  }

  const errorHz = prescribedHz === null ? null : measurement.frequency - prescribedHz;
  return {
    prescribedHz,
    measuredHz: measurement.frequency,
    magnitude: measurement.magnitude,
    errorHz,
    withinTolerance: errorHz === null ? null : Math.abs(errorHz) <= toleranceHz,
  };
};

export const measureStereoProof = (
  snapshot: StereoSnapshot | null,
  request: ProofMeasurementRequest = {},
): StereoProofMeasurement | null => {
  if (!snapshot) return null;

  const carrierToleranceHz = request.carrierToleranceHz ?? 0.25;
  const beatToleranceHz = request.beatToleranceHz ?? 0.25;
  const expectedLeftHz = finitePositive(request.expectedLeftHz);
  const expectedRightHz = finitePositive(request.expectedRightHz);

  const left = measureChannel(snapshot.left, snapshot.sampleRate, expectedLeftHz, carrierToleranceHz);
  const right = measureChannel(snapshot.right, snapshot.sampleRate, expectedRightHz, carrierToleranceHz);

  const prescribedBeatHz =
    expectedLeftHz !== null && expectedRightHz !== null
      ? Math.abs(expectedRightHz - expectedLeftHz)
      : null;
  const measuredBeatHz =
    left.measuredHz !== null && right.measuredHz !== null
      ? Math.abs(right.measuredHz - left.measuredHz)
      : null;
  const beatErrorHz =
    prescribedBeatHz !== null && measuredBeatHz !== null
      ? measuredBeatHz - prescribedBeatHz
      : null;
  const beatWithinTolerance =
    beatErrorHz === null ? null : Math.abs(beatErrorHz) <= beatToleranceHz;

  const unavailable = left.measuredHz === null || right.measuredHz === null;
  const failedTolerance =
    left.withinTolerance === false ||
    right.withinTolerance === false ||
    beatWithinTolerance === false;

  return {
    status: unavailable ? 'signal-unavailable' : failedTolerance ? 'out-of-tolerance' : 'ok',
    sampleRate: snapshot.sampleRate,
    endFrame: snapshot.endFrame,
    left,
    right,
    prescribedBeatHz,
    measuredBeatHz,
    beatErrorHz,
    beatWithinTolerance,
  };
};

export const snapshotAndMeasureStereoProof = (
  tap: SignalProofTap | null,
  frames: number,
  request: ProofMeasurementRequest = {},
): StereoProofMeasurement => {
  if (!tap) return unavailableProof('signal-unavailable');
  const snapshot = tap.snapshot(frames);
  if (!snapshot) return unavailableProof('insufficient-audio', tap.sampleRate);
  return measureStereoProof(snapshot, request) ?? unavailableProof('signal-unavailable');
};

const unavailableChannel = (): ChannelProof => ({
  prescribedHz: null,
  measuredHz: null,
  magnitude: null,
  errorHz: null,
  withinTolerance: null,
});

const unavailableProof = (
  status: Extract<ProofMeasurementStatus, 'insufficient-audio' | 'signal-unavailable'>,
  sampleRate = 0,
): StereoProofMeasurement => ({
  status,
  sampleRate,
  endFrame: 0,
  left: unavailableChannel(),
  right: unavailableChannel(),
  prescribedBeatHz: null,
  measuredBeatHz: null,
  beatErrorHz: null,
  beatWithinTolerance: null,
});

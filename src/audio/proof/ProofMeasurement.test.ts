import { describe, expect, it } from 'vitest';
import { measureStereoProof, snapshotAndMeasureStereoProof } from './ProofMeasurement';
import { SignalProofTap } from './SignalProofTap';

const sine = (frequency: number, sampleRate: number, frames: number): Float32Array => {
  const output = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    output[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }
  return output;
};

describe('ProofMeasurement', () => {
  it('reports measured carriers and beat within tolerance', () => {
    const sampleRate = 48_000;
    const frames = sampleRate * 2;
    const result = measureStereoProof(
      {
        left: sine(200, sampleRate, frames),
        right: sine(210, sampleRate, frames),
        sampleRate,
        endFrame: frames,
      },
      {
        expectedLeftHz: 200,
        expectedRightHz: 210,
        carrierToleranceHz: 0.05,
        beatToleranceHz: 0.05,
      },
    );

    expect(result).not.toBeNull();
    expect(result!.status).toBe('ok');
    expect(result!.left.measuredHz).toBeCloseTo(200, 2);
    expect(result!.right.measuredHz).toBeCloseTo(210, 2);
    expect(result!.measuredBeatHz).toBeCloseTo(10, 2);
    expect(result!.beatWithinTolerance).toBe(true);
  });

  it('reports out-of-tolerance instead of hiding disagreement', () => {
    const sampleRate = 48_000;
    const frames = sampleRate * 2;
    // Keep the offset inside the estimator's unambiguous phase-slope window,
    // while choosing a much tighter requested tolerance. This tests the status
    // contract rather than intentionally driving the estimator into unavailable.
    const result = measureStereoProof(
      {
        left: sine(200.02, sampleRate, frames),
        right: sine(210.03, sampleRate, frames),
        sampleRate,
        endFrame: frames,
      },
      {
        expectedLeftHz: 200,
        expectedRightHz: 210,
        carrierToleranceHz: 0.005,
        beatToleranceHz: 0.005,
      },
    );

    expect(result!.status).toBe('out-of-tolerance');
    expect(result!.left.withinTolerance).toBe(false);
    expect(result!.right.withinTolerance).toBe(false);
    expect(result!.beatWithinTolerance).toBe(false);
  });

  it('reports unavailable rather than fabricating values for silence', () => {
    const result = measureStereoProof({
      left: new Float32Array(4096),
      right: new Float32Array(4096),
      sampleRate: 48_000,
      endFrame: 4096,
    });

    expect(result!.status).toBe('signal-unavailable');
    expect(result!.left.measuredHz).toBeNull();
    expect(result!.right.measuredHz).toBeNull();
    expect(result!.measuredBeatHz).toBeNull();
  });

  it('distinguishes unsupported tap from insufficient captured audio', () => {
    expect(snapshotAndMeasureStereoProof(null, 4096).status).toBe('signal-unavailable');

    const tap = new SignalProofTap(48_000, 1);
    tap.write(new Float32Array(128));
    expect(snapshotAndMeasureStereoProof(tap, 4096).status).toBe('insufficient-audio');
  });
});

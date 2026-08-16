import { describe, expect, it } from 'vitest';
import { SignalProofTap } from './SignalProofTap';

const sine = (
  frequency: number,
  sampleRate: number,
  frames: number,
  phase = 0,
): Float32Array => {
  const output = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    output[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate + phase);
  }
  return output;
};

describe('SignalProofTap', () => {
  it('rejects invalid construction parameters', () => {
    expect(() => new SignalProofTap(0)).toThrow(RangeError);
    expect(() => new SignalProofTap(48_000, 0)).toThrow(RangeError);
  });

  it('returns null until the requested frame count is available', () => {
    const tap = new SignalProofTap(48_000, 0.1);
    tap.write(new Float32Array([1, 2, 3]));
    expect(tap.snapshot(4)).toBeNull();
  });

  it('returns the newest stereo frames in chronological order after wrapping', () => {
    const tap = new SignalProofTap(1_000, 0.001);
    const total = tap.capacity + 8;
    const left = new Float32Array(total);
    const right = new Float32Array(total);
    for (let i = 0; i < total; i += 1) {
      left[i] = i;
      right[i] = -i;
    }

    tap.write(left, right);
    const snapshot = tap.snapshot(8);
    expect(snapshot).not.toBeNull();
    expect(Array.from(snapshot!.left)).toEqual(
      Array.from({ length: 8 }, (_, index) => total - 8 + index),
    );
    expect(Array.from(snapshot!.right)).toEqual(
      Array.from({ length: 8 }, (_, index) => -(total - 8 + index)),
    );
    expect(snapshot!.endFrame).toBe(total);
  });

  it('measures a clean tone to sub-hertz precision', () => {
    const sampleRate = 48_000;
    const actual = 417.35;
    const signal = sine(actual, sampleRate, sampleRate * 2);
    const result = SignalProofTap.measureTone(signal, 417, sampleRate);

    expect(result).not.toBeNull();
    expect(result!.frequency).toBeCloseTo(actual, 2);
    // The two-window quadrature estimator reports correlation magnitude,
    // not normalized signal amplitude. A clean unit sine should remain well
    // above the noise-rejection floor without asserting a false 0.5 scale.
    expect(result!.magnitude).toBeGreaterThan(0.35);
  });

  it('acquires a clean tone without an expected frequency', () => {
    const sampleRate = 48_000;
    const actual = 233.2;
    const signal = sine(actual, sampleRate, sampleRate * 2, 0.37);
    const result = SignalProofTap.acquireTone(signal, sampleRate);

    expect(result).not.toBeNull();
    expect(result!.frequency).toBeCloseTo(actual, 2);
  });

  it('rejects silence and undersized windows', () => {
    expect(SignalProofTap.acquireTone(new Float32Array(128), 48_000)).toBeNull();
    expect(SignalProofTap.acquireTone(new Float32Array(4096), 48_000)).toBeNull();
  });

  it('clears retained samples and frame history', () => {
    const tap = new SignalProofTap(48_000, 0.1);
    tap.write(sine(440, 48_000, 1024));
    expect(tap.snapshot(1024)).not.toBeNull();
    tap.clear();
    expect(tap.snapshot(1)).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import {
  evaluateRefreshCompatibility,
  protocolSupportsPhotic,
  isGammaBeat,
  GAMMA_TARGET_HZ,
  PHOTIC_LIMITS,
} from '../photicSafety';

describe('photic safety — refresh compatibility', () => {
  it('REFUSES 60 Hz (the dangerous case: 40 Hz would alias into 15-25 Hz)', () => {
    const result = evaluateRefreshCompatibility(60);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/alias|drift|disabled/i);
  });

  it('refuses 59.94 Hz (near-60, still 1.5x)', () => {
    expect(evaluateRefreshCompatibility(59.94).ok).toBe(false);
  });

  it('accepts 120 Hz with 3 frames per cycle', () => {
    const result = evaluateRefreshCompatibility(120);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.framesPerCycle).toBe(3);
      expect(result.onFrames).toBeGreaterThanOrEqual(1);
      expect(result.onFrames).toBeLessThan(3);
    }
  });

  it('accepts 240 Hz with 6 frames per cycle', () => {
    const result = evaluateRefreshCompatibility(240);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.framesPerCycle).toBe(6);
  });

  it('accepts a realistically-measured 119.88 Hz (within tolerance)', () => {
    expect(evaluateRefreshCompatibility(119.88).ok).toBe(true);
  });

  it('refuses 90 Hz (2.25x — not an integer multiple)', () => {
    expect(evaluateRefreshCompatibility(90).ok).toBe(false);
  });

  it('refuses 100 Hz (2.5x — would drift)', () => {
    expect(evaluateRefreshCompatibility(100).ok).toBe(false);
  });

  it('refuses zero / NaN / negative refresh', () => {
    expect(evaluateRefreshCompatibility(0).ok).toBe(false);
    expect(evaluateRefreshCompatibility(NaN).ok).toBe(false);
    expect(evaluateRefreshCompatibility(-120).ok).toBe(false);
  });

  it('on-frames never spans the whole cycle (always has an off phase)', () => {
    for (const hz of [120, 240, 360, 480]) {
      const result = evaluateRefreshCompatibility(hz);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.onFrames).toBeGreaterThanOrEqual(1);
        expect(result.onFrames).toBeLessThan(result.framesPerCycle);
      }
    }
  });
});

describe('photic safety — gamma beat detection', () => {
  it('treats 40 Hz and near-40 as gamma', () => {
    expect(isGammaBeat(40)).toBe(true);
    expect(isGammaBeat(39)).toBe(true);
    expect(isGammaBeat(41)).toBe(true);
  });
  it('rejects non-gamma beats', () => {
    expect(isGammaBeat(10)).toBe(false);
    expect(isGammaBeat(20)).toBe(false);
    expect(isGammaBeat(35)).toBe(false);
  });
});

describe('photic safety — protocol eligibility', () => {
  it('includes the canonical GENUS protocol', () => {
    expect(protocolSupportsPhotic('mgs_40')).toBe(true);
  });
  it('excludes non-gamma protocols and nullish ids', () => {
    expect(protocolSupportsPhotic('deep_sleep_delta')).toBe(false);
    expect(protocolSupportsPhotic(undefined)).toBe(false);
    expect(protocolSupportsPhotic(null)).toBe(false);
  });
});

describe('photic safety — luminance limits are conservative', () => {
  it('never flashes to pure white', () => {
    expect(PHOTIC_LIMITS.brightRGB.some((c) => c < 255) || PHOTIC_LIMITS.maxIntensity < 1).toBe(true);
  });
  it('bright state is warm (red not the brightest, avoiding red provocation is moot but blue is reduced)', () => {
    const [r, g, b] = PHOTIC_LIMITS.brightRGB;
    expect(b).toBeLessThanOrEqual(g);
    expect(g).toBeLessThanOrEqual(r);
  });
  it('caps intensity below full', () => {
    expect(PHOTIC_LIMITS.maxIntensity).toBeLessThanOrEqual(0.8);
  });
  it('has a non-trivial onset ramp', () => {
    expect(PHOTIC_LIMITS.onsetRampSeconds).toBeGreaterThanOrEqual(2);
  });
  it('targets 40 Hz', () => {
    expect(GAMMA_TARGET_HZ).toBe(40);
  });
});

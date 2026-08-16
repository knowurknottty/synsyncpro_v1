/**
 * SynSync Pro — Octave Layer Resolver
 * ====================================
 * Computes octave-spaced harmonic layers for carrier and overlay frequencies.
 * This is the core DSP enhancement that makes SynSync protocols richer and
 * more neurologically effective than single-frequency approaches.
 * 
 * Theory: Harmonic stacking leverages the phantom fundamental principle
 * (Houtsma & Goldstein 1972) — the brain perceives the fundamental even
 * when only harmonics are present, deepening entrainment.
 * 
 * @version 2.0.0
 */

import type { OctaveConfig, OctaveLayer } from './types';

// Audible frequency bounds
const FREQ_MIN = 20;    // Hz
const FREQ_MAX = 20000; // Hz

/**
 * Resolve octave layers for a given fundamental frequency.
 * Returns an array of OctaveLayer objects with computed gain curves.
 */
export function resolveOctaveLayers(
  fundamental: number,
  config: OctaveConfig
): OctaveLayer[] {
  if (!config.enabled) {
    return [{
      frequency: fundamental,
      gain: 1.0,
      octaveOffset: 0,
      detuneCents: 0,
      pan: 0,
    }];
  }

  const layers: OctaveLayer[] = [];
  const totalLayers = config.octavesBelow + 1 + config.octavesAbove;

  for (let offset = -config.octavesBelow; offset <= config.octavesAbove; offset++) {
    const freq = fundamental * Math.pow(2, offset);

    // Clamp to audible range
    if (freq < FREQ_MIN || freq > FREQ_MAX) continue;

    // Gain decreases per octave distance from fundamental
    const distance = Math.abs(offset);
    const gain = Math.pow(config.gainRolloff, distance);

    // Detune spreads symmetrically across layers
    const detuneRange = config.detuneSpread;
    const normalizedPos = totalLayers > 1
      ? (offset + config.octavesBelow) / (totalLayers - 1)
      : 0.5;
    const detuneCents = (normalizedPos - 0.5) * 2 * detuneRange;

    // Spatial spread: lower octaves slightly left, higher slightly right
    const pan = totalLayers > 1
      ? ((offset + config.octavesBelow) / (totalLayers - 1)) * 2 - 1
      : 0;

    layers.push({
      frequency: Math.round(freq * 100) / 100,
      gain: Math.round(gain * 1000) / 1000,
      octaveOffset: offset,
      detuneCents: Math.round(detuneCents * 10) / 10,
      pan: Math.round(pan * 100) / 100,
    });
  }

  return layers;
}

/**
 * Create a standard octave config with sensible defaults.
 */
export function createOctaveConfig(
  overrides: Partial<OctaveConfig> = {}
): OctaveConfig {
  return {
    enabled: true,
    octavesAbove: 1,
    octavesBelow: 1,
    gainRolloff: 0.7,
    detuneSpread: 5,
    ...overrides,
  };
}

/**
 * Create a disabled (bypass) octave config.
 */
export function noOctaves(): OctaveConfig {
  return {
    enabled: false,
    octavesAbove: 0,
    octavesBelow: 0,
    gainRolloff: 1,
    detuneSpread: 0,
  };
}

/**
 * Deep octave config for protocols that need maximum harmonic richness
 * (e.g., altered states, pineal protocols).
 */
export function deepOctaves(): OctaveConfig {
  return {
    enabled: true,
    octavesAbove: 2,
    octavesBelow: 2,
    gainRolloff: 0.65,
    detuneSpread: 8,
  };
}

/**
 * Gentle octave config for subtle harmonic enhancement
 * (e.g., sleep, anxiety relief).
 */
export function gentleOctaves(): OctaveConfig {
  return {
    enabled: true,
    octavesAbove: 1,
    octavesBelow: 0,
    gainRolloff: 0.5,
    detuneSpread: 3,
  };
}

/**
 * Wide octave config for spatial-rich protocols
 * (e.g., flow states, consciousness exploration).
 */
export function wideOctaves(): OctaveConfig {
  return {
    enabled: true,
    octavesAbove: 2,
    octavesBelow: 1,
    gainRolloff: 0.6,
    detuneSpread: 12,
  };
}

/**
 * Resolve all octave layers for an entire phase's carrier + overlays.
 * Returns a flat array of all layers with source tagging.
 */
export function resolvePhaseOctaves(
  carrierFreq: number,
  carrierOctaves: OctaveConfig,
  overlays: readonly number[],
  overlayOctaves: OctaveConfig
): { carrier: OctaveLayer[]; overlays: Map<number, OctaveLayer[]> } {
  const carrierLayers = resolveOctaveLayers(carrierFreq, carrierOctaves);
  const overlayMap = new Map<number, OctaveLayer[]>();

  for (const freq of overlays) {
    overlayMap.set(freq, resolveOctaveLayers(freq, overlayOctaves));
  }

  return { carrier: carrierLayers, overlays: overlayMap };
}

/**
 * SynSync Pro — Phase Builder Utility
 * ====================================
 * Fluent builder for constructing PhaseSpec objects with sensible defaults.
 * Reduces boilerplate across spec files.
 * 
 * @version 2.0.0
 */

import type { PhaseSpec, OctaveConfig, DeliveryMethod, NoiseColor, SpatialMotion } from './types';
import { DSP_DEFAULTS } from './constants';
import { createOctaveConfig, noOctaves, gentleOctaves, deepOctaves, wideOctaves } from './octave-resolver';

export class PhaseBuilder {
  private phase: Partial<PhaseSpec> = {
    stochastic: false,
    harmonicStacking: false,
    overlays: [],
    overlayMix: 0,
    spatialMotion: null,
    crossfadeDuration: DSP_DEFAULTS.crossfadeDuration,
    gainEnvelope: { ...DSP_DEFAULTS.gainEnvelope },
    carrierOctaves: createOctaveConfig(),
    overlayOctaves: noOctaves(),
    delivery: 'binaural',
    noiseType: 'pink',
    noiseMix: 0.1,
  };

  constructor(index: number, name: string) {
    this.phase.index = index;
    this.phase.name = name;
  }

  duration(seconds: number): this {
    this.phase.durationSeconds = seconds;
    return this;
  }

  beat(freq: number | [number, number]): this {
    this.phase.beatFrequency = freq;
    return this;
  }

  carrier(freq: number): this {
    this.phase.carrierFrequency = freq;
    return this;
  }

  noise(type: NoiseColor, mix: number): this {
    this.phase.noiseType = type;
    this.phase.noiseMix = mix;
    return this;
  }

  overlays(freqs: readonly number[], mix: number): this {
    this.phase.overlays = freqs;
    this.phase.overlayMix = mix;
    return this;
  }

  spatial(motion: SpatialMotion, rate?: number): this {
    this.phase.spatialMotion = motion;
    if (rate !== undefined) this.phase.spatialRate = rate;
    return this;
  }

  stochasticJitter(varianceMs?: number): this {
    this.phase.stochastic = true;
    this.phase.stochasticVariance = varianceMs ?? DSP_DEFAULTS.stochasticVariance;
    return this;
  }

  harmonics(enabled = true): this {
    this.phase.harmonicStacking = enabled;
    return this;
  }

  delivery(method: DeliveryMethod): this {
    this.phase.delivery = method;
    return this;
  }

  isochronic(duty?: number): this {
    this.phase.delivery = 'isochronic';
    this.phase.isochronicDuty = duty ?? DSP_DEFAULTS.isochronicDuty;
    return this;
  }

  hybrid(duty?: number): this {
    this.phase.delivery = 'hybrid';
    this.phase.isochronicDuty = duty ?? DSP_DEFAULTS.isochronicDuty;
    return this;
  }

  carrierOctaves(config: Partial<OctaveConfig>): this {
    this.phase.carrierOctaves = createOctaveConfig(config);
    return this;
  }

  overlayOctaves(config: Partial<OctaveConfig>): this {
    this.phase.overlayOctaves = createOctaveConfig(config);
    return this;
  }

  gentleCarrierOctaves(): this {
    this.phase.carrierOctaves = gentleOctaves();
    return this;
  }

  deepCarrierOctaves(): this {
    this.phase.carrierOctaves = deepOctaves();
    return this;
  }

  wideCarrierOctaves(): this {
    this.phase.carrierOctaves = wideOctaves();
    return this;
  }

  noCarrierOctaves(): this {
    this.phase.carrierOctaves = noOctaves();
    return this;
  }

  deepOverlayOctaves(): this {
    this.phase.overlayOctaves = deepOctaves();
    return this;
  }

  wideOverlayOctaves(): this {
    this.phase.overlayOctaves = wideOctaves();
    return this;
  }

  gentleOverlayOctaves(): this {
    this.phase.overlayOctaves = gentleOctaves();
    return this;
  }

  crossfade(seconds: number): this {
    this.phase.crossfadeDuration = seconds;
    return this;
  }

  envelope(attack: number, sustain: number, release: number): this {
    this.phase.gainEnvelope = { attack, sustain, release };
    return this;
  }

  purpose(desc: string): this {
    this.phase.purpose = desc;
    return this;
  }

  build(): PhaseSpec {
    if (this.phase.durationSeconds === undefined) throw new Error(`Phase "${this.phase.name}" missing duration`);
    if (this.phase.beatFrequency === undefined) throw new Error(`Phase "${this.phase.name}" missing beat frequency`);
    if (this.phase.carrierFrequency === undefined) throw new Error(`Phase "${this.phase.name}" missing carrier`);
    return this.phase as PhaseSpec;
  }
}

/** Shorthand factory */
export function phase(index: number, name: string): PhaseBuilder {
  return new PhaseBuilder(index, name);
}

// src/dsp/compiler/phaseToGraph.ts
// Compiles a PhaseSpec into a DspGraphSpec for the GraphEngine.

import type { PhaseSpec } from '../../audio/dsp/types';
import type {
  DspGraphSpec,
  DspNodeSpec,
  DspConnectionSpec,
  DspNodeKind,
  DspNodeParams,
} from '../graph/DspNode';
import { resolvePhaseOctaves } from '../../audio/dsp/octave-resolver';

// ─── Build Context ────────────────────────────────────────────────

class GraphBuildContext {
  readonly prefix: string;
  readonly nodes: DspNodeSpec[] = [];
  readonly connections: DspConnectionSpec[] = [];

  // Track node IDs by role for wiring
  schedulerId = '';
  busId = '';
  entrainmentIds: string[] = [];
  noiseId: string | null = null;
  stochasticId: string | null = null;
  sweepId: string | null = null;
  crossfadeId: string | null = null;
  analyzerId: string | null = null;

  constructor(phaseIndex: number) {
    this.prefix = `p${phaseIndex}`;
  }

  makeId(kind: string): string {
    return `${this.prefix}-${kind}`;
  }

  addNode(kind: DspNodeKind, params: DspNodeParams): string {
    const id = this.makeId(kind);
    this.nodes.push({ id, kind, params });
    return id;
  }

  connect(fromId: string, toId: string): void {
    this.connections.push({
      fromNodeId: fromId,
      fromOutput: 'out',
      toNodeId: toId,
      toInput: 'in',
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Compile a single PhaseSpec into a DspGraphSpec.
 */
export function compilePhaseToGraph(
  phase: PhaseSpec,
  phaseIndex: number,
): DspGraphSpec {
  const ctx = new GraphBuildContext(phaseIndex);

  // Always-present nodes
  emitTemporalScheduler(ctx, phase);
  emitSpatialSceneBus(ctx);

  // Conditionally-present nodes
  emitEntrainmentNodes(ctx, phase);
  emitNoiseNode(ctx, phase);
  emitSpatialParams(ctx, phase);
  emitStochasticNode(ctx, phase);
  emitSweepNode(ctx, phase);
  emitCrossfadeNode(ctx, phase);
  emitAnalyzerNode(ctx, phase);

  // Wire the signal chain
  wireSignalChain(ctx);

  return { nodes: ctx.nodes, connections: ctx.connections };
}

// ─── Emitters ─────────────────────────────────────────────────────

function emitTemporalScheduler(ctx: GraphBuildContext, phase: PhaseSpec): void {
  ctx.schedulerId = ctx.addNode('temporal-scheduler', {
    durationSec: phase.durationSeconds,
    fadeInSec: phase.gainEnvelope.attack,
    fadeOutSec: phase.gainEnvelope.release,
    sustainLevel: phase.gainEnvelope.sustain,
  });
}

function emitSpatialSceneBus(ctx: GraphBuildContext): void {
  ctx.busId = ctx.addNode('spatial-scene-bus', {
    scenePreset: 'default',
  });
}

function emitEntrainmentNodes(ctx: GraphBuildContext, phase: PhaseSpec): void {
  const beatHz = Array.isArray(phase.beatFrequency)
    ? phase.beatFrequency[0]
    : phase.beatFrequency;

  // Resolve octave layers for carrier + overlays
  const octaves = resolvePhaseOctaves(
    phase.carrierFrequency,
    phase.carrierOctaves,
    phase.overlays,
    phase.overlayOctaves,
  );

  const carrierLayersJson = JSON.stringify(
    octaves.carrier.map(l => ({
      hz: l.frequency,
      gain: l.gain,
      pan: l.pan,
      detune: l.detuneCents,
    })),
  );

  // Overlays: collect all overlay layers into a flat array
  const overlayEntries: { hz: number; gain: number; pan: number; detune: number }[] = [];
  octaves.overlays.forEach(layers => {
    for (const l of layers) {
      overlayEntries.push({ hz: l.frequency, gain: l.gain, pan: l.pan, detune: l.detuneCents });
    }
  });
  const overlayLayersJson = JSON.stringify(overlayEntries);

  if (phase.delivery === 'binaural' || phase.delivery === 'hybrid') {
    const id = ctx.addNode('binaural-spatializer', {
      carrierHz: phase.carrierFrequency,
      beatHz,
      carrierLayers: carrierLayersJson,
      overlayLayers: overlayLayersJson,
      overlayMix: phase.overlayMix,
      harmonicStacking: phase.harmonicStacking,
    });
    ctx.entrainmentIds.push(id);
  }

  if (phase.delivery === 'isochronic' || phase.delivery === 'hybrid') {
    const id = ctx.addNode('isochronic-pulse-generator', {
      pulseHz: beatHz,
      carrierHz: phase.carrierFrequency,
      dutyCycle: phase.isochronicDuty ?? 0.5,
      harmonicStacking: phase.harmonicStacking,
      carrierLayers: carrierLayersJson,
    });
    ctx.entrainmentIds.push(id);
  }

  if (phase.delivery === 'hybrid') {
    const id = ctx.addNode('am-fm-hybrid-modulator', {
      carrierHz: phase.carrierFrequency,
      modulatorHz: beatHz,
      fmDepthHz: beatHz,
      amDepth: 0.8,
    });
    ctx.entrainmentIds.push(id);
  }
}

function emitNoiseNode(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (phase.noiseType === 'none' || phase.noiseMix <= 0) return;

  ctx.noiseId = ctx.addNode('colored-noise-masker', {
    color: phase.noiseType,
    levelDb: mixToDb(phase.noiseMix),
  });
}

/**
 * Merge spatial motion params into an existing binaural-spatializer node,
 * or create a standalone one if no binaural node exists (isochronic-only).
 */
function emitSpatialParams(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (!phase.spatialMotion || phase.spatialMotion === 'fixed') return;

  const existingBinaural = ctx.nodes.find(n => n.kind === 'binaural-spatializer');
  if (existingBinaural) {
    existingBinaural.params.motionType = phase.spatialMotion;
    existingBinaural.params.rateHz = phase.spatialRate ?? 0.1;
  } else {
    // Standalone spatializer for isochronic-only delivery with spatial motion
    const id = ctx.addNode('binaural-spatializer', {
      motionType: phase.spatialMotion,
      azimuthDeg: 30,
      rateHz: phase.spatialRate ?? 0.1,
    });
    ctx.entrainmentIds.push(id);
  }
}

function emitStochasticNode(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (!phase.stochastic) return;

  const beatHz = Array.isArray(phase.beatFrequency)
    ? (phase.beatFrequency[0] + phase.beatFrequency[1]) / 2
    : phase.beatFrequency;

  ctx.stochasticId = ctx.addNode('stochastic-resonance-enhancer', {
    targetBandCenterHz: beatHz,
    noiseLevelDb: -30,
    varianceMs: phase.stochasticVariance ?? 12,
  });
}

function emitSweepNode(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (!Array.isArray(phase.beatFrequency)) return;

  const [startHz, endHz] = phase.beatFrequency;
  ctx.sweepId = ctx.addNode('micro-doppler-sweeper', {
    startHz,
    endHz,
    sweepRateHz: 1 / phase.durationSeconds,
    durationSec: phase.durationSeconds,
  });
}

function emitCrossfadeNode(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (phase.crossfadeDuration <= 0) return;

  ctx.crossfadeId = ctx.addNode('crossfade-optimizer', {
    xfadeSec: phase.crossfadeDuration,
  });
}

function emitAnalyzerNode(ctx: GraphBuildContext, phase: PhaseSpec): void {
  if (!phase.carrierOctaves.enabled && !phase.overlayOctaves.enabled) return;

  ctx.analyzerId = ctx.addNode('critical-band-analyzer', {
    fftSize: 2048,
  });
}

// ─── Wiring ───────────────────────────────────────────────────────

function wireSignalChain(ctx: GraphBuildContext): void {
  // 1. Scheduler → each entrainment node
  for (const entId of ctx.entrainmentIds) {
    ctx.connect(ctx.schedulerId, entId);
  }

  // 2. Build processing chain after entrainment
  let chainTails =
    ctx.entrainmentIds.length > 0
      ? [...ctx.entrainmentIds]
      : [ctx.schedulerId];

  // 3. Stochastic enhancer
  if (ctx.stochasticId) {
    for (const tail of chainTails) {
      ctx.connect(tail, ctx.stochasticId);
    }
    chainTails = [ctx.stochasticId];
  }

  // 4. Doppler sweep (frequency ramps)
  if (ctx.sweepId) {
    for (const tail of chainTails) {
      ctx.connect(tail, ctx.sweepId);
    }
    chainTails = [ctx.sweepId];
  }

  // 5. Crossfade (last before bus)
  if (ctx.crossfadeId) {
    for (const tail of chainTails) {
      ctx.connect(tail, ctx.crossfadeId);
    }
    chainTails = [ctx.crossfadeId];
  }

  // 6. All chain tails → spatial-scene-bus
  for (const tail of chainTails) {
    ctx.connect(tail, ctx.busId);
  }

  // 7. Noise → bus (parallel path)
  if (ctx.noiseId) {
    ctx.connect(ctx.schedulerId, ctx.noiseId);
    ctx.connect(ctx.noiseId, ctx.busId);
  }

  // 8. Analyzer tap (from bus, monitoring only)
  if (ctx.analyzerId) {
    ctx.connect(ctx.busId, ctx.analyzerId);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

function mixToDb(mix: number): number {
  if (mix <= 0) return -60;
  return 20 * Math.log10(mix);
}

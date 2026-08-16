// src/protocols/examples/gamma_focus_multi_layer.ts [Experimental]

import type { ProtocolSpec } from "../schema";
import type { DspGraphSpec } from "../../dsp/graph/DspNode";

const baseGraph: DspGraphSpec = {
  nodes: [
    { id: "scheduler", kind: "temporal-scheduler", params: { fadeInSec: 5, fadeOutSec: 5 } },
    { id: "spatialBus", kind: "spatial-scene-bus", params: { scenePreset: "front-hemisphere" } },
    { id: "analyzer", kind: "critical-band-analyzer", params: { fftSize: 2048 } },
    { id: "masker", kind: "colored-noise-masker", params: { color: "pink", levelDb: -18 } }
  ],
  connections: [
    { fromNodeId: "scheduler", fromOutput: "out", toNodeId: "masker", toInput: "in" },
    { fromNodeId: "masker", fromOutput: "out", toNodeId: "spatialBus", toInput: "in" },
    { fromNodeId: "masker", fromOutput: "out", toNodeId: "analyzer", toInput: "in" }
  ]
};

const gammaGraph: DspGraphSpec = {
  nodes: [
    ...baseGraph.nodes,
    { id: "gammaMod", kind: "am-fm-hybrid-modulator", params: { carrierHz: 400, modulatorHz: 40, fmDepthHz: 40, amDepth: 0.8 } },
    { id: "srEnhancer", kind: "stochastic-resonance-enhancer", params: { targetBandCenterHz: 40, noiseLevelDb: -30 } },
    { id: "spatializer", kind: "binaural-spatializer", params: { azimuthDeg: 30 } },
    { id: "doppler", kind: "micro-doppler-sweeper", params: { sweepDepthCents: 20, sweepRateHz: 0.1 } },
    { id: "xfade", kind: "crossfade-optimizer", params: { xfadeSec: 2.0 } }
  ],
  connections: [
    ...baseGraph.connections,
    { fromNodeId: "scheduler", fromOutput: "out", toNodeId: "gammaMod", toInput: "in" },
    { fromNodeId: "gammaMod", fromOutput: "out", toNodeId: "srEnhancer", toInput: "in" },
    { fromNodeId: "srEnhancer", fromOutput: "out", toNodeId: "spatializer", toInput: "in" },
    { fromNodeId: "spatializer", fromOutput: "out", toNodeId: "doppler", toInput: "in" },
    { fromNodeId: "doppler", fromOutput: "out", toNodeId: "xfade", toInput: "in" },
    { fromNodeId: "xfade", fromOutput: "out", toNodeId: "spatialBus", toInput: "in" }
  ]
};

const alphaGraph: DspGraphSpec = {
  nodes: [
    ...baseGraph.nodes,
    { id: "isoAlpha", kind: "isochronic-pulse-generator", params: { pulseHz: 10, carrierHz: 200, dutyCycle: 0.5 } }
  ],
  connections: [
    ...baseGraph.connections,
    { fromNodeId: "scheduler", fromOutput: "out", toNodeId: "isoAlpha", toInput: "in" },
    { fromNodeId: "isoAlpha", fromOutput: "out", toNodeId: "spatialBus", toInput: "in" }
  ]
};

export const gammaFocusMultiLayer: ProtocolSpec = {
  id: "gamma-focus-multi-layer",
  name: "Gamma Focus Multi-Layer",
  category: "cognitive",
  version: "1.0.0",
  durationSeconds: 1800,
  layers: [
    { id: "gamma", description: "40Hz AM-FM + SR", targetBandHz: 40, stimulusType: "am-fm-hybrid", dspGraph: gammaGraph },
    { id: "alpha", description: "10Hz isochronic support", targetBandHz: 10, stimulusType: "isochronic", dspGraph: alphaGraph }
  ],
  psychoacoustics: { useCriticalBandAnalyzer: true, useColoredNoiseMasker: true, useBinauralSpatializer: true },
  safety: {
    maxLeqDb: 80,
    photosensitivityHzMin: 0,
    photosensitivityHzMax: 0,
    seizureHistoryContraindicated: true,
    evidenceGrade: "D",
    notes: "Experimental gamma entrainment"
  }
};

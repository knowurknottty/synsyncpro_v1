// src/dsp/graph/DspNode.ts [Experimental]

export type DspNodeKind =
  | "temporal-scheduler"
  | "micro-doppler-sweeper"
  | "crossfade-optimizer"
  | "critical-band-analyzer"
  | "binaural-spatializer"
  | "colored-noise-masker"
  | "isochronic-pulse-generator"
  | "am-fm-hybrid-modulator"
  | "stochastic-resonance-enhancer"
  | "spatial-scene-bus";

export interface DspNodeParams {
  [key: string]: number | string | boolean;
}

export interface DspConnectionSpec {
  fromNodeId: string;
  fromOutput: string;
  toNodeId: string;
  toInput: string;
}

export interface DspNodeSpec {
  id: string;
  kind: DspNodeKind;
  params: DspNodeParams;
}

export interface DspGraphSpec {
  nodes: DspNodeSpec[];
  connections: DspConnectionSpec[];
}

// src/dsp/nodes/CrossfadeOptimizer.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/crossfade-optimizer.js

import type { DspNodeParams } from "../graph/DspNode";

export class CrossfadeOptimizer extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

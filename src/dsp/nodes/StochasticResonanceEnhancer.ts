// src/dsp/nodes/StochasticResonanceEnhancer.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/stochastic-resonance-enhancer-processor.js

import type { DspNodeParams } from "../graph/DspNode";

export class StochasticResonanceEnhancer extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

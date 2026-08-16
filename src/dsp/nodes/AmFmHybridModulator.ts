// src/dsp/nodes/AmFmHybridModulator.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/am-fm-hybrid-modulator-processor.js

import type { DspNodeParams } from "../graph/DspNode";

export class AmFmHybridModulator extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

// src/dsp/nodes/ColoredNoiseMasker.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/colored-noise-generator.js

import type { DspNodeParams } from "../graph/DspNode";

export class ColoredNoiseMasker extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

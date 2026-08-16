// src/dsp/nodes/MicroDopplerSweeper.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/micro-doppler-processor.js

import type { DspNodeParams } from "../graph/DspNode";

export class MicroDopplerSweeper extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

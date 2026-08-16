// src/dsp/nodes/IsochronicPulseGenerator.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/harmonic-binaural-stacker-processor.js

import type { DspNodeParams } from "../graph/DspNode";

export class IsochronicPulseGenerator extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

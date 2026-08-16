// src/dsp/nodes/BinauralSpatializer.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/binaural-spatializer.js

import type { DspNodeParams } from "../graph/DspNode";

export class BinauralSpatializer extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

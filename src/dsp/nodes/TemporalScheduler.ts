// src/dsp/nodes/TemporalScheduler.ts [Experimental]
// Stub: replace with AudioWorkletNode wrapping src/audio-worklets/temporal-scheduler.js

import type { DspNodeParams } from "../graph/DspNode";

export class TemporalSchedulerNode extends GainNode {
  readonly params: DspNodeParams;

  constructor(context: AudioContext, params: DspNodeParams) {
    super(context);
    this.params = params;
  }
}

// src/player/ProtocolPlayer.ts [Experimental]

import type { ProtocolSpec } from "../protocols/schema";
import { GraphEngine } from "../dsp/graph/GraphEngine";

export interface ProtocolPlayerOptions {
  onSafetyViolation?: (msg: string) => void;
}

export class ProtocolPlayer {
  private engines: GraphEngine[] = [];
  private protocol?: ProtocolSpec;
  private context?: AudioContext;
  private opts: ProtocolPlayerOptions;

  constructor(opts: ProtocolPlayerOptions = {}) {
    this.opts = opts;
  }

  async load(protocol: ProtocolSpec): Promise<void> {
    this.protocol = protocol;
    await this.validateSafety();
  }

  async start(): Promise<void> {
    if (!this.protocol) throw new Error("Load protocol first");
    this.context = new AudioContext({ sampleRate: 44100 });
    this.engines = this.protocol.layers.map(layer => {
      const engine = new GraphEngine(this.context!);
      engine.build(layer.dspGraph);
      return engine;
    });
    await this.context.resume();
  }

  async stop(): Promise<void> {
    this.engines.forEach(engine => engine.dispose());
    this.engines = [];
    await this.context?.close();
  }

  private async validateSafety(): Promise<boolean> {
    if (!this.protocol?.safety) return false;
    const { safety } = this.protocol;
    if (safety.maxLeqDb > 85) {
      this.opts.onSafetyViolation?.("Exceeds NIOSH SPL guideline");
      return false;
    }
    return true;
  }
}

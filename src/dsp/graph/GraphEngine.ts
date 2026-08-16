// src/dsp/graph/GraphEngine.ts [Experimental]

import type { DspGraphSpec, DspNodeSpec, DspConnectionSpec, DspNodeKind } from "./DspNode";
import { TemporalSchedulerNode } from "../nodes/TemporalScheduler";
import { IsochronicPulseGenerator } from "../nodes/IsochronicPulseGenerator";
import { AmFmHybridModulator } from "../nodes/AmFmHybridModulator";
import { StochasticResonanceEnhancer } from "../nodes/StochasticResonanceEnhancer";
import { BinauralSpatializer } from "../nodes/BinauralSpatializer";
import { ColoredNoiseMasker } from "../nodes/ColoredNoiseMasker";
import { MicroDopplerSweeper } from "../nodes/MicroDopplerSweeper";
import { CrossfadeOptimizer } from "../nodes/CrossfadeOptimizer";

export class GraphEngine {
  private context: AudioContext;
  private nodeMap = new Map<string, AudioNode>();
  private masterGain: GainNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  build(graph: DspGraphSpec): void {
    this.nodeMap.clear();
    this.context.resume();

    // Build nodes
    for (const nodeSpec of graph.nodes) {
      const node = this.createNode(nodeSpec);
      this.nodeMap.set(nodeSpec.id, node);
    }

    // Wire connections
    for (const conn of graph.connections) {
      this.connect(conn);
    }

    // Route unconnected to master
    this.routeOrphansToMaster();
  }

  private createNode(spec: DspNodeSpec): AudioNode {
    const kind = spec.kind as DspNodeKind;
    switch (kind) {
      case "temporal-scheduler":
        return new TemporalSchedulerNode(this.context, spec.params);
      case "isochronic-pulse-generator":
        return new IsochronicPulseGenerator(this.context, spec.params);
      case "am-fm-hybrid-modulator":
        return new AmFmHybridModulator(this.context, spec.params);
      case "stochastic-resonance-enhancer":
        return new StochasticResonanceEnhancer(this.context, spec.params);
      case "critical-band-analyzer":
        return this.context.createAnalyser();
      case "binaural-spatializer":
        return new BinauralSpatializer(this.context, spec.params);
      case "colored-noise-masker":
        return new ColoredNoiseMasker(this.context, spec.params);
      case "micro-doppler-sweeper":
        return new MicroDopplerSweeper(this.context, spec.params);
      case "crossfade-optimizer":
        return new CrossfadeOptimizer(this.context, spec.params);
      case "spatial-scene-bus": {
        const bus = this.context.createGain();
        bus.connect(this.masterGain);
        return bus;
      }
      default:
        console.warn(`Fallback gain for ${kind}`);
        return this.context.createGain();
    }
  }

  private connect(spec: DspConnectionSpec): void {
    const from = this.nodeMap.get(spec.fromNodeId);
    const to = this.nodeMap.get(spec.toNodeId);
    if (from && to) {
      from.connect(to);
    }
  }

  private routeOrphansToMaster(): void {
    const connectedNodes = new Set<string>();
    // In a full implementation, track which nodes are connected as sources
    // For now, connect all terminal nodes to master
    this.nodeMap.forEach((node, _id) => {
      if (!connectedNodes.has(_id)) {
        node.connect(this.masterGain);
      }
    });
  }

  dispose(): void {
    this.nodeMap.forEach(node => {
      try {
        node.disconnect();
      } catch {
        // Node may not be connected
      }
    });
    this.nodeMap.clear();
  }
}

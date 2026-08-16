// scripts/test-graph-engine.ts [Established]
// Structural validation for graph-based DSP scaffolding.
// Run with: npx tsx scripts/test-graph-engine.ts

import { gammaFocusMultiLayer } from "../src/protocols/examples/gamma_focus_multi_layer";
import { getProtocolById, listProtocols } from "../src/protocols/index";
import type { DspGraphSpec, DspNodeSpec, DspConnectionSpec } from "../src/dsp/graph/DspNode";

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}

function validateGraph(graph: DspGraphSpec, label: string): void {
  assert(graph.nodes.length > 0, `${label}: graph has no nodes`);
  assert(graph.connections.length > 0, `${label}: graph has no connections`);

  const nodeIds = new Set(graph.nodes.map((n: DspNodeSpec) => n.id));
  for (const conn of graph.connections) {
    assert(nodeIds.has(conn.fromNodeId), `${label}: connection references missing source node "${conn.fromNodeId}"`);
    assert(nodeIds.has(conn.toNodeId), `${label}: connection references missing target node "${conn.toNodeId}"`);
  }
}

function main(): void {
  console.log("Testing graph-based DSP scaffolding...\n");

  // Test 1: Protocol spec structure
  console.log("  [1] Protocol spec structure");
  assert(gammaFocusMultiLayer.id === "gamma-focus-multi-layer", "protocol id");
  assert(gammaFocusMultiLayer.layers.length === 2, "expected 2 layers");
  assert(gammaFocusMultiLayer.durationSeconds === 1800, "expected 1800s duration");
  console.log("      OK");

  // Test 2: Layer graph integrity
  console.log("  [2] Layer graph integrity");
  for (const layer of gammaFocusMultiLayer.layers) {
    validateGraph(layer.dspGraph, `layer:${layer.id}`);
    console.log(`      ${layer.id}: ${layer.dspGraph.nodes.length} nodes, ${layer.dspGraph.connections.length} connections`);
  }
  console.log("      OK");

  // Test 3: Registry lookup
  console.log("  [3] Protocol registry");
  const found = getProtocolById("gamma-focus-multi-layer");
  assert(found !== undefined, "registry lookup failed");
  assert(found!.name === "Gamma Focus Multi-Layer", "registry returned wrong spec");
  const all = listProtocols();
  assert(all.length >= 1, "listProtocols returned empty");
  console.log(`      ${all.length} protocol(s) registered`);
  console.log("      OK");

  // Test 4: Safety constraints
  console.log("  [4] Safety constraints");
  assert(gammaFocusMultiLayer.safety.maxLeqDb <= 85, "maxLeqDb exceeds NIOSH guideline");
  assert(gammaFocusMultiLayer.safety.seizureHistoryContraindicated === true, "seizure contraindication missing");
  console.log("      OK");

  // Test 5: All DSP node kinds are valid
  console.log("  [5] DSP node kind coverage");
  const validKinds = new Set([
    "temporal-scheduler", "micro-doppler-sweeper", "crossfade-optimizer",
    "critical-band-analyzer", "binaural-spatializer", "colored-noise-masker",
    "isochronic-pulse-generator", "am-fm-hybrid-modulator",
    "stochastic-resonance-enhancer", "spatial-scene-bus"
  ]);
  for (const layer of gammaFocusMultiLayer.layers) {
    for (const node of layer.dspGraph.nodes) {
      assert(validKinds.has(node.kind), `unknown node kind: "${node.kind}"`);
    }
  }
  console.log("      OK");

  console.log("\nAll scaffolding tests passed.");
  process.exit(0);
}

main();

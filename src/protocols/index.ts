// src/protocols/index.ts [Established]

import type { ProtocolSpec } from "./schema";
import { gammaFocusMultiLayer } from "./examples/gamma_focus_multi_layer";
import { compileProtocol } from "../dsp/compiler";
import { ALL_SPECS } from "./specs";

// Compile all PhaseSpec-based protocols into graph-based format
const compiledProtocols = ALL_SPECS.map(spec => compileProtocol(spec));

const registry: Record<string, ProtocolSpec> = {
  // Hand-crafted example (reference implementation)
  "gamma-focus-multi-layer": gammaFocusMultiLayer,
};

// Register all compiled protocols (hand-crafted take precedence on ID collision)
for (const compiled of compiledProtocols) {
  if (!registry[compiled.id]) {
    registry[compiled.id] = compiled;
  }
}

export function getProtocolById(id: string): ProtocolSpec | undefined {
  return registry[id];
}

export function listProtocols(): ProtocolSpec[] {
  return Object.values(registry);
}

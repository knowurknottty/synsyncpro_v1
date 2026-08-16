// src/specs/index.ts

import { PROTOCOL_EVIDENCE_REGISTRY } from './protocol-evidence-registry';
import { PROTOCOL_SAFETY_GATES_REGISTRY } from './protocol-safety-gates-registry';
import type {
  ProtocolEvidenceSpec,
} from '../types/spec-protocol-evidence';
import type {
  ProtocolSafetyGateSpec,
} from '../types/spec-safety-gates';

/**
 * Internal maps for O(1) lookup by protocol id.
 *
 * RVP: we fail fast in development if duplicate ids are present,
 * because that would create ambiguous evidence/safety mappings.
 */
const evidenceById: Record<string, ProtocolEvidenceSpec> = {};
const safetyById: Record<string, ProtocolSafetyGateSpec> = {};

// Build evidence map with duplicate detection in dev.
for (const spec of PROTOCOL_EVIDENCE_REGISTRY) {
  if (process.env.NODE_ENV !== 'production') {
    if (evidenceById[spec.protocolId]) {
      // RVP: duplicate evidence spec means ambiguous claim hygiene.
      // Throw in dev to force explicit resolution.
      // eslint-disable-next-line no-console
      console.error(
        `[RVP] Duplicate ProtocolEvidenceSpec for protocolId="${spec.protocolId}".`,
      );
      throw new Error(
        `[RVP] Duplicate ProtocolEvidenceSpec for protocolId="${spec.protocolId}".`,
      );
    }
  }
  evidenceById[spec.protocolId] = spec;
}

// Build safety map with duplicate detection in dev.
for (const spec of PROTOCOL_SAFETY_GATES_REGISTRY) {
  if (process.env.NODE_ENV !== 'production') {
    if (safetyById[spec.protocolId]) {
      // eslint-disable-next-line no-console
      console.error(
        `[RVP] Duplicate ProtocolSafetyGateSpec for protocolId="${spec.protocolId}".`,
      );
      throw new Error(
        `[RVP] Duplicate ProtocolSafetyGateSpec for protocolId="${spec.protocolId}".`,
      );
    }
  }
  safetyById[spec.protocolId] = spec;
}

/**
 * Get evidence spec for a protocol id, if present.
 *
 * Returns undefined when no evidence spec is registered.
 */
export function getProtocolEvidence(
  id: string,
): ProtocolEvidenceSpec | undefined {
  return evidenceById[id];
}

/**
 * Get safety gate spec for a protocol id, if present.
 *
 * Returns undefined when no safety spec is registered.
 */
export function getProtocolSafetyGate(
  id: string,
): ProtocolSafetyGateSpec | undefined {
  return safetyById[id];
}

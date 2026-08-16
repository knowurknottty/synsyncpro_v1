// src/selectors/protocolSelectors.ts

import { getProtocolEvidence, getProtocolSafetyGate } from '../specs';
import type {
  ProtocolEvidenceSpec,
  EvidenceLevel,
  EvidenceGrade,
} from '../types/spec-protocol-evidence';
import type {
  ProtocolSafetyGateSpec,
  RiskSeverity,
} from '../types/spec-safety-gates';
import { PROTOCOLS } from '../audio/constants';
import type { Protocol } from '../../types';


/**
 * View model that enriches a base protocol with evidence and safety metadata.
 *
 * RVP: This is a read-only derived model; it does NOT modify the core Protocol type.
 */
export interface ProtocolViewModel {
  protocol: Protocol;
  evidence?: ProtocolEvidenceSpec;
  safety?: ProtocolSafetyGateSpec;

  // Convenient accessors for common fields
  evidenceLevel?: EvidenceLevel;
  evidenceGrade?: EvidenceGrade;
  overallRiskSeverity?: RiskSeverity;
}

/**
 * Get a protocol view model enriched with evidence and safety specs.
 *
 * @param id Protocol ID to look up
 * @returns ProtocolViewModel or undefined if protocol not found
 *
 * RVP: Non-breaking extension. Base protocol types remain unchanged.
 */
export function getProtocolViewModel(
  id: string,
): ProtocolViewModel | undefined {
  const protocol = PROTOCOLS[id];
  if (!protocol) {
    return undefined;
  }
  const evidence = getProtocolEvidence(id);
  const safety = getProtocolSafetyGate(id);

  return {
    protocol,    evidence,
    safety,
    evidenceLevel: evidence?.evidenceLevel,
    evidenceGrade: evidence?.evidenceGrade,
    overallRiskSeverity: safety?.overallRiskSeverity,
  };
}

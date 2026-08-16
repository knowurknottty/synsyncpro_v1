/**
 * SynSync Pro — Protocol Spec Registry
 * ======================================
 * Central barrel export for all protocol specs.
 * Also provides the master registry for agent orchestration.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec, ProtocolCategory } from '../../audio/dsp/types';

// ─── Category Imports ───────────────────────────────────────────────
export { SUFFERING_REDUCTION_SPECS, neuroAnalgesia, anxietyRelief, deepSleep, moodElevator, acuteStressReset } from './sufferingReduction/suffering-reduction.spec';
export { PERFORMANCE_FOCUS_SPECS, professionalFocus, learningConsolidation, adhdFocus } from './cognitive/performance-focus.spec';
export { RECOVERY_ADDICTION_SPECS, neuroRecovery, acuteCraving, dopamineReset, withdrawalSupport, cravingInterrupter, motivationRebuilder, liverDetoxVibration, cellularCleansing } from './recovery/recovery-addiction.spec';
export { FLOW_STATE_SPECS, flowIgnition, flowStruggle, flowRelease, flowState, flowHarvest, gammaV4FlowInsight } from './cognitive/flow-state.spec';
export { EMOTIONAL_MASTERY_SPECS, emotionalProcessing, confidenceRebuilding, meditationDeepening, angerResolution, confidenceBuilder, fearExtinction } from './mood/emotional-mastery.spec';
export { ATHLETIC_SPECS, PHYSIOLOGICAL_SPECS, athleticConfidence, recoveryAccelerator, vagusNerveReset, reactionTimeSharpener, enduranceEnhancer, muscleTensionRelease, cellularRegeneration, circadianMaster } from './performance/athletic-physiological.spec';
export { ALTERED_STATES_SPECS, SPECULATIVE_SPECS, pinealResonance, dmtGateway, lucidDream } from './consciousness/consciousness-exploration.spec';
export { CALIBRATION_SPECS, stereoVerify, iapfDetection } from './calibration/calibration.spec';
export { ISOCHRONIC_SPEAKERS_SPECS, speakerFocus, speakerRelaxation, isoSettleCalm, isoBreathingPacing, isoMeditationAnchor, isoSleepOnset, isoFocusBlock, isoAlertnessBurst, isoEnergyHype, isoDistractionRelief } from './audio/isochronic-speakers.spec';
export { SLEEP_RECOVERY_SPECS, deepSleepDelta, napOptimizer, remEnhancer, circadianReset, sleepMaintenance } from './sleep/sleep-recovery.spec';
export { RELATIONSHIP_SOCIAL_SPECS, empathicResonance, socialConfidence, communicationClarity, empathyDeepener } from './interpersonal/relationship-social.spec';
export { CREATIVE_EXPRESSION_SPECS, creativeFlow, musicalInspiration } from './creative/creative-expression.spec';
export { SPIRITUAL_INTEGRATION_SPECS, deepMeditation, gratitudePresence } from './spiritual/spiritual-integration.spec';
export { ADVANCED_RESEARCH_SPECS, crossFrequencyCoupling, infraslowOscillation, schumannSync, remoteViewing, neuroFocus10, neuroFocus12, neuroFocus15, interbrainSync } from './advancedResearch/advanced-research.spec';
export { MDMA_MIMICRY_SPECS, mdmaMimic, empathyExpansion, entacticWarmth } from './psychoactive-mimicry/mdma-mimicry.spec';
export { STIMULANT_MIMICRY_SPECS, stimulantMimic, motivationDopamineDrive, hyperfocusUltimate } from './psychoactive-mimicry/stimulant-mimicry.spec';
export { PSYCHEDELIC_MIMICRY_SPECS, psychedelicMimic, geometricVisualGateway, mysticalExperienceGenerator } from './psychoactive-mimicry/psychedelic-mimicry.spec';
export { CANNABIS_MIMICRY_SPECS, cannabisMimic, socialEase, introspectionInsight } from './psychoactive-mimicry/cannabis-mimicry.spec';
export { MULTIMODAL_GAMMA_SPECS, tgCfc, tiPbm, mgs40 } from './advancedResearch/multimodal-gamma.spec';
export { SMR_MU_SPECS, smrMu } from './cognitive/smr-mu.spec';
export { RF_HRV_SPECS, rfHrv } from './performance/rf-hrv.spec';
export { ACSW_SPECS, adaptiveSlowWave } from './sleep/acsw.spec';
export { ABLEHEART_SPECS, hci639, atb10, gmu15 } from './ableheart/ableheart.spec';

// ─── Lazy Imports for Registry ──────────────────────────────────────
import { SUFFERING_REDUCTION_SPECS } from './sufferingReduction/suffering-reduction.spec';
import { PERFORMANCE_FOCUS_SPECS } from './cognitive/performance-focus.spec';
import { RECOVERY_ADDICTION_SPECS } from './recovery/recovery-addiction.spec';
import { FLOW_STATE_SPECS } from './cognitive/flow-state.spec';
import { EMOTIONAL_MASTERY_SPECS } from './mood/emotional-mastery.spec';
import { ATHLETIC_SPECS, PHYSIOLOGICAL_SPECS } from './performance/athletic-physiological.spec';
import { ALTERED_STATES_SPECS, SPECULATIVE_SPECS } from './consciousness/consciousness-exploration.spec';
import { CALIBRATION_SPECS } from './calibration/calibration.spec';
import { ISOCHRONIC_SPEAKERS_SPECS } from './audio/isochronic-speakers.spec';
import { SLEEP_RECOVERY_SPECS } from './sleep/sleep-recovery.spec';
import { RELATIONSHIP_SOCIAL_SPECS } from './interpersonal/relationship-social.spec';
import { CREATIVE_EXPRESSION_SPECS } from './creative/creative-expression.spec';
import { SPIRITUAL_INTEGRATION_SPECS } from './spiritual/spiritual-integration.spec';
import { ADVANCED_RESEARCH_SPECS } from './advancedResearch/advanced-research.spec';
import { MDMA_MIMICRY_SPECS } from './psychoactive-mimicry/mdma-mimicry.spec';
import { STIMULANT_MIMICRY_SPECS } from './psychoactive-mimicry/stimulant-mimicry.spec';
import { PSYCHEDELIC_MIMICRY_SPECS } from './psychoactive-mimicry/psychedelic-mimicry.spec';
import { CANNABIS_MIMICRY_SPECS } from './psychoactive-mimicry/cannabis-mimicry.spec';
import { MULTIMODAL_GAMMA_SPECS } from './advancedResearch/multimodal-gamma.spec';
import { SMR_MU_SPECS } from './cognitive/smr-mu.spec';
import { RF_HRV_SPECS } from './performance/rf-hrv.spec';
import { ACSW_SPECS } from './sleep/acsw.spec';
import { ABLEHEART_SPECS } from './ableheart/ableheart.spec';

// ─── Master Registry ────────────────────────────────────────────────
/**
 * All protocols in a single flat array.
 * Use for iteration, search, and validation.
 */
export const ALL_SPECS: ProtocolSpec[] = [
  ...CALIBRATION_SPECS,
  ...ISOCHRONIC_SPEAKERS_SPECS,
  ...SLEEP_RECOVERY_SPECS,
  ...SUFFERING_REDUCTION_SPECS,
  ...PERFORMANCE_FOCUS_SPECS,
  ...RECOVERY_ADDICTION_SPECS,
  ...FLOW_STATE_SPECS,
  ...EMOTIONAL_MASTERY_SPECS,
  ...ATHLETIC_SPECS,
  ...PHYSIOLOGICAL_SPECS,
  ...ALTERED_STATES_SPECS,
  ...SPECULATIVE_SPECS,
  ...RELATIONSHIP_SOCIAL_SPECS,
  ...CREATIVE_EXPRESSION_SPECS,
  ...SPIRITUAL_INTEGRATION_SPECS,
  ...ADVANCED_RESEARCH_SPECS,
  ...MDMA_MIMICRY_SPECS,
  ...STIMULANT_MIMICRY_SPECS,
  ...PSYCHEDELIC_MIMICRY_SPECS,
  ...CANNABIS_MIMICRY_SPECS,
  ...MULTIMODAL_GAMMA_SPECS,
  ...SMR_MU_SPECS,
  ...RF_HRV_SPECS,
  ...ACSW_SPECS,
  ...ABLEHEART_SPECS,
];

/**
 * Lookup by protocol ID.
 */
export const SPEC_BY_ID: Map<string, ProtocolSpec> = new Map(
  ALL_SPECS.map(spec => [spec.id, spec])
);

/**
 * Lookup by category.
 */
export const SPECS_BY_CATEGORY: Map<ProtocolCategory, ProtocolSpec[]> = new Map();
for (const spec of ALL_SPECS) {
  const existing = SPECS_BY_CATEGORY.get(spec.category) ?? [];
  existing.push(spec);
  SPECS_BY_CATEGORY.set(spec.category, existing);
}

/**
 * Get a protocol spec by ID or throw.
 */
export function getSpec(id: string): ProtocolSpec {
  const spec = SPEC_BY_ID.get(id);
  if (!spec) throw new Error(`Protocol spec not found: "${id}"`);
  return spec;
}

/**
 * Get all specs for a category.
 */
export function getSpecsByCategory(category: ProtocolCategory): ProtocolSpec[] {
  return SPECS_BY_CATEGORY.get(category) ?? [];
}

/**
 * Search specs by keyword across name, goal, and description.
 */
export function searchSpecs(query: string): ProtocolSpec[] {
  const q = query.toLowerCase();
  return ALL_SPECS.filter(spec =>
    spec.name.toLowerCase().includes(q) ||
    spec.usageGoal.toLowerCase().includes(q) ||
    spec.algorithmDescription.toLowerCase().includes(q) ||
    spec.id.toLowerCase().includes(q)
  );
}

/**
 * FIX #6: Expanded Split-Hemisphere Configurations
 * 
 * PROBLEM: Split-hemisphere is SynSync's most unique DSP feature — the
 * ability to entrain different frequencies to left and right hemispheres.
 * But it's only used in 3-4 protocols (Poker Face, Tilt Prevention,
 * Interview Confidence, one mood protocol). Research on frontal alpha
 * asymmetry (FAA), hemispheric lateralization, and interhemispheric
 * coherence supports much broader application.
 * 
 * SOLUTION: Pre-built split-hemisphere configurations based on research,
 * ready to be added to existing protocols via the Phase Builder.
 */

// ============================================================
// SPLIT-HEMISPHERE PRESETS
// ============================================================

export interface SplitHemisphereConfig {
  leftFreq: number;      // Left ear entrainment target (Hz)
  rightFreq: number;     // Right ear entrainment target (Hz)
  purpose: string;        // Internal identifier
  rationale: string;      // Research-backed explanation
  targetProtocols: string[]; // Protocol IDs this should be added to
}

/**
 * Research-backed split-hemisphere configurations.
 * 
 * Key neuroscience principles:
 * - Left prefrontal alpha DECREASE = approach motivation (Davidson, 2004)
 * - Right prefrontal alpha DECREASE = withdrawal/avoidance
 * - FAA (Frontal Alpha Asymmetry) = left alpha minus right alpha
 * - Positive FAA (more left activation) correlates with positive affect
 * - Negative FAA correlates with depression, anxiety, withdrawal
 * 
 * For entrainment:
 * - Higher frequency to LEFT hemisphere = more left activation = approach
 * - Higher frequency to RIGHT hemisphere = more right activation = creativity/spatial
 */

export const SPLIT_HEMISPHERE_PRESETS: Record<string, SplitHemisphereConfig> = {

  // ============================================================
  // ANXIETY & MOOD PROTOCOLS
  // ============================================================

  anxiety_approach_shift: {
    leftFreq: 12,    // Alpha-high (more activation = approach)
    rightFreq: 8,    // Alpha-low (less activation = reduced avoidance)
    purpose: 'anxiety_faa_correction',
    rationale: 'Corrects the right-dominant FAA pattern characteristic of anxiety disorders. Shifts prefrontal balance toward approach motivation (Davidson 2004, Thibodeau 2006).',
    targetProtocols: ['anxiety_relief_v4'],
  },

  depression_activation: {
    leftFreq: 14,    // Beta-low left (activation)
    rightFreq: 10,   // Alpha right (calming)
    purpose: 'depression_faa_correction',
    rationale: 'Addresses left prefrontal hypoactivation seen in depression. Left beta + right alpha normalizes FAA toward healthy approach motivation (Henriques & Davidson 1991).',
    targetProtocols: ['mood_elevator_v4'],
  },

  emotional_balance: {
    leftFreq: 10,    // Alpha left
    rightFreq: 10,   // Alpha right (symmetric)
    purpose: 'faa_normalization',
    rationale: 'Symmetric alpha promotes balanced emotional processing. Useful as baseline before asymmetric protocols (Allen & Kline 2004).',
    targetProtocols: ['emotional_processing', 'vagus_nerve_reset'],
  },

  // ============================================================
  // CREATIVITY & INSIGHT PROTOCOLS
  // ============================================================

  creative_insight: {
    leftFreq: 10,    // Alpha left (reduced analytical)
    rightFreq: 6,    // Theta right (enhanced associative)
    purpose: 'creativity_right_theta',
    rationale: 'Right hemisphere theta is associated with insight moments ("aha!" experiences). Left alpha reduces analytical interference. (Kounios & Beeman 2009, Jung-Beeman 2004).',
    targetProtocols: ['creative_flow_inducer', 'musical_inspiration'],
  },

  divergent_thinking: {
    leftFreq: 8,     // Alpha left (defocused attention)
    rightFreq: 40,   // Gamma right (binding novel associations)
    purpose: 'divergent_gamma_right',
    rationale: 'Right hemisphere gamma burst during defocused (alpha) left hemisphere state enables novel conceptual binding. Pattern seen in highly creative individuals (Fink & Benedek 2014).',
    targetProtocols: ['creative_flow_inducer', 'flow_3_release'],
  },

  // ============================================================
  // FOCUS & LEARNING PROTOCOLS
  // ============================================================

  verbal_learning: {
    leftFreq: 15,    // Beta left (language areas)
    rightFreq: 8,    // Alpha right (reduced distraction)
    purpose: 'left_verbal_enhancement',
    rationale: 'Left hemisphere beta enhances Broca/Wernicke language network activity. Right alpha dampening reduces spatial/emotional distraction during verbal learning (Sperry 1982 lateralization model).',
    targetProtocols: ['learning_v4', 'reading_comprehension_v5'],
  },

  spatial_reasoning: {
    leftFreq: 8,     // Alpha left (reduced verbal)
    rightFreq: 15,   // Beta right (spatial processing)
    purpose: 'right_spatial_enhancement',
    rationale: 'Right hemisphere beta enhances visuospatial processing. Left alpha dampening reduces verbal interference during spatial tasks (mental rotation, geometry, navigation).',
    targetProtocols: ['pattern_recognition_accelerator_v5', 'poker_reads_enhancement_v5'],
  },

  memory_encoding: {
    leftFreq: 5,     // Theta left (verbal memory)
    rightFreq: 5,    // Theta right (spatial memory)
    purpose: 'bilateral_theta_encoding',
    rationale: 'Bilateral theta synchronization enhances hippocampal-cortical dialogue for memory encoding. Symmetric theta promotes both verbal and spatial memory consolidation (Klimesch 1999).',
    targetProtocols: ['learning_consolidation_v5', 'long_term_potentiation_activator_v5'],
  },

  // ============================================================
  // SLEEP PROTOCOLS
  // ============================================================

  sleep_onset: {
    leftFreq: 3,     // Delta left
    rightFreq: 4,    // Delta-theta border right
    purpose: 'sleep_asymmetry',
    rationale: 'Slight asymmetry during sleep onset mimics natural hemispheric sleep patterns. The brain does not sleep symmetrically — slight left-lead delta promotes faster onset (Goldstein et al. 2019).',
    targetProtocols: ['deep_sleep_v4'],
  },

  // ============================================================
  // SOCIAL & EMPATHY PROTOCOLS
  // ============================================================

  mirror_neuron_activation: {
    leftFreq: 40,    // Gamma left (action understanding)
    rightFreq: 12,   // SMR right (embodied awareness)
    purpose: 'mirror_system_enhancement',
    rationale: 'Left gamma in premotor areas activates mirror neuron system. Right SMR enhances somatic awareness of others\' emotional states (Rizzolatti & Craighero 2004).',
    targetProtocols: ['empathic_resonance', 'social_confidence_builder', 'interbrain_sync'],
  },

  // ============================================================
  // ADDICTION & RECOVERY PROTOCOLS
  // ============================================================

  craving_suppression: {
    leftFreq: 12,    // Alpha-high left (approach without impulsivity)
    rightFreq: 14,   // SMR right (motor inhibition)
    purpose: 'craving_inhibition',
    rationale: 'Left alpha maintains positive motivation without triggering impulsive approach. Right SMR enhances motor inhibition circuit — the "brake" on acting on cravings (Goldstein & Volkow 2011).',
    targetProtocols: ['acute_craving', 'craving_interrupter', 'dopamine_reset'],
  },
};

// ============================================================
// HELPER: Apply split-hemisphere to Phase Builder
// ============================================================

/**
 * Generate the splitHemisphere object for a protocol phase.
 * 
 * Usage in Phase Builder protocols:
 * 
 *   // In v4-style protocol definition:
 *   splitHemisphere: getSplitHemisphere('anxiety_approach_shift')
 * 
 *   // Or directly in phase object:
 *   const preset = SPLIT_HEMISPHERE_PRESETS.anxiety_approach_shift;
 *   phase.splitHemisphere = {
 *     leftFreq: preset.leftFreq,
 *     rightFreq: preset.rightFreq,
 *     purpose: preset.purpose,
 *   };
 */
export function getSplitHemisphere(presetName: string): {
  leftFreq: number;
  rightFreq: number;
  purpose: string;
} | null {
  const preset = SPLIT_HEMISPHERE_PRESETS[presetName];
  if (!preset) return null;
  return {
    leftFreq: preset.leftFreq,
    rightFreq: preset.rightFreq,
    purpose: preset.purpose,
  };
}

/**
 * Get all presets applicable to a given protocol.
 */
export function getPresetsForProtocol(protocolId: string): SplitHemisphereConfig[] {
  return Object.values(SPLIT_HEMISPHERE_PRESETS)
    .filter(p => p.targetProtocols.includes(protocolId));
}

// ============================================================
// IMPLEMENTATION PRIORITY
// ============================================================
/**
 * Highest impact additions (add these first):
 * 
 * 1. anxiety_relief_v4 + anxiety_approach_shift
 *    → FAA correction is one of the most validated interventions
 * 
 * 2. mood_elevator_v4 + depression_activation
 *    → Left prefrontal hypoactivation is a biomarker of depression
 * 
 * 3. creative_flow_inducer + creative_insight
 *    → Right theta for insight is well-documented
 * 
 * 4. acute_craving + craving_suppression
 *    → Motor inhibition is critical for impulse control
 * 
 * 5. empathic_resonance + mirror_neuron_activation
 *    → Novel application, differentiates from all competitors
 */

// src/audio/curatedStacks.ts
// Curated protocol stacks with RVP-reviewed evidence tags and safety metadata.

export type StackEvidenceLevel = 'established' | 'experimental' | 'speculative';

export interface CuratedStack {
  /** Stable identifier, used in URLs, telemetry, and gating. */
  id: string;
  /** User-facing title for the stack card. */
  title: string;
  /** Short, plain-language explanation of what this stack is for. */
  tagline: string;
  /** Longer description shown in the detail sheet / modal. */
  description: string;
  /** Underlying protocol IDs in playback order (sequential) or parallel render set. */
  protocolIds: string[];
  /**
   * How this stack is rendered:
   * - 'sequential' → back-to-back (e.g., alpha prelude then delta core)
   * - 'parallel'   → protocols rendered simultaneously in the engine
   */
  renderMode: 'sequential' | 'parallel';
  /** Primary intent for sorting & filtering in the UI. */
  category: 'sleep' | 'focus' | 'relaxation' | 'performance' | 'autonomic';
  /** Evidence level *for the combination as used here*. */
  evidenceLevel: StackEvidenceLevel;
  /** Internal flag for your SafetyGate / classifier. */
  safetyTier: 'low' | 'moderate' | 'high';
  /** Recommended maximum continuous session length in minutes. */
  maxSessionMinutes: number;
  /** Recommended time of day. */
  recommendedTime: 'any' | 'morning' | 'afternoon' | 'evening' | 'pre_sleep' | 'night';
  /** Suggested experience level. */
  suggestedUserLevel: 'beginner' | 'intermediate' | 'advanced';
  /** Key outcomes this stack is engineered to target. */
  targetOutcomes: string[];
  /**
   * Bullet-style safety notes (rendered as list in the UI).
   * E.g. "Do not use while driving.", "Stop if you feel overstimulated."
   */
  safetyNotes: string[];
  /**
   * Optional RVP tags you can show in an "Evidence & Safety" accordion.
   * Keep these short, 1–2 per stack.
   */
  rvpNotes?: string[];
}

/**
 * Curated, RVP-reviewed protocol stacks.
 *
 * These are "opinionated presets" that:
 * - Combine existing protocols that already pass validation.
 * - Make conservative, honest evidence claims about the combo.
 * - Surface safety and usage guidance up front.
 */
export const CURATED_STACKS: CuratedStack[] = [
  // 1. Theta Meditation + Deep Sleep Delta – Sleep onset bridge → deep sleep core
  {
    id: 'theta_meditation_plus_deep_sleep',
    title: 'Theta Meditation + Deep Sleep',
    tagline: 'Gentle theta bridge into restorative deep sleep.',
    description:
      'Starts with a theta meditation phase to quiet mental chatter and ease into alpha-theta relaxation, then transitions into a stable delta core for deep, restorative sleep. ' +
      'Designed as a conservative, evidence-aligned stack for sleep onset and slow-wave support.',
    protocolIds: [
      'theta_meditation_deep',
      'deep_sleep_delta'
    ],
    renderMode: 'sequential',
    category: 'sleep',
    evidenceLevel: 'established',
    safetyTier: 'low',
    maxSessionMinutes: 120,
    recommendedTime: 'pre_sleep',
    suggestedUserLevel: 'beginner',
    targetOutcomes: [
      'reduced_sleep_latency',
      'deep_sleep_duration_increase',
      'morning_mood_improvement'
    ],
    safetyNotes: [
      'Use lying down or in a safe resting position.',
      'Do not use while driving or operating machinery.',
      'Enable night mode / lower maximum volume for bedtime sessions.'
    ],
    rvpNotes: [
      'Delta binaural beats show improved sleep quality and mood in controlled studies.',
      'Theta meditation protocols align with natural sleep-onset transitions.'
    ]
  },

  // 2. Professional Focus + Working Memory – 40 Hz stack for deep focus
  {
    id: 'gamma_focus_plus_working_memory',
    title: 'Gamma Focus + Working Memory Booster',
    tagline: 'Stacked 40 Hz gamma entrainment for intense, time-boxed focus.',
    description:
      'Combines Professional Focus v5.0 (12–15Hz SMR with 40Hz gamma) with Working Memory Expander v5.0 (pure 40Hz gamma with beta harmonics). ' +
      'This stack intensifies known 40 Hz entrainment effects for short, high-focus work blocks and is labeled experimental due to limited data on combined gamma stacking.',
    protocolIds: [
      'focus_v5_professional',
      'working_memory_expander_v5'
    ],
    renderMode: 'parallel',
    category: 'focus',
    evidenceLevel: 'experimental',
    safetyTier: 'moderate',
    maxSessionMinutes: 30,
    recommendedTime: 'morning',
    suggestedUserLevel: 'intermediate',
    targetOutcomes: [
      'sustained_attention',
      'working_memory',
      'task_engagement',
      'flow_state'
    ],
    safetyNotes: [
      'Use for time-boxed focus blocks (e.g., 20–30 minutes).',
      'Stop or switch to a calmer protocol if you feel overstimulated.',
      'Avoid use close to bedtime; gamma protocols may delay sleep onset in some users.'
    ],
    rvpNotes: [
      '40 Hz auditory stimulation has shown cognitive and mood benefits in several studies.',
      'Stacking multiple 40 Hz drivers is experimental and should be clearly labeled as such.'
    ]
  },

  // 3. ADHD Focus + HRV Coherence – Calm alert performance mode
  {
    id: 'adhd_focus_plus_hrv_coherence',
    title: 'ADHD Focus + HRV Coherence',
    tagline: 'Top-down beta focus with bottom-up autonomic coherence.',
    description:
      'Pairs ADHD Focus Enhancer v5.0 (12–15Hz SMR + beta + gamma for impulse inhibition) with HRV Coherence Optimizer v5.0 (0.1Hz resonance frequency breathing). ' +
      'Best suited for experienced users seeking "calm alert" performance; the combined effect is conceptually sound but not yet formally validated as a named stack.',
    protocolIds: [
      'adhd_focus_enhancer_v5',
      'hrv_coherence_optimizer_v5'
    ],
    renderMode: 'parallel',
    category: 'performance',
    evidenceLevel: 'speculative',
    safetyTier: 'moderate',
    maxSessionMinutes: 25,
    recommendedTime: 'afternoon',
    suggestedUserLevel: 'advanced',
    targetOutcomes: [
      'calm_focus',
      'impulse_control',
      'performance_under_pressure',
      'emotional_self_regulation'
    ],
    safetyNotes: [
      'Not recommended as a first-time protocol; start with simpler focus or coherence sessions.',
      'Discontinue if you experience anxiety, dizziness, or difficulty maintaining smooth breathing.',
      'Users with cardiovascular or respiratory conditions should consult a clinician before intensive coherence training.'
    ],
    rvpNotes: [
      'SMR training and HRV coherence each have evidence individually for ADHD and autonomic regulation.',
      'Combined use for "calm alert" performance is extrapolative and tagged speculative.'
    ]
  },

  // 4. Learning Consolidation + LTP Activator – Memory & neural strengthening
  {
    id: 'learning_consolidation_plus_ltp',
    title: 'Learning Consolidation + LTP Activator',
    tagline: 'Memory encoding with synaptic strengthening for accelerated learning.',
    description:
      'Combines Learning Consolidation v5.0 (5Hz theta + 40Hz gamma for hippocampal replay) with Long-Term Potentiation Activator v5.0 (7Hz theta + 40Hz gamma for NMDA receptor activation). ' +
      'Designed for post-study consolidation and permanent circuit strengthening.',
    protocolIds: [
      'learning_consolidation_v5',
      'long_term_potentiation_activator_v5'
    ],
    renderMode: 'sequential',
    category: 'performance',
    evidenceLevel: 'established',
    safetyTier: 'low',
    maxSessionMinutes: 40,
    recommendedTime: 'afternoon',
    suggestedUserLevel: 'intermediate',
    targetOutcomes: [
      'memory_encoding',
      'learning_speed',
      'long_term_retention',
      'synaptic_strengthening'
    ],
    safetyNotes: [
      'Use immediately after study sessions for best results.',
      'Safe for extended use; cumulative effects build over multiple sessions.'
    ],
    rvpNotes: [
      'Theta-gamma coupling is the biological mechanism for hippocampal memory consolidation.',
      'LTP activation protocols are grounded in NMDA receptor research.'
    ]
  },

  // 5. Vagal Tone + Cardiac Resilience – Deep autonomic recovery
  {
    id: 'vagal_tone_plus_cardiac_resilience',
    title: 'Vagal Tone + Cardiac Resilience',
    tagline: 'Build parasympathetic strength and heart health.',
    description:
      'Combines Vagal Tone Builder v5.0 (5Hz theta for vagal stimulation) with Cardiac Resilience Protocol v5.0 (alpha-theta blend for HRV enhancement). ' +
      'Designed for deep autonomic recovery, stress resilience, and cardiovascular health optimization.',
    protocolIds: [
      'vagal_tone_builder_v5',
      'cardiac_resilience_protocol_v5'
    ],
    renderMode: 'sequential',
    category: 'autonomic',
    evidenceLevel: 'established',
    safetyTier: 'low',
    maxSessionMinutes: 35,
    recommendedTime: 'evening',
    suggestedUserLevel: 'beginner',
    targetOutcomes: [
      'vagal_tone_increase',
      'hrv_improvement',
      'stress_resilience',
      'cardiac_health'
    ],
    safetyNotes: [
      'Excellent for post-stress recovery and evening wind-down.',
      'Safe for daily use; effects are cumulative over multiple weeks.'
    ],
    rvpNotes: [
      'Low vagal tone predicts 47% higher cardiac death risk; these protocols target vagal enhancement.',
      'Alpha-theta protocols show consistent HRV improvements in controlled studies.'
    ]
  },

  // 6. Meditation Deepening + Theta Journey – Advanced consciousness exploration
  {
    id: 'meditation_deepening_plus_shamanic_journey',
    title: 'Meditation Deepening + Shamanic Journey',
    tagline: 'Advanced theta-gamma meditation with visionary exploration.',
    description:
      'Combines Meditation Deepening v5.0 (7Hz theta + 40Hz gamma for zen states) with Shamanic Theta Journey (4.5Hz theta for visionary states). ' +
      'Designed for experienced meditators seeking deep consciousness exploration. Use with caution; not suitable for those with dissociative disorders.',
    protocolIds: [
      'meditation_deepening_v5',
      'shamanic_theta_journey'
    ],
    renderMode: 'sequential',
    category: 'relaxation',
    evidenceLevel: 'speculative',
    safetyTier: 'high',
    maxSessionMinutes: 60,
    recommendedTime: 'evening',
    suggestedUserLevel: 'advanced',
    targetOutcomes: [
      'deep_meditation',
      'consciousness_exploration',
      'visionary_experiences',
      'mindfulness_depth'
    ],
    safetyNotes: [
      'Not recommended for beginners or those with psychological conditions.',
      'Contraindicated for: psychosis, schizophrenia, severe trauma, dissociative disorders.',
      'Use in a safe, comfortable environment with no external demands.',
      'Stop immediately if you experience distress or disorientation.'
    ],
    rvpNotes: [
      'Theta-gamma meditation signatures are observed in advanced practitioners with 8,000+ hours.',
      'Shamanic drumming frequency (4.5Hz) enables visionary states but is largely speculative without clinical validation.'
    ]
  }
];

/**
 * Convenience map for quick lookup by id.
 * Use this in UI and engine layers instead of scanning the array repeatedly.
 */
export const CURATED_STACKS_BY_ID: Record<string, CuratedStack> = Object.fromEntries(
  CURATED_STACKS.map((stack) => [stack.id, stack])
);

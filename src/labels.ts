/**
 * Centralized UI Labels System
 *
 * All user-facing text strings organized by UI mode (Guided vs Expert).
 * This enables consistent language switching throughout the app.
 */

export type UIMode = 'guided' | 'expert';

// ─────────────────────────────────────────────────────────────────────────────
// MODE TOGGLE LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const MODE_LABELS = {
  appMode: {
    scientific: {
      guided: 'Research-Backed',
      expert: 'Research-Backed',
    },
    speculative: {
      guided: 'Exploratory',
      expert: 'Exploratory',
    },
  },
  uiMode: {
    guided: 'Guided',
    expert: 'Expert',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION / CATEGORY LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_LABELS: Record<string, { guided: string; expert: string; description?: string }> = {
  'Calibration': {
    guided: 'Getting Started',
    expert: 'Calibration & Setup',
    description: 'Baseline sessions to familiarize yourself with the system',
  },
  'Isochronic (Speakers)': {
    guided: 'Speaker Sessions',
    expert: 'Isochronic (Speakers)',
    description: 'No headphones required — works with speakers',
  },
  'Suffering Reduction': {
    guided: 'Relief & Comfort',
    expert: 'Suffering Reduction',
    description: 'Ease discomfort and find relief',
  },
  'Sleep & Recovery': {
    guided: 'Sleep & Recovery',
    expert: 'Sleep & Recovery',
    description: 'Deep rest and restorative sleep',
  },
  'Performance Focus': {
    guided: 'Focus & Clarity',
    expert: 'Performance Focus',
    description: 'Sharp thinking and sustained attention',
  },
  'Performance Advanced': {
    guided: 'Peak Performance',
    expert: 'Performance Advanced',
    description: 'High-intensity cognitive optimization',
  },
  'Neural Rewiring': {
    guided: 'Mindset Transformation',
    expert: 'Neural Rewiring',
    description: 'Neuroplasticity and habit formation',
  },
  'Autonomic Mastery': {
    guided: 'Nervous System Balance',
    expert: 'Autonomic Regulation',
    description: 'Heart rate variability and stress response',
  },
  'Recovery & Addiction': {
    guided: 'Recovery & Renewal',
    expert: 'Recovery & Addiction',
    description: 'Support for recovery and renewal',
  },
  'Flow State': {
    guided: 'Flow State',
    expert: 'Flow State',
    description: 'Effortless focus and creative flow',
  },
  'Athletic Performance': {
    guided: 'Athletic Performance',
    expert: 'Athletic Performance',
    description: 'Physical optimization and recovery',
  },
  'Emotional Mastery': {
    guided: 'Emotional Balance',
    expert: 'Emotional Mastery',
    description: 'Mood regulation and emotional resilience',
  },
  'Relationship & Social': {
    guided: 'Connection & Communication',
    expert: 'Relationship & Social',
    description: 'Social bonding and empathy',
  },
  'Creative Expression': {
    guided: 'Creative Expression',
    expert: 'Creative Expression',
    description: 'Artistic flow and imagination',
  },
  'Spiritual Integration': {
    guided: 'Inner Peace & Reflection',
    expert: 'Spiritual Integration',
    description: 'Contemplation and spiritual practice',
  },
  'Advanced Research': {
    guided: 'Experimental Protocols',
    expert: 'Advanced Research',
    description: 'Cutting-edge and experimental sessions',
  },
  'Biohacking & Longevity': {
    guided: 'Optimization & Vitality',
    expert: 'Biohacking & Longevity',
    description: 'Longevity and biological optimization',
  },
  'Consciousness Expansion': {
    guided: 'Deep Awareness',
    expert: 'Consciousness Expansion',
    description: 'Expanded states of consciousness',
  },
  'Cannabis Mimicry': {
    guided: 'Deep Relaxation & Creative Flow',
    expert: 'Cannabis Mimicry',
    description: 'Relaxation and creative states',
  },
  'MDMA Mimicry': {
    guided: 'Heart-Opening: Connection States',
    expert: 'MDMA Mimicry',
    description: 'Empathy and emotional openness',
  },
  'Stimulant Mimicry': {
    guided: 'Energy & Alert Focus',
    expert: 'Stimulant Mimicry',
    description: 'Clean energy and alertness',
  },
  'Psychedelic Mimicry': {
    guided: 'Expanded Perception States',
    expert: 'Psychedelic Mimicry',
    description: 'Altered perception and insight',
  },
};

/**
 * Get section label for current UI mode
 */
export function getSectionLabel(sectionKey: string, mode: UIMode): string {
  const config = SECTION_LABELS[sectionKey];
  if (!config) return sectionKey;
  return mode === 'guided' ? config.guided : config.expert;
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL TUNING PANEL LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const TUNING_LABELS = {
  panelTitle: {
    guided: 'Fine Tuning',
    expert: 'Tactical Tuning',
  },
  panelSubtitle: {
    guided: 'Personalize your session',
    expert: 'Real-time Parameter Overrides',
  },
  balance: {
    label: {
      guided: 'L/R Balance',
      expert: 'L/R Balance',
    },
  },
  pitch: {
    label: {
      guided: 'Base Tone',
      expert: 'Carrier Frequency',
    },
    unit: {
      guided: 'cents',
      expert: 'cents',
    },
  },
  beatOffset: {
    label: {
      guided: 'Rhythm Shift',
      expert: 'Beat Offset',
    },
    unit: {
      guided: 'cents',
      expert: 'cents',
    },
  },
  noiseFloor: {
    label: {
      guided: 'Background Noise',
      expert: 'Noise Floor',
    },
  },
  overlayIntensity: {
    label: {
      guided: 'Harmonic Blend',
      expert: 'Overlay Intensity',
    },
  },
};

/**
 * Get tuning label for current UI mode
 */
export function getTuningLabel(key: keyof typeof TUNING_LABELS, subkey: 'label' | 'unit' = 'label', mode: UIMode): string {
  const config = TUNING_LABELS[key];
  const nested = config && subkey in config ? config[subkey as keyof typeof config] : undefined;
  if (!nested || typeof nested !== 'object' || !(mode in nested)) return '';
  return nested[mode as keyof typeof nested];
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE LEVEL LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const EVIDENCE_LABELS = {
  I: {
    guided: 'Strongest Evidence',
    expert: 'Level I',
    stars: 5,
    description: 'Multiple high-quality RCTs with consistent results',
  },
  II: {
    guided: 'Strong Evidence',
    expert: 'Level II',
    stars: 4,
    description: 'Several RCTs or meta-analyses with positive findings',
  },
  III: {
    guided: 'Moderate Evidence',
    expert: 'Level III',
    stars: 3,
    description: 'Some controlled studies with promising results',
  },
  IV: {
    guided: 'Emerging Evidence',
    expert: 'Level IV',
    stars: 2,
    description: 'Preliminary research and case studies',
  },
  V: {
    guided: 'Exploratory',
    expert: 'Level V',
    stars: 1,
    description: 'Theoretical framework or early-stage research',
  },
};

/**
 * Get evidence label for current UI mode
 */
export function getEvidenceLabel(level: string, mode: UIMode): string {
  const config = EVIDENCE_LABELS[level as keyof typeof EVIDENCE_LABELS];
  if (!config) return level;
  return mode === 'guided' ? config.guided : config.expert;
}

/**
 * Get evidence stars count
 */
export function getEvidenceStars(level: string): number {
  const config = EVIDENCE_LABELS[level as keyof typeof EVIDENCE_LABELS];
  return config?.stars ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATES
// ─────────────────────────────────────────────────────────────────────────────

export const EMPTY_STATE_LABELS = {
  desktop: {
    noProtocol: {
      guided: 'Choose a session from the panel →',
      expert: 'Select Protocol to Begin',
    },
  },
  mobile: {
    noProtocol: {
      session: {
        guided: 'Tap Gallery to browse sessions',
        expert: 'Load Protocol to Begin',
      },
      tune: {
        guided: 'Select a session first to access tuning controls',
        expert: 'Metadata Locked — Select Protocol First',
      },
    },
  },
};

/**
 * Get empty state label
 */
export function getEmptyStateLabel(context: 'desktop' | 'mobile', subcontext: string, mode: UIMode): string {
  if (context === 'desktop') {
    const config = EMPTY_STATE_LABELS.desktop[subcontext as keyof typeof EMPTY_STATE_LABELS.desktop];
    if (!config) return '';
    return config[mode];
  } else {
    const noProtocol = EMPTY_STATE_LABELS.mobile.noProtocol;
    const config = noProtocol[subcontext as keyof typeof noProtocol];
    if (!config) return '';
    return config[mode];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL UI STRINGS
// ─────────────────────────────────────────────────────────────────────────────

export const UI_STRINGS = {
  playback: {
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    resume: 'Resume',
    volume: {
      guided: 'Volume',
      expert: 'Master Gain',
    },
  },
  header: {
    sessionReady: {
      guided: 'Session Ready',
      expert: 'Neural Interface Active',
    },
  },
  tabs: {
    mobile: {
      archive: 'Gallery',
      session: 'Session',
      tech: 'Insights',
      viz: 'Visualize',
    },
  },
  buttons: {
    library: 'Library',
    legal: 'Legal',
    sources: 'Sources',
    download: 'Download',
    settings: 'Settings',
  },
  dspAlgorithm: {
    guided: 'How It Works',
    expert: 'DSP Algorithm',
  },
  neuroContext: {
    guided: 'Research Background',
    expert: 'Neuro Context',
  },
};

/**
 * Get general UI string for current mode
 */
export function getUIString(path: string, mode: UIMode): string {
  const keys = path.split('.');
  let value: any = UI_STRINGS;

  for (const key of keys) {
    value = value?.[key];
    if (!value) return path;
  }

  if (typeof value === 'object' && 'guided' in value && 'expert' in value) {
    return value[mode];
  }

  return typeof value === 'string' ? value : path;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROTOCOL FRIENDLY NAMES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Friendly names for protocols (prioritizing recent additions)
 * Maps protocol ID to user-friendly display name
 */
export const PROTOCOL_FRIENDLY_NAMES: Record<string, string> = {
  // Recently added protocols (priority)
  'TG-CFC': 'Memory-Boost Theta Sync',
  'TI-PBM': 'Deep Theta Journey',
  'MGS-40': 'Gamma Focus Sweep',
  'SMR-Mu': 'Calm Body, Alert Mind',
  'RF-HRV': 'Heart-Breath Harmony',
  'ACSW': 'Slow-Wave Sleep Optimizer',
  'HCI-639': 'Heart Coherence 639',
  'ATB-10': 'Creative Heart Flow',
  'GMU-1.5': 'Manifestation Resonance',

  // Add more protocol friendly names here as they're defined
};

/**
 * Get protocol display name based on UI mode
 */
export function getProtocolDisplayName(protocol: { id: string; title: string }, mode: UIMode): { primary: string; subtitle?: string } {
  const friendlyName = PROTOCOL_FRIENDLY_NAMES[protocol.id];

  if (mode === 'guided' && friendlyName) {
    return {
      primary: friendlyName,
      subtitle: protocol.id,
    };
  } else if (mode === 'expert') {
    return {
      primary: protocol.id,
      subtitle: friendlyName,
    };
  } else {
    return {
      primary: protocol.title,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default {
  MODE_LABELS,
  SECTION_LABELS,
  TUNING_LABELS,
  EVIDENCE_LABELS,
  EMPTY_STATE_LABELS,
  UI_STRINGS,
  PROTOCOL_FRIENDLY_NAMES,
  getSectionLabel,
  getTuningLabel,
  getEvidenceLabel,
  getEvidenceStars,
  getEmptyStateLabel,
  getUIString,
  getProtocolDisplayName,
};

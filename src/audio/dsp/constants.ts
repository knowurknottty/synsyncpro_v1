/**
 * SynSync Pro — Frequency Constants & Band Definitions
 * =====================================================
 * Canonical frequency values used across all protocol specs.
 * Includes brainwave bands, solfeggio frequencies, and carrier presets.
 * 
 * @version 2.0.0
 */

// ─── Brainwave Band Boundaries ──────────────────────────────────────
export const BANDS = {
  delta:  { min: 0.5,  max: 3,   label: 'Delta',  state: 'Deep sleep, unconscious' },
  theta:  { min: 3,    max: 8,   label: 'Theta',  state: 'Hypnagogic, creative' },
  alpha:  { min: 8,    max: 12,  label: 'Alpha',  state: 'Relaxed alertness' },
  smr:    { min: 12,   max: 15,  label: 'SMR',    state: 'Motor stillness, impulse control' },
  beta:   { min: 15,   max: 30,  label: 'Beta',   state: 'Cognitive engagement' },
  gamma:  { min: 30,   max: 100, label: 'Gamma',  state: 'Insight, binding, flow' },
} as const;

// ─── Solfeggio Frequencies ──────────────────────────────────────────
export const SOLFEGGIO = {
  UT:  174,   // Pain relief, safety
  RE:  285,   // Tissue regeneration
  MI:  396,   // Liberating guilt/fear
  FA:  417,   // Facilitating change
  SOL: 528,   // Transformation, DNA repair (most studied)
  LA:  639,   // Connecting relationships
  TI:  741,   // Awakening intuition
  SI:  852,   // Returning to spiritual order
  OM:  963,   // Pineal activation / "Frequency of Gods"
} as const;

// ─── Standard Carrier Frequencies ───────────────────────────────────
// Chosen for skull cavity resonance and minimal discomfort
export const CARRIERS = {
  low:       100,  // Sub-bass protocols
  standard:  150,  // General purpose
  warm:      200,  // Relaxation / sleep
  neutral:   210,  // Meditation / balance
  bright:    250,  // Focus / performance
  high:      300,  // Gamma / high-energy
  skull_res: 215,  // Skull cavity resonance (pineal work)
} as const;

// ─── Schumann Resonance ─────────────────────────────────────────────
export const SCHUMANN = {
  fundamental: 7.83,
  harmonics: [14.3, 20.8, 27.3, 33.8] as number[],
} as const;

// ─── Common Overlay Presets ─────────────────────────────────────────
export const OVERLAY_PRESETS = {
  /** Anxiety / fear extinction stack */
  fear_extinction: [SOLFEGGIO.MI, SOLFEGGIO.FA, SOLFEGGIO.SOL], // 396, 417, 528
  /** Deep healing / pain relief stack */
  deep_healing: [SOLFEGGIO.UT, SOLFEGGIO.SOL, SOLFEGGIO.SI],    // 174, 528, 852
  /** Spiritual / consciousness stack */
  consciousness: [SOLFEGGIO.SI, SOLFEGGIO.OM, SOLFEGGIO.SOL],   // 852, 963, 528
  /** Mood / reward circuit stack */
  mood_lift: [SOLFEGGIO.SOL, SOLFEGGIO.LA, SOLFEGGIO.FA],       // 528, 639, 417
  /** Creative / intuition stack */
  creative: [SOLFEGGIO.TI, SOLFEGGIO.SOL, SOLFEGGIO.SI],        // 741, 528, 852
  /** Empty (no overlays) */
  none: [] as number[],
} as const;

// ─── DSP Defaults ───────────────────────────────────────────────────
export const DSP_DEFAULTS = {
  sampleRate: 48000 as const,
  bitDepth: 24 as const,
  crossfadeDuration: 1.5,  // seconds between phases
  masterGain: 0.85,
  gainEnvelope: {
    attack: 2.0,    // seconds
    sustain: 0.9,   // level
    release: 3.0,   // seconds
  },
  stochasticVariance: 12,  // ms
  isochronicDuty: 0.5,
} as const;

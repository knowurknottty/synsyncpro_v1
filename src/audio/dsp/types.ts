/**
 * SynSync Pro — Core DSP Type Definitions
 * =========================================
 * All protocol specs implement these interfaces.
 * Updated for octave-layered harmonic stacking DSP pipeline.
 * 
 * @version 2.0.0
 * @license MIT (Open Source — "The Linux of Brain Technology")
 */

// ─── Frequency Band Enums ───────────────────────────────────────────
export type FrequencyBand =
  | 'delta'    // 0.5–3 Hz  → deep sleep, pain, recovery
  | 'theta'    // 3–8 Hz    → hypnagogic, creative, subconscious
  | 'alpha'    // 8–12 Hz   → relaxed alertness, default mode
  | 'smr'      // 12–15 Hz  → motor stillness, impulse control
  | 'beta'     // 15–30 Hz  → cognitive engagement, problem-solving
  | 'gamma';   // 30–100 Hz → insight, binding, flow state

export type NoiseColor = 'white' | 'pink' | 'brown' | 'none';

export type SpatialMotion = 'fixed' | 'rotate' | 'random' | 'pendulum' | 'spiral' | 'breathe' | null;

export type DeliveryMethod = 'binaural' | 'isochronic' | 'hybrid';

export type EvidenceLevel = 'I' | 'II' | 'III' | 'IV' | 'V' | 'Setup';

export type ProtocolCategory =
  | 'calibration'
  | 'isochronic_speakers'
  | 'suffering_reduction'
  | 'performance_focus'
  | 'recovery_addiction'
  | 'flow_state'
  | 'emotional_mastery'
  | 'athletic'
  | 'altered_states'
  | 'advanced_research'
  | 'speculative_experimental'
  | 'sleep_recovery'
  | 'hormonal_physiological'
  | 'relationship_social'
  | 'creative_expression'
  | 'spiritual_integration'
  | 'mdma_mimicry'
  | 'stimulant_mimicry'
  | 'psychedelic_mimicry'
  | 'cannabis_mimicry'
  | 'neural_rewiring'
  | 'autonomic_mastery';

// ─── Octave Layer System ────────────────────────────────────────────
/**
 * Octave layering distributes a target frequency across multiple
 * octave-spaced carriers for richer harmonic entrainment.
 * 
 * Given a fundamental F, octave layers are:
 *   F, F*2, F/2, F*4, F/4 ... (clamped to audible range 20–20000 Hz)
 * 
 * Each layer gets an independent gain envelope and optional detuning.
 */
export interface OctaveLayer {
  /** The frequency of this layer in Hz */
  frequency: number;
  /** Gain relative to fundamental (0.0–1.0) */
  gain: number;
  /** Octave offset from fundamental (-3 to +3) */
  octaveOffset: number;
  /** Fine detune in cents (-50 to +50) for chorus/thickness */
  detuneCents: number;
  /** Per-layer spatial pan (-1.0 left to 1.0 right) */
  pan: number;
}

export interface OctaveConfig {
  /** Enable octave stacking for this frequency */
  enabled: boolean;
  /** Number of octaves above fundamental (0–3) */
  octavesAbove: number;
  /** Number of octaves below fundamental (0–3) */
  octavesBelow: number;
  /** Gain rolloff per octave step (0.0–1.0, e.g. 0.7 = -3dB/octave) */
  gainRolloff: number;
  /** Apply chorus-style detuning across layers */
  detuneSpread: number;
  /** Computed layers (populated by DSP engine) */
  layers?: OctaveLayer[];
}

// ─── Phase Definition ───────────────────────────────────────────────
export interface PhaseSpec {
  /** Phase index (0-based) */
  index: number;
  /** Human-readable phase name */
  name: string;
  /** Duration in seconds */
  durationSeconds: number;
  /** Primary beat frequency in Hz (can be a ramp: [start, end]) */
  beatFrequency: number | [number, number];
  /** Carrier frequency in Hz */
  carrierFrequency: number;
  /** Carrier octave layering config */
  carrierOctaves: OctaveConfig;
  /** Delivery method for this phase */
  delivery: DeliveryMethod;
  /** Background noise color */
  noiseType: NoiseColor;
  /** Noise mix level (0.0–1.0) */
  noiseMix: number;
  /** Overlay/harmonic frequencies in Hz */
  overlays: readonly number[];
  /** Overlay octave layering config */
  overlayOctaves: OctaveConfig;
  /** Overlay mix level (0.0–1.0) */
  overlayMix: number;
  /** Spatial modulation type */
  spatialMotion: SpatialMotion;
  /** Spatial rotation rate in Hz (for rotate/pendulum) */
  spatialRate?: number;
  /** Enable stochastic jitter on beat onset */
  stochastic: boolean;
  /** Stochastic variance in ms (typical: 5–20ms) */
  stochasticVariance?: number;
  /** Enable harmonic stacking (adds phantom fundamental perception) */
  harmonicStacking: boolean;
  /** Isochronic pulse duty cycle (0.0–1.0, default 0.5) */
  isochronicDuty?: number;
  /** Crossfade duration to next phase in seconds */
  crossfadeDuration: number;
  /** DSP: Per-phase gain envelope (0.0–1.0) */
  gainEnvelope: {
    attack: number;   // seconds
    sustain: number;   // level 0.0–1.0
    release: number;   // seconds
  };
  /** Purpose description for this phase */
  purpose: string;
}

// ─── Breathwork Integration ─────────────────────────────────────────
export interface BreathworkSpec {
  name: string;
  /** [inhale, hold, exhale, hold] in beat counts */
  ratio: [number, number, number, number];
  description: string;
  /** Seconds per full breath cycle */
  cycleDuration?: number;
  /** Sync breathwork to beat frequency */
  syncToBeat: boolean;
}

// ─── Mantra Integration ─────────────────────────────────────────────
export interface MantraSpec {
  phonetic: string;
  pronunciation: string;
  tonality: string;
  meaning: string;
  /** Repeat interval in beat repetitions */
  repeatInterval: number;
  /** Delivery: spoken aloud, whispered, or internal thought */
  delivery: 'spoken' | 'whispered' | 'internal';
}

// ─── Safety & Contraindications ─────────────────────────────────────
export interface ContraindicationSpec {
  /** List of absolute contraindications */
  absolute: string[];
  /** List of relative cautions */
  relative: string[];
  /** Drug interaction notes */
  drugInteractions?: string[];
  /** Special population notes (pregnancy, children, elderly) */
  specialPopulations?: string[];
}

// ─── Protocol Spec (the main interface) ─────────────────────────────
export interface ProtocolSpec {
  /** Machine-readable unique ID */
  id: string;
  /** Display name */
  name: string;
  /** Protocol family/category */
  category: ProtocolCategory;
  /** Spec file version */
  version?: string;
  /** Total duration in seconds */
  durationSeconds: number;
  /** Evidence level (I = gold standard, V = speculative) */
  evidenceLevel: EvidenceLevel;
  /** Primary research citations */
  citations: string[];
  /** User-facing goal description */
  usageGoal: string;
  /** Technical algorithm description */
  algorithmDescription: string;
  /** Detailed research context */
  researchContext: string;
  /** Target frequency band(s) */
  targetBands?: FrequencyBand[];
  /** Target neurochemistry */
  neurochemistryTargets?: string[];
  /** Multi-phase architecture */
  phases: PhaseSpec[];
  /** Breathwork integration */
  breathwork: BreathworkSpec;
  /** Mantra/phonetic component */
  mantra: MantraSpec;
  /** Safety information */
  contraindications: ContraindicationSpec;
  /** Expected timeline of results */
  expectedTimeline?: string;
  /** Recommended usage frequency */
  frequencyOfUse?: string;
  /** Optimal time of day */
  optimalTiming?: string;
  /** DSP: Master output gain (0.0–1.0) */
  masterGain?: number;
  /** DSP: Sample rate */
  sampleRate?: 44100 | 48000;
  /** DSP: Bit depth */
  bitDepth?: 16 | 24;
  /** DSP: Enable global octave layering */
  globalOctaveLayers?: boolean;
  /** Unlock criteria (if gated) */
  unlockCriteria?: string[];
}

// ─── Agent Message Types ────────────────────────────────────────────
export type AgentRole =
  | 'orchestrator'
  | 'dsp_engine'
  | 'spec_validator'
  | 'octave_resolver'
  | 'safety_checker'
  | 'breath_sync'
  | 'spatial_renderer'
  | 'phase_sequencer';

export interface AgentMessage {
  from: AgentRole;
  to: AgentRole;
  type: 'request' | 'response' | 'event' | 'error';
  payload: unknown;
  timestamp: number;
  correlationId: string;
}

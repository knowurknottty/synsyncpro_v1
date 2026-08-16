
// types.ts - COMPLETE PRODUCTION TYPE SYSTEM
// SynSync Pro - Clinical-Grade Neuroacoustic Medicine
// Updated: January 31, 2026
export type {
  EvidenceGrade,
  EvidenceSource,
  ClaimGuardrail,
  EffectSizeEstimate,
  DoseResponseNotes,
  ProtocolEvidenceSpec,
} from './src/types/spec-protocol-evidence';

export type {
  RiskSeverity,
  ContraindicationSpec,
  VolumeCalibrationSpec,
  PhotosensitivityCheckSpec,
  SessionLimits,
  ProtocolSafetyGateSpec,
} from './src/types/spec-safety-gates';

export type {
  MetricType,
  MeasurementFrequency,
  ImprovementDirection,
  ProtocolMetricSpec,
  TimeHorizonSpec,
  ProtocolMeasurementPlan,
} from './src/types/spec-measurement-plan';

export type NoiseType = 'white' | 'pink' | 'brown';
export type EvidenceLevel = 'I' | 'II' | 'III' | 'IV' | 'V';

// Spatial audio motion patterns
export type SpatialMotion = 'rotate' | 'fixed' | 'random' | 'breathe' | 'pendulum' | 'lissajous';

// Progression curve types for dynamic frequency sweeps
export type ProgressionCurve = 'linear' | 'exponential' | 'sigmoid' | 'logarithmic' | 'chaotic';

// Neuroanatomical targeting for DBSS
export type DBSSTarget = 
  | 'hippocampus'
  | 'amygdala' 
  | 'prefrontal'
  | 'thalamus'
  | 'motor_cortex'
  | 'vagus_nerve'
  | 'vagus_nucleus'
  | 'heart'
  | 'nucleus_tractus_solitarius'
  | 'insula'
  | 'brocas_wernickes'
  | 'white_matter'
  | 'microglia'
  | 'neocortex'
  | 'visual_cortex'
  | 'glymphatic_system'
  | 'nucleus_accumbens'
  | 'anterior_cingulate'
  | 'whole_brain';

// Hemisphere targeting for FAA correction, creativity boost, etc.
export type HemisphereAsymmetryPurpose = 
  | 'asymmetry_correction'
  | 'mood_balance'
  | 'creativity_boost'
  | 'glymphatic_bilateral';

// Time of day optimization
export type OptimalTimeOfDay = 
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'bedtime'
  | 'anytime'
  | 'post-learning'
  | 'during-practice'
  | 'during-learning'
  | 'pre-learning'
  | 'pre-event'
  | 'post-stress'
  | 'nightly'
  | 'daily';

// Multi-modal entrainment configuration
export interface EntrainmentSubMode {
  enabled: boolean;
  strength?: number;      // 0-1 amplitude modulation
  dutyCycle?: number;     // 0-1 for isochronic tones
}

export interface EntrainmentMode {
  binaural?: EntrainmentSubMode;
  isochronic?: EntrainmentSubMode;
  monaural?: EntrainmentSubMode;
}

export interface Prescription {
  id: string;
  title: string;
  prescribedBy?: string;
  date: number;
  content: string;
  source: 'upload' | 'paste';
}

// Hemisphere-specific frequency targeting
export interface SplitHemisphere {
  leftFreq: number;
  rightFreq: number;
  purpose: HemisphereAsymmetryPurpose;
}

// DBSS dual-frequency targeting
export interface DBSSFrequency {
  primary: number;
  secondary: number;
  targetRegion: DBSSTarget;
  modulationDepth?: number; // AM modulation depth (0-1), defaults to 0.3
}

// Breathwork integration
export interface Breathwork {
  name: string;
  ratio: readonly [number, number, number, number]; // [inhale, hold, exhale, hold] in seconds
  description: string;
}

// Mantra/affirmation integration
export interface Mantra {
  phonetic: string;
  meaning: string;
  repeatInterval: number; // seconds
}

// Phase definition - single segment of protocol
export interface Phase {
  // Core timing
  duration: number;               // Duration in seconds
  
  // Carrier frequencies (Oster Curve optimized: 100-500 Hz)
  carrier: number;
  carrierEnd?: number;            // For frequency sweeps
  
  // Beat frequency (entrainment target: 0.5-30 Hz)
  beat: number;
  beatEnd?: number;               // For beat sweeps
  
  // Volume control (0-1)
  vol?: number;
  volL?: number;                  // Left channel volume
  volR?: number;                  // Right channel volume
  
  // Noise layer
  noise?: NoiseType | null;
  noiseMix?: number;              // 0-1 noise blend
  
  // Multi-modal entrainment (UPGRADE 1)
  entrainmentMode?: EntrainmentMode;
  
  // Spatial audio (UPGRADE 2)
  spatialMotion?: SpatialMotion;
  
  // Dynamic progressions (UPGRADE 3)
  progressionCurve?: ProgressionCurve;
  progressionVariability?: number; // 0-1 for chaotic mode
  
  // Hemisphere targeting (UPGRADE 4)
  splitHemisphere?: SplitHemisphere;
  
  // DBSS targeting (UPGRADE 5)
  dbssFrequency?: DBSSFrequency;
  
  // Harmonic overlays (UPGRADE 6)
  harmonicOverlay?: {
    frequency: number;
    amplitude: number;
    type: 'sine' | 'square' | 'sawtooth' | 'triangle';
  }[];
  
  // Stochastic micro-jitter (UPGRADE 7)
  stochastic?: boolean | {
    enabled: boolean;
    deviation: number;  // Hz variance
    rate: number;       // Changes per second
  };
}

// Protocol definition - complete therapeutic session
export interface Protocol {
  // Core identification
  id: string;
  title: string;
  friendlyName?: string;        // User-friendly display name (e.g., "Calm Body, Alert Mind")
  description: string;
  
  // Categorization
  category: string;
  section?: string;               // Protocol family/group
  tags?: string[];
  
  // Clinical metadata
  evidenceLevel?: EvidenceLevel;
  evidenceGrade?: 'A' | 'B' | 'C' | 'D';
  mechanismOfAction?: string;
  
  // Safety
  contraindications?: readonly string[];
  contraindicationsSeverity?: 'mild' | 'moderate' | 'severe';
  
  // Usage guidance
  duration: number;               // Total duration in seconds
  usageGoal?: string;
  algoDesc?: string;
  researchContext?: string;
  citation?: string;
  optimalTimeOfDay?: OptimalTimeOfDay;
  
  // Efficacy expectations
  expectedOnset?: number;         // Minutes until effect
  cumulativeEffect?: boolean;
  requiredSessions?: number;
  
  // Personalization
  personalizedFrequency?: string; // Note for EEG-calibrated protocols
  
  // Integration features
  breathwork?: Breathwork;
  mantra?: Mantra;
  
  // Phase sequence
  phases: Phase[];
}

// Protocol chaining for multi-stage sessions
export interface ProtocolChain {
  id: string;
  name: string;
  description: string;
  protocols: Protocol[];
  transitionMode: 'crossfade' | 'immediate' | 'pause';
  transitionDuration?: number;    // Seconds for crossfade
  adaptation: 'adaptive' | 'linear';
}

// Audio output configuration
export type AudioOutputMode = 'stereo' | 'binaural' | 'spatial';

// Real-time biofeedback integration
export interface BiofeedbackMetrics {
  active?: boolean;
  coherence?: number;
  hrv?: number;                   // Heart rate variability (ms)
  heartRate?: number;             // BPM
  breathRate?: number;            // Breaths per minute
  eegAlpha?: number;              // Alpha power (μV²)
  eegBeta?: number;
  eegTheta?: number;
  eegDelta?: number;
  eegGamma?: number;
  skinConductance?: number;       // μS
  temperature?: number;           // °C
}

// Quality assurance metrics
export interface QAMetrics {
  clippingDetected: boolean;
  peakAmplitude: number;
  peakLevel?: number;
  rmsLevel: number;
  dynamicRange: number;
  thd: number;                    // Total harmonic distortion
  snr: number;                    // Signal-to-noise ratio
  noiseFloor?: number;
  clippingEvents?: number;
  lufs: number;
  peak: number;
}

export type WearableType = 'muse' | 'polar' | 'apple' | 'garmin' | 'whoop' | 'oura' | 'phone_motion' | 'bluetooth_hr' | 'muse_eeg' | 'apple_watch_bridge';

export interface WearableDevice {
  id: string;
  name: string;
  type: WearableType;
  connected: boolean;
  batteryLevel?: number;
}

export interface SensorData {
  timestamp?: number;
  type?: string;
  value?: number;
  unit?: string;
  hr?: number;
  hrv?: number;
  motion?: number | { x: number; y: number; z: number };
  eeg?: EEGData;
}

export interface EEGData {
  timestamp?: number;
  alpha?: number;
  beta?: number;
  theta?: number;
  delta?: number;
  gamma?: number;
  blink?: boolean;
  jawClench?: boolean;
  electrode?: string;
  samples?: number[];
  quality?: number;
}

export interface EEGServiceConfig {
  sampleRate: number;
  channels: string[];
}

// Export configuration
export interface ExportConfig {
  format: 'wav' | 'mp3' | 'flac';
  sampleRate: 44100 | 48000 | 88200 | 96000;
  bitDepth: 16 | 24 | 32;
  channels: 1 | 2;
  normalize: boolean;
  fadeIn?: number;                 // Seconds
  fadeOut?: number;                // Seconds
  dither?: boolean;
}

export interface SocraticStep {
  id: string;
  question: string;
  placeholder: string;
  nextLabel: string;
}

export interface GeometryLesson {
  shape: string;
  element: string;
  description: string;
  vertices: number[][];
  faces: number[][];
}

export type SessionGuidance = 'audio_only' | 'breathwork' | 'mantra' | 'socratic' | 'geometry';

export interface MantraProfile {
  id: string;
  name: string;
  phonetic: string;
  meaning: string;
  pronunciation?: string;
  tonality?: string;
  affirmations?: string[];
}

export interface CymaticsSafetyConfig {
  maxFrequency: number;
  syncToAudio: boolean;
  fftSize: 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;
  smoothingTimeConstant: number;
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentProtocolId: string | null;
  currentPhaseIndex: number;
  volume: number;
}

export type CymaticMedium = 'sand' | 'water' | 'mercury' | 'oil' | 'ferrofluid' | 'plasma' | 'gold' | 'aether';

// ─── Access / Membership system ──────────────────────────────────────────────

export type MembershipPlan = 'day' | 'week' | 'month' | 'year' | 'lifetime';

export interface AccessToken {
  uid: string;
  iat: number;         // issued-at  (unix ms)
  exp: number | null;  // expires-at (unix ms) — null = lifetime
  plan: MembershipPlan;
}

export interface SessionRecord {
  protocolId: string;
  timestamp: number;
  durationMs: number;
}

export interface UserData {
  displayName: string;
  favoriteProtocols: string[];
  sessionsCompleted: number;
  totalMinutes: number;
  lastProtocolId: string | null;
  notes: string;
  /**
   * User-supplied prescription text (pasted or typed).
   * When present, GuidedHome surfaces a banner and highlights
   * relevant protocols above all others.
   */
  prescription?: string;
  preferences: Record<string, unknown> & {
    prescriptions?: Prescription[];
  };
  history: SessionRecord[];
  createdAt: number;
  lastSeen: number;
}

export interface AccessSession {
  token: AccessToken;
  userData: UserData;
  /** In-memory blob of the current (possibly updated) file */
  fileBlob: Blob;
  /** Original filename so we can offer re-download with the same name */
  filename: string;
}

export type XRSession = any;

// Constants for therapeutic frequencies
export const SOLFEGGIO = {
  UT: 396,   // Liberation from fear
  RE: 417,   // Facilitating change
  MI: 528,   // Transformation/DNA repair
  FA: 639,   // Connecting relationships
  SOL: 741,  // Awakening intuition
  LA: 852,   // Returning to spiritual order
  SI: 963    // Divine consciousness (extended)
} as const;

export const SCHUMANN_BASE = 7.83;
export const SCHUMANN_HARMONICS = [14.3, 20.8, 27.3, 33.8, 39.0, 45.0] as const;

// Oster Curve optimal carrier range
export const OSTER_CARRIER_MIN = 100;
export const OSTER_CARRIER_MAX = 500;
export const OSTER_CARRIER_OPTIMAL = 200; // Sweet spot for most users

// Safety limits
export const BEAT_FREQUENCY_MIN = 0.5;
export const BEAT_FREQUENCY_MAX = 100;    // Gamma upper limit
export const BEAT_FREQUENCY_SAFE_MAX = 50; // Conservative safety limit

// Seizure risk thresholds
export const SEIZURE_RISK_ALPHA = 10;     // 10 Hz - photosensitive epilepsy risk
export const SEIZURE_RISK_RANGE = [8, 12]; // Alpha band caution zone

// Amplitude safety
export const MAX_AMPLITUDE = 0.95;        // Prevent clipping
export const RMS_TARGET = 0.3;            // Target RMS for comfort
export const LIMITER_THRESHOLD = -0.5;    // dBFS
export const LIMITER_KNEE = 0.1;          // Soft knee

// src/protocols/schema.ts [Established]

import type { DspGraphSpec } from "../dsp/graph/DspNode";

export type SafetyGrade = "A" | "B" | "C" | "D" | "E";

export interface ProtocolSafety {
  maxLeqDb: number;
  photosensitivityHzMin: number;
  photosensitivityHzMax: number;
  seizureHistoryContraindicated: boolean;
  evidenceGrade: SafetyGrade;
  notes: string;
}

export interface EntrainmentLayer {
  id: string;
  description: string;
  targetBandHz: number;
  stimulusType: "binaural" | "isochronic" | "am-fm-hybrid";
  dspGraph: DspGraphSpec;
}

export interface PsychoacousticProfile {
  useCriticalBandAnalyzer: boolean;
  useColoredNoiseMasker: boolean;
  useBinauralSpatializer: boolean;
  spatialSceneId?: string;
}

export interface ProtocolSpec {
  id: string;
  name: string;
  category: string;
  version: string;
  durationSeconds: number;
  layers: EntrainmentLayer[];
  psychoacoustics: PsychoacousticProfile;
  safety: ProtocolSafety;
}

// src/dsp/compiler/protocolCompiler.ts
// Compiles a PhaseSpec-based ProtocolSpec into a DspGraphSpec-based ProtocolSpec.

import type { ProtocolSpec as PhaseProtocolSpec } from '../../audio/dsp/types';
import type {
  ProtocolSpec as GraphProtocolSpec,
  EntrainmentLayer,
  PsychoacousticProfile,
  ProtocolSafety,
  SafetyGrade,
} from '../../protocols/schema';
import { compilePhaseToGraph } from './phaseToGraph';

/**
 * Compile a full PhaseSpec-based protocol into the graph-based format
 * consumed by ProtocolPlayer + GraphEngine.
 */
export function compileProtocol(source: PhaseProtocolSpec): GraphProtocolSpec {
  const layers: EntrainmentLayer[] = source.phases.map((phase, idx) => {
    const beatHz = Array.isArray(phase.beatFrequency)
      ? phase.beatFrequency[0]
      : phase.beatFrequency;

    return {
      id: `phase-${idx}`,
      description: `${phase.name}: ${phase.purpose}`,
      targetBandHz: beatHz,
      stimulusType: mapDeliveryToStimulus(phase.delivery),
      dspGraph: compilePhaseToGraph(phase, idx),
    };
  });

  return {
    id: source.id,
    name: source.name,
    category: source.category,
    version: source.version ?? '1.0.0',
    durationSeconds: source.durationSeconds,
    layers,
    psychoacoustics: derivePsychoacoustics(source),
    safety: deriveSafety(source),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────

function mapDeliveryToStimulus(
  delivery: 'binaural' | 'isochronic' | 'hybrid',
): 'binaural' | 'isochronic' | 'am-fm-hybrid' {
  switch (delivery) {
    case 'binaural':
      return 'binaural';
    case 'isochronic':
      return 'isochronic';
    case 'hybrid':
      return 'am-fm-hybrid';
  }
}

function derivePsychoacoustics(source: PhaseProtocolSpec): PsychoacousticProfile {
  const hasNoise = source.phases.some(p => p.noiseType !== 'none' && p.noiseMix > 0);
  const hasSpatial = source.phases.some(
    p => p.spatialMotion != null && p.spatialMotion !== 'fixed',
  );
  const hasBinaural = source.phases.some(p => p.delivery !== 'isochronic');

  return {
    useCriticalBandAnalyzer: source.phases.some(
      p => p.carrierOctaves.enabled || p.overlayOctaves.enabled,
    ),
    useColoredNoiseMasker: hasNoise,
    useBinauralSpatializer: hasSpatial || hasBinaural,
  };
}

function deriveSafety(source: PhaseProtocolSpec): ProtocolSafety {
  const gradeMap: Record<string, SafetyGrade> = {
    I: 'A',
    II: 'B',
    III: 'C',
    IV: 'D',
    V: 'E',
    Setup: 'B',
  };

  const hasGamma = source.phases.some(p => {
    const beat = Array.isArray(p.beatFrequency)
      ? Math.max(...p.beatFrequency)
      : p.beatFrequency;
    return beat >= 30;
  });

  const hasEpilepsyContra = source.contraindications.absolute.some(c =>
    c.toLowerCase().includes('epilepsy'),
  );

  return {
    maxLeqDb: 80,
    photosensitivityHzMin: 0,
    photosensitivityHzMax: 0,
    seizureHistoryContraindicated: hasGamma || hasEpilepsyContra,
    evidenceGrade: gradeMap[source.evidenceLevel] ?? 'E',
    notes:
      source.contraindications.absolute.join('; ') ||
      'No absolute contraindications',
  };
}

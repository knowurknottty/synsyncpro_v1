import { PROTOCOLS } from '../audio/constants.ts';
import type { Protocol } from '../../types.ts';

export type FrankenCAPTReleaseModuleId = 'pain' | 'sleep' | 'focus' | 'anxiety';

export interface FrankenCAPTReleaseModule {
  moduleId: FrankenCAPTReleaseModuleId;
  protocolId: string;
  title: string;
  shortName: string;
  releaseReason: string;
  intendedUse: string;
}

export const FRANKENCAPT_RELEASE_LICENSE = 'CAPT-BioCAPT Constitutional Commons License, pending final signed release';

export const FRANKENCAPT_RELEASE_MODULES: readonly FrankenCAPTReleaseModule[] = [
  {
    moduleId: 'pain',
    protocolId: 'neuro_analgesia',
    title: 'NeuroAnalgesia',
    shortName: 'Pain Module',
    releaseReason:
      'The pain module is the cleanest public proof that SynSync is not just ambience: it encodes a staged alpha-to-delta intervention with noise shaping, overlays, spatial motion, and safety metadata.',
    intendedUse:
      'Public, non-commercial individual use for chronic pain support and nervous-system downshift. Not a substitute for medical care.',
  },
  {
    moduleId: 'sleep',
    protocolId: 'deep_sleep_delta',
    title: 'Deep Sleep Delta',
    shortName: 'Sleep Module',
    releaseReason:
      'The sleep module uses the strongest runnable sleep spec in the repo: an evidence-level-I delta protocol with infraslow consolidation, brown/pink noise shaping, and a full 90-minute descent/sustain architecture.',
    intendedUse:
      'Public, non-commercial individual use for sleep onset support. People with sleep apnea or clinical sleep disorders should use medical guidance.',
  },
  {
    moduleId: 'focus',
    protocolId: 'focus_v5_professional',
    title: 'Professional Focus',
    shortName: 'Focus Module',
    releaseReason:
      'The focus module is the sharp edge of the proof: SMR, beta, and gamma layers arranged for stillness plus cognitive binding in a way the engine can verify and play.',
    intendedUse:
      'Public, non-commercial individual use for time-boxed work or study blocks. Avoid late-day use and discontinue if overstimulating.',
  },
  {
    moduleId: 'anxiety',
    protocolId: 'anxiety_relief_v4',
    title: 'Anxiety Relief',
    shortName: 'Anxiety Module',
    releaseReason:
      'The anxiety module is the public trust anchor: simple enough to understand, strong enough to matter, and structured to demonstrate a real therapeutic DSP path.',
    intendedUse:
      'Public, non-commercial individual use for acute or recurring anxiety support. Not emergency care and not a replacement for professional treatment.',
  },
] as const;

export function getFrankenCAPTReleaseProtocol(moduleId: FrankenCAPTReleaseModuleId): Protocol {
  const releaseModule = FRANKENCAPT_RELEASE_MODULES.find((candidate) => candidate.moduleId === moduleId);
  if (!releaseModule) {
    throw new Error(`Unknown FrankenCAPT public release module: ${moduleId}`);
  }
  return requireProtocol(releaseModule.protocolId);
}

export function getFrankenCAPTReleaseProtocols(): Record<FrankenCAPTReleaseModuleId, Protocol> {
  return FRANKENCAPT_RELEASE_MODULES.reduce((acc, releaseModule) => {
    acc[releaseModule.moduleId] = requireProtocol(releaseModule.protocolId);
    return acc;
  }, {} as Record<FrankenCAPTReleaseModuleId, Protocol>);
}

function requireProtocol(protocolId: string): Protocol {
  const protocol = PROTOCOLS[protocolId];
  if (!protocol) {
    throw new Error(`FrankenCAPT public release protocol not found: ${protocolId}`);
  }
  return protocol;
}

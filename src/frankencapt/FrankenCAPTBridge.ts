import { AudioEngine } from '../../services/AudioEngine.ts';
import { classifyProtocolSafety, type ProtocolSafetyProfile } from '../../services/ProtocolSafety.ts';
import type { AudioState, Protocol, QAMetrics } from '../../types.ts';
import {
  FRANKENCAPT_RELEASE_LICENSE,
  FRANKENCAPT_RELEASE_MODULES,
  getFrankenCAPTReleaseProtocol,
  type FrankenCAPTReleaseModule,
  type FrankenCAPTReleaseModuleId,
} from './publicRelease.ts';

export const FRANKENCAPT_GLOBAL_KEY = '__FRANKENCAPT_SYNSYNC__';

export interface FrankenCAPTHandshake {
  bridgeId: 'frankencapt.synsync.v1';
  version: '1.0.0';
  engine: 'synsync-pro-audio-engine';
  issuedAt: string;
  capabilities: readonly string[];
  release: {
    license: string;
    moduleCount: number;
    modules: readonly string[];
  };
  disclosure: {
    exposesRawSource: false;
    exposesPrivateProtocols: false;
    exposesLocalPaths: false;
    exposesSecrets: false;
  };
  proofHash: string;
}

export interface FrankenCAPTProtocolManifest {
  id: string;
  title: string;
  category: string;
  section: string | null;
  durationSeconds: number;
  evidenceLevel: string | number | null;
  phaseCount: number;
  frequencyEnvelope: {
    carrierHz: NumericRange | null;
    beatHz: NumericRange | null;
  };
  features: {
    noiseTypes: readonly string[];
    entrainmentModes: readonly string[];
    spatialMotion: readonly string[];
    hasHarmonicOverlay: boolean;
    hasStochasticJitter: boolean;
    hasDbssTargeting: boolean;
    hasSplitHemisphere: boolean;
  };
  safety: Pick<
    ProtocolSafetyProfile,
    | 'overallRisk'
    | 'photosensitivityRisk'
    | 'gamma40Hz'
    | 'has3to30Hz'
    | 'has10to25Hz'
    | 'hasDeltaSub4Hz'
    | 'hasInfraslowSub1Hz'
    | 'contraindicationsSeverity'
    | 'tags'
    | 'summary'
  >;
  manifestHash: string;
}

export interface FrankenCAPTReceipt {
  ok: boolean;
  action: 'handshake' | 'inspect' | 'play' | 'stop' | 'volume' | 'challenge';
  issuedAt: string;
  protocolHash?: string;
  stateHash: string;
  receiptHash: string;
}

export interface FrankenCAPTChallengeResponse extends FrankenCAPTReceipt {
  action: 'challenge';
  challengeHash: string;
  responseHash: string;
}

export interface FrankenCAPTBridgeState {
  engineReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentProtocolId: string | null;
  currentPhaseIndex: number;
  volume: number | null;
  qaMetrics: QAMetrics | null;
}

export interface FrankenCAPTBridgeApi {
  handshake(): FrankenCAPTHandshake;
  getState(): FrankenCAPTBridgeState;
  getReleaseModules(): readonly FrankenCAPTReleaseModule[];
  getReleaseModuleManifest(moduleId: FrankenCAPTReleaseModuleId): FrankenCAPTProtocolManifest;
  inspectActiveProtocol(): FrankenCAPTProtocolManifest | null;
  inspectProtocol(protocol: Protocol): FrankenCAPTProtocolManifest;
  play(protocol: Protocol): Promise<FrankenCAPTReceipt>;
  stop(): FrankenCAPTReceipt;
  setVolume(volume: number): FrankenCAPTReceipt;
  answerChallenge(challenge: string): FrankenCAPTChallengeResponse;
}

interface NumericRange {
  min: number;
  max: number;
}

type InstallTarget = Record<string, unknown>;

const CAPABILITIES = [
  'live-engine-handshake',
  'sanitized-protocol-inspection',
  'playback-control',
  'volume-control',
  'qa-metrics-readout',
  'safety-profile-readout',
  'challenge-response-proof',
  'four-module-public-release',
] as const;

const EMPTY_DISCLOSURE = {
  exposesRawSource: false,
  exposesPrivateProtocols: false,
  exposesLocalPaths: false,
  exposesSecrets: false,
} as const;

export class FrankenCAPTBridge implements FrankenCAPTBridgeApi {
  constructor(private readonly audioEngine: AudioEngine) {}

  handshake(): FrankenCAPTHandshake {
    const issuedAt = new Date().toISOString();
    const basis = {
      bridgeId: 'frankencapt.synsync.v1',
      version: '1.0.0',
      engine: 'synsync-pro-audio-engine',
      capabilities: CAPABILITIES,
      release: releaseSummary(),
      disclosure: EMPTY_DISCLOSURE,
    } satisfies Omit<FrankenCAPTHandshake, 'issuedAt' | 'proofHash'>;

    return {
      ...basis,
      issuedAt,
      proofHash: stableHash(basis),
    };
  }

  getState(): FrankenCAPTBridgeState {
    const playbackState = readPlaybackState(this.audioEngine);
    const currentProtocol = readCurrentProtocol(this.audioEngine);

    return {
      engineReady: Boolean(this.audioEngine),
      isPlaying: playbackState?.isPlaying ?? Boolean(this.audioEngine.isPlaying),
      isPaused: playbackState?.isPaused ?? false,
      currentProtocolId: currentProtocol?.id ?? null,
      currentPhaseIndex: playbackState?.currentPhaseIndex ?? 0,
      volume: readVolume(this.audioEngine),
      qaMetrics: this.audioEngine.getQAMetrics?.() ?? null,
    };
  }

  getReleaseModules(): readonly FrankenCAPTReleaseModule[] {
    return FRANKENCAPT_RELEASE_MODULES;
  }

  getReleaseModuleManifest(moduleId: FrankenCAPTReleaseModuleId): FrankenCAPTProtocolManifest {
    return this.inspectProtocol(getFrankenCAPTReleaseProtocol(moduleId));
  }

  inspectActiveProtocol(): FrankenCAPTProtocolManifest | null {
    const currentProtocol = readCurrentProtocol(this.audioEngine);
    return currentProtocol ? this.inspectProtocol(currentProtocol) : null;
  }

  inspectProtocol(protocol: Protocol): FrankenCAPTProtocolManifest {
    const manifest = buildProtocolManifest(protocol);
    return {
      ...manifest,
      manifestHash: stableHash(manifest),
    };
  }

  async play(protocol: Protocol): Promise<FrankenCAPTReceipt> {
    assertPlayable(protocol);
    await this.audioEngine.unlock?.();
    await this.audioEngine.playProtocol(protocol);
    return this.receipt('play', this.inspectProtocol(protocol).manifestHash);
  }

  stop(): FrankenCAPTReceipt {
    this.audioEngine.stopProtocol();
    return this.receipt('stop');
  }

  setVolume(volume: number): FrankenCAPTReceipt {
    if (!Number.isFinite(volume)) {
      throw new Error('FrankenCAPT volume must be a finite number.');
    }
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioEngine.setVolume(clampedVolume);
    return this.receipt('volume');
  }

  answerChallenge(challenge: string): FrankenCAPTChallengeResponse {
    const normalizedChallenge = String(challenge ?? '').slice(0, 512);
    const stateHash = stableHash(this.getState());
    const challengeHash = stableHash({ challenge: normalizedChallenge });
    const responseHash = stableHash({
      bridge: this.handshake().proofHash,
      challengeHash,
      stateHash,
    });

    const receipt = this.receipt('challenge');
    return {
      ...receipt,
      action: 'challenge',
      challengeHash,
      responseHash,
    };
  }

  toPublicApi(): FrankenCAPTBridgeApi {
    return {
      handshake: () => this.handshake(),
      getState: () => this.getState(),
      getReleaseModules: () => this.getReleaseModules(),
      getReleaseModuleManifest: (moduleId: FrankenCAPTReleaseModuleId) =>
        this.getReleaseModuleManifest(moduleId),
      inspectActiveProtocol: () => this.inspectActiveProtocol(),
      inspectProtocol: (protocol: Protocol) => this.inspectProtocol(protocol),
      play: (protocol: Protocol) => this.play(protocol),
      stop: () => this.stop(),
      setVolume: (volume: number) => this.setVolume(volume),
      answerChallenge: (challenge: string) => this.answerChallenge(challenge),
    };
  }

  private receipt(action: FrankenCAPTReceipt['action'], protocolHash?: string): FrankenCAPTReceipt {
    const issuedAt = new Date().toISOString();
    const stateHash = stableHash(this.getState());
    const receiptBasis = {
      action,
      issuedAt,
      protocolHash,
      stateHash,
    };

    return {
      ok: true,
      action,
      issuedAt,
      protocolHash,
      stateHash,
      receiptHash: stableHash(receiptBasis),
    };
  }
}

function releaseSummary(): FrankenCAPTHandshake['release'] {
  return {
    license: FRANKENCAPT_RELEASE_LICENSE,
    moduleCount: FRANKENCAPT_RELEASE_MODULES.length,
    modules: FRANKENCAPT_RELEASE_MODULES.map((releaseModule) => releaseModule.moduleId),
  };
}

export function installFrankenCAPTBridge(
  audioEngine: AudioEngine,
  target: InstallTarget = globalThis as unknown as InstallTarget,
): () => void {
  const bridge = new FrankenCAPTBridge(audioEngine);

  Object.defineProperty(target, FRANKENCAPT_GLOBAL_KEY, {
    value: bridge.toPublicApi(),
    configurable: true,
    enumerable: false,
    writable: false,
  });

  return () => {
    delete target[FRANKENCAPT_GLOBAL_KEY];
  };
}

function buildProtocolManifest(protocol: Protocol): Omit<FrankenCAPTProtocolManifest, 'manifestHash'> {
  if (!protocol || typeof protocol !== 'object') {
    throw new Error('FrankenCAPT requires a protocol object for inspection.');
  }

  const phases = Array.isArray(protocol.phases) ? protocol.phases : [];
  const safety = classifyProtocolSafety(protocol);

  return {
    id: protocol.id,
    title: protocol.title,
    category: protocol.category,
    section: protocol.section ?? null,
    durationSeconds: protocol.duration,
    evidenceLevel: protocol.evidenceLevel ?? null,
    phaseCount: phases.length,
    frequencyEnvelope: {
      carrierHz: rangeFrom(phases.flatMap((phase) => [phase.carrier, phase.carrierEnd])),
      beatHz: rangeFrom(phases.flatMap((phase) => [phase.beat, phase.beatEnd])),
    },
    features: {
      noiseTypes: uniqueStrings(phases.map((phase) => phase.noise).filter(Boolean)),
      entrainmentModes: uniqueStrings(phases.flatMap((phase) => Object.keys(phase.entrainmentMode ?? {}))),
      spatialMotion: uniqueStrings(phases.map((phase) => phase.spatialMotion).filter(Boolean)),
      hasHarmonicOverlay: phases.some((phase) => Boolean(phase.harmonicOverlay?.length)),
      hasStochasticJitter: phases.some((phase) => typeof phase.stochastic === 'object' ? phase.stochastic.enabled : Boolean(phase.stochastic)),
      hasDbssTargeting: phases.some((phase) => Boolean(phase.dbssFrequency)),
      hasSplitHemisphere: phases.some((phase) => Boolean(phase.splitHemisphere)),
    },
    safety: {
      overallRisk: safety.overallRisk,
      photosensitivityRisk: safety.photosensitivityRisk,
      gamma40Hz: safety.gamma40Hz,
      has3to30Hz: safety.has3to30Hz,
      has10to25Hz: safety.has10to25Hz,
      hasDeltaSub4Hz: safety.hasDeltaSub4Hz,
      hasInfraslowSub1Hz: safety.hasInfraslowSub1Hz,
      contraindicationsSeverity: safety.contraindicationsSeverity,
      tags: safety.tags,
      summary: safety.summary,
    },
  };
}

function assertPlayable(protocol: Protocol): void {
  if (!protocol?.id || !protocol?.title || !Array.isArray(protocol.phases) || protocol.phases.length === 0) {
    throw new Error('FrankenCAPT refused playback: protocol is incomplete.');
  }

  if (!Number.isFinite(protocol.duration) || protocol.duration <= 0) {
    throw new Error('FrankenCAPT refused playback: protocol duration must be positive.');
  }
}

function readPlaybackState(audioEngine: AudioEngine): Partial<AudioState> | null {
  const maybeState = (audioEngine as unknown as { getPlaybackState?: () => Partial<AudioState> }).getPlaybackState?.();
  return maybeState ?? null;
}

function readCurrentProtocol(audioEngine: AudioEngine): Protocol | null {
  return (
    (audioEngine as unknown as { currentProtocol?: Protocol | null }).currentProtocol ??
    (audioEngine as unknown as { activeProtocol?: Protocol | null }).activeProtocol ??
    null
  );
}

function readVolume(audioEngine: AudioEngine): number | null {
  const maybeVolume = (audioEngine as unknown as { volume?: unknown; masterGain?: GainNode | null }).volume;
  if (typeof maybeVolume === 'number') return maybeVolume;
  return audioEngine.masterGain?.gain?.value ?? null;
}

function rangeFrom(values: readonly unknown[]): NumericRange | null {
  const numericValues = values.filter((value): value is number => Number.isFinite(value));
  if (numericValues.length === 0) return null;
  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
}

function uniqueStrings(values: readonly unknown[]): readonly string[] {
  return [...new Set(values.map(String))].sort();
}

function stableHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

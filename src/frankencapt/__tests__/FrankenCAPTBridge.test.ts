import { describe, expect, it, vi } from 'vitest';
import { AudioEngine } from '../../../services/AudioEngine.ts';
import type { Protocol } from '../../../types.ts';
import {
  FRANKENCAPT_GLOBAL_KEY,
  FRANKENCAPT_RELEASE_MODULES,
  FrankenCAPTBridge,
  getFrankenCAPTReleaseProtocol,
  installFrankenCAPTBridge,
} from '../index.ts';

const protocol: Protocol = {
  id: 'test-protocol',
  title: 'Test Protocol',
  description: 'This description should not be needed by the public proof manifest.',
  category: 'evidence',
  section: 'Test',
  duration: 60,
  evidenceLevel: 'II',
  phases: [
    {
      duration: 60,
      carrier: 220,
      beat: 10,
      noise: 'pink',
      spatialMotion: 'rotate',
      entrainmentMode: {
        binaural: { enabled: true, strength: 1 },
        isochronic: { enabled: true, dutyCycle: 0.5 },
      },
    },
  ],
};

function createMockEngine() {
  return {
    ctx: null,
    masterGain: { gain: { value: 0.5 } },
    activeProtocol: protocol,
    currentProtocol: protocol,
    isPlaying: true,
    unlock: vi.fn().mockResolvedValue(undefined),
    playProtocol: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    setVolume: vi.fn(),
    getQAMetrics: vi.fn(() => null),
    getPlaybackState: vi.fn(() => ({
      isPlaying: true,
      isPaused: false,
      currentProtocolId: protocol.id,
      currentPhaseIndex: 0,
    })),
  } as unknown as AudioEngine;
}

describe('FrankenCAPTBridge', () => {
  it('produces a public handshake without private disclosure flags', () => {
    const bridge = new FrankenCAPTBridge(createMockEngine());
    const handshake = bridge.handshake();

    expect(handshake.bridgeId).toBe('frankencapt.synsync.v1');
    expect(handshake.disclosure).toEqual({
      exposesRawSource: false,
      exposesPrivateProtocols: false,
      exposesLocalPaths: false,
      exposesSecrets: false,
    });
    expect(handshake.release.moduleCount).toBe(4);
    expect(handshake.capabilities).toContain('four-module-public-release');
    expect(handshake.proofHash).toMatch(/^fnv1a32:/);
  });

  it('sanitizes protocol inspection to evidence, ranges, features, and hashes', () => {
    const bridge = new FrankenCAPTBridge(createMockEngine());
    const manifest = bridge.inspectProtocol(protocol);

    expect(manifest.id).toBe(protocol.id);
    expect(manifest.frequencyEnvelope.carrierHz).toEqual({ min: 220, max: 220 });
    expect(manifest.frequencyEnvelope.beatHz).toEqual({ min: 10, max: 10 });
    expect(manifest.features.noiseTypes).toEqual(['pink']);
    expect(manifest.manifestHash).toMatch(/^fnv1a32:/);
    expect(JSON.stringify(manifest)).not.toContain(protocol.description);
  });

  it('exposes the four public release modules as runnable protocol manifests', () => {
    const bridge = new FrankenCAPTBridge(createMockEngine());

    expect(FRANKENCAPT_RELEASE_MODULES.map((module) => module.moduleId)).toEqual([
      'pain',
      'sleep',
      'focus',
      'anxiety',
    ]);

    for (const releaseModule of FRANKENCAPT_RELEASE_MODULES) {
      const releaseProtocol = getFrankenCAPTReleaseProtocol(releaseModule.moduleId);
      const manifest = bridge.getReleaseModuleManifest(releaseModule.moduleId);

      expect(releaseProtocol.id).toBe(releaseModule.protocolId);
      expect(manifest.id).toBe(releaseModule.protocolId);
      expect(manifest.phaseCount).toBeGreaterThan(0);
    }
  });

  it('can be installed as a non-enumerable browser proof surface', () => {
    const target: Record<string, unknown> = {};
    const uninstall = installFrankenCAPTBridge(createMockEngine(), target);

    expect(Object.keys(target)).not.toContain(FRANKENCAPT_GLOBAL_KEY);
    expect(target[FRANKENCAPT_GLOBAL_KEY]).toBeDefined();
    expect((target[FRANKENCAPT_GLOBAL_KEY] as { handshake: () => unknown }).handshake()).toBeDefined();

    uninstall();
    expect(target[FRANKENCAPT_GLOBAL_KEY]).toBeUndefined();
  });

  it('delegates playback through the real engine wrapper', async () => {
    const engine = createMockEngine();
    const bridge = new FrankenCAPTBridge(engine);
    const receipt = await bridge.play(protocol);

    expect(engine.unlock).toHaveBeenCalled();
    expect(engine.playProtocol).toHaveBeenCalledWith(protocol);
    expect(receipt.action).toBe('play');
    expect(receipt.protocolHash).toMatch(/^fnv1a32:/);
  });
});


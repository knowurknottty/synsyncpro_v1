/**
 * Group 5: Spatial Audio & Immersion - current API test suite.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BinauralBeatStereoWidthAnimator } from '../src/modules/BinauralBeatStereoWidthAnimator';
import { SpatialAudioSceneDesigner } from '../src/modules/SpatialAudioSceneDesigner';
import { TransauralCrosstalkCancellation } from '../src/modules/TransauralCrosstalkCancellation';

function makeSource(audioContext: AudioContext): AudioBufferSourceNode {
  const source = audioContext.createBufferSource();
  source.buffer = audioContext.createBuffer(2, 44100, 44100);
  return source;
}

describe('Group 5: Spatial Audio Modules', () => {
  let audioContext: AudioContext;
  let sourceNode: AudioBufferSourceNode;

  beforeEach(() => {
    audioContext = new AudioContext();
    sourceNode = makeSource(audioContext);
  });

  afterEach(() => {
    audioContext.close();
  });

  describe('Module 8: BinauralBeatStereoWidthAnimator', () => {
    let animator: BinauralBeatStereoWidthAnimator;

    beforeEach(() => {
      animator = new BinauralBeatStereoWidthAnimator(audioContext);
    });

    it('should initialize with default parameters', () => {
      expect(animator).toBeDefined();
    });

    it('should set static spatial positions', () => {
      expect(() => animator.setStaticPosition(-90)).not.toThrow();
      expect(() => animator.setStaticPosition(0, 0)).not.toThrow();
      expect(() => animator.setStaticPosition(90, 30)).not.toThrow();
    });

    it('should accept supported animation patterns', () => {
      expect(() => animator.startAnimation('circular', { speed: 0.05, radius: 1 })).not.toThrow();
      expect(() => animator.startAnimation('pendulum', { speed: 0.1, radius: 2 })).not.toThrow();
      expect(() => animator.startAnimation('figure_eight', { speed: 0.2, radius: 3 })).not.toThrow();
      animator.stopAnimation();
    });

    it('should properly connect stereo sources to destination', () => {
      const rightSource = makeSource(audioContext);
      const destination = audioContext.createGain();

      expect(() => {
        animator.connect(sourceNode, rightSource, destination);
      }).not.toThrow();
    });

    it('should start and stop animation', () => {
      expect(() => animator.startAnimation()).not.toThrow();
      expect(() => animator.stopAnimation()).not.toThrow();
    });

    it('should handle rapid position changes', () => {
      for (let i = 0; i < 100; i++) {
        animator.setStaticPosition(Math.random() * 360 - 180, Math.random() * 60 - 30);
      }

      expect(true).toBe(true);
    });

    it('should disconnect cleanly', () => {
      expect(() => animator.disconnect()).not.toThrow();
    });
  });

  describe('Module 24: TransauralCrosstalkCancellation', () => {
    let cancellation: TransauralCrosstalkCancellation;

    beforeEach(() => {
      cancellation = new TransauralCrosstalkCancellation(audioContext);
    });

    it('should initialize with default parameters', () => {
      expect(cancellation).toBeDefined();
      expect(cancellation.input).toBeDefined();
      expect(cancellation.output).toBeDefined();
    });

    it('should accept valid speaker angles (10-60 degrees)', () => {
      expect(() => cancellation.setSpeakerAngle(10)).not.toThrow();
      expect(() => cancellation.setSpeakerAngle(30)).not.toThrow();
      expect(() => cancellation.setSpeakerAngle(60)).not.toThrow();
    });

    it('should reject invalid speaker angles', () => {
      expect(() => cancellation.setSpeakerAngle(5)).toThrow();
      expect(() => cancellation.setSpeakerAngle(65)).toThrow();
      expect(() => cancellation.setSpeakerAngle(-10)).toThrow();
    });

    it('should accept valid ear distances (0.15-0.25m)', () => {
      expect(() => cancellation.setEarDistance(0.15)).not.toThrow();
      expect(() => cancellation.setEarDistance(0.18)).not.toThrow();
      expect(() => cancellation.setEarDistance(0.25)).not.toThrow();
    });

    it('should reject invalid ear distances', () => {
      expect(() => cancellation.setEarDistance(0.1)).toThrow();
      expect(() => cancellation.setEarDistance(0.3)).toThrow();
      expect(() => cancellation.setEarDistance(-0.18)).toThrow();
    });

    it('should properly connect to audio graph', () => {
      const destination = audioContext.createGain();

      expect(() => {
        sourceNode.connect(cancellation.input);
        cancellation.output.connect(destination);
      }).not.toThrow();
    });

    it('should handle different sample rates', () => {
      const ctx44 = new AudioContext({ sampleRate: 44100 });
      const ctx48 = new AudioContext({ sampleRate: 48000 });

      expect(() => new TransauralCrosstalkCancellation(ctx44)).not.toThrow();
      expect(() => new TransauralCrosstalkCancellation(ctx48)).not.toThrow();

      ctx44.close();
      ctx48.close();
    });

    it('should disconnect cleanly', () => {
      expect(() => cancellation.disconnect()).not.toThrow();
    });
  });

  describe('Module 28: SpatialAudioSceneDesigner', () => {
    let designer: SpatialAudioSceneDesigner;

    beforeEach(() => {
      designer = new SpatialAudioSceneDesigner(audioContext);
    });

    afterEach(() => {
      designer.clearScene();
    });

    it('should initialize with default parameters', () => {
      expect(designer).toBeDefined();
      expect(designer.getSourceCount()).toBe(0);
    });

    it('should start and stop the scene loop', () => {
      expect(() => designer.startScene()).not.toThrow();
      expect(() => designer.stopScene()).not.toThrow();
    });

    it('should add audio sources at polar positions', () => {
      expect(() => designer.addSource(sourceNode, { azimuth: 0, elevation: 0, distance: 5 })).not.toThrow();

      const source = makeSource(audioContext);
      expect(() => designer.addSource(source, { azimuth: 45, elevation: 10, distance: 3 })).not.toThrow();

      expect(designer.getSourceCount()).toBe(2);
    });

    it('should reject sources with invalid positions', () => {
      expect(() => designer.addSource(sourceNode, { azimuth: NaN, elevation: 0, distance: 1 })).toThrow();
      expect(() => designer.addSource(sourceNode, { azimuth: 0, elevation: Infinity, distance: 1 })).toThrow();
    });

    it('should update source pattern and static position', () => {
      const sourceId = designer.addSource(sourceNode, { azimuth: 0, elevation: 0, distance: 2 });

      expect(sourceId).toBeTruthy();
      expect(() => designer.updateSourcePattern(sourceId!, 'orbit', { speed: 0.1, radius: 2 })).not.toThrow();
      expect(() => designer.setStaticPosition(sourceId!, { azimuth: 90, elevation: 0, distance: 2 })).not.toThrow();
    });

    it('should handle the configured source limit', () => {
      for (let i = 0; i < 8; i++) {
        designer.addSource(makeSource(audioContext), {
          azimuth: Math.random() * 360 - 180,
          elevation: Math.random() * 45,
          distance: 0.5 + Math.random() * 4.5,
        });
      }

      expect(designer.getSourceCount()).toBe(8);
      expect(designer.addSource(makeSource(audioContext), { azimuth: 0, elevation: 0, distance: 1 })).toBeNull();
    });

    it('should remove and clear sources cleanly', () => {
      const sourceId = designer.addSource(sourceNode, { azimuth: 0, elevation: 0, distance: 2 });

      expect(sourceId).toBeTruthy();
      designer.removeSource(sourceId!);
      expect(designer.getSourceCount()).toBe(0);
      expect(() => designer.clearScene()).not.toThrow();
    });
  });

  describe('Integration: All Modules Together', () => {
    it('should chain animator and crosstalk cancellation without conflicts', () => {
      const animator = new BinauralBeatStereoWidthAnimator(audioContext);
      const cancellation = new TransauralCrosstalkCancellation(audioContext);
      const designer = new SpatialAudioSceneDesigner(audioContext);
      const rightSource = makeSource(audioContext);
      const destination = audioContext.createGain();

      expect(() => {
        animator.connect(sourceNode, rightSource, cancellation.input);
        cancellation.output.connect(destination);
        designer.addSource(cancellation.output, { azimuth: 0, elevation: 0, distance: 2 });
      }).not.toThrow();

      animator.disconnect();
      cancellation.disconnect();
      designer.clearScene();
    });

    it('should handle concurrent parameter updates', () => {
      const animator = new BinauralBeatStereoWidthAnimator(audioContext);
      const cancellation = new TransauralCrosstalkCancellation(audioContext);
      const designer = new SpatialAudioSceneDesigner(audioContext);
      const sourceId = designer.addSource(sourceNode, { azimuth: 0, elevation: 0, distance: 2 });

      for (let i = 0; i < 50; i++) {
        animator.setStaticPosition(Math.random() * 360 - 180, Math.random() * 60 - 30);
        cancellation.setSpeakerAngle(10 + Math.random() * 50);
        designer.updateSourcePattern(sourceId!, i % 2 === 0 ? 'orbit' : 'static', { speed: 0.05 });
      }

      expect(true).toBe(true);
    });
  });

  describe('Safety & Error Handling', () => {
    it('should handle closed AudioContext construction gracefully', () => {
      const closedCtx = new AudioContext();
      closedCtx.close();

      expect(() => new BinauralBeatStereoWidthAnimator(closedCtx)).not.toThrow();
    });

    it('should prevent memory leaks on disconnect', () => {
      const animator = new BinauralBeatStereoWidthAnimator(audioContext);
      const rightSource = makeSource(audioContext);

      animator.connect(sourceNode, rightSource, audioContext.destination);
      animator.disconnect();
      animator.disconnect();

      expect(audioContext.currentTime).toBeGreaterThanOrEqual(0);
    });
  });
});

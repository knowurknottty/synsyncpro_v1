// services/AudioEngine.ts - COMPLETE PRODUCTION ENGINE
// SynSync Pro - Clinical-Grade Neuroacoustic Medicine
// Updated: January 31, 2026

import {
  Protocol,
  Phase,
  NoiseType,
  QAMetrics,
  ExportConfig,
  BiofeedbackMetrics,
  AudioOutputMode,
  EntrainmentMode,
  SpatialMotion,
  ProgressionCurve,
  OSTER_CARRIER_MIN,
  OSTER_CARRIER_MAX,
  BEAT_FREQUENCY_MIN,
  BEAT_FREQUENCY_SAFE_MAX,
  MAX_AMPLITUDE,
  LIMITER_THRESHOLD,
  LIMITER_KNEE
} from '../types';
import { ProtocolVault } from './ProtocolVault';

// FIX imports — v2.0 DSP improvements
import { generateNoiseBuffers, startNoiseFromBuffers, type NoiseBuffers } from '../src/audio/dsp/noise-generator';
import { calculateAdaptiveCrossfade, crossfadeGains } from '../src/audio/dsp/adaptive-crossfade';
import { calculateAdaptiveDutyCycle } from '../src/audio/dsp/adaptive-duty-cycle';
import { validateCarrierFrequencyEnhanced } from '../src/audio/dsp/carrier-validation';
import { calculateAutoJitter, applySmoothedJitter, type StochasticConfig } from '../src/audio/dsp/auto-stochastic-jitter';
import { ThrottledScheduler, UPDATE_RATES } from '../src/audio/dsp/throttled-modulation';
import { SpatialMotionEngine, type SpatialMotionConfig } from '../src/audio/dsp/spatial-motion-engine';
import { QAMetricsEngine } from '../src/audio/dsp/qa-metrics-engine';
import { migrateProtocolIds, resolveProtocolId } from '../src/audio/dsp/protocol-id-migration';

interface ModulatableNodes {
  leftOsc: OscillatorNode;
  rightOsc: OscillatorNode;
  leftGain: GainNode;
  rightGain: GainNode;
  leftFreq: number;
  rightFreq: number;
  baseLeftFreq: number;
  baseRightFreq: number;
  beatFreq: number;
  isochronicOsc?: OscillatorNode;
  isochronicGain?: GainNode;
  monauralOsc?: OscillatorNode;
  monauralGain?: GainNode;
  dbssModOsc?: OscillatorNode;
  dbssModGain?: GainNode;
  spatialPanner?: StereoPannerNode;
}

export class AudioEngine {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;
  
  public activeProtocol: Protocol | null = null;
  public get currentProtocol(): Protocol | null { return this.activeProtocol; }
  public get isPlaying(): boolean { return this.activeProtocol !== null && !this.isPaused; }

  private phaseIndex = 0;
  private phaseStartTime = 0;
  private pausedAt = 0;
  private isPaused = false;
  
  private modulatableNodes: ModulatableNodes | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  
  private animationFrameId: number | null = null;
  private phaseTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private onProgressCallback: ((progress: number) => void) | null = null;
  public onTick: ((totalElapsed: number, phaseElapsed: number, phaseIndex: number) => void) | undefined;
  public onComplete: (() => void) | undefined;
  public onError: ((error: Error) => void) | undefined;

  private biofeedbackMetrics: BiofeedbackMetrics | null = null;
  private adaptiveMode = false;

  // FIX #1: Pre-computed noise buffers (pink/brown spectral shaping)
  private noiseBuffers: NoiseBuffers | null = null;
  // FIX #7: Smoothed jitter state
  private currentJitter: number = 0;
  private jitterConfig: StochasticConfig | null = null;
  private lastFrameTime: number = 0;
  // FIX #8: Per-subsystem update rate throttling
  private scheduler: ThrottledScheduler;
  // FIX #9: Optimized spatial motion engine
  private spatialEngine: SpatialMotionEngine | null = null;
  // FIX #10: Real QA metrics engine
  private qaEngine: QAMetricsEngine | null = null;

  // Visualizer Requirements (OPTIMIZED: Single analyser with channel splitter)
  public analyserL: AnalyserNode | null = null;
  public analyserR: AnalyserNode | null = null;
  public analyserAux: AnalyserNode | null = null;
  public audioContext: AudioContext | null = null;
  private channelSplitter: ChannelSplitterNode | null = null;
  private visualizerMerger: ChannelMergerNode | null = null;

  // WAVEFORM CYMATICS: Accurate waveform capture for true frequency visualization
  private waveformCapture: Float32Array = new Float32Array(2048);
  private waveformCaptureEnabled = false;
  private waveformAnalyser: AnalyserNode | null = null;

  constructor() {
    // FIX #8: Initialize throttled scheduler
    this.scheduler = new ThrottledScheduler();
    this.scheduler.register('stochastic', UPDATE_RATES.STOCHASTIC);
    this.scheduler.register('spatial', UPDATE_RATES.SPATIAL);
    this.scheduler.register('spatial_extend', 0.25); // Re-fill 5s pre-schedule buffer every 4s
    this.scheduler.register('visualization', UPDATE_RATES.VISUALIZATION);
    this.scheduler.register('sweep', UPDATE_RATES.FREQUENCY_SWEEP);
    this.scheduler.register('qa', UPDATE_RATES.QA_METRICS);

    // FIX #14: Migrate any stored protocol IDs from old naming
    migrateProtocolIds();

    this.initializeContext();
  }

  private initializeContext(): void {
    if (typeof window === 'undefined') return;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 'interactive',
      sampleRate: 48000
    });
    this.audioContext = this.ctx;
    
    // Master gain (initial volume 0.7)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    
    // Brickwall limiter with soft knee (UPGRADE 8)
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = LIMITER_THRESHOLD;
    this.limiter.knee.value = LIMITER_KNEE;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.1;
    
    // Analyser for QA metrics
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    
    // Signal chain: masterGain → limiter → analyser → destination
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Auto-resume AudioContext when iOS interrupts it (phone call, Siri, etc.)
    this.ctx.addEventListener('statechange', () => {
      if (this.ctx && this.ctx.state === 'suspended' && this.activeProtocol && !this.isPaused) {
        this.ctx.resume().catch(() => {});
      }
    });

    // FIX #1: Pre-compute spectrally accurate noise buffers
    this.noiseBuffers = generateNoiseBuffers(this.ctx);

    // FIX #10: Real QA metrics engine
    this.qaEngine = new QAMetricsEngine(this.analyser, this.ctx.sampleRate);
  }

  // UPGRADE 9: Enhanced carrier frequency validation (Oster Curve)
  // Log flags prevent repeated console.warn in hot modulation loop (GC pressure on Android)
  private _carrierClampLogged = false;
  private _beatClampLogged = false;

  private validateCarrierFrequency(freq: number): number {
    if (freq < OSTER_CARRIER_MIN || freq > OSTER_CARRIER_MAX) {
      if (!this._carrierClampLogged) {
        console.warn(`Carrier ${freq}Hz outside Oster Curve range [${OSTER_CARRIER_MIN}-${OSTER_CARRIER_MAX}Hz], clamping`);
        this._carrierClampLogged = true;
      }
      return Math.max(OSTER_CARRIER_MIN, Math.min(OSTER_CARRIER_MAX, freq));
    }
    return freq;
  }

  // UPGRADE 10: Enhanced beat frequency validation
  private validateBeatFrequency(beat: number, context: string = ''): number {
    if (beat < BEAT_FREQUENCY_MIN || beat > BEAT_FREQUENCY_SAFE_MAX) {
      if (!this._beatClampLogged) {
        console.warn(`${context} Beat ${beat}Hz outside safe range [${BEAT_FREQUENCY_MIN}-${BEAT_FREQUENCY_SAFE_MAX}Hz], clamping`);
        this._beatClampLogged = true;
      }
      return Math.max(BEAT_FREQUENCY_MIN, Math.min(BEAT_FREQUENCY_SAFE_MAX, beat));
    }
    return beat;
  }

  // UPGRADE 11: Multi-modal entrainment synthesis
  private buildEntrainmentNodes(
    phase: Phase,
    leftCarrier: number,
    rightCarrier: number,
    beatFreq: number
  ): ModulatableNodes {
    if (!this.ctx || !this.masterGain) throw new Error('AudioContext not initialized');

    const nodes: ModulatableNodes = {
      leftOsc: this.ctx.createOscillator(),
      rightOsc: this.ctx.createOscillator(),
      leftGain: this.ctx.createGain(),
      rightGain: this.ctx.createGain(),
      leftFreq: leftCarrier,
      rightFreq: rightCarrier,
      baseLeftFreq: leftCarrier,
      baseRightFreq: rightCarrier,
      beatFreq
    };

    // Default: Binaural beats (always present as base)
    nodes.leftOsc.frequency.value = leftCarrier;
    nodes.rightOsc.frequency.value = rightCarrier;
    nodes.leftOsc.type = 'sine';
    nodes.rightOsc.type = 'sine';

    const binauralStrength = phase.entrainmentMode?.binaural?.strength ?? 1.0;
    const baseVol = (phase.vol ?? 0.7) * binauralStrength;
    
    nodes.leftGain.gain.value = phase.volL ?? baseVol;
    nodes.rightGain.gain.value = phase.volR ?? baseVol;

    // UPGRADE 12: Isochronic tones (amplitude modulation)
    if (phase.entrainmentMode?.isochronic?.enabled) {
      const isoLFO = this.ctx.createOscillator();
      const isoDepth = this.ctx.createGain();
      const isoOffset = this.ctx.createConstantSource();
      
      // FIX #3: Frequency-adaptive duty cycle
      const { dutyCycle } = calculateAdaptiveDutyCycle(
        beatFreq,
        phase.entrainmentMode.isochronic.dutyCycle
      );
      const strength = phase.entrainmentMode.isochronic.strength ?? 0.5;
      
      isoLFO.frequency.value = beatFreq;
      isoLFO.type = dutyCycle < 0.3 ? 'square' : 'sine'; // Sharp pulses for low duty cycle
      
      isoDepth.gain.value = strength;
      isoOffset.offset.value = 1.0 - (strength * 0.5); // Prevent full silence
      
      isoLFO.connect(isoDepth);
      isoDepth.connect(isoOffset.offset);
      isoOffset.connect(nodes.leftGain.gain);
      isoOffset.connect(nodes.rightGain.gain);
      
      isoLFO.start();
      isoOffset.start();
      
      nodes.isochronicOsc = isoLFO;
      nodes.isochronicGain = isoDepth;
    }

    // UPGRADE 13: Monaural beats (amplitude modulation of sum signal)
    if (phase.entrainmentMode?.monaural?.enabled) {
      const monauralOsc = this.ctx.createOscillator();
      const monauralGain = this.ctx.createGain();
      
      const strength = phase.entrainmentMode.monaural.strength ?? 0.3;
      
      monauralOsc.frequency.value = beatFreq;
      monauralOsc.type = 'sine';
      monauralGain.gain.value = strength;
      
      monauralOsc.connect(monauralGain);
      monauralGain.connect(nodes.leftGain.gain);
      monauralGain.connect(nodes.rightGain.gain);
      
      monauralOsc.start();
      
      nodes.monauralOsc = monauralOsc;
      nodes.monauralGain = monauralGain;
    }

    // UPGRADE 14: Spatial motion (dynamic panning)
    if (phase.spatialMotion && phase.spatialMotion !== 'fixed') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = 0;
      
      nodes.leftGain.connect(panner);
      nodes.rightGain.connect(panner);
      panner.connect(this.masterGain);
      
      nodes.spatialPanner = panner;
    } else {
      // Standard stereo routing
      nodes.leftGain.connect(this.masterGain);
      nodes.rightGain.connect(this.masterGain);
    }

    // Connect oscillators to gains
    nodes.leftOsc.connect(nodes.leftGain);
    nodes.rightOsc.connect(nodes.rightGain);

    return nodes;
  }

  private buildDBSSNodes(
    phase: Phase,
    leftCarrier: number,
    rightCarrier: number,
    beatFreq: number,
    modulationFreq: number,
    modulationDepth: number
  ): ModulatableNodes {
    if (!this.ctx) throw new Error('AudioContext not initialized');

    const nodes = this.buildEntrainmentNodes(phase, leftCarrier, rightCarrier, beatFreq);
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const depth = Math.max(0, Math.min(1, modulationDepth));

    modOsc.frequency.value = modulationFreq;
    modOsc.type = 'sine';
    modGain.gain.value = depth;
    modOsc.connect(modGain);
    modGain.connect(nodes.leftGain.gain);
    modGain.connect(nodes.rightGain.gain);
    modOsc.start();

    nodes.dbssModOsc = modOsc;
    nodes.dbssModGain = modGain;
    return nodes;
  }

  // UPGRADE 16: Dynamic progression curves
  private applyProgressionCurve(
    start: number,
    end: number,
    progress: number,
    curve: ProgressionCurve = 'linear',
    variability: number = 0
  ): number {
    let normalized = progress;
    
    switch (curve) {
      case 'exponential':
        normalized = Math.pow(progress, 2);
        break;
      case 'logarithmic':
        normalized = Math.log(1 + progress * (Math.E - 1)) / Math.log(Math.E);
        break;
      case 'sigmoid':
        normalized = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
        break;
      case 'chaotic':
        const chaos = (Math.random() - 0.5) * variability;
        normalized = Math.max(0, Math.min(1, progress + chaos));
        break;
      case 'linear':
      default:
        normalized = progress;
    }
    
    return start + (end - start) * normalized;
  }

  // UPGRADE 17: Real-time phase modulation with all features
  // Time constant for smooth parameter transitions (50ms avoids clicks on Android)
  private static readonly PARAM_RAMP_TC = 0.05;

  private modulatePhase(): void {
    if (!this.ctx || !this.modulatableNodes || !this.activeProtocol || this.isPaused) return;

    const phase = this.activeProtocol.phases[this.phaseIndex];
    const elapsed = this.ctx.currentTime - this.phaseStartTime;
    const progress = Math.min(elapsed / phase.duration, 1.0);

    const nodes = this.modulatableNodes;
    const now = this.ctx.currentTime;
    const tc = AudioEngine.PARAM_RAMP_TC;

    // Carrier frequency sweep with progression curve
    if (phase.carrierEnd !== undefined && phase.carrierEnd !== phase.carrier) {
      const carrier = this.applyProgressionCurve(
        phase.carrier,
        phase.carrierEnd,
        progress,
        phase.progressionCurve,
        phase.progressionVariability
      );

      const validatedCarrier = this.validateCarrierFrequency(carrier);
      const beatFreq = nodes.beatFreq;

      nodes.leftFreq = validatedCarrier;
      nodes.rightFreq = validatedCarrier + beatFreq;

      nodes.leftOsc.frequency.setTargetAtTime(nodes.leftFreq, now, tc);
      nodes.rightOsc.frequency.setTargetAtTime(nodes.rightFreq, now, tc);
    }

    // Beat frequency sweep with progression curve
    if (phase.beatEnd !== undefined && phase.beatEnd !== phase.beat) {
      const beat = this.applyProgressionCurve(
        phase.beat,
        phase.beatEnd,
        progress,
        phase.progressionCurve,
        phase.progressionVariability
      );

      const validatedBeat = this.validateBeatFrequency(beat, 'Phase modulation');

      nodes.beatFreq = validatedBeat;
      nodes.rightFreq = nodes.leftFreq + validatedBeat;

      nodes.rightOsc.frequency.setTargetAtTime(nodes.rightFreq, now, tc);

      // Update isochronic/monaural LFOs if present
      if (nodes.isochronicOsc) {
        nodes.isochronicOsc.frequency.setTargetAtTime(validatedBeat, now, tc);
      }
      if (nodes.monauralOsc) {
        nodes.monauralOsc.frequency.setTargetAtTime(validatedBeat, now, tc);
      }
    }

    // FIX #7 + #8: Smoothed stochastic jitter at throttled 3Hz rate
    if (this.jitterConfig?.enabled) {
      const perfNow = performance.now();
      if (this.scheduler.shouldUpdate('stochastic', perfNow)) {
        const deltaTime = this.lastFrameTime > 0 ? (perfNow - this.lastFrameTime) / 1000 : 0.016;
        this.currentJitter = applySmoothedJitter(this.currentJitter, this.jitterConfig, deltaTime);
        // Use setTargetAtTime instead of direct .value assignment to avoid clicks
        nodes.leftOsc.frequency.setTargetAtTime(nodes.leftFreq + this.currentJitter, now, tc);
        nodes.rightOsc.frequency.setTargetAtTime(nodes.rightFreq + this.currentJitter, now, tc);
      }
      this.lastFrameTime = performance.now();
    }

    // FIX #9: Update spatial engine for random mode only (deterministic modes are pre-scheduled)
    if (this.spatialEngine && this.ctx) {
      const perfNowSpatial = performance.now();
      if (this.spatialEngine.needsAnimationFrame && this.scheduler.shouldUpdate('spatial', perfNowSpatial)) {
        this.spatialEngine.update(this.ctx);
      }
      // Refill the 5-second pre-schedule window every 4 seconds for deterministic modes
      if (this.scheduler.shouldUpdate('spatial_extend', perfNowSpatial)) {
        this.spatialEngine.extendSchedule(this.ctx);
      }
    }

    // Continue modulation loop
    if (progress < 1.0) {
      this.animationFrameId = requestAnimationFrame(() => this.modulatePhase());
    }
  }

  // UPGRADE 19: Hemisphere-specific targeting (FAA, creativity, glymphatic)
  // FIXED: Now validates derived beat frequency for safety
  private applyHemisphereTargeting(phase: Phase): { left: number; right: number; beat: number } {
    if (!phase.splitHemisphere) {
      const carrier = this.validateCarrierFrequency(phase.carrier);
      const beat = this.validateBeatFrequency(phase.beat, 'Hemisphere targeting');
      return {
        left: carrier,
        right: carrier + beat,
        beat: beat
      };
    }

    const { leftFreq, rightFreq, purpose } = phase.splitHemisphere;
    
    
    // Validate individual carriers
    const validLeft = this.validateCarrierFrequency(leftFreq);
    const validRight = this.validateCarrierFrequency(rightFreq);
    
    // CRITICAL FIX: Validate the beat frequency derived from hemisphere split
    const derivedBeat = Math.abs(validRight - validLeft);
    const validatedBeat = this.validateBeatFrequency(derivedBeat, `Hemisphere targeting (${purpose})`);
    
    // If beat was clamped, adjust the right frequency to maintain the validated beat
    if (validatedBeat !== derivedBeat) {
      console.warn(`Hemisphere beat clamped: ${derivedBeat}Hz -> ${validatedBeat}Hz for ${purpose}`);
      const adjustedRight = validLeft + validatedBeat;
      return {
        left: validLeft,
        right: adjustedRight,
        beat: validatedBeat
      };
    }
    
    return {
      left: validLeft,
      right: validRight,
      beat: derivedBeat
    };
  }

  // UPGRADE 20: DBSS dual-frequency targeting with AM modulation
  private applyDBSSTargeting(phase: Phase): { 
    primary: number; 
    secondary: number;
    amDepth: number;
  } | null {
    if (!phase.dbssFrequency) return null;

    const { primary, secondary, targetRegion, modulationDepth = 0.3 } = phase.dbssFrequency;
    
    
    // Validate both frequencies
    const validPrimary = this.validateBeatFrequency(primary, `DBSS primary (${targetRegion})`);
    const validSecondary = this.validateBeatFrequency(secondary, `DBSS secondary (${targetRegion})`);
    
    return { 
      primary: validPrimary, 
      secondary: validSecondary,
      amDepth: modulationDepth 
    };
  }

  // Maps a SpatialMotion mode string to a SpatialMotionConfig.
  // Rate and depth are tuned to match the old animateSpatialMotion behaviour.
  private static spatialConfigFor(motion: SpatialMotion): SpatialMotionConfig {
    switch (motion) {
      case 'rotate':    return { mode: 'rotate',    rate: 0.1,  depth: 1.0 };
      case 'pendulum':  return { mode: 'pendulum',  rate: 0.16, depth: 0.8 };
      case 'breathe':   return { mode: 'breathe',   rate: 0.16, depth: 0.3 };
      case 'lissajous': return { mode: 'lissajous', rate: 1.0,  depth: 1.0 };
      case 'random':    return { mode: 'random',    rate: 1.0,  depth: 0.7, randomProbability: 0.01 };
      default:          return { mode: 'fixed',     rate: 0,    depth: 0 };
    }
  }

  // Main protocol start method
  async startProtocol(protocol: Protocol): Promise<void> {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.stopProtocol();
    
    this.activeProtocol = protocol;
    this.phaseIndex = 0;
    this.phaseStartTime = this.ctx.currentTime;
    this.isPaused = false;

    // FIX #10: Reset QA metrics for new session
    this.qaEngine?.reset();

    await this.startPhase(0);
  }

  private async startPhase(index: number): Promise<void> {
    if (!this.ctx || !this.activeProtocol || !this.masterGain) return;
    if (index >= this.activeProtocol.phases.length) {
      this.onProtocolComplete();
      return;
    }

    const phase = this.activeProtocol.phases[index];
    this.phaseIndex = index;
    this.phaseStartTime = this.ctx.currentTime;

    // Reset once-per-phase log flags
    this._carrierClampLogged = false;
    this._beatClampLogged = false;

    // Stop previous phase
    this.stopCurrentPhase();

    // Build carrier frequencies with hemisphere/DBSS targeting
    let leftCarrier: number;
    let rightCarrier: number;
    
    const dbss = this.applyDBSSTargeting(phase);
    if (dbss) {
      // DBSS mode: dual-frequency with AM modulation
      leftCarrier = this.validateCarrierFrequency(phase.carrier);
      rightCarrier = leftCarrier; // Same carrier base

      // Use primary as beat frequency, secondary as modulation frequency
      const beatFreq = dbss.primary;
      const modFreq = dbss.secondary;
      const modDepth = dbss.amDepth;

      this.modulatableNodes = this.buildDBSSNodes(
        phase,
        leftCarrier,
        rightCarrier,
        beatFreq,
        modFreq,
        modDepth
      );
    } else {
      // Standard / hemisphere-targeted mode
      const hemi = this.applyHemisphereTargeting(phase);
      leftCarrier = hemi.left;
      rightCarrier = hemi.right;

      // Use the validated beat from hemisphere targeting
      const beatFreq = hemi.beat;

      this.modulatableNodes = this.buildEntrainmentNodes(
        phase,
        leftCarrier,
        rightCarrier,
        beatFreq
      );
    }

    const nodes = this.modulatableNodes;
    if (!nodes) return;

    // Fade in gains to avoid start-of-phase click
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const targetL = nodes.leftGain.gain.value;
      const targetR = nodes.rightGain.gain.value;
      nodes.leftGain.gain.setValueAtTime(0, now);
      nodes.rightGain.gain.setValueAtTime(0, now);
      nodes.leftGain.gain.setTargetAtTime(targetL, now, 0.01);
      nodes.rightGain.gain.setTargetAtTime(targetR, now, 0.01);
    }

    // Start oscillators
    nodes.leftOsc.start();
    nodes.rightOsc.start();

    // Start spatial motion engine (pre-schedules deterministic modes; rAF only for random)
    if (phase.spatialMotion && phase.spatialMotion !== 'fixed' && nodes.spatialPanner && this.ctx) {
      this.spatialEngine = new SpatialMotionEngine(AudioEngine.spatialConfigFor(phase.spatialMotion));
      this.spatialEngine.start(this.ctx, nodes.spatialPanner);
    }

    // Setup optional noise
    if (phase.noise) {
      await this.startNoise(phase.noise, phase.noiseMix ?? 0.2);
    }

    // Setup visualizer analysers (OPTIMIZED: Single FFT with channel routing)
    if (this.ctx && this.modulatableNodes) {
        // Create merger to combine all channels into one stream
        this.visualizerMerger = this.ctx.createChannelMerger(3);

        // Route channels: L→0, R→1, Aux→2
        this.modulatableNodes.leftGain.connect(this.visualizerMerger, 0, 0);
        this.modulatableNodes.rightGain.connect(this.visualizerMerger, 0, 1);
        if (this.noiseGain) {
            this.noiseGain.connect(this.visualizerMerger, 0, 2);
        }

        // Single analyser for all channels (75% FFT reduction!)
        const masterAnalyser = this.ctx.createAnalyser();
        masterAnalyser.fftSize = 4096;  // High resolution (was 2048)
        masterAnalyser.smoothingTimeConstant = 0.8;

        // Split after analysis for backward compatibility
        this.channelSplitter = this.ctx.createChannelSplitter(3);
        this.visualizerMerger.connect(masterAnalyser);
        masterAnalyser.connect(this.channelSplitter);

        // Create dummy analysers for backward compatibility (no FFT overhead)
        this.analyserL = this.ctx.createAnalyser();
        this.analyserR = this.ctx.createAnalyser();
        this.analyserAux = this.ctx.createAnalyser();

        // Note: These analysers are connected to splitter outputs
        // but we'll read from masterAnalyser directly in visualizer
        this.channelSplitter.connect(this.analyserL, 0);
        this.channelSplitter.connect(this.analyserR, 1);
        this.channelSplitter.connect(this.analyserAux, 2);
    }

    // FIX #7: Calculate auto-jitter config for this phase
    this.jitterConfig = calculateAutoJitter(
      phase.duration,
      phase.beat ?? 10,
      phase.stochastic === false ? true : undefined,
      typeof phase.stochastic === 'object' ? phase.stochastic.deviation : undefined
    );
    this.currentJitter = 0;
    this.lastFrameTime = 0;

    // FIX #8: Reset throttled scheduler timers
    this.scheduler.reset();

    // Kick off modulation loop
    this.animationFrameId = requestAnimationFrame(() => this.modulatePhase());

    if (this.onTick && this.ctx) {
        this.onTick(this.ctx.currentTime - this.phaseStartTime, 0, this.phaseIndex);
    }

    // Schedule phase transition
    this.schedulePhaseTransition(phase.duration);
  }

  private schedulePhaseTransition(initialDelaySeconds: number): void {
    if (!this.ctx || !this.activeProtocol) return;
    this.clearPhaseTransitionTimer();

    const totalPhases = this.activeProtocol.phases.length;
    const currentIndex = this.phaseIndex;

    const arm = (delaySeconds: number): void => {
      this.phaseTransitionTimer = setTimeout(async () => {
        this.phaseTransitionTimer = null;
        if (!this.ctx || !this.activeProtocol || this.isPaused || this.phaseIndex !== currentIndex) return;

        // The wall-clock timer drifts and is throttled in background tabs,
        // and it keeps counting while the context is suspended. The
        // AudioContext clock is authoritative for phase dosing — if the
        // phase hasn't actually elapsed yet, re-arm for the remainder.
        const phase = this.activeProtocol.phases[currentIndex];
        const remaining = this.phaseStartTime + phase.duration - this.ctx.currentTime;
        if (remaining > 0.05) {
          arm(remaining);
          return;
        }

        const nextIndex = currentIndex + 1;
        if (nextIndex < totalPhases) {
          await this.startPhase(nextIndex);
        } else {
          this.onProtocolComplete();
        }
      }, Math.max(0, delaySeconds * 1000));
    };

    arm(initialDelaySeconds);
  }

  private clearPhaseTransitionTimer(): void {
    if (this.phaseTransitionTimer !== null) {
      clearTimeout(this.phaseTransitionTimer);
      this.phaseTransitionTimer = null;
    }
  }

  // Fade-out duration for phase transitions to avoid clicks/pops
  private static readonly PHASE_FADE_MS = 30;

  private stopCurrentPhase(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect visualizer analysers to prevent leaked nodes (OPTIMIZED)
    try {
      if (this.channelSplitter) { this.channelSplitter.disconnect(); this.channelSplitter = null; }
      if (this.visualizerMerger) { this.visualizerMerger.disconnect(); this.visualizerMerger = null; }
      if (this.analyserL) { this.analyserL.disconnect(); this.analyserL = null; }
      if (this.analyserR) { this.analyserR.disconnect(); this.analyserR = null; }
      if (this.analyserAux) { this.analyserAux.disconnect(); this.analyserAux = null; }
    } catch {
      // Already disconnected
    }

    const fadeTime = AudioEngine.PHASE_FADE_MS / 1000;

    // Ramp gains to zero before stopping oscillators to prevent pops
    if (this.modulatableNodes && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.modulatableNodes.leftGain.gain.setTargetAtTime(0, now, fadeTime / 3);
        this.modulatableNodes.rightGain.gain.setTargetAtTime(0, now, fadeTime / 3);
      } catch {
        // Nodes may already be disconnected
      }
    }

    if (this.noiseGain && this.ctx) {
      try {
        this.noiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime / 3);
      } catch {
        // Already disconnected
      }
    }

    // Schedule the actual stop after the fade-out completes
    const nodesToStop = this.modulatableNodes;
    const noiseToStop = this.noiseNode;
    const spatialToStop = this.spatialEngine;

    setTimeout(() => {
      if (nodesToStop) {
        try { nodesToStop.leftOsc.stop(); } catch { /* already stopped */ }
        try { nodesToStop.rightOsc.stop(); } catch { /* already stopped */ }
        // DBSS FIX: Stop and cleanup AM modulation nodes
        try { nodesToStop.dbssModOsc?.stop(); } catch { /* already stopped */ }
        try { nodesToStop.dbssModOsc?.disconnect(); } catch { /* already disconnected */ }
        try { nodesToStop.dbssModGain?.disconnect(); } catch { /* already disconnected */ }
        nodesToStop.dbssModOsc = undefined;
        nodesToStop.dbssModGain = undefined;
      }
      if (noiseToStop) {
        try { noiseToStop.stop(); } catch { /* already stopped */ }
      }
      if (spatialToStop) {
        spatialToStop.stop();
      }
    }, AudioEngine.PHASE_FADE_MS);

    this.modulatableNodes = null;
    this.noiseNode = null;
    this.noiseGain = null;
    this.spatialEngine = null;
  }

  // FIX #1: Spectrally accurate noise — uses pre-computed pink/brown buffers
  private async startNoise(type: NoiseType, level: number): Promise<void> {
    if (!this.ctx || !this.masterGain || !this.noiseBuffers) return;

    const noiseType = (type as 'white' | 'pink' | 'brown') || 'pink';
    const result = startNoiseFromBuffers(
      this.ctx, this.masterGain, this.noiseBuffers, noiseType, level
    );
    this.noiseNode = result.source;
    this.noiseGain = result.gain;
  }

  private onProtocolComplete(): void {
    this.stopCurrentPhase();
    this.activeProtocol = null;
    this.phaseIndex = 0;
    this.phaseStartTime = 0;
    this.isPaused = false;
    this.onComplete?.();
  }

  // Public control API

  setBalance(balance: number): void {
    if (!this.ctx || !this.modulatableNodes || !this.masterGain) return;
    const left = Math.min(1, 1 - balance);
    const right = Math.min(1, 1 + balance);
    const now = this.ctx.currentTime;
    this.modulatableNodes.leftGain.gain.setTargetAtTime(
      (this.activeProtocol?.phases[this.phaseIndex]?.volL ?? 0.7) * left, now, 0.02
    );
    this.modulatableNodes.rightGain.gain.setTargetAtTime(
      (this.activeProtocol?.phases[this.phaseIndex]?.volR ?? 0.7) * right, now, 0.02
    );
  }

  updateManualOverrides(pitch: number, beat: number, noise: number, overlay: number): void {
    if (!this.modulatableNodes || !this.ctx) return;

    // Pitch shift in cents: f * 2^(cents/1200)
    const factor = Math.pow(2, pitch / 1200);
    const now = this.ctx.currentTime;
    this.modulatableNodes.leftOsc.frequency.setTargetAtTime(this.modulatableNodes.leftFreq * factor, now, 0.02);
    this.modulatableNodes.rightOsc.frequency.setTargetAtTime(this.modulatableNodes.rightFreq * factor, now, 0.02);

    if (this.noiseGain) {
        this.noiseGain.gain.setTargetAtTime(noise * 0.2, now, 0.1);
    }
  }

  getPlaybackState() {
      return {
          totalElapsed: this.ctx ? this.ctx.currentTime - (this.phaseStartTime || 0) : 0, // Simplified
          phaseElapsed: this.ctx ? this.ctx.currentTime - this.phaseStartTime : 0,
          currentPhaseIndex: this.phaseIndex,
          isPlaying: this.isPlaying,
          isPaused: this.isPaused
      };
  }

  updateBiofeedback(metrics: BiofeedbackMetrics): void {
    this.biofeedbackMetrics = metrics;
    this.adaptiveMode = metrics.active || false;

    if (this.adaptiveMode && this.modulatableNodes && this.ctx) {
      const hrv = metrics.hrv || 75;
      const coherence = metrics.coherence || 0.8;

      let freqReduction = 0;
      if (hrv < 50) {
        freqReduction = (50 - hrv) * 0.5;
      }

      // Apply modulation based on base frequency to avoid drift
      this.modulatableNodes.leftFreq = this.modulatableNodes.baseLeftFreq - freqReduction;
      this.modulatableNodes.rightFreq = this.modulatableNodes.baseRightFreq - freqReduction;

      this.modulatableNodes.leftOsc.frequency.setTargetAtTime(this.modulatableNodes.leftFreq, this.ctx.currentTime, 0.1);
      this.modulatableNodes.rightOsc.frequency.setTargetAtTime(this.modulatableNodes.rightFreq, this.ctx.currentTime, 0.1);

      if (this.noiseGain) {
        const noiseLevel = coherence < 0.5 ? 0.4 : (hrv < 50 ? 0.3 : 0.1);
        this.noiseGain.gain.setTargetAtTime(noiseLevel, this.ctx.currentTime, 0.2);
      }
    } else if (!this.adaptiveMode && this.modulatableNodes && this.ctx) {
        // Reset to base if adaptive mode turned off
        this.modulatableNodes.leftFreq = this.modulatableNodes.baseLeftFreq;
        this.modulatableNodes.rightFreq = this.modulatableNodes.baseRightFreq;
        this.modulatableNodes.leftOsc.frequency.setTargetAtTime(this.modulatableNodes.leftFreq, this.ctx.currentTime, 0.1);
        this.modulatableNodes.rightOsc.frequency.setTargetAtTime(this.modulatableNodes.rightFreq, this.ctx.currentTime, 0.1);
    }
  }

  pause(): void {
    if (!this.ctx || this.isPaused || !this.activeProtocol) return;
    this.pausedAt = this.ctx.currentTime - this.phaseStartTime;
    this.isPaused = true;
    // The wall-clock timer keeps counting while the context is suspended —
    // it must not fire (or be left dead) across a pause.
    this.clearPhaseTransitionTimer();
    if (this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  async resume(): Promise<void> {
    if (!this.ctx || !this.isPaused || !this.activeProtocol) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.phaseStartTime = this.ctx.currentTime - this.pausedAt;
    this.isPaused = false;
    // Re-arm the phase transition for the un-elapsed remainder of this phase.
    const phase = this.activeProtocol.phases[this.phaseIndex];
    if (phase) {
      this.schedulePhaseTransition(Math.max(0, phase.duration - this.pausedAt));
    }
    this.animationFrameId = requestAnimationFrame(() => this.modulatePhase());
  }

    async unlock(): Promise<void> {
    if (!this.ctx) {
      console.warn('[AudioEngine] Context not initialized');
      return;
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.error('[AudioEngine] Failed to unlock:', err);
      }
    }

    // iOS safari may create context in 'interrupted' state — force resume
    if ((this.ctx.state as string) === 'interrupted') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.error('[AudioEngine] Failed to resume from interrupted:', err);
      }
    }
  }

    // Public API alias for startProtocol
  async playProtocol(protocol: Protocol): Promise<void> {
    return this.startProtocol(protocol);
  }

  stopProtocol(): void {
    if (!this.ctx) return;
    // Kill any pending phase transition — a stale timer from a previous
    // protocol could otherwise advance a newly started protocol early.
    this.clearPhaseTransitionTimer();
    this.stopCurrentPhase();
    this.activeProtocol = null;
    this.phaseIndex = 0;
    this.phaseStartTime = 0;
    this.pausedAt = 0;
    this.isPaused = false;
  }

  stopImmediate(): void {
    this.stopProtocol();
  }

  // Safety constraint: master output never exceeds 0.7 amplitude.
  // Per-phase levels are shaped below this ceiling; the limiter is a
  // backstop, not the primary control.
  private static readonly MASTER_GAIN_CEILING = 0.7;

  setVolume(volume: number): void {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(AudioEngine.MASTER_GAIN_CEILING, volume));
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
  }

  setOnProgressCallback(cb: (progress: number) => void): void {
    this.onProgressCallback = cb;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  async renderOffline(protocol: Protocol, config: ExportConfig): Promise<{ buffer: AudioBuffer; metrics: QAMetrics }> {
    if (!protocol.phases || protocol.phases.length === 0) {
      throw new Error(`Protocol "${protocol.title}" has no phases — nothing to render.`);
    }
    if (!protocol.duration || protocol.duration <= 0) {
      throw new Error(`Protocol "${protocol.title}" has zero duration — nothing to render.`);
    }
    const sampleRate = config.sampleRate;
    const numSamples = Math.ceil(protocol.duration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, numSamples, sampleRate);

    // Master gain + limiter chain
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 0.85;
    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.value = LIMITER_THRESHOLD;
    limiter.knee.value = LIMITER_KNEE;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;
    masterGain.connect(limiter);
    limiter.connect(offlineCtx.destination);

    let startTime = 0;
    for (const phase of protocol.phases) {
      const phaseDur = phase.duration;
      const carrier  = Math.max(OSTER_CARRIER_MIN, Math.min(OSTER_CARRIER_MAX, phase.carrier));
      const beat     = Math.max(BEAT_FREQUENCY_MIN, Math.min(BEAT_FREQUENCY_SAFE_MAX, phase.beat));
      const vol      = Math.min(MAX_AMPLITUDE, phase.vol ?? 0.7);
      const volL     = Math.min(MAX_AMPLITUDE, phase.volL ?? vol);
      const volR     = Math.min(MAX_AMPLITUDE, phase.volR ?? vol);

      // Carrier sweep support
      const carrierEnd = phase.carrierEnd ?? carrier;
      const beatEnd    = phase.beatEnd    ?? beat;

      // Channel merger for stereo placement
      const merger = offlineCtx.createChannelMerger(2);
      merger.connect(masterGain);

      // Left ear
      const leftOsc  = offlineCtx.createOscillator();
      const leftGain = offlineCtx.createGain();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrier, startTime);
      leftOsc.frequency.linearRampToValueAtTime(carrierEnd, startTime + phaseDur);
      leftGain.gain.value = volL;
      leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0);

      // Right ear (carrier + beat for binaural)
      const rightOsc  = offlineCtx.createOscillator();
      const rightGain = offlineCtx.createGain();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(carrier + beat, startTime);
      rightOsc.frequency.linearRampToValueAtTime(carrierEnd + beatEnd, startTime + phaseDur);
      rightGain.gain.value = volR;
      rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1);

      // Harmonic overlays
      if (phase.harmonicOverlay) {
        for (const h of phase.harmonicOverlay) {
          const hOsc  = offlineCtx.createOscillator();
          const hGain = offlineCtx.createGain();
          hOsc.type = h.type;
          hOsc.frequency.value = h.frequency;
          hGain.gain.value = h.amplitude * 0.3;
          hOsc.connect(hGain);
          hGain.connect(masterGain);
          hOsc.start(startTime);
          hOsc.stop(startTime + phaseDur);
        }
      }

      // Schedule phase
      leftOsc.start(startTime);  leftOsc.stop(startTime + phaseDur);
      rightOsc.start(startTime); rightOsc.stop(startTime + phaseDur);

      // Phase fade-in / fade-out envelope (4ms ramps to remove clicks)
      leftGain.gain.setValueAtTime(0, startTime);
      leftGain.gain.linearRampToValueAtTime(volL, startTime + 0.004);
      leftGain.gain.setValueAtTime(volL, startTime + phaseDur - 0.004);
      leftGain.gain.linearRampToValueAtTime(0, startTime + phaseDur);
      rightGain.gain.setValueAtTime(0, startTime);
      rightGain.gain.linearRampToValueAtTime(volR, startTime + 0.004);
      rightGain.gain.setValueAtTime(volR, startTime + phaseDur - 0.004);
      rightGain.gain.linearRampToValueAtTime(0, startTime + phaseDur);

      startTime += phaseDur;
    }

    // Add timeout wrapper to prevent indefinite hangs on long renders
    const RENDER_TIMEOUT_MS = 120000; // 2 minutes max render time
    const rendered = await Promise.race([
      offlineCtx.startRendering(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(
          `Render timeout after ${RENDER_TIMEOUT_MS/1000}s. Protocol may be too long (${Math.round(protocol.duration/60)}min). Try reducing sample rate or splitting into shorter sessions.`
        )), RENDER_TIMEOUT_MS)
      )
    ]).catch(err => {
      console.error('[AudioEngine] Offline rendering failed:', err);
      throw new Error(`Export failed: ${err.message}. For long protocols (>${Math.round(protocol.duration/60)}min), try 44.1kHz sample rate or shorter durations.`);
    }) as AudioBuffer;

    // Optional normalisation to -1.0 dBTP (≈ 0.891 linear)
    if (config.normalize) {
      let peak = 0;
      for (let ch = 0; ch < rendered.numberOfChannels; ch++) {
        const data = rendered.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          const abs = Math.abs(data[i]);
          if (abs > peak) peak = abs;
        }
      }
      if (peak > 0) {
        const scale = 0.891 / peak;
        for (let ch = 0; ch < rendered.numberOfChannels; ch++) {
          const data = rendered.getChannelData(ch);
          for (let i = 0; i < data.length; i++) data[i] *= scale;
        }
      }
    }

    // Estimate LUFS from RMS of rendered buffer
    const ch0 = rendered.getChannelData(0);
    const ch1 = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : ch0;
    let sumSq = 0;
    for (let i = 0; i < ch0.length; i++) sumSq += ch0[i] ** 2 + ch1[i] ** 2;
    const rms = Math.sqrt(sumSq / (2 * ch0.length));
    const lufs = rms > 0 ? 20 * Math.log10(rms) : -100;
    let peakLinear = config.normalize ? 0.891 : 0;
    if (!config.normalize) {
      for (let i = 0; i < ch0.length; i++) {
        const a = Math.abs(ch0[i]); if (a > peakLinear) peakLinear = a;
      }
    }
    const peakDb = peakLinear > 0 ? 20 * Math.log10(peakLinear) : -100;

    const metrics: QAMetrics = {
      clippingDetected: peakLinear >= 1.0,
      peakAmplitude:    peakLinear,
      peakLevel:        peakLinear,
      rmsLevel:         rms,
      dynamicRange:     peakDb - (lufs - 3),
      thd:              0.001,
      snr:              90,
      lufs,
      peak:             peakDb,
    };

    return { buffer: rendered, metrics };
  }

  encodeWAV(buffer: AudioBuffer, config: ExportConfig, _metadata: Record<string, string>): Blob {
    const numCh      = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numFrames  = buffer.length;
    const bitDepth   = config.bitDepth ?? 24;
    const isFloat    = bitDepth === 32;
    const bytesPerSample = isFloat ? 4 : bitDepth === 24 ? 3 : 2;
    const dataSize   = numFrames * numCh * bytesPerSample;
    const buf        = new ArrayBuffer(44 + dataSize);
    const view       = new DataView(buf);

    const ws = (off: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };

    // RIFF header
    ws(0,  'RIFF');
    view.setUint32(4,  36 + dataSize, true);
    ws(8,  'WAVE');
    ws(12, 'fmt ');
    view.setUint32(16, 16, true);                                    // chunk size
    view.setUint16(20, isFloat ? 3 : 1, true);                      // PCM=1, Float=3
    view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numCh * bytesPerSample, true);   // byte rate
    view.setUint16(32, numCh * bytesPerSample, true);                // block align
    view.setUint16(34, bitDepth, true);
    ws(36, 'data');
    view.setUint32(40, dataSize, true);

    // Pull channel arrays
    const channels: Float32Array[] = [];
    for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

    // TPDF dither scale (LSB of target bit depth)
    const maxInt    = isFloat ? 1 : bitDepth === 24 ? 0x7FFFFF : 0x7FFF;
    const ditherAmp = config.dither && !isFloat ? 1 / maxInt : 0;

    let off = 44;
    for (let i = 0; i < numFrames; i++) {
      for (let c = 0; c < numCh; c++) {
        const dither = ditherAmp * (Math.random() - Math.random());
        const s = Math.max(-1, Math.min(1, channels[c][i] + dither));

        if (isFloat) {
          view.setFloat32(off, s, true);
          off += 4;
        } else if (bitDepth === 24) {
          const v = Math.round(s * 0x7FFFFF);
          view.setUint8(off,     v & 0xFF);
          view.setUint8(off + 1, (v >> 8)  & 0xFF);
          view.setUint8(off + 2, (v >> 16) & 0xFF);
          off += 3;
        } else {
          view.setInt16(off, Math.round(s * 0x7FFF), true);
          off += 2;
        }
      }
    }

    return new Blob([buf], { type: 'audio/wav' });
  }

  // FIX #10: Real QA metrics replacing placeholders
  getQAMetrics(): QAMetrics | null {
    if (!this.qaEngine || !this.analyser) return null;

    const real = this.qaEngine.measure();

    // Map to existing QAMetrics interface for backward compatibility
    return {
      clippingDetected: real.clipping,
      peakAmplitude: real.peakLevel,
      peakLevel: real.peakLevel,
      rmsLevel: real.rmsLevel,
      dynamicRange: real.dynamicRange,
      thd: real.thd,
      snr: real.snr,
      noiseFloor: real.dcOffset,
      clippingEvents: real.clipCount,
      lufs: real.shortTermLUFS,
      peak: real.peakLevel > 0 ? 20 * Math.log10(real.peakLevel) : -100,
    };
  }

  // ============ Error Handling ============

  private handleError(error: Error, context: string): void {
    const fullError = new Error(`AudioEngine [${context}]: ${error.message}`);
    console.error(fullError);
    if (this.onError) {
      this.onError(fullError);
    }
  }

  // Dispose and clean up resources
  dispose(): void {
    try {
      this.stopProtocol();
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.ctx && this.ctx.state !== 'closed') {
        this.ctx.close();
      }
      this.ctx = null;
      this.masterGain = null;
      this.limiter = null;
      this.analyser = null;
      this.onTick = undefined;
      this.onComplete = undefined;
      this.onError = undefined;
    } catch (error) {
      console.error('Error during AudioEngine disposal:', error);
    }
  }

  // Alias for setVolume for compatibility
  setMasterGain(gain: number): void {
    this.setVolume(gain);
  }

  // ============================================================================
  // WAVEFORM CYMATICS: Accurate waveform capture for true frequency visualization
  // ============================================================================

  /**
   * Enable/disable waveform capture for cymatics visualization
   * When enabled, the AudioEngine captures the actual audio waveform
   * being generated for accurate cymatics visualization
   */
  public enableWaveformCapture(enabled: boolean): void {
    this.waveformCaptureEnabled = enabled;
    
    if (enabled && this.ctx && this.masterGain) {
      // Create analyser for waveform capture if not exists
      if (!this.waveformAnalyser) {
        this.waveformAnalyser = this.ctx.createAnalyser();
        this.waveformAnalyser.fftSize = 2048;
        this.waveformAnalyser.smoothingTimeConstant = 0;
        // Connect master gain to waveform analyser
        this.masterGain.connect(this.waveformAnalyser);
      }
    }
  }

  /**
   * Get the current waveform data for cymatics visualization
   * Returns Float32Array of actual audio samples being played
   */
  public getWaveformData(): Float32Array {
    if (!this.waveformCaptureEnabled || !this.waveformAnalyser) {
      // Return synthesized waveform based on current frequencies
      return this.synthesizeWaveform();
    }
    
    // Get actual waveform from analyser
    const dataArray = new Float32Array(this.waveformAnalyser.frequencyBinCount);
    this.waveformAnalyser.getFloatTimeDomainData(dataArray);
    return dataArray;
  }

  /**
   * Synthesize expected waveform when analyser not available
   * This mathematically reconstructs the binaural beat waveform
   */
  private synthesizeWaveform(): Float32Array {
    if (!this.modulatableNodes) {
      // Return silence if no active nodes
      return new Float32Array(2048);
    }
    
    const sampleRate = this.ctx?.sampleRate || 48000;
    const beatFreq = this.modulatableNodes.beatFreq;
    const carrierFreq = this.modulatableNodes.leftFreq;
    const time = this.ctx?.currentTime || 0;
    
    for (let i = 0; i < this.waveformCapture.length; i++) {
      const t = time + (i / sampleRate);
      // Reconstruct the actual binaural beat waveform
      const left = Math.sin(2 * Math.PI * carrierFreq * t);
      const right = Math.sin(2 * Math.PI * (carrierFreq + beatFreq) * t);
      this.waveformCapture[i] = (left + right) * 0.5;
    }
    
    return this.waveformCapture;
  }

  /**
   * Get current audio frequencies for cymatics shader uniforms
   */
  public getCymaticsFrequencies(): { beatFreq: number; carrierFreq: number; sampleRate: number } {
    return {
      beatFreq: this.modulatableNodes?.beatFreq || 10.0,
      carrierFreq: this.modulatableNodes?.leftFreq || 200.0,
      sampleRate: this.ctx?.sampleRate || 48000
    };
  }

}

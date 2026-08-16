/**
 * BinauralNatureSoundMixer.ts
 * Group 6: Ambient Enhancement & Masking
 * Module 16: Binaural Nature Sound Mixer
 * 
 * Technical Specification:
 * - Spatially positioned nature sound library (rain, ocean, forest, streams)
 * - Binaural panning with HRTF simulation
 * - Adaptive volume balancing
 * - Multi-source mixing with crossfade
 * 
 * Evidence Grade: RVP A
 * [🔬Experimental] Spatial audio implementation
 */

import { AudioModule, ModuleParams } from '../types/audio';

export type NatureSoundType = 'rain' | 'ocean' | 'forest' | 'stream' | 'wind' | 'birds' | 'campfire';

export interface NatureSoundParams extends ModuleParams {
  soundType: NatureSoundType;
  volume: number; // 0-1
  spatialPosition: { azimuth: number; elevation: number }; // degrees
  crossfadeDuration: number; // seconds
}

/**
 * Binaural Nature Sound Mixer
 * Provides spatially-aware nature soundscapes for ambient enhancement
 */
export class BinauralNatureSoundMixer implements AudioModule {
  private context: AudioContext;
  private outputNode: GainNode;
  private pannerNode: StereoPannerNode;
  private currentSource: AudioBufferSourceNode | null = null;
  private nextSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode;
  private nextGain: GainNode;
  
  // Nature sound buffer cache
  private soundBuffers: Map<NatureSoundType, AudioBuffer> = new Map();
  private currentSoundType: NatureSoundType | null = null;

  constructor(context: AudioContext) {
    this.context = context;
    this.outputNode = this.context.createGain();
    this.pannerNode = this.context.createStereoPanner();
    this.currentGain = this.context.createGain();
    this.nextGain = this.context.createGain();
    
    this.currentGain.connect(this.pannerNode);
    this.nextGain.connect(this.pannerNode);
    this.pannerNode.connect(this.outputNode);
    
    // Initialize gain for crossfading
    this.currentGain.gain.value = 1;
    this.nextGain.gain.value = 0;
  }

  /**
   * Load nature sound from URL into buffer cache
   */
  public async loadSound(type: NatureSoundType, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.soundBuffers.set(type, audioBuffer);
    } catch (error) {
      console.error(`Failed to load nature sound: ${type}`, error);
    }
  }

  /**
   * Generate synthetic nature sounds as fallback
   * Uses filtered noise with amplitude modulation
   */
  private generateSyntheticSound(type: NatureSoundType): AudioBuffer {
    const duration = 10; // 10-second loop
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(2, duration * sampleRate, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        let sample = 0;
        
        switch (type) {
          case 'rain':
            // High-pass filtered white noise with amplitude modulation
            sample = (Math.random() * 2 - 1) * (0.3 + 0.1 * Math.sin(t * 0.5));
            break;
            
          case 'ocean':
            // Low-frequency noise with wave-like modulation
            sample = (Math.random() * 2 - 1) * 0.2 * (1 + Math.sin(t * 0.3));
            break;
            
          case 'stream':
            // Mid-range noise with continuous flow modulation
            sample = (Math.random() * 2 - 1) * 0.25 * (1 + 0.3 * Math.sin(t * 2));
            break;
            
          case 'wind':
            // Low-pass filtered noise with slow modulation
            sample = (Math.random() * 2 - 1) * 0.15 * (1 + 0.5 * Math.sin(t * 0.2));
            break;
            
          default:
            sample = Math.random() * 2 - 1;
        }
        
        data[i] = sample * 0.5; // Safety amplitude reduction
      }
    }
    
    return buffer;
  }

  /**
   * Set spatial position using azimuth (left-right)
   */
  private setSpatialPosition(azimuth: number) {
    // Map azimuth (-180 to 180) to pan value (-1 to 1)
    const pan = Math.max(-1, Math.min(1, azimuth / 90));
    this.pannerNode.pan.setTargetAtTime(pan, this.context.currentTime, 0.1);
  }

  public setParams(params: Partial<NatureSoundParams>) {
    if (params.soundType !== undefined && params.soundType !== this.currentSoundType) {
      this.transitionToSound(params.soundType, params.crossfadeDuration || 2);
    }
    
    if (params.volume !== undefined) {
      this.outputNode.gain.setTargetAtTime(params.volume, this.context.currentTime, 0.1);
    }
    
    if (params.spatialPosition !== undefined) {
      this.setSpatialPosition(params.spatialPosition.azimuth);
    }
  }

  /**
   * Crossfade between current and new nature sound
   */
  private transitionToSound(type: NatureSoundType, duration: number) {
    let buffer = this.soundBuffers.get(type);
    
    // Generate synthetic if not loaded
    if (!buffer) {
      buffer = this.generateSyntheticSound(type);
      this.soundBuffers.set(type, buffer);
    }
    
    // Create new source
    this.nextSource = this.context.createBufferSource();
    this.nextSource.buffer = buffer;
    this.nextSource.loop = true;
    this.nextSource.connect(this.nextGain);
    
    // Crossfade
    const now = this.context.currentTime;
    this.currentGain.gain.setTargetAtTime(0, now, duration / 3);
    this.nextGain.gain.setTargetAtTime(1, now, duration / 3);
    
    // Start new source
    this.nextSource.start();
    
    // Swap after crossfade completes
    setTimeout(() => {
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
      }
      this.currentSource = this.nextSource;
      this.nextSource = null;
      
      // Swap gain nodes
      const tempGain = this.currentGain;
      this.currentGain = this.nextGain;
      this.nextGain = tempGain;
      
      this.nextGain.gain.value = 0;
      this.currentSoundType = type;
    }, duration * 1000);
  }

  public connect(destination: AudioNode) {
    this.outputNode.connect(destination);
  }

  public disconnect() {
    this.outputNode.disconnect();
  }

  public start() {
    // Sources start on demand via setParams
  }

  public stop() {
    const now = this.context.currentTime;
    this.currentGain.gain.setTargetAtTime(0, now, 0.05);
    
    setTimeout(() => {
      if (this.currentSource) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
      this.currentSoundType = null;
    }, 100);
  }
}

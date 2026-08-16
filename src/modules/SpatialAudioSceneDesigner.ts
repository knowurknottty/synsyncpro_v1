/**
 * @module SpatialAudioSceneDesigner
 * @group Spatial Audio & Immersion (Group 5)
 * @evidenceGrade ⚠️Speculative
 * @description Creates 3D soundscapes with multiple moving audio sources using Web Audio
 * PannerNode. Engages spatial attention networks while delivering entrainment. Supports up to
 * 8 simultaneous sources with complex motion patterns.
 * 
 *
 * SAFETY WARNINGS:
 * - Spatial complexity may distract from entrainment rather than enhance it
 * - Start with simple scenes (1-2 sources) before adding complexity
 * - Motion sensitivity: Users may experience disorientation
 * - User controls: Enable/disable sources, adjust speeds, select presets
 * - SPL limits: Combined SPL of all sources <85 dB
 * 
 *
 * EXPERIMENTAL STATUS:
 * This is a spatial attention engagement hypothesis, NOT a proven entrainment enhancement.
 * Multi-source spatial complexity may interfere with entrainment efficacy. Requires N-of-1
 * validation before clinical deployment.
 * 
 *
 * @browserConstraints
 * - PannerNode HRTF: Chrome, Firefox, Safari (all modern browsers)
 * - Multiple simultaneous panners: Tested up to 16 sources
 * - Performance degrades with >8 active sources on mobile
 * 
 *
 * @performanceTarget <10% CPU for 8-source scene on iPhone 12 / Pixel 6
 */

export type MovementPattern = 'orbit' | 'spiral' | 'approach_recede' | 'random_walk_3d' | 'static' | 'guided_path';

export interface Position3D {
  azimuth: number; // degrees: -180 to +180
  elevation: number; // degrees: -90 to +90
  distance: number; // meters: 0.5-5m optimal range
}

export interface MovementOptions {
  radius?: number; // meters
  speed?: number; // Hz: 0.05-0.2
  initialAzimuth?: number;
  elevation?: number;
  waypoints?: Position3D[]; // for guided_path pattern
}

export interface AudioSource {
  id: string;
  audioNode: AudioNode;
  panner: PannerNode;
  position: Position3D;
  movementPattern: MovementPattern;
  options: MovementOptions;
  startTime: number;
  isActive: boolean;
}

export interface ScenePreset {
  id: string;
  name: string;
  description: string;
  sources: {
    type: 'binaural' | 'ambient' | 'marker' | 'environment';
    position: Position3D;
    movementPattern: MovementPattern;
    options: MovementOptions;
  }[];
}

/**
 * Spatial Audio Scene Designer
 * 
 *
 * Manages multiple 3D audio sources with independent motion patterns. Uses Web Audio API
 * PannerNode with HRTF panning for realistic spatial rendering. Designed for headphone use.
 */
export class SpatialAudioSceneDesigner {
  private context: AudioContext;
  private listener: AudioListener;
  private sources: Map<string, AudioSource> = new Map();
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  

  // Safety limits
  private readonly MAX_SOURCES = 8;
  private readonly MAX_SPEED = 0.2; // Hz
  private readonly MAX_ELEVATION = 45; // degrees
  private readonly MIN_DISTANCE = 0.5; // meters
  private readonly MAX_DISTANCE = 5; // meters

  constructor(audioContext: AudioContext) {
    this.context = audioContext;
    this.listener = audioContext.listener;

    // Set listener at origin (user's head)
    this.listener.positionX.value = 0;
    this.listener.positionY.value = 0;
    this.listener.positionZ.value = 0;
    this.listener.forwardX.value = 0;
    this.listener.forwardY.value = 0;
    this.listener.forwardZ.value = -1;
    this.listener.upX.value = 0;
    this.listener.upY.value = 1;
    this.listener.upZ.value = 0;
  }
  

  /**
   * Add audio source to scene
   */
  addSource(
    audioNode: AudioNode,
    initialPosition: Position3D,
    movementPattern: MovementPattern = 'static',
    options: MovementOptions = {}
  ): string | null {
    if (this.sources.size >= this.MAX_SOURCES) {
      console.warn(`Max sources (${this.MAX_SOURCES}) reached`);
      return null;
    }

    if (
      !Number.isFinite(initialPosition.azimuth) ||
      !Number.isFinite(initialPosition.elevation) ||
      !Number.isFinite(initialPosition.distance)
    ) {
      throw new Error(
        `Invalid source position: azimuth=${initialPosition.azimuth}, elevation=${initialPosition.elevation}, distance=${initialPosition.distance} (all values must be finite)`
      );
    }

    // Create panner with HRTF spatial audio
    const panner = new PannerNode(this.context, {
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
    });
    
    // Connect nodes
    audioNode.connect(panner);
    panner.connect(this.context.destination);

    // Create source object
    const sourceId = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const source: AudioSource = {
      id: sourceId,
      audioNode,
      panner,
      position: this.clampPosition(initialPosition),
      movementPattern,
      options: {
        radius: options.radius || 2,
        speed: Math.min(options.speed || 0.1, this.MAX_SPEED),
        initialAzimuth: options.initialAzimuth || 0,
        elevation: options.elevation || 0,
        waypoints: options.waypoints || []
      },
      startTime: this.context.currentTime,
      isActive: true
    };
    
    this.sources.set(sourceId, source);
    this.setPosition(source, source.position);

    // Start scene if not running
    if (!this.isRunning) {
      this.startScene();
    }
    
    return sourceId;
  }

  /**
   * Remove source from scene
   */
  removeSource(sourceId: string): void {
    const source = this.sources.get(sourceId);
    if (source) {
      // Only sever the connection into this scene's panner — the caller's
      // node may feed other destinations (e.g. the master chain).
      source.audioNode.disconnect(source.panner);
      source.panner.disconnect();
      this.sources.delete(sourceId);
    }

    // Stop scene if no active sources
    if (this.sources.size === 0) {
      this.stopScene();
    }
  }
  

  /**
   * Update source movement pattern
   */
  updateSourcePattern(
    sourceId: string,
    pattern: MovementPattern,
    options?: MovementOptions
  ): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.movementPattern = pattern;
      if (options) {
        source.options = {
          ...source.options,
          ...options,
          speed: Math.min(options.speed || source.options.speed || 0.1, this.MAX_SPEED)
        };
      }
      source.startTime = this.context.currentTime;
    }
  }
  

  /**
   * Set static position for source
   */
  setStaticPosition(sourceId: string, position: Position3D): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.movementPattern = 'static';
      source.position = this.clampPosition(position);
      this.setPosition(source, source.position);
    }
  }
  

  /**
   * Start scene animation
   */
  startScene(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateScene();
  }
  

  /**
   * Stop scene animation
   */
  stopScene(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  

  /**
   * Clear all sources
   */
  clearScene(): void {
    this.sources.forEach((source) => {
      source.audioNode.disconnect(source.panner);
      source.panner.disconnect();
    });
    this.sources.clear();
    this.stopScene();
  }
  

  /**
   * Animation loop
   */
  private updateScene = (): void => {
    if (!this.isRunning) return;

    const currentTime = this.context.currentTime;

    this.sources.forEach((source) => {
      if (!source.isActive) return;

      const elapsed = currentTime - source.startTime;
      const newPosition = this.calculatePosition(
        source.movementPattern,
        elapsed,
        source.position,
        source.options
      );

      source.position = newPosition;
      this.setPosition(source, newPosition);
    });

    this.animationFrameId = requestAnimationFrame(this.updateScene);
  }

  /**
   * Calculate new position based on movement pattern
   */
  private calculatePosition(
    pattern: MovementPattern,
    elapsed: number,
    currentPos: Position3D,
    options: MovementOptions
  ): Position3D {
    const { radius = 2, speed = 0.1, initialAzimuth = 0, elevation = 0 } = options;
    

    switch (pattern) {
      case 'orbit':
        return {
          azimuth: ((initialAzimuth + elapsed * speed * 360) % 360) - 180,
          elevation: elevation,
          distance: radius
        };
        

      case 'spiral':
        return {
          azimuth: ((initialAzimuth + elapsed * speed * 360) % 360) - 180,
          elevation: Math.min(this.MAX_ELEVATION, (elapsed * speed * 60) % 60 - 30),
          distance: radius
        };
        

      case 'approach_recede':
        const phase = Math.sin(2 * Math.PI * speed * elapsed);
        return {
          azimuth: initialAzimuth,
          elevation: elevation,
          distance: radius + phase * (radius * 0.5)
        };
        

      case 'random_walk_3d':
        // Bounded Brownian motion
        return {
          azimuth: Math.max(-180, Math.min(180, currentPos.azimuth + (Math.random() - 0.5) * 20)),
          elevation: Math.max(-this.MAX_ELEVATION, Math.min(this.MAX_ELEVATION,
            currentPos.elevation + (Math.random() - 0.5) * 10)),
          distance: Math.max(this.MIN_DISTANCE, Math.min(this.MAX_DISTANCE,
            currentPos.distance + (Math.random() - 0.5) * 0.3))
        };
        

      case 'guided_path':
        // Simple waypoint interpolation
        if (options.waypoints && options.waypoints.length > 0) {
          const waypointIndex = Math.floor((elapsed * speed) % options.waypoints.length);
          return options.waypoints[waypointIndex];
        }
        return currentPos;
        

      case 'static':
      default:
        return currentPos;
    }
  }
  

  /**
   * Set 3D position of source
   */
  private setPosition(source: AudioSource, position: Position3D): void {
    const { azimuth, elevation, distance } = this.clampPosition(position);
    
    const azimuthRad = azimuth * (Math.PI / 180);
    const elevationRad = elevation * (Math.PI / 180);
    
    const x = distance * Math.sin(azimuthRad) * Math.cos(elevationRad);
    const y = distance * Math.sin(elevationRad);
    const z = -distance * Math.cos(azimuthRad) * Math.cos(elevationRad);
    source.panner.positionX.value = x;
    source.panner.positionY.value = y;
    source.panner.positionZ.value = z;
  }
  

  /**
   * Clamp position to safe limits
   */
  private clampPosition(position: Position3D): Position3D {
    return {
      azimuth: Math.max(-180, Math.min(180, position.azimuth)),
      elevation: Math.max(-this.MAX_ELEVATION, Math.min(this.MAX_ELEVATION, position.elevation)),
      distance: Math.max(this.MIN_DISTANCE, Math.min(this.MAX_DISTANCE, position.distance))
    };
  }
  

  /**
   * Get source count
   */
  getSourceCount(): number {
    return this.sources.size;
  }
  

  /**
   * Get source info
   */
  getSourceInfo(sourceId: string): AudioSource | undefined {
    return this.sources.get(sourceId);
  }
  

  /**
   * Toggle source active state
   */
  toggleSource(sourceId: string, active: boolean): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.isActive = active;
    }
  }
}

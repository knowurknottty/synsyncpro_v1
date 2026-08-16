/**
 * audio.ts
 * Core audio module type system for SynSync Pro
 * Provides base interfaces for all audio processing modules
 */

/**
 * Base parameter interface for all audio modules
 */
export interface ModuleParams {
  [key: string]: any;
}

/**
 * Standard AudioModule interface
 * All audio processing modules must implement this interface
 */
export interface AudioModule {
  /**
   * Update module parameters
   */
  setParams(params: Partial<ModuleParams>): void;

  /**
   * Connect module output to an audio destination
   */
  connect(destination: AudioNode): void;

  /**
   * Disconnect module from all outputs
   */
  disconnect(): void;

  /**
   * Start audio processing
   */
  start(): void;

  /**
   * Stop audio processing
   */
  stop(): void;
}

/**
 * RVP Evidence Classification
 */
export type RVPGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

/**
 * Confidence tags for module implementations
 */
export type ConfidenceTag = '✅Established' | '🔬Experimental' | '⚠️Speculative';

/**
 * Module metadata for documentation and UI
 */
export interface ModuleMetadata {
  name: string;
  description: string;
  rvpGrade: RVPGrade;
  confidenceTag: ConfidenceTag;
  citations?: string[];
}

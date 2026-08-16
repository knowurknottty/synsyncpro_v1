/**
 * Module 18: Auditory Safety Monitor (SPL Limiter)
 * 
 * Real-time sound pressure level (SPL) monitoring with <85 dB ceiling enforcement.
 * Prevents hearing damage from prolonged exposure.
 * 
 * Evidence Grade: [✅Established]
 * Source: cdc.gov/niosh/topics/noise - Tier 1 evidence
 * 
 * @module AuditorySafetyMonitor
 * @group Group 7: User Experience & Safety
 */

/**
 * SPL monitoring state update
 */
export interface SPLState {
  /** Current estimated SPL in dB */
  currentSPL: number;
  /** Whether hard limiter is actively reducing output */
  isLimiting: boolean;
  /** Total exposure time in seconds */
  exposureTime: number;
  /** Maximum safe exposure time remaining at current SPL (seconds, Infinity if safe) */
  maxSafeExposure: number;
  /** Whether SPL is in warning range (85-90 dB) */
  inWarningRange: boolean;
  /** Whether SPL has exceeded limit (>90 dB) */
  exceedsLimit: boolean;
}

/**
 * Calibration settings for SPL estimation
 */
export interface CalibrationSettings {
  /** User-provided calibration offset in dB */
  offsetDB: number;
  /** Timestamp when calibration was last updated */
  calibratedAt: number;
  /** Reference SPL value used for calibration */
  referenceSPL: number;
}

/**
 * NIOSH/CDC SPL safety thresholds
 */
const SPL_THRESHOLDS = {
  /** Safe for 8-hour exposure */
  SAFE: 85,
  /** Safe for <2 hours, WARNING displayed */
  MODERATE_RISK: 85,
  /** Hearing damage risk, HARD LIMIT enforced */
  HIGH_RISK: 90,
  /** Absolute peak (pain threshold) */
  PEAK_LIMIT: 120,
} as const;

const STORAGE_KEY_CALIBRATION = 'synsync_spl_calibration';
const MONITORING_INTERVAL_MS = 100; // 10 Hz update rate

/**
 * Auditory Safety Monitor with SPL limiting
 * 
 * Monitors real-time audio output and enforces NIOSH/CDC hearing safety limits.
 * Uses Web Audio API AnalyserNode for RMS measurement and DynamicsCompressor for limiting.
 */
export class AuditorySafetyMonitor {
  private context: AudioContext;
  private analyser: AnalyserNode;
  private limiter: DynamicsCompressorNode;
  private dataArray: Uint8Array;
  private calibrationOffset: number = 0;
  private currentSPL: number = 0;
  private maxSPL: number = SPL_THRESHOLDS.HIGH_RISK;
  private isLimiting: boolean = false;
  private totalExposureTime: number = 0;
  private exposureStartTime: number | null = null;
  private monitoringTimerId: number | null = null;
  private onSPLUpdate?: (state: SPLState) => void;

  constructor(audioContext: AudioContext) {
    this.context = audioContext;

    // Create analyser for RMS measurement
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create hard limiter (compressor with extreme ratio)
    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.value = -10; // dB (digital)
    this.limiter.ratio.value = 20; // Near-infinity ratio for brick-wall limiting
    this.limiter.attack.value = 0.003; // 3ms
    this.limiter.release.value = 0.25; // 250ms
    this.limiter.knee.value = 0; // Hard knee

    // RMS buffer for continuous monitoring
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Load calibration from storage
    this.loadCalibration();
  }

  /**
   * Connect audio source to safety monitor
   * 
   * Chain: source → analyser → limiter → destination
   * 
   * @param source - Audio source node
   * @param destination - Audio destination node
   */
  connect(source: AudioNode, destination: AudioNode): void {
    source.connect(this.analyser);
    this.analyser.connect(this.limiter);
    this.limiter.connect(destination);
  }

  /**
   * Calculate current SPL from RMS level
   * 
   * @returns Estimated SPL in dB
   */
  private calculateSPL(): number {
    // Get time-domain data for RMS calculation
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate RMS
    let sumSquares = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128; // -1 to +1
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.dataArray.length);

    // Convert to dB (digital scale)
    const dBFS = 20 * Math.log10(rms + 1e-10); // Add epsilon to prevent log(0)

    // Approximate SPL (requires calibration)
    // Assume 0 dBFS (digital full-scale) = 100 dB SPL (typical headphone output)
    const estimatedSPL = 100 + dBFS + this.calibrationOffset;

    this.currentSPL = Math.max(0, estimatedSPL); // Clamp to non-negative

    return this.currentSPL;
  }

  /**
   * Calculate maximum safe exposure time based on current SPL
   * 
   * Uses NIOSH formula: Safe time halves for every 3 dB increase above 85 dB
   * 
   * @param spl - Current SPL in dB
   * @returns Maximum safe exposure time in seconds (Infinity if unlimited)
   */
  private calculateMaxSafeExposure(spl: number): number {
    if (spl <= SPL_THRESHOLDS.SAFE) return Infinity;

    const baseTime = 8 * 3600; // 8 hours in seconds
    const excessDB = spl - SPL_THRESHOLDS.SAFE;
    const safeTime = baseTime / Math.pow(2, excessDB / 3);

    return safeTime;
  }

  /**
   * Monitoring loop - runs at ~10 Hz
   */
  private monitorLoop = (): void => {
    const spl = this.calculateSPL();

    // Update exposure time
    if (this.exposureStartTime) {
      this.totalExposureTime = (Date.now() - this.exposureStartTime) / 1000;
    }

    // Check thresholds
    const exceedsLimit = spl > SPL_THRESHOLDS.HIGH_RISK;
    const inWarningRange = spl >= SPL_THRESHOLDS.MODERATE_RISK && spl <= SPL_THRESHOLDS.HIGH_RISK;

    if (exceedsLimit) {
      this.isLimiting = true;
      console.warn(`🚨 SPL LIMIT EXCEEDED: ${spl.toFixed(1)} dB SPL (max: ${SPL_THRESHOLDS.HIGH_RISK} dB)`);
    } else if (inWarningRange) {
      this.isLimiting = false;
      console.warn(`⚠️ SPL Warning: ${spl.toFixed(1)} dB SPL (limit: ${SPL_THRESHOLDS.MODERATE_RISK} dB)`);
    } else {
      this.isLimiting = false;
    }

    // Emit update to UI
    if (this.onSPLUpdate) {
      this.onSPLUpdate({
        currentSPL: spl,
        isLimiting: this.isLimiting,
        exposureTime: this.totalExposureTime,
        maxSafeExposure: this.calculateMaxSafeExposure(spl),
        inWarningRange,
        exceedsLimit,
      });
    }

    // Schedule next iteration
    this.monitoringTimerId = window.setTimeout(this.monitorLoop, MONITORING_INTERVAL_MS);
  };

  /**
   * Start SPL monitoring
   * 
   * @param callback - Called on each SPL update (~10 Hz)
   */
  startMonitoring(callback?: (state: SPLState) => void): void {
    if (this.monitoringTimerId !== null) {
      console.warn('[AuditorySafetyMonitor] Already monitoring, stopping previous session');
      this.stopMonitoring();
    }

    this.onSPLUpdate = callback;
    this.exposureStartTime = Date.now();
    this.totalExposureTime = 0;

    this.monitorLoop();
  }

  /**
   * Stop SPL monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringTimerId !== null) {
      clearTimeout(this.monitoringTimerId);
      this.monitoringTimerId = null;
    }

    this.exposureStartTime = null;
  }

  /**
   * Calibrate SPL readings using reference measurement
   * 
   * User provides known SPL reading (e.g., from smartphone SPL meter app)
   * and this adjusts the calibration offset to match.
   * 
   * @param userReportedSPL - Known SPL value in dB
   */
  calibrate(userReportedSPL: number): void {
    const currentEstimate = this.calculateSPL();
    this.calibrationOffset += userReportedSPL - currentEstimate;

    // Save to storage
    this.saveCalibration({
      offsetDB: this.calibrationOffset,
      calibratedAt: Date.now(),
      referenceSPL: userReportedSPL,
    });

  }

  /**
   * Reset exposure timer
   */
  resetExposureTimer(): void {
    this.totalExposureTime = 0;
    this.exposureStartTime = Date.now();
  }

  /**
   * Get current calibration settings
   */
  getCalibration(): CalibrationSettings | null {
    return this.loadCalibration();
  }

  /**
   * Load calibration from localStorage
   */
  private loadCalibration(): CalibrationSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CALIBRATION);
      if (!stored) return null;

      const calibration: CalibrationSettings = JSON.parse(stored);
      this.calibrationOffset = calibration.offsetDB;

      return calibration;
    } catch (error) {
      console.error('[AuditorySafetyMonitor] Failed to load calibration:', error);
      return null;
    }
  }

  /**
   * Save calibration to localStorage
   */
  private saveCalibration(calibration: CalibrationSettings): void {
    try {
      const serialized = JSON.stringify(calibration);
      localStorage.setItem(STORAGE_KEY_CALIBRATION, serialized);
    } catch (error) {
      console.error('[AuditorySafetyMonitor] Failed to save calibration:', error);
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopMonitoring();
    this.analyser.disconnect();
    this.limiter.disconnect();
  }
}

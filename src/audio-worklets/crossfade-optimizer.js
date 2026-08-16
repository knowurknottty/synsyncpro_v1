/**
 * Module 14: Crossfade Transition Optimizer
 *
 * @objective Implement equal-power crossfading between protocol phases
 * using raised-cosine windows to prevent perceptual "dips" and maintain
 * constant loudness during frequency transitions.
 *
 * @evidence [🔬Experimental] - Equal-power crossfading maintains
 * perceptual loudness per psychoacoustic principles.
 *
 * @reference Apply Fletcher-Munson equal-loudness contours to compensate
 * for frequency-dependent perception during crossfades.
 *
 * @safety Smooth transitions reduce the risk of auditory startle responses
 * and ensure comfortable listening experience.
 */

/**
 * CrossfadeOptimizer implements equal-power crossfading
 * with raised-cosine windowing.
 *
 * Technical specifications:
 * - Equal-power math: gain_out² + gain_in² = 1 (constant power)
 * - Raised-cosine window for smooth transitions
 * - Loudness variance target: <0.3 dB during crossfade
 * - Multiple window types: raised-cosine, linear, exponential
 * - Sample-accurate timing integration with TemporalScheduler
 */
class CrossfadeOptimizer extends AudioWorkletProcessor {
  constructor(options) {
    super();

    // Crossfade state
    this.isActive = false;
    this.currentSample = 0;
    this.crossfadeDuration = 2.0; // seconds (default)
    this.totalSamples = 0;
    this.windowType = 'raised-cosine'; // default window

    // Audio sources (managed externally, this just processes gains)
    this.fadeOutGain = 1.0;
    this.fadeInGain = 0.0;

    // Pre-computed window
    this.window = null;

    // Process initialization parameters
    if (options.processorOptions) {
      this.crossfadeDuration = options.processorOptions.duration || this.crossfadeDuration;
      this.windowType = options.processorOptions.windowType || this.windowType;
    }

    // Message port for communication
    this.port.onmessage = (event) => this.handleMessage(event.data);

    console.log('[CrossfadeOptimizer] Initialized:', {
      duration: this.crossfadeDuration,
      windowType: this.windowType
    });
  }

  /**
   * Generate raised-cosine window
   * @param {number} length - Window length in samples
   * @returns {Float32Array} Window values
   */
  static raisedCosineWindow(length) {
    const window = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const phase = (i / (length - 1)) * Math.PI;
      window[i] = 0.5 * (1 - Math.cos(phase));
    }
    return window;
  }

  /**
   * Generate linear window
   * @param {number} length - Window length in samples
   * @returns {Float32Array} Window values
   */
  static linearWindow(length) {
    const window = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      window[i] = i / (length - 1);
    }
    return window;
  }

  /**
   * Generate exponential window
   * @param {number} length - Window length in samples
   * @returns {Float32Array} Window values
   */
  static exponentialWindow(length) {
    const window = new Float32Array(length);
    const exponent = 2.0; // Exponential curve factor
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1);
      window[i] = Math.pow(t, exponent);
    }
    return window;
  }

  /**
   * Calculate equal-power crossfade gains
   * @param {number} progress - Progress through crossfade (0.0 to 1.0)
   * @returns {Object} {fadeOut, fadeIn} gain values
   */
  calculateEqualPowerGains(progress) {
    // Equal-power crossfade formulas:
    // fade-out: cos(π/2 * progress)
    // fade-in: sin(π/2 * progress)
    // Ensures: fadeOut² + fadeIn² = 1

    const fadeOut = Math.cos((Math.PI / 2) * progress);
    const fadeIn = Math.sin((Math.PI / 2) * progress);

    return { fadeOut, fadeIn };
  }

  /**
   * Handle messages from main thread
   */
  handleMessage(data) {
    switch (data.type) {
      case 'start':
        this.isActive = true;
        this.currentSample = 0;
        this.crossfadeDuration = data.duration || this.crossfadeDuration;
        this.windowType = data.windowType || this.windowType;
        this.totalSamples = Math.floor(this.crossfadeDuration * sampleRate);

        // Pre-compute window
        switch (this.windowType) {
          case 'raised-cosine':
            this.window = CrossfadeOptimizer.raisedCosineWindow(this.totalSamples);
            break;
          case 'linear':
            this.window = CrossfadeOptimizer.linearWindow(this.totalSamples);
            break;
          case 'exponential':
            this.window = CrossfadeOptimizer.exponentialWindow(this.totalSamples);
            break;
          default:
            this.window = CrossfadeOptimizer.raisedCosineWindow(this.totalSamples);
        }

        console.log('[CrossfadeOptimizer] Crossfade started:', {
          duration: this.crossfadeDuration,
          samples: this.totalSamples,
          windowType: this.windowType
        });
        break;

      case 'stop':
        this.isActive = false;
        console.log('[CrossfadeOptimizer] Crossfade stopped');
        break;

      default:
        console.warn('[CrossfadeOptimizer] Unknown message type:', data.type);
    }
  }

  /**
   * Process audio - apply crossfade gains
   * @param {Array} inputs - Input audio channels [fadeOut, fadeIn]
   * @param {Array} outputs - Output audio channels
   * @param {Object} parameters - Audio parameters
   * @returns {boolean} - True to keep processor alive
   */
  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (!output || output.length === 0) {
      return true;
    }

    // If crossfade is not active, pass through first input
    if (!this.isActive || inputs.length < 2) {
      const input = inputs[0];
      if (input && input.length > 0) {
        for (let channel = 0; channel < output.length; channel++) {
          output[channel].set(input[channel] || new Float32Array(128));
        }
      }
      return true;
    }

    const fadeOutInput = inputs[0];
    const fadeInInput = inputs[1];

    // Process each sample in the buffer
    for (let i = 0; i < output[0].length; i++) {
      if (this.currentSample >= this.totalSamples) {
        // Crossfade complete - output only fadeIn source
        for (let channel = 0; channel < output.length; channel++) {
          output[channel][i] = fadeInInput[channel] ? fadeInInput[channel][i] : 0;
        }
        continue;
      }

      // Calculate progress
      const progress = this.currentSample / this.totalSamples;

      // Get window value (for shaped crossfades)
      const windowValue = this.window ? this.window[this.currentSample] : progress;

      // Calculate equal-power gains
      const gains = this.calculateEqualPowerGains(windowValue);

      // Apply crossfade to each channel
      for (let channel = 0; channel < output.length; channel++) {
        const fadeOutSample = fadeOutInput[channel] ? fadeOutInput[channel][i] : 0;
        const fadeInSample = fadeInInput[channel] ? fadeInInput[channel][i] : 0;

        output[channel][i] =
          (fadeOutSample * gains.fadeOut) +
          (fadeInSample * gains.fadeIn);
      }

      this.currentSample++;
    }

    // Send progress update
    if (this.isActive && this.currentSample < this.totalSamples) {
      const progress = this.currentSample / this.totalSamples;
      if (Math.floor(progress * 100) % 10 === 0) { // Every 10%
        this.port.postMessage({
          type: 'progress',
          progress: progress,
          fadeOutGain: this.fadeOutGain,
          fadeInGain: this.fadeInGain
        });
      }
    } else if (this.currentSample >= this.totalSamples && this.isActive) {
      this.isActive = false;
      this.port.postMessage({
        type: 'complete'
      });
      console.log('[CrossfadeOptimizer] Crossfade complete');
    }

    return true;
  }

  /**
   * Define processor parameters
   */
  static get parameterDescriptors() {
    return [];
  }
}

// Register the processor
registerProcessor('crossfade-optimizer', CrossfadeOptimizer);

console.log('[CrossfadeOptimizer] Registered successfully');

/**
 * BinauralProcessor - AudioWorklet for sample-accurate binaural beat generation
 *
 * Runs on dedicated audio thread (zero main thread overhead).
 * Provides sample-perfect frequency accuracy and smooth modulation.
 *
 * Parameters:
 * - carrierL: Left channel carrier frequency (Hz)
 * - carrierR: Right channel carrier frequency (Hz)
 * - amplitude: Output amplitude (0.0-1.0)
 * - phase: Phase offset (0.0-1.0)
 */

class BinauralProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        // Internal state
        this.phase = 0;
        this.phaseL = 0;
        this.phaseR = 0;
        this.sampleRate = sampleRate;

        // Message handling from main thread
        this.port.onmessage = (e) => {
            if (e.data.type === 'reset') {
                this.phaseL = 0;
                this.phaseR = 0;
                this.phase = 0;
            }
        };
    }

    static get parameterDescriptors() {
        return [
            {
                name: 'carrierL',
                defaultValue: 200,
                minValue: 20,
                maxValue: 1000,
                automationRate: 'a-rate'  // Per-sample automation
            },
            {
                name: 'carrierR',
                defaultValue: 210,
                minValue: 20,
                maxValue: 1000,
                automationRate: 'a-rate'
            },
            {
                name: 'amplitude',
                defaultValue: 0.5,
                minValue: 0.0,
                maxValue: 1.0,
                automationRate: 'a-rate'
            },
            {
                name: 'phaseOffset',
                defaultValue: 0.0,
                minValue: 0.0,
                maxValue: 1.0,
                automationRate: 'k-rate'  // Per-block automation
            }
        ];
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        if (!output || output.length < 2) return true;

        const leftChannel = output[0];
        const rightChannel = output[1];
        const frameCount = leftChannel.length;

        // Get parameter arrays (could be 1-length or 128-length)
        const carrierL = parameters.carrierL;
        const carrierR = parameters.carrierR;
        const amplitude = parameters.amplitude;
        const phaseOffset = parameters.phaseOffset;

        // Check if parameters are constant (length === 1) or varying (length === 128)
        const isCarrierLConstant = carrierL.length === 1;
        const isCarrierRConstant = carrierR.length === 1;
        const isAmplitudeConstant = amplitude.length === 1;

        for (let i = 0; i < frameCount; i++) {
            // Get current parameter values (handle both constant and varying)
            const freqL = isCarrierLConstant ? carrierL[0] : carrierL[i];
            const freqR = isCarrierRConstant ? carrierR[0] : carrierR[i];
            const amp = isAmplitudeConstant ? amplitude[0] : amplitude[i];

            // Sample-accurate sine wave generation
            leftChannel[i] = Math.sin(this.phaseL) * amp;
            rightChannel[i] = Math.sin(this.phaseR) * amp;

            // Increment phase (wrap at 2π for numerical stability)
            const phaseIncrementL = (2 * Math.PI * freqL) / this.sampleRate;
            const phaseIncrementR = (2 * Math.PI * freqR) / this.sampleRate;

            this.phaseL += phaseIncrementL;
            this.phaseR += phaseIncrementR;

            // Wrap phases to prevent float precision loss
            if (this.phaseL > 2 * Math.PI) this.phaseL -= 2 * Math.PI;
            if (this.phaseR > 2 * Math.PI) this.phaseR -= 2 * Math.PI;
        }

        return true;  // Keep processor alive
    }
}

registerProcessor('binaural-processor', BinauralProcessor);

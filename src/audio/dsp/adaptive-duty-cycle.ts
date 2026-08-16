/**
 * FIX #3: Frequency-Adaptive Isochronic Duty Cycle
 * ==================================================
 * Optimal duty cycles vary by target frequency band:
 * - Delta (<4Hz): Wide duty (0.6-0.7)
 * - Theta (4-8Hz): Medium-wide (0.5-0.6)
 * - Alpha (8-12Hz): Standard (0.4-0.5)
 * - SMR/Beta (12-30Hz): Narrower (0.35-0.45)
 * - Gamma (30-100Hz): Sharp pulses (0.25-0.35)
 *
 * @version 2.0.0
 */

export interface DutyCycleConfig {
  dutyCycle: number;
  rampFraction: number;
  explanation: string;
}

export function calculateAdaptiveDutyCycle(
  beatFrequency: number,
  explicitDutyCycle?: number
): DutyCycleConfig {
  if (explicitDutyCycle !== undefined && explicitDutyCycle > 0) {
    return {
      dutyCycle: explicitDutyCycle,
      rampFraction: 0.1,
      explanation: `Protocol-defined duty cycle: ${explicitDutyCycle}`,
    };
  }

  const freq = Math.abs(beatFrequency);

  if (freq < 1) {
    return { dutyCycle: 0.70, rampFraction: 0.15, explanation: `Infraslow (${freq.toFixed(2)}Hz): Wide 70% duty` };
  } else if (freq < 4) {
    const t = (freq - 1) / 3;
    return { dutyCycle: 0.70 - (t * 0.10), rampFraction: 0.12, explanation: `Delta (${freq.toFixed(1)}Hz)` };
  } else if (freq < 8) {
    const t = (freq - 4) / 4;
    return { dutyCycle: 0.60 - (t * 0.10), rampFraction: 0.10, explanation: `Theta (${freq.toFixed(1)}Hz)` };
  } else if (freq < 12) {
    const t = (freq - 8) / 4;
    return { dutyCycle: 0.50 - (t * 0.05), rampFraction: 0.10, explanation: `Alpha (${freq.toFixed(1)}Hz)` };
  } else if (freq < 15) {
    const t = (freq - 12) / 3;
    return { dutyCycle: 0.45 - (t * 0.05), rampFraction: 0.08, explanation: `SMR (${freq.toFixed(1)}Hz)` };
  } else if (freq < 30) {
    const t = (freq - 15) / 15;
    return { dutyCycle: 0.40 - (t * 0.05), rampFraction: 0.08, explanation: `Beta (${freq.toFixed(1)}Hz)` };
  } else {
    const t = Math.min(1, (freq - 30) / 70);
    return { dutyCycle: Math.max(0.20, 0.35 - (t * 0.10)), rampFraction: 0.05, explanation: `Gamma (${freq.toFixed(0)}Hz)` };
  }
}

export function isochronicPulseGain(
  phase: number,
  dutyCycle: number,
  rampFraction: number = 0.1
): number {
  const p = phase % 1;
  if (p >= dutyCycle) return 0;

  const rampTime = dutyCycle * rampFraction;
  if (p < rampTime) {
    return 0.5 * (1 - Math.cos(Math.PI * p / rampTime));
  } else if (p > dutyCycle - rampTime) {
    const releaseProgress = (p - (dutyCycle - rampTime)) / rampTime;
    return 0.5 * (1 + Math.cos(Math.PI * releaseProgress));
  }
  return 1;
}

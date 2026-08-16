export interface StereoSnapshot {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
  endFrame: number;
}

export interface ToneMeasurement {
  frequency: number;
  magnitude: number;
}

interface ProofTapChunkMessage {
  type: 'audio-chunk';
  sampleRate: number;
  startFrame: number;
  left: Float32Array;
  right: Float32Array;
}

export class SignalProofTap {
  readonly capacity: number;
  readonly sampleRate: number;

  private readonly left: Float32Array;
  private readonly right: Float32Array;
  private totalFrames = 0;

  constructor(sampleRate: number, seconds = 4) {
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new RangeError('sampleRate must be a positive finite number');
    }
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new RangeError('seconds must be a positive finite number');
    }

    this.sampleRate = sampleRate;
    this.capacity = Math.max(Math.floor(sampleRate * seconds), 4096);
    this.left = new Float32Array(this.capacity);
    this.right = new Float32Array(this.capacity);
  }

  write(left: Float32Array, right: Float32Array = left): void {
    if (left.length !== right.length) {
      throw new RangeError('left and right channel lengths must match');
    }

    let sourceOffset = 0;
    let remaining = left.length;
    while (remaining > 0) {
      const destinationIndex = this.totalFrames % this.capacity;
      const run = Math.min(remaining, this.capacity - destinationIndex);
      this.left.set(left.subarray(sourceOffset, sourceOffset + run), destinationIndex);
      this.right.set(right.subarray(sourceOffset, sourceOffset + run), destinationIndex);
      this.totalFrames += run;
      sourceOffset += run;
      remaining -= run;
    }
  }

  snapshot(frames: number): StereoSnapshot | null {
    if (!Number.isInteger(frames) || frames <= 0 || frames > this.capacity) return null;
    if (this.totalFrames < frames) return null;

    const outLeft = new Float32Array(frames);
    const outRight = new Float32Array(frames);
    const startFrame = this.totalFrames - frames;
    const startIndex = startFrame % this.capacity;
    const firstRun = Math.min(frames, this.capacity - startIndex);
    const secondRun = frames - firstRun;

    outLeft.set(this.left.subarray(startIndex, startIndex + firstRun));
    outRight.set(this.right.subarray(startIndex, startIndex + firstRun));
    if (secondRun > 0) {
      outLeft.set(this.left.subarray(0, secondRun), firstRun);
      outRight.set(this.right.subarray(0, secondRun), firstRun);
    }

    return { left: outLeft, right: outRight, sampleRate: this.sampleRate, endFrame: this.totalFrames };
  }

  clear(): void {
    this.left.fill(0);
    this.right.fill(0);
    this.totalFrames = 0;
  }

  static zeroCrossingFrequency(signal: Float32Array, sampleRate: number): number | null {
    if (signal.length < 256 || sampleRate <= 0) return null;
    let firstCrossing: number | null = null;
    let lastCrossing: number | null = null;
    let count = 0;
    let previous = signal[0];
    for (let i = 1; i < signal.length; i += 1) {
      const current = signal[i];
      if (previous < 0 && current >= 0) {
        const denominator = previous - current;
        const fraction = denominator === 0 ? 0 : previous / denominator;
        const time = (i - 1 + fraction) / sampleRate;
        if (firstCrossing === null) firstCrossing = time;
        lastCrossing = time;
        count += 1;
      }
      previous = current;
    }
    if (firstCrossing === null || lastCrossing === null || count < 8 || lastCrossing <= firstCrossing) return null;
    return (count - 1) / (lastCrossing - firstCrossing);
  }

  static measureTone(signal: Float32Array, expectedHz: number, sampleRate: number): ToneMeasurement | null {
    const n = signal.length;
    if (n < 256 || expectedHz <= 0 || expectedHz >= sampleRate / 2) return null;
    const half = Math.floor(n / 2);
    const omega = (2 * Math.PI * expectedHz) / sampleRate;
    const correlate = (start: number, end: number): { re: number; im: number } => {
      let re = 0;
      let im = 0;
      for (let i = start; i < end; i += 1) {
        const sample = signal[i];
        const phase = omega * i;
        re += sample * Math.cos(phase);
        im -= sample * Math.sin(phase);
      }
      return { re, im };
    };
    const first = correlate(0, half);
    const second = correlate(half, n);
    const magnitudeFirst = Math.hypot(first.re, first.im);
    const magnitudeSecond = Math.hypot(second.re, second.im);
    if (magnitudeFirst <= 1e-6 || magnitudeSecond <= 1e-6) return null;
    const crossReal = second.re * first.re + second.im * first.im;
    const crossImaginary = second.im * first.re - second.re * first.im;
    const deltaPhase = Math.atan2(crossImaginary, crossReal);
    const deltaTime = half / sampleRate;
    const offset = deltaPhase / (2 * Math.PI * deltaTime);
    if (Math.abs(offset) >= 1 / (2 * deltaTime)) return null;
    return { frequency: expectedHz + offset, magnitude: (magnitudeFirst + magnitudeSecond) / n };
  }

  static acquireTone(signal: Float32Array, sampleRate: number, minHz = 20, maxHz = 1200): ToneMeasurement | null {
    const acquired = SignalProofTap.zeroCrossingFrequency(signal, sampleRate);
    if (acquired === null || acquired < minHz || acquired > Math.min(maxHz, sampleRate / 2)) return null;
    return SignalProofTap.measureTone(signal, acquired, sampleRate);
  }
}

export class SignalProofTapNode {
  readonly tap: SignalProofTap;
  readonly node: AudioWorkletNode;

  private constructor(node: AudioWorkletNode, tap: SignalProofTap) {
    this.node = node;
    this.tap = tap;
    this.node.port.onmessage = (event: MessageEvent<ProofTapChunkMessage>) => {
      const message = event.data;
      if (message?.type !== 'audio-chunk') return;
      this.tap.write(message.left, message.right);
    };
  }

  static async create(context: AudioContext, options: { seconds?: number; chunkFrames?: number } = {}): Promise<SignalProofTapNode> {
    if (!context.audioWorklet) throw new Error('AudioWorklet is unavailable in this browser');
    await context.audioWorklet.addModule('/worklets/signal-proof-tap-processor.js');
    const node = new AudioWorkletNode(context, 'signal-proof-tap-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      channelCount: 2,
      channelCountMode: 'explicit',
      processorOptions: { chunkFrames: options.chunkFrames ?? 2048 },
    });
    return new SignalProofTapNode(node, new SignalProofTap(context.sampleRate, options.seconds ?? 4));
  }

  setEnabled(enabled: boolean): void {
    this.node.port.postMessage({ type: 'set-enabled', enabled });
  }

  disconnect(): void {
    this.node.disconnect();
    this.node.port.close();
  }
}

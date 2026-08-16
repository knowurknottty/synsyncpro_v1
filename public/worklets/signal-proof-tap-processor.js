class SignalProofTapProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const configuredFrames = options?.processorOptions?.chunkFrames;
    this.chunkFrames = Number.isInteger(configuredFrames)
      ? Math.max(128, Math.min(configuredFrames, 4096))
      : 2048;
    this.left = new Float32Array(this.chunkFrames);
    this.right = new Float32Array(this.chunkFrames);
    this.writeIndex = 0;
    this.totalFrames = 0;
    this.enabled = true;

    this.port.onmessage = (event) => {
      if (event.data?.type === 'set-enabled') {
        this.enabled = Boolean(event.data.enabled);
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || input.length === 0 || !output || output.length === 0) return true;

    const inputLeft = input[0];
    const inputRight = input[1] || inputLeft;
    const outputLeft = output[0];
    const outputRight = output[1] || output[0];
    const frames = outputLeft.length;

    for (let i = 0; i < frames; i += 1) {
      const l = inputLeft?.[i] ?? 0;
      const r = inputRight?.[i] ?? l;
      outputLeft[i] = l;
      outputRight[i] = r;

      if (this.enabled) {
        this.left[this.writeIndex] = l;
        this.right[this.writeIndex] = r;
        this.writeIndex += 1;
        this.totalFrames += 1;

        if (this.writeIndex === this.chunkFrames) {
          const left = this.left;
          const right = this.right;
          this.port.postMessage(
            {
              type: 'audio-chunk',
              sampleRate,
              startFrame: this.totalFrames - this.chunkFrames,
              left,
              right,
            },
            [left.buffer, right.buffer]
          );
          this.left = new Float32Array(this.chunkFrames);
          this.right = new Float32Array(this.chunkFrames);
          this.writeIndex = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor('signal-proof-tap-processor', SignalProofTapProcessor);

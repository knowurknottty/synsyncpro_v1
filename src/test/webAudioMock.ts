/**
 * Constructible, stateful Web Audio API mock for vitest (jsdom has no Web Audio).
 *
 * Design goals:
 * - `new AudioContext()` works (classes, not arrow functions) and every context
 *   gets its own isolated node graph state.
 * - `createBuffer` returns REAL Float32Array-backed buffers so DSP code that
 *   fills buffers (noise generators, etc.) can be spectrally verified in tests.
 * - AudioParams record their scheduled values so safety tests can assert ramp
 *   behavior (no instantaneous jumps, ceilings respected).
 */

type ScheduledEvent = {
  method: string;
  value?: number | Float32Array;
  time: number;
  timeConstant?: number;
  duration?: number;
};

export class MockAudioParam {
  value: number;
  readonly defaultValue: number;
  readonly minValue = -3.4028235e38;
  readonly maxValue = 3.4028235e38;
  automationRate: 'a-rate' | 'k-rate' = 'a-rate';
  /** Recorded automation events, for assertions in tests. */
  readonly events: ScheduledEvent[] = [];

  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.defaultValue = defaultValue;
  }

  setValueAtTime(value: number, time: number): this {
    this.events.push({ method: 'setValueAtTime', value, time });
    this.value = value;
    return this;
  }
  linearRampToValueAtTime(value: number, time: number): this {
    this.events.push({ method: 'linearRampToValueAtTime', value, time });
    this.value = value;
    return this;
  }
  exponentialRampToValueAtTime(value: number, time: number): this {
    if (value === 0) {
      throw new RangeError('exponentialRampToValueAtTime: value must be non-zero');
    }
    this.events.push({ method: 'exponentialRampToValueAtTime', value, time });
    this.value = value;
    return this;
  }
  setTargetAtTime(value: number, time: number, timeConstant: number): this {
    this.events.push({ method: 'setTargetAtTime', value, time, timeConstant });
    this.value = value;
    return this;
  }
  setValueCurveAtTime(curve: Float32Array, time: number, duration: number): this {
    this.events.push({ method: 'setValueCurveAtTime', value: curve, time, duration });
    this.value = curve[curve.length - 1];
    return this;
  }
  cancelScheduledValues(time: number): this {
    this.events.push({ method: 'cancelScheduledValues', time });
    return this;
  }
  cancelAndHoldAtTime(time: number): this {
    this.events.push({ method: 'cancelAndHoldAtTime', time });
    return this;
  }
}

export class MockAudioBuffer {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  private channels: Float32Array[];

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    if (numberOfChannels <= 0 || length <= 0 || sampleRate <= 0) {
      throw new RangeError('Invalid AudioBuffer dimensions');
    }
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }

  get duration(): number {
    return this.length / this.sampleRate;
  }
  getChannelData(channel: number): Float32Array {
    if (channel < 0 || channel >= this.numberOfChannels) {
      throw new RangeError(`Channel index ${channel} out of range`);
    }
    return this.channels[channel];
  }
  copyToChannel(source: Float32Array, channel: number, startInChannel = 0): void {
    this.getChannelData(channel).set(
      source.subarray(0, this.length - startInChannel),
      startInChannel,
    );
  }
  copyFromChannel(destination: Float32Array, channel: number, startInChannel = 0): void {
    const data = this.getChannelData(channel);
    destination.set(data.subarray(startInChannel, startInChannel + destination.length));
  }
}

export class MockAudioNode {
  readonly context: MockAudioContext;
  numberOfInputs = 1;
  numberOfOutputs = 1;
  channelCount = 2;
  channelCountMode: ChannelCountMode = 'max';
  channelInterpretation: ChannelInterpretation = 'speakers';
  /** Current downstream connections, for graph-teardown assertions. */
  readonly connections = new Set<unknown>();

  constructor(context: MockAudioContext) {
    this.context = context;
  }

  connect(destination: unknown): unknown {
    this.connections.add(destination);
    return destination;
  }
  disconnect(destination?: unknown): void {
    if (destination === undefined) {
      this.connections.clear();
    } else {
      this.connections.delete(destination);
    }
  }
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
}

class MockAudioScheduledSourceNode extends MockAudioNode {
  onended: (() => void) | null = null;
  private started = false;
  private stopped = false;

  start(_when?: number): void {
    if (this.started) throw new DOMException('cannot call start more than once', 'InvalidStateError');
    this.started = true;
  }
  stop(_when?: number): void {
    if (!this.started) throw new DOMException('cannot call stop before start', 'InvalidStateError');
    if (this.stopped) return;
    this.stopped = true;
  }
}

export class MockOscillatorNode extends MockAudioScheduledSourceNode {
  type: OscillatorType = 'sine';
  readonly frequency = new MockAudioParam(440);
  readonly detune = new MockAudioParam(0);
  setPeriodicWave(): void {}
}

export class MockGainNode extends MockAudioNode {
  readonly gain = new MockAudioParam(1);
}

export class MockBiquadFilterNode extends MockAudioNode {
  type: BiquadFilterType = 'lowpass';
  readonly frequency = new MockAudioParam(350);
  readonly detune = new MockAudioParam(0);
  readonly Q = new MockAudioParam(1);
  readonly gain = new MockAudioParam(0);
  getFrequencyResponse(): void {}
}

export class MockDelayNode extends MockAudioNode {
  readonly delayTime = new MockAudioParam(0);
}

export class MockStereoPannerNode extends MockAudioNode {
  readonly pan = new MockAudioParam(0);
}

export class MockPannerNode extends MockAudioNode {
  panningModel: PanningModelType = 'equalpower';
  distanceModel: DistanceModelType = 'inverse';
  readonly positionX = new MockAudioParam(0);
  readonly positionY = new MockAudioParam(0);
  readonly positionZ = new MockAudioParam(0);
  readonly orientationX = new MockAudioParam(1);
  readonly orientationY = new MockAudioParam(0);
  readonly orientationZ = new MockAudioParam(0);
  refDistance = 1;
  maxDistance = 10000;
  rolloffFactor = 1;
  coneInnerAngle = 360;
  coneOuterAngle = 360;
  coneOuterGain = 0;

  constructor(context: MockAudioContext, options?: PannerOptions) {
    super(context);
    if (options) {
      if (options.panningModel) this.panningModel = options.panningModel;
      if (options.distanceModel) this.distanceModel = options.distanceModel;
      if (options.refDistance !== undefined) this.refDistance = options.refDistance;
      if (options.maxDistance !== undefined) this.maxDistance = options.maxDistance;
      if (options.rolloffFactor !== undefined) this.rolloffFactor = options.rolloffFactor;
      if (options.coneInnerAngle !== undefined) this.coneInnerAngle = options.coneInnerAngle;
      if (options.coneOuterAngle !== undefined) this.coneOuterAngle = options.coneOuterAngle;
      if (options.coneOuterGain !== undefined) this.coneOuterGain = options.coneOuterGain;
      if (options.positionX !== undefined) this.positionX.value = options.positionX;
      if (options.positionY !== undefined) this.positionY.value = options.positionY;
      if (options.positionZ !== undefined) this.positionZ.value = options.positionZ;
      if (options.orientationX !== undefined) this.orientationX.value = options.orientationX;
      if (options.orientationY !== undefined) this.orientationY.value = options.orientationY;
      if (options.orientationZ !== undefined) this.orientationZ.value = options.orientationZ;
    }
  }
  setPosition(): void {}
  setOrientation(): void {}
}

export class MockAudioWorkletNode extends MockAudioNode {
  readonly parameters = new Map<string, MockAudioParam>();
  readonly port = {
    postMessage: () => {},
    onmessage: null as ((e: unknown) => void) | null,
    addEventListener: () => {},
    removeEventListener: () => {},
    start: () => {},
    close: () => {},
  };
  onprocessorerror: (() => void) | null = null;

  constructor(context: MockAudioContext, _name: string, options?: AudioWorkletNodeOptions) {
    super(context);
    if (options?.numberOfInputs !== undefined) this.numberOfInputs = options.numberOfInputs;
    if (options?.numberOfOutputs !== undefined) this.numberOfOutputs = options.numberOfOutputs;
    for (const [key, value] of Object.entries(options?.parameterData ?? {})) {
      this.parameters.set(key, new MockAudioParam(value as number));
    }
  }
}

export class MockConstantSourceNode extends MockAudioScheduledSourceNode {
  readonly offset = new MockAudioParam(1);
}

export class MockAudioBufferSourceNode extends MockAudioScheduledSourceNode {
  buffer: MockAudioBuffer | null = null;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  readonly playbackRate = new MockAudioParam(1);
  readonly detune = new MockAudioParam(0);
}

export class MockAnalyserNode extends MockAudioNode {
  fftSize = 2048;
  minDecibels = -100;
  maxDecibels = -30;
  smoothingTimeConstant = 0.8;

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }
  getByteFrequencyData(array: Uint8Array): void {
    array.fill(0);
  }
  getByteTimeDomainData(array: Uint8Array): void {
    array.fill(128);
  }
  getFloatFrequencyData(array: Float32Array): void {
    array.fill(this.minDecibels);
  }
  getFloatTimeDomainData(array: Float32Array): void {
    array.fill(0);
  }
}

export class MockDynamicsCompressorNode extends MockAudioNode {
  readonly threshold = new MockAudioParam(-24);
  readonly knee = new MockAudioParam(30);
  readonly ratio = new MockAudioParam(12);
  readonly attack = new MockAudioParam(0.003);
  readonly release = new MockAudioParam(0.25);
  readonly reduction = 0;
}

export class MockChannelSplitterNode extends MockAudioNode {
  constructor(context: MockAudioContext, numberOfOutputs = 6) {
    super(context);
    this.numberOfOutputs = numberOfOutputs;
  }
}

export class MockChannelMergerNode extends MockAudioNode {
  constructor(context: MockAudioContext, numberOfInputs = 6) {
    super(context);
    this.numberOfInputs = numberOfInputs;
  }
}

export class MockConvolverNode extends MockAudioNode {
  buffer: MockAudioBuffer | null = null;
  normalize = true;
}

export class MockWaveShaperNode extends MockAudioNode {
  curve: Float32Array | null = null;
  oversample: OverSampleType = 'none';
}

export class MockScriptProcessorNode extends MockAudioNode {
  bufferSize: number;
  onaudioprocess: ((e: unknown) => void) | null = null;
  constructor(context: MockAudioContext, bufferSize = 4096) {
    super(context);
    this.bufferSize = bufferSize;
  }
}

export class MockMediaStreamAudioDestinationNode extends MockAudioNode {
  readonly stream = { getTracks: () => [] as unknown[] };
}

export class MockAudioContext {
  sampleRate: number;
  currentTime = 0;
  state: AudioContextState = 'running';
  readonly destination: MockAudioNode;
  readonly listener = {
    positionX: new MockAudioParam(0),
    positionY: new MockAudioParam(0),
    positionZ: new MockAudioParam(0),
    forwardX: new MockAudioParam(0),
    forwardY: new MockAudioParam(0),
    forwardZ: new MockAudioParam(-1),
    upX: new MockAudioParam(0),
    upY: new MockAudioParam(1),
    upZ: new MockAudioParam(0),
    setPosition: () => {},
    setOrientation: () => {},
  };
  readonly baseLatency = 0.005;
  readonly outputLatency = 0.01;
  readonly audioWorklet = {
    addModule: (_url: string) => Promise.resolve(),
  };
  onstatechange: (() => void) | null = null;
  /** Every node created by this context, for leak/teardown assertions. */
  readonly createdNodes: MockAudioNode[] = [];

  constructor(options?: { sampleRate?: number }) {
    this.sampleRate = options?.sampleRate ?? 48000;
    this.destination = new MockAudioNode(this);
    this.destination.numberOfOutputs = 0;
  }

  private track<T extends MockAudioNode>(node: T): T {
    this.createdNodes.push(node);
    return node;
  }

  createOscillator() {
    return this.track(new MockOscillatorNode(this));
  }
  createGain() {
    return this.track(new MockGainNode(this));
  }
  createBiquadFilter() {
    return this.track(new MockBiquadFilterNode(this));
  }
  createDelay(_maxDelayTime?: number) {
    return this.track(new MockDelayNode(this));
  }
  createStereoPanner() {
    return this.track(new MockStereoPannerNode(this));
  }
  createPanner() {
    return this.track(new MockPannerNode(this));
  }
  createConstantSource() {
    return this.track(new MockConstantSourceNode(this));
  }
  createBufferSource() {
    return this.track(new MockAudioBufferSourceNode(this));
  }
  createAnalyser() {
    return this.track(new MockAnalyserNode(this));
  }
  createDynamicsCompressor() {
    return this.track(new MockDynamicsCompressorNode(this));
  }
  createChannelSplitter(numberOfOutputs?: number) {
    return this.track(new MockChannelSplitterNode(this, numberOfOutputs));
  }
  createChannelMerger(numberOfInputs?: number) {
    return this.track(new MockChannelMergerNode(this, numberOfInputs));
  }
  createConvolver() {
    return this.track(new MockConvolverNode(this));
  }
  createWaveShaper() {
    return this.track(new MockWaveShaperNode(this));
  }
  createScriptProcessor(bufferSize?: number) {
    return this.track(new MockScriptProcessorNode(this, bufferSize));
  }
  createMediaStreamDestination() {
    return this.track(new MockMediaStreamAudioDestinationNode(this));
  }
  createBuffer(numberOfChannels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(numberOfChannels, length, sampleRate);
  }
  createPeriodicWave(real: Float32Array, imag: Float32Array) {
    return { real, imag };
  }
  decodeAudioData(_data: ArrayBuffer): Promise<MockAudioBuffer> {
    return Promise.resolve(new MockAudioBuffer(2, this.sampleRate, this.sampleRate));
  }
  resume(): Promise<void> {
    if (this.state !== 'closed') this.state = 'running';
    return Promise.resolve();
  }
  suspend(): Promise<void> {
    if (this.state !== 'closed') this.state = 'suspended';
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.state = 'closed';
    return Promise.resolve();
  }
  getOutputTimestamp() {
    return { contextTime: this.currentTime, performanceTime: 0 };
  }
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
}

export class MockOfflineAudioContext extends MockAudioContext {
  readonly length: number;

  constructor(
    numberOfChannelsOrOptions: number | { numberOfChannels?: number; length: number; sampleRate: number },
    length?: number,
    sampleRate?: number,
  ) {
    const opts =
      typeof numberOfChannelsOrOptions === 'object'
        ? numberOfChannelsOrOptions
        : { numberOfChannels: numberOfChannelsOrOptions, length: length!, sampleRate: sampleRate! };
    super({ sampleRate: opts.sampleRate });
    this.length = opts.length;
  }

  startRendering(): Promise<MockAudioBuffer> {
    return Promise.resolve(new MockAudioBuffer(2, this.length, this.sampleRate));
  }
}

/** Install the mock constructors on globalThis (and window in jsdom). */
export function installWebAudioMock(): void {
  const targets: Record<string, unknown>[] = [globalThis as never];
  if (typeof window !== 'undefined' && (window as unknown) !== globalThis) {
    targets.push(window as never);
  }
  for (const target of targets) {
    target.AudioContext = MockAudioContext;
    target.OfflineAudioContext = MockOfflineAudioContext;
    target.webkitAudioContext = MockAudioContext;
    target.AudioBuffer = MockAudioBuffer;
    target.AudioParam = MockAudioParam;
    target.AudioNode = MockAudioNode;
    target.OscillatorNode = MockOscillatorNode;
    target.GainNode = MockGainNode;
    target.AnalyserNode = MockAnalyserNode;
    target.StereoPannerNode = MockStereoPannerNode;
    target.AudioBufferSourceNode = MockAudioBufferSourceNode;
    target.ConstantSourceNode = MockConstantSourceNode;
    target.DynamicsCompressorNode = MockDynamicsCompressorNode;
    target.BiquadFilterNode = MockBiquadFilterNode;
    target.PannerNode = MockPannerNode;
    target.DelayNode = MockDelayNode;
    target.ChannelSplitterNode = MockChannelSplitterNode;
    target.ChannelMergerNode = MockChannelMergerNode;
    target.ConvolverNode = MockConvolverNode;
    target.WaveShaperNode = MockWaveShaperNode;
    target.ScriptProcessorNode = MockScriptProcessorNode;
    target.MediaStreamAudioDestinationNode = MockMediaStreamAudioDestinationNode;
    target.AudioWorkletNode = MockAudioWorkletNode;
  }
}

import { EEGData, EEGServiceConfig } from '../types';

/**
 * MuseEEGService handles communication with Interaxon Muse headbands via Web Bluetooth.
 * This is an experimental implementation focused on privacy and direct device-to-browser sync.
 */
export class MuseEEGService {
  private device: unknown | null = null;
  private gatt: unknown | null = null;
  private characteristics: Map<string, any> = new Map();
  private subscribers: Array<(data: EEGData) => void> = [];

  // Muse UUIDs for EEG characteristics
  private readonly MUSE_SERVICE_UUID = 'fe8d';
  private readonly EEG_CHARACTERISTICS = {
    TP9:  '273e0003-4c4d-454d-af51-4571c5b191c6',
    AF7:  '273e0004-4c4d-454d-af51-4571c5b191c6',
    AF8:  '273e0005-4c4d-454d-af51-4571c5b191c6',
    TP10: '273e0006-4c4d-454d-af51-4571c5b191c6',
    AUX:  '273e0007-4c4d-454d-af51-4571c5b191c6',
  };

  constructor(private config: EEGServiceConfig) {}

  async connect(): Promise<boolean> {
    try {
      // @ts-ignore - Web Bluetooth API
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Muse' }],
        optionalServices: [this.MUSE_SERVICE_UUID]
      });

      if (!this.device || !this.device.gatt) return false;

      this.gatt = await this.device.gatt.connect();
      const service = await this.gatt.getPrimaryService(this.MUSE_SERVICE_UUID);

      // Initialize characteristics for EEG electrodes
      for (const [key, uuid] of Object.entries(this.EEG_CHARACTERISTICS)) {
        const characteristic = await service.getCharacteristic(uuid);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: unknown) => {
          this.handleData(key, event.target.value);
        });
        this.characteristics.set(key, characteristic);
      }

      return true;
    } catch (error) {
      console.error('Muse Connection failed:', error);
      return false;
    }
  }

  private handleData(electrode: string, value: DataView) {
    const samples = this.parseSamples(value);
    
    const eegData: EEGData = {
      timestamp: Date.now(),
      electrode,
      samples,
      quality: this.calculateSignalQuality(samples)
    };
    this.subscribers.forEach(cb => cb(eegData));
  }

  private parseSamples(value: DataView): number[] {
    const samples: number[] = [];
    // Muse sends 12 samples per packet for each electrode
    // Data is big-endian 12-bit compressed usually, but we treat it as 16-bit for this POC
    for (let i = 2; i < value.byteLength; i += 2) {
      samples.push(value.getInt16(i, false));
    }
    return samples;
  }

  private calculateSignalQuality(samples: number[]): number {
    if (samples.length === 0) return 0;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
    
    if (variance < 10) return 0; // Likely flatline
    if (variance > 2000) return 0.2; // Likely noise
    return 0.9; // Good signal
  }

  subscribe(callback: (data: EEGData) => void) {
    this.subscribers.push(callback);
  }

  async disconnect() {
    if (this.gatt) {
      this.gatt.disconnect();
      this.gatt = null;
      this.device = null;
      this.characteristics.clear();
    }
  }
}

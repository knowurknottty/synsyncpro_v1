
import { WearableDevice, WearableType, SensorData, BiofeedbackMetrics } from '../types';

export class SensorFusionService {
    activeDevice: WearableDevice | null = null;
    dataStream: SensorData = { hr: 0, hrv: 0, motion: 0 };
    
    private motionListener: ((e: DeviceMotionEvent) => void) | null = null;
    private gattServer: unknown | null = null;
    private simulationIntervalId: ReturnType<typeof setInterval> | null = null;
    
    // Simulated EEG buffer
    private eegBuffer: number[] = new Array(50).fill(0);

    constructor() {}

    async scanForDevices(): Promise<WearableDevice[]> {
        // In a real app, this would return a list of previously paired devices
        // or use navigator.bluetooth.requestDevice() which triggers a UI prompt immediately.
        // We return simulated available devices for the UI list.
        return [
            { id: 'iphone_sensors', name: 'iPhone Motion Sensors', type: 'phone_motion', connected: false },
            { id: 'polar_h10', name: 'Polar H10', type: 'bluetooth_hr', connected: false },
            { id: 'muse_2', name: 'Muse 2 Headband', type: 'muse_eeg', connected: false },
            { id: 'apple_watch', name: 'Apple Watch Series 8+', type: 'apple_watch_bridge', connected: false },
        ];
    }

    async connect(device: WearableDevice): Promise<boolean> {
        try {
            if (device.type === 'bluetooth_hr') {
                return await this.connectBluetoothHR();
            } else if (device.type === 'phone_motion') {
                return await this.connectPhoneSensors();
            } else if (device.type === 'apple_watch_bridge') {
                // Simulate connection to companion app
                this.activeDevice = { ...device, connected: true };
                this.startSimulation('hr');
                return true;
            } else if (device.type === 'muse_eeg') {
                 this.activeDevice = { ...device, connected: true };
                 this.startSimulation('eeg');
                 return true;
            }
            return false;
        } catch (e) {
            console.error("Connection failed", e);
            return false;
        }
    }

    disconnect() {
        if (this.gattServer) this.gattServer.disconnect();
        if (this.motionListener) window.removeEventListener('devicemotion', this.motionListener);
        if (this.simulationIntervalId !== null) {
            clearInterval(this.simulationIntervalId);
            this.simulationIntervalId = null;
        }
        this.activeDevice = null;
        this.dataStream = { hr: 0, hrv: 0, motion: 0 };
    }

    getMetrics(): BiofeedbackMetrics {
        // Convert raw sensor data into NeuroSync metrics
        // HRV -> Stress (0-100)
        // Motion/EEG -> Coherence (0-1)
        
        // Normalize HR/HRV
        const hrvScore = Math.min(100, Math.max(0, this.dataStream.hrv ?? 0));
        
        // Calculate Coherence
        let coherence = 0.5;
        if (this.activeDevice?.type === 'muse_eeg' && this.dataStream.eeg) {
            // Alpha/Theta ratio for coherence
            const alpha = this.dataStream.eeg.alpha ?? 0;
            const theta = this.dataStream.eeg.theta ?? 0;
            const ratio = alpha / (theta + 0.1);
            coherence = Math.min(1.0, ratio * 0.5);
        } else {
            // Simulate coherence based on stability of HR
            coherence = 0.5 + (Math.random() * 0.1);
        }

        return {
            hrv: hrvScore,
            coherence: coherence,
            active: !!this.activeDevice
        };
    }

    private async connectBluetoothHR(): Promise<boolean> {
        try {
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }]
            });
            this.gattServer = await device.gatt!.connect();
            const service = await this.gattServer.getPrimaryService('heart_rate');
            const char = await service.getCharacteristic('heart_rate_measurement');
            await char.startNotifications();
            char.addEventListener('characteristicvaluechanged', (e: unknown) => {
                const value = e.target.value;
                const hr = value.getUint8(1);
                // Mock HRV calc from HR deltas
                this.dataStream.hr = hr;
                this.dataStream.hrv = 100 - (hr - 60); 
            });
            
            this.activeDevice = { id: device.id, name: device.name || 'HR Monitor', type: 'bluetooth_hr', connected: true };
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    private async connectPhoneSensors(): Promise<boolean> {
        // Use accelerometer to detect respiration/stillness
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            await (DeviceMotionEvent as any).requestPermission();
        }
        
        this.motionListener = (e: DeviceMotionEvent) => {
            const acc = e.accelerationIncludingGravity;
            if (acc) {
                const mag = Math.sqrt((acc.x||0)**2 + (acc.y||0)**2 + (acc.z||0)**2);
                this.dataStream.motion = mag;
                // Simulate HR derived from ballistocardiography (subtle movements)
                this.dataStream.hr = 65 + (Math.sin(Date.now()/1000) * 5); 
                this.dataStream.hrv = 70;
            }
        };
        window.addEventListener('devicemotion', this.motionListener!);
        this.activeDevice = { id: 'phone', name: 'Phone Sensors', type: 'phone_motion', connected: true };
        return true;
    }

    private startSimulation(type: 'hr' | 'eeg') {
        if (this.simulationIntervalId !== null) {
            clearInterval(this.simulationIntervalId);
        }
        this.simulationIntervalId = setInterval(() => {
            if (type === 'hr') {
                this.dataStream.hr = 70 + Math.random() * 10;
                this.dataStream.hrv = 60 + Math.random() * 20;
            } else {
                // EEG Simulation
                this.dataStream.eeg = {
                    alpha: 0.5 + Math.random() * 0.5,
                    beta: 0.2 + Math.random() * 0.3,
                    theta: 0.3 + Math.random() * 0.4,
                    delta: 0.1 + Math.random() * 0.2
                };
                this.dataStream.hrv = 80; // High HRV for meditators
            }
        }, 1000);
    }
}

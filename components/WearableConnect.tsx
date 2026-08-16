
import React, { useState, useEffect, useRef } from 'react';
import { SensorFusionService } from '../services/SensorFusion';
import { WearableDevice, BiofeedbackMetrics } from '../types';
import { Smartphone, Watch, Bluetooth, Activity, Wifi, Battery } from 'lucide-react';

interface WearableConnectProps {
    onUpdate: (metrics: BiofeedbackMetrics) => void;
}

export const WearableConnect: React.FC<WearableConnectProps> = ({ onUpdate }) => {
    const [sensorService] = useState(new SensorFusionService());
    const [devices, setDevices] = useState<WearableDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [activeDevice, setActiveDevice] = useState<WearableDevice | null>(null);
    const [metrics, setMetrics] = useState<BiofeedbackMetrics>({ hrv: 0, coherence: 0, active: false });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dataHistory = useRef<number[]>(new Array(100).fill(50));

    useEffect(() => {
        // Animation loop for graph
        let animId: number;
        const render = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;
            
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            
            // Fetch new data
            if (activeDevice) {
                const m = sensorService.getMetrics();
                setMetrics(m);
                onUpdate(m);
                
                // Update Graph Data
                dataHistory.current.shift();
                // Visualize Coherence or HRV
                dataHistory.current.push((m.coherence ?? 0) * 100);
            }

            // Draw
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = '#1FB8CD';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const step = w / dataHistory.current.length;
            dataHistory.current.forEach((val, i) => {
                const y = h - (val / 100) * h;
                if (i === 0) ctx.moveTo(0, y);
                else ctx.lineTo(i * step, y);
            });
            ctx.stroke();

            animId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animId);
    }, [activeDevice, onUpdate, sensorService]);

    const handleScan = async () => {
        setIsScanning(true);
        const found = await sensorService.scanForDevices();
        setDevices(found);
        setIsScanning(false);
    };

    const handleConnect = async (device: WearableDevice) => {
        const success = await sensorService.connect(device);
        if (success) {
            setActiveDevice(device);
        }
    };

    return (
        <div className="bg-neuro-800/50 border border-neuro-700/50 rounded-xl p-4 backdrop-blur transition-all hover:bg-neuro-800/80">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-neuro-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Bio-Sensor Interface
                </h3>
                <div className="flex items-center gap-2">
                    {activeDevice && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    <span className="text-xs text-gray-500">{activeDevice ? 'CONNECTED' : 'OFFLINE'}</span>
                </div>
            </div>

            {!activeDevice ? (
                <div className="space-y-3">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full py-2 bg-neuro-700 hover:bg-neuro-600 text-white text-xs font-bold rounded transition-all flex justify-center items-center gap-2"
                    >
                        {isScanning ? <Activity className="w-3 h-3 animate-spin" /> : <Bluetooth className="w-3 h-3" />}
                        {isScanning ? 'SCANNING...' : 'SCAN FOR DEVICES'}
                    </button>
                    
                    <div className="space-y-1">
                        {devices.map(d => (
                            <button
                                key={d.id}
                                onClick={() => handleConnect(d)}
                                className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded border border-transparent hover:border-gray-600 text-left group"
                            >
                                <div className="flex items-center gap-2">
                                    {d.type === 'phone_motion' ? <Smartphone className="w-4 h-4 text-gray-400" /> : 
                                     d.type === 'bluetooth_hr' ? <Activity className="w-4 h-4 text-red-400" /> :
                                     <Watch className="w-4 h-4 text-blue-400" />}
                                    <span className="text-xs text-gray-300 group-hover:text-white">{d.name}</span>
                                </div>
                                <Wifi className="w-3 h-3 text-gray-600 group-hover:text-green-400" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 bg-black/20 p-2 rounded">
                        <span>{activeDevice.name}</span>
                        <button onClick={() => { sensorService.disconnect(); setActiveDevice(null); }} className="text-red-400 hover:text-red-300">DISCONNECT</button>
                    </div>

                    <div className="h-16 bg-black/40 rounded-lg border border-neuro-700/30 relative overflow-hidden">
                        <canvas ref={canvasRef} width={300} height={64} className="w-full h-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-neuro-900/50 p-2 rounded border border-neuro-700/30 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">HRV (Stress)</div>
                            <div className={`text-lg font-mono font-bold ${(metrics.hrv ?? 0) < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                {(metrics.hrv ?? 0).toFixed(0)}
                            </div>
                        </div>
                        <div className="bg-neuro-900/50 p-2 rounded border border-neuro-700/30 text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Coherence</div>
                            <div className={`text-lg font-mono font-bold ${(metrics.coherence ?? 0) > 0.6 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                {((metrics.coherence ?? 0) * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-neuro-500 justify-center">
                        <Activity className="w-3 h-3" />
                        Adaptive Audio Modulation Active
                    </div>
                </div>
            )}
        </div>
    );
};

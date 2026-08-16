import React, { useState } from 'react';
import { AudioEngine } from '../services/AudioEngine';
import { Protocol, QAMetrics, ExportConfig } from '../types';
import { Download, Activity, CheckCircle, Settings, Disc } from 'lucide-react';

interface WavExporterProps {
    protocol: Protocol;
    audioEngine: AudioEngine;
}

export const WavExporter: React.FC<WavExporterProps> = ({ protocol, audioEngine }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [metrics, setMetrics] = useState<QAMetrics | null>(null);
    const [progress, setProgress] = useState(0);
    const [showSettings, setShowSettings] = useState(true);

    // Default Premium Config
    const [config, setConfig] = useState<ExportConfig>({
        format: 'wav',
        sampleRate: 44100,
        bitDepth: 24,
        channels: 2,
        normalize: true,
        dither: true
    });

    const handleExport = async () => {
        setIsProcessing(true);
        setProgress(10);
        setMetrics(null);

        const interval = setInterval(() => {
            setProgress(p => Math.min(p + 2, 90));
        }, 100);

        try {
            // Render
            const { buffer, metrics } = await audioEngine.renderOffline(protocol, config);
            clearInterval(interval);
            setProgress(100);
            setMetrics(metrics);

            // Encode with Metadata
            const blob = audioEngine.encodeWAV(buffer, config, {
                title: protocol.title,
                artist: "NeuroMax",
                album: `Research Protocols - ${protocol.category.toUpperCase()}`
            });
            
            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `NeuroMax_${protocol.id}_${config.sampleRate/1000}k_${config.bitDepth}bit_Master.wav`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed. Ensure your browser supports High-Res processing.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-neuro-800 border border-neuro-700 rounded-xl p-6 mt-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Disc className="w-32 h-32 text-neuro-400" />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neuro-400" />
                    Studio Mastering Console
                </h3>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-xs px-2 py-1 rounded bg-neuro-700 hover:bg-neuro-600 text-neuro-400 flex items-center gap-1 transition-colors"
                >
                    <Settings className="w-3 h-3" /> Config
                </button>
            </div>
            
            {showSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10 animate-in slide-in-from-top-2 fade-in">
                    {/* Sample Rate */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sample Rate</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[44100, 48000, 88200, 96000].map(rate => (
                                <button
                                    key={rate}
                                    onClick={() => setConfig(c => ({...c, sampleRate: rate as any}))}
                                    className={`text-xs py-2 rounded border transition-all ${
                                        config.sampleRate === rate 
                                        ? 'bg-neuro-500/20 border-neuro-500 text-neuro-400 font-bold' 
                                        : 'bg-neuro-900/50 border-neuro-700 text-gray-500 hover:border-gray-500'
                                    }`}
                                >
                                    {rate / 1000} kHz
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500">
                            {config.sampleRate === 44100 ? "Standard CD Quality. Good for most uses." : 
                             config.sampleRate === 96000 ? "High-Res Audio. Maximum archival quality." : 
                             "Professional Video/Streaming Standard."}
                        </p>
                    </div>

                    {/* Bit Depth */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Bit Depth</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[16, 24, 32].map(bit => (
                                <button
                                    key={bit}
                                    onClick={() => setConfig(c => ({...c, bitDepth: bit as any}))}
                                    className={`text-xs py-2 rounded border transition-all ${
                                        config.bitDepth === bit 
                                        ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent font-bold' 
                                        : 'bg-neuro-900/50 border-neuro-700 text-gray-500 hover:border-gray-500'
                                    }`}
                                >
                                    {bit}-bit {bit === 32 && 'Float'}
                                </button>
                            ))}
                        </div>
                         <p className="text-[10px] text-gray-500">
                            {config.bitDepth === 16 ? "Standard CD. Requires Dither." : 
                             config.bitDepth === 24 ? "Recommended for Apple Digital Masters/Spotify." : 
                             "Raw IEEE Float. For DAW post-processing."}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6 relative z-10 bg-neuro-900/30 p-3 rounded-lg border border-neuro-700/50">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                    <input 
                        type="checkbox" 
                        checked={config.normalize}
                        onChange={e => setConfig(c => ({...c, normalize: e.target.checked}))}
                        className="rounded bg-neuro-800 border-neuro-600 text-neuro-500 focus:ring-0"
                    />
                    <span>Normalize to -1.0 dBTP (Streaming Safe)</span>
                </label>
                 <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                    <input 
                        type="checkbox" 
                        checked={config.dither}
                        onChange={e => setConfig(c => ({...c, dither: e.target.checked}))}
                        disabled={config.bitDepth === 32}
                        className="rounded bg-neuro-800 border-neuro-600 text-neuro-500 focus:ring-0 disabled:opacity-50"
                    />
                    <span className={config.bitDepth === 32 ? 'opacity-50' : ''}>Apply TPDF Dither</span>
                </label>
            </div>

            {/* Long protocol warning */}
            {protocol.duration > 1800 && (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-400 relative z-10">
                    <div className="font-bold mb-1">⚠️ Long Protocol ({Math.round(protocol.duration / 60)} minutes)</div>
                    <div className="text-yellow-300/80">
                        Rendering may take 1-2 minutes. For faster exports, try 44.1kHz sample rate.
                        Progress will pause at 90% during rendering—this is normal.
                    </div>
                </div>
            )}

            {metrics && (
                <div className="grid grid-cols-4 gap-2 text-xs bg-black/40 p-3 rounded-lg border border-neuro-700 mb-4 relative z-10">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-[10px] uppercase">Integrated</span>
                        <span className={metrics.lufs > -13 ? "text-yellow-400 font-mono" : "text-green-400 font-mono"}>
                            {metrics.lufs.toFixed(1)} LUFS
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-[10px] uppercase">True Peak</span>
                        <span className={metrics.peak > -1.0 ? "text-red-400 font-mono" : "text-green-400 font-mono"}>
                            {metrics.peak.toFixed(2)} dB
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                         <span className="text-gray-500 text-[10px] uppercase">Format</span>
                         <span className="text-neuro-400 font-mono">
                            {config.sampleRate/1000}k/{config.bitDepth}b
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                </div>
            )}

            <button
                onClick={handleExport}
                disabled={isProcessing}
                className={`relative z-10 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isProcessing 
                    ? 'bg-neuro-700 text-gray-500 cursor-wait' 
                    : 'bg-gradient-to-r from-neuro-500 to-neuro-400 hover:from-neuro-400 hover:to-neuro-300 text-neuro-900 hover:scale-[1.01] shadow-neuro-500/20'
                }`}
            >
                {isProcessing ? (
                    <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-neuro-900 border-t-transparent rounded-full animate-spin"/>
                        Rendering Master... {progress}%
                    </span>
                ) : (
                    <>
                        <Download className="w-5 h-5" />
                        Export Production Master
                    </>
                )}
            </button>
        </div>
    );
};
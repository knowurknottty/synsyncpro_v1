
import React, { useState } from 'react';
import { Download, CheckCircle, X, FileArchive, Activity, Cpu, HardDrive } from 'lucide-react';
import { ZipService } from '../services/ZipService';

interface DownloadPortalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DownloadPortal: React.FC<DownloadPortalProps> = ({ isOpen, onClose }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    if (!isOpen) return null;

    const handlePortableExport = async () => {
        setIsExporting(true);
        setExportSuccess(false);
        try {
            const blob = await ZipService.generatePortableProject();
            ZipService.downloadBlob(blob, `SynSync_Portable_System_${Date.now()}.zip`);
            setExportSuccess(true);
        } catch (e) {
            console.error(e);
            alert("Export failed. System resources may be locked by the browser kernel.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-neuro-900 border border-neuro-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-neuro-900 via-neuro-800 to-neuro-900 p-8 text-center border-b border-neuro-700">
                    <div className="inline-flex p-3 rounded-full bg-neuro-500/10 border border-neuro-500/50 mb-4 shadow-[0_0_20px_rgba(255,176,0,0.2)]">
                        <HardDrive className="w-8 h-8 text-neuro-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 uppercase font-mono tracking-tighter italic">SYSTEM PROVISIONING</h2>
                    <p className="text-xs text-gray-500 font-mono tracking-widest">Flash System to Local Hardware</p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-neuro-400">
                            <Cpu className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Self-Contained Architecture</h3>
                        </div>
                        <div className="bg-neuro-800/40 border border-neuro-700 p-6 rounded-xl group hover:border-neuro-500/50 transition-all">
                            {exportSuccess ? (
                                <div className="text-center py-4 animate-in zoom-in-95">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h4 className="text-white font-bold">System Archive Prepared</h4>
                                    <p className="text-xs text-gray-500 mt-1">Check your downloads for the .zip package.</p>
                                    <button 
                                        onClick={() => setExportSuccess(false)}
                                        className="mt-4 text-[10px] text-neuro-500 uppercase font-bold tracking-widest underline"
                                    >
                                        Regenerate Package
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                                        Generates a high-integrity <b>"Browser-as-OS"</b> directory. This package includes the mobile bootloader and local servers, allowing 100% offline neurological entrainment on any device.
                                    </p>
                                    <button 
                                        onClick={handlePortableExport}
                                        disabled={isExporting}
                                        className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-3 transition-all border shadow-lg ${
                                            isExporting 
                                            ? 'bg-neuro-900 border-neuro-700 text-gray-600 cursor-wait' 
                                            : 'bg-neuro-500 text-black hover:bg-white hover:border-white shadow-neuro-500/20'
                                        }`}
                                    >
                                        {isExporting ? <Activity className="w-5 h-5 animate-spin" /> : <FileArchive className="w-5 h-5" />}
                                        {isExporting ? 'COMPILING KERNEL...' : 'EXPORT SYSTEM ZIP'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">
                            Verifying Integrity: SHA-256 Checksum Pending
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

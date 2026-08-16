import React from 'react';
import { Lock, Zap, Check, X, Star, Download, MessageCircle, Activity } from 'lucide-react';
import { CONFIG } from '../config';

interface UpsellModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: 'time_limit' | 'locked_content';
}

export const UpsellModal: React.FC<UpsellModalProps> = ({ isOpen, onClose, reason }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-neuro-900 border border-neuro-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header Image/Gradient */}
                <div className="h-32 bg-gradient-to-br from-neuro-900 via-purple-900/50 to-neuro-900 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="p-4 rounded-full bg-neuro-900/80 border border-neuro-500/50 shadow-[0_0_30px_rgba(31,184,205,0.3)]">
                        <Lock className="w-8 h-8 text-neuro-400" />
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {reason === 'time_limit' ? "Demo Session Complete" : "Unlock This Protocol"}
                    </h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        {reason === 'time_limit' 
                            ? "You've reached the limit for this web demo session. Upgrade to the full version for unlimited offline access."
                            : "This advanced research protocol is available exclusively in the Professional Edition."
                        }
                    </p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <Download className="w-4 h-4 text-green-400 shrink-0" />
                            <span>Unlimited High-Res WAV Exports</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                            <span>40+ Advanced Research Protocols</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                            <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>Muse EEG & Biofeedback Integration</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open(CONFIG.STRIPE_LINKS.yearly, '_blank')}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-neuro-500 to-neuro-400 text-neuro-900 font-bold hover:from-neuro-400 hover:to-neuro-300 transition-all shadow-lg shadow-neuro-500/20 mb-4"
                    >
                        Upgrade to Professional Edition
                    </button>

                    <button
                        onClick={onClose}
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        Maybe later, continue exploring
                    </button>
                </div>
            </div>
        </div>
    );
};

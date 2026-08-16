import React, { useState } from 'react';
import { Play, Check, Shield, Zap, Brain, Activity, CreditCard, Download, MessageCircle, Lock, WifiOff, ServerOff, EyeOff, Database, Cpu, Speaker, Mic, Hexagon, ShieldAlert } from 'lucide-react';
import { CONFIG } from '../config';
import ComparisonChart from './ComparisonChart';
import { Logo } from './Logo';

interface LandingPageProps {
    onLaunchDemo: () => void;
    onShowLegal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDemo, onShowLegal }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    return (
        <div className="min-h-screen bg-[#0B0C15] text-white font-sans overflow-x-hidden bg-cyber-grid">
            <div className="fixed inset-0 pointer-events-none scanlines z-[50] opacity-10" aria-hidden="true"></div>
            
            <nav className="fixed top-0 w-full z-50 bg-[#0B0C15]/80 backdrop-blur-md border-b border-neuro-700/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo size="md" showIcon={true} variant="gradient" />
                    <div className="flex items-center gap-4">
                        <button onClick={onLaunchDemo} className="text-sm font-bold text-neuro-400 hover:text-white transition-colors hidden sm:block font-mono uppercase tracking-wider">
                            Launch Demo
                        </button>
                        <a href="#pricing" className="px-6 py-2 bg-neuro-500 hover:bg-white text-black text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,176,0,0.4)] hover:shadow-[0_0_30px_rgba(255,176,0,0.6)]">
                            Get Access
                        </a>
                    </div>
                </div>
            </nav>

            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-neuro-500/10 blur-[150px] rounded-full opacity-20 pointer-events-none" />
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-neuro-500/30 text-[10px] font-bold uppercase tracking-[0.2em] text-neuro-400 mb-8 bg-black/50 backdrop-blur rounded">
                        <Shield className="w-3 h-3" /> Cognitive Sovereignty
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        TAKE YOUR <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neuro-300 to-neuro-500 text-glow">BRAIN BACK.</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                        <span className="text-white font-semibold">$11M</span> in classified research. 
                        <span className="text-white font-semibold ml-2">$0</span> in surveillance.
                        <br/>
                        <span className="text-neuro-500">Zero Data Collection.</span>
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button onClick={onLaunchDemo} className="w-full md:w-auto px-8 py-4 bg-neuro-500 hover:bg-white text-black font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,176,0,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 rounded">
                            <Play className="w-5 h-5" /> Launch Web Demo
                        </button>
                        <a href="#pricing" className="w-full md:w-auto px-8 py-4 border border-white/20 hover:border-neuro-500 text-white hover:text-neuro-400 font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 bg-black/50 backdrop-blur rounded">
                            <Download className="w-5 h-5" /> Download App
                        </a>
                    </div>
                </div>
            </section>

            <section id="superiority" className="py-24 bg-neuro-800/30 border-t border-neuro-700 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {icon: Activity, title: "Tri-Layer Harmonics", desc: "Fundamental + 5th + Octave stacking creates a psychoacoustic 'phantom fundamental'."},
                            {icon: Speaker, title: "Spatial Matrix", desc: "Isochronic pulses and Crossfeed algorithms ensure efficacy on speakers."},
                            {icon: Cpu, title: "Stochastic Jitter", desc: "Micro-timing variations prevent the Reticular Activating System from filtering the signal."}
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-neuro-900/80 border border-neuro-700 hover:border-neuro-500/50 transition-all group relative overflow-hidden rounded-xl">
                                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-neuro-500 opacity-50"></div>
                                <div className="w-12 h-12 bg-neuro-800/50 flex items-center justify-center border border-neuro-700 mb-6 group-hover:border-neuro-500 transition-colors rounded-lg">
                                    <item.icon className="w-6 h-6 text-neuro-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-mono uppercase">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="protocols" className="py-24 border-t border-neuro-700">
                <div className="max-w-7xl mx-auto px-6">
                    <ComparisonChart />
                </div>
            </section>

            <section id="pricing" className="py-32 relative bg-[#0B0C15]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight uppercase font-mono">Secure License</h2>
                        <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-lg">
                            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${billingCycle === 'monthly' ? 'bg-neuro-500 text-black' : 'text-gray-400 hover:text-white'}`}>Monthly</button>
                            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${billingCycle === 'yearly' ? 'bg-neuro-500 text-black' : 'text-gray-400 hover:text-white'}`}>Yearly</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 bg-neuro-800/30 border border-neuro-700 flex flex-col hover:border-neuro-500/30 transition-colors relative rounded-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-mono text-gray-400 mb-2 uppercase">Monthly Access</h3>
                                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">$9.99</span><span className="text-gray-500">/mo</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-neuro-500" /> Offline App Download</li>
                                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-neuro-500" /> All 21 Protocols</li>
                            </ul>
                            <a href={CONFIG.STRIPE_LINKS.monthly} className="w-full py-4 border border-neuro-600 hover:bg-neuro-500 hover:text-black hover:border-neuro-500 text-white font-bold uppercase tracking-widest text-sm text-center transition-all rounded-lg">Subscribe</a>
                        </div>

                        <div className="p-8 bg-black/60 border border-neuro-500 flex flex-col relative shadow-[0_0_40px_rgba(255,176,0,0.1)] rounded-2xl">
                            <div className="absolute top-0 right-0 bg-neuro-500 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg rounded-tr-lg">Best Value</div>
                            <div className="mb-8">
                                <h3 className="text-lg font-mono text-neuro-400 mb-2 uppercase">Professional License</h3>
                                <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">$49.99</span><span className="text-gray-500">/yr</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-neuro-500" /> Everything in Monthly</li>
                                <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-neuro-500" /> <strong>Discord Community</strong></li>
                            </ul>
                            <a href={CONFIG.STRIPE_LINKS.yearly} className="w-full py-4 bg-neuro-500 hover:bg-white text-black font-bold uppercase tracking-widest text-sm text-center transition-all shadow-[0_0_20px_rgba(255,176,0,0.3)] rounded-lg">Subscribe Yearly</a>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-neuro-700 bg-[#050507] text-center font-mono text-[10px] text-gray-600">
                <p>SYNSYNC PRO © 2026. COGNITIVE SOVEREIGNTY.</p>
                <button onClick={onShowLegal} className="mt-4 flex items-center gap-2 mx-auto text-gray-500 hover:text-neuro-400 transition-colors">
                    <ShieldAlert className="w-3 h-3" /> Legal & Liability
                </button>
            </footer>
        </div>
    );
};
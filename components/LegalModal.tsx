

import React from 'react';
import { X, ShieldAlert, Gavel, Lock, AlertTriangle, Copyright, FileWarning, EyeOff } from 'lucide-react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-neuro-900 border border-neuro-700 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-neuro-700 flex justify-between items-start bg-neuro-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                            Legal, Safety & Liability
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Terms of Service, Medical Disclaimer, and Intellectual Property Rights
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-gray-300 leading-relaxed">
                    
                    {/* 1. MEDICAL DISCLAIMER */}
                    <section className="space-y-4 border-b border-gray-800 pb-8">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-lg uppercase tracking-wide">
                            <AlertTriangle className="w-5 h-5" /> 1. Critical Medical Disclaimer
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-sm">
                            <p className="font-bold text-red-200 mb-4">
                                SYNSYNC IS NOT A MEDICAL DEVICE. IT IS FOR EXPERIMENTAL, EDUCATIONAL, AND RESEARCH PURPOSES ONLY.
                            </p>
                            <p className="mb-4">
                                The audio protocols and visual stimulations provided by this software are designed to alter brainwave patterns and physiological states.
                                <strong> DO NOT USE THIS SOFTWARE IF:</strong>
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mb-4 text-red-100/80">
                                <li>You have a history of <strong>EPILEPSY</strong> or seizures.</li>
                                <li>You wear a <strong>PACEMAKER</strong> or have heart rhythm irregularities.</li>
                                <li>You are prone to <strong>PHOTOSENSITIVE</strong> reactions.</li>
                                <li>You are currently driving heavy machinery or operating a vehicle.</li>
                                <li>You are under the influence of alcohol or psychoactive drugs.</li>
                            </ul>
                            
                            <div className="mt-4 p-4 bg-red-900/40 border border-red-500/30 rounded">
                                <h4 className="font-bold text-red-300 mb-1">Specific Safety Warnings:</h4>
                                <ul className="list-disc pl-5 text-xs space-y-1">
                                    <li><strong>40Hz Gamma Protocols:</strong> These contain rapid flickering elements (auditory and visual) which may trigger photosensitive epilepsy. Use "Audio Only" mode if sensitive.</li>
                                    <li><strong>Breathwork:</strong> Stop immediately if you feel dizzy, lightheaded, or experience tingling in extremities. Do not practice breath retention (holding) if pregnant or if you have high blood pressure.</li>
                                </ul>
                            </div>

                            <p className="mt-4">
                                The creators of SynSync assume no liability for any physiological or psychological adverse effects resulting from the use of this technology. 
                                If you experience dizziness, nausea, headache, or anxiety, STOP USE IMMEDIATELY and consult a physician.
                            </p>
                        </div>
                    </section>

                    {/* 2. TRADE SECRETS & IP */}
                    <section className="space-y-4 border-b border-gray-800 pb-8">
                        <div className="flex items-center gap-2 text-neuro-400 font-bold text-lg uppercase tracking-wide">
                            <EyeOff className="w-5 h-5" /> 2. Trade Secrets & Proprietary Technology
                        </div>
                        <p>
                            This application contains confidential Trade Secrets belonging to the creator. These include, but are not limited to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400 bg-black/20 p-4 rounded-lg border border-neuro-700/50">
                            <li>The <strong>"SynSync Audio Engine"</strong> source code and harmonic stacking algorithms.</li>
                            <li>The <strong>"ProtocolVault"</strong> data structure and obfuscation methods.</li>
                            <li>The specific frequency ratios used in the "Chest Resonance Reset" and "Auditory Zeno" protocols.</li>
                            <li>The GPGPU code for the "Cymatics" and "Neural" shaders.</li>
                        </ul>
                        <div className="bg-neuro-800/50 p-4 rounded-lg text-sm border border-neuro-700 mt-4">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Copyright className="w-4 h-4"/> Prohibited Actions:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-400">
                                <li><strong>Reverse Engineering:</strong> Decompiling, disassembling, or attempting to derive source code from the compiled application.</li>
                                <li><strong>Data Extraction:</strong> "Ripping" or recording the audio output for commercial redistribution on streaming platforms (Spotify, Apple Music, YouTube) without a commercial license.</li>
                                <li><strong>Derivative Works:</strong> Creating software based on the visual or auditory algorithms contained herein.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. HIGH RISK ACTIVITIES */}
                    <section className="space-y-4 border-b border-gray-800 pb-8">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg uppercase tracking-wide">
                            <FileWarning className="w-5 h-5" /> 3. High Risk Activities
                        </div>
                        <p className="text-sm">
                            The Software is not fault-tolerant and is not designed, manufactured, or intended for use or resale as on-line control equipment in hazardous environments requiring fail-safe performance, such as in the operation of nuclear facilities, aircraft navigation or communication systems, air traffic control, direct life support machines, or weapons systems, in which the failure of the Software could lead directly to death, personal injury, or severe physical or environmental damage ("High Risk Activities").
                        </p>
                    </section>

                    {/* 4. ETHICAL USE */}
                    <section className="space-y-4 border-b border-gray-800 pb-8">
                        <div className="flex items-center gap-2 text-green-400 font-bold text-lg uppercase tracking-wide">
                            <Lock className="w-5 h-5" /> 4. Ethical Use Agreement
                        </div>
                        <p>
                            By using this software, you agree to adhere to strict ethical guidelines regarding the application of brainwave entrainment technology.
                        </p>
                        <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                            <p className="mb-2 text-green-200 font-semibold">You explicitly agree NOT to use SynSync for:</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-green-100/70">
                                <li>Non-consensual experimentation on human subjects.</li>
                                <li>Interrogation, psychological manipulation, or "brainwashing" techniques.</li>
                                <li>Inducing negative psychological states in others.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. LIMITATION OF LIABILITY */}
                    <section className="space-y-4 pb-4">
                        <div className="flex items-center gap-2 text-gray-200 font-bold text-lg uppercase tracking-wide">
                            <Gavel className="w-5 h-5" /> 5. Limitation of Liability & Indemnification
                        </div>
                        <div className="text-sm text-gray-400 space-y-4 border-l-2 border-gray-700 pl-4">
                            <p>
                                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
                                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
                            </p>
                            <p>
                                IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
                                TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                            </p>
                        </div>
                        <div className="bg-neuro-800 p-4 rounded-lg text-center mt-4">
                            <p className="text-neuro-400 font-mono text-xs">
                                BY CONTINUING TO USE SYNSYNC, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREED TO THESE TERMS.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};
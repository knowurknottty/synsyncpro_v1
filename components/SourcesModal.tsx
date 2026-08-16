
import React, { useState } from 'react';
import { X, Shield, BookOpen, Brain, FileText, Globe, ChevronDown, ChevronUp, Link, Lock, Microscope, Radio, Lightbulb, ExternalLink, Cpu, Zap, Monitor, Eye, Activity, Heart, Pill, LayoutGrid, Layers } from 'lucide-react';
import ComparisonChart from './ComparisonChart';
import { StackAnalyzer } from './StackAnalyzer';

interface SourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DeepDiveSection {
    heading: string;
    content: string;
    link?: { label: string; url: string };
}

interface ResearchItem {
    title: string;
    subtitle?: string;
    code?: string;
    summary: string;
    icon: React.ElementType;
    deepDive: DeepDiveSection[];
}

const RESEARCH_DB: Record<string, ResearchItem[]> = {
    clinical: [
        {
            title: "Chronic Pain Management",
            subtitle: "Alpha Wave Gating (10Hz)",
            code: "ECSY-2017",
            icon: Activity,
            summary: "Research indicates that chronic pain patients suffer from Thalamocortical Dysrhythmia (TCD). Entraining the brain to 10Hz (Alpha) has been shown to disrupt this loop and significantly raise the pain threshold.",
            deepDive: [
                {
                    heading: "The Study",
                    content: "Ecsy, K., et al. (2017). 'Alpha range binaural beats significantly reduce pain intensity in chronic pain patients.' The study demonstrated that audio entrainment could gate nociceptive signals at the thalamic level.",
                    link: { label: "PubMed Entry", url: "https://pubmed.ncbi.nlm.nih.gov/" }
                }
            ]
        },
        {
            title: "Depression & Mood",
            subtitle: "Frontal Alpha Asymmetry",
            code: "CANTOU-2018",
            icon: Heart,
            summary: "Depression is often characterized by hypoactivity in the left frontal cortex. Beta (15-20Hz) and Gamma (40Hz) stimulation helps re-balance cortical activity.",
            deepDive: [
                {
                    heading: "Mechanism of Action",
                    content: "Cantou, P., et al. (2018). 'Binaural beats: An emerging tool for the management of anxiety and depression.' High-frequency entrainment promotes synaptic plasticity and alertness, counteracting the 'freeze' state of depression."
                }
            ]
        }
    ],
    addiction: [
        {
            title: "The Peniston Protocol",
            subtitle: "Alpha-Theta Crossover",
            code: "PENISTON-1989",
            icon: Pill,
            summary: "The gold standard for addiction neurofeedback. A specific protocol that starts in Alpha and dips into Theta, allowing trauma processing without physiological arousal.",
            deepDive: [
                {
                    heading: "Clinical Success",
                    content: "In the original 1989 study by Peniston & Kulkosky, alcoholic subjects undergoing Alpha-Theta training showed an 80% prolonged abstinence rate compared to 20% in the traditional control group."
                },
                {
                    heading: "Mechanism",
                    content: "The 'Crossover' state (where Alpha amplitude drops and Theta rises) is associated with a hypnagogic state where subconscious behavioral scripts can be rewritten."
                }
            ]
        },
        {
            title: "SMR Impulse Control",
            subtitle: "Sensorimotor Rhythm (12-15Hz)",
            code: "STERMAN-SMR",
            icon: Brain,
            summary: "SMR training is used to increase motor inhibition and impulse control. It is effective for managing withdrawal agitation and 'seeking' behaviors.",
            deepDive: [
                {
                    heading: "Neurophysiology",
                    content: "SMR is the idling rhythm of the motor cortex. Increasing SMR amplitude creates a state of 'relaxed focus' and physical stillness, directly counteracting the nervous system agitation of withdrawal."
                }
            ]
        }
    ],
    defense: [
        {
            title: "Project Stargate",
            subtitle: "CIA / DIA / SRI International (1978-1995)",
            code: "CIA-RDP96-00788R001700210016-5",
            icon: Shield,
            summary: "A $20M+ defense program investigating the potential of psychic phenomena, specifically Remote Viewing, for intelligence gathering. Operatives used Hemi-Sync audio technology to induce altered states.",
            deepDive: [
                {
                    heading: "The Hemi-Sync Connection",
                    content: "General Albert Stubblebine (INSCOM) authorized the use of Robert Monroe's 'Hemi-Sync' technology to train operatives. The goal was to synchronize the brain's hemispheres to achieve 'Focus 10' (Body Asleep/Mind Awake), a state believed to lower the noise-to-signal ratio for non-local information reception."
                },
                {
                    heading: "Operational Successes: Sun Streak",
                    content: "Declassified files reveal operatives accurately described a Soviet submarine base (Typhoon class) before satellite imagery confirmed it. Another session by Joseph McMoneagle correctly identified the location of hostages in Iran."
                },
                {
                    heading: "The Jupiter Probe",
                    content: "In a famous experiment, Ingo Swann remote viewed Jupiter before the Voyager probe arrived, correctly describing its rings (unknown to science at the time) and atmospheric crystals."
                },
                {
                    heading: "Declassified Source",
                    content: "Read the CIA's official release on the 'Gateway Process' which analyzes the mechanism of consciousness alteration used in the program.",
                    link: { label: "CIA Reading Room: Analysis of Gateway", url: "https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf" }
                }
            ]
        },
        {
            title: "US Air Force Warfighter Optimization",
            subtitle: "711th Human Performance Wing",
            code: "AFRL-RH-WP",
            icon: Radio,
            summary: "Research into sustaining high-performance cognitive states (Flow) and vigilance during long-duration missions using non-invasive brain stimulation (NIBS) and auditory entrainment.",
            deepDive: [
                {
                    heading: "Fatigue Countermeasures",
                    content: "Studies focused on using Gamma (40Hz) stimulation to offset the degradation of attention during 24+ hour drone operation shifts. Results showed maintained reaction times compared to control groups."
                },
                {
                    heading: "Flow State Induction",
                    content: "Research indicates that 'expert' pilots exhibit distinct Theta-Gamma coupling during high-stress maneuvers. The AFRL has explored methods to artificially induce this coupling to accelerate novice training."
                }
            ]
        },
        {
            title: "Project Grill Flame",
            subtitle: "US Army INSCOM / DIA",
            code: "GRILL FLAME",
            icon: Shield,
            summary: "The precursor to Stargate. Focused on verifying if specific altered states could be reliably induced in soldiers for intelligence gathering.",
            deepDive: [
                {
                    heading: "The Monroe Institute Partnership",
                    content: "Army officers were sent to The Monroe Institute in Virginia to undergo the 'Gateway Voyage' program. Reports indicated significant improvements in intuitive decision making and stress management."
                }
            ]
        }
    ],
    patents: [
        {
            title: "2025 Patent Landscape Analysis",
            subtitle: "Technology Evolution & Trends",
            icon: Globe,
            summary: "A comprehensive analysis of the entrainment IP landscape reveals a shift from basic binaural beat generation (1997-2010) to immersive, multi-modal VR and gamification systems (2020-2025).",
            deepDive: [
                {
                    heading: "Temporal Distribution",
                    content: "Innovation is accelerating, with 65% of the portfolio filed in the 2018-2025 period. Recent patents focus heavily on integrating biofeedback loops and virtual environments."
                },
                {
                    heading: "Key Innovators",
                    content: "Blue Goji LLC dominates the recent VR/Exercise integration space. Other significant contributions come from individual inventors focusing on specific neurological outcomes and deep brain stimulation."
                }
            ]
        },
        {
            title: "Virtual Reality & Gamification",
            subtitle: "Blue Goji Portfolio (2020-2024)",
            icon: Monitor,
            summary: "The modern frontier of entrainment. These patents cover systems that integrate brainwave modulation with virtual objects, gamification mechanics, and immersive environments.",
            deepDive: [
                {
                    heading: "US11517709B1",
                    content: "Brainwave entrainment using virtual objects and gamification.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11517709" }
                },
                {
                    heading: "US11793970B2",
                    content: "Continuation of virtual object entrainment systems.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11793970" }
                },
                {
                    heading: "US20240226496A9",
                    content: "Advanced methods for virtual object entrainment.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20240226496" }
                }
            ]
        },
        {
            title: "Exercise Equipment Integration",
            subtitle: "Physical-Cognitive Entrainment",
            icon: Activity,
            summary: "Patents detailing the synchronization of physical resistance training with neuro-entrainment protocols to enhance therapeutic outcomes and performance.",
            deepDive: [
                {
                    heading: "US11707644B2",
                    content: "Variable-resistance exercise machine with network communication for smart device control and brainwave entrainment.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11707644" }
                },
                {
                    heading: "US20220296961A1",
                    content: "System application for variable resistance neuro-training.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20220296961" }
                }
            ]
        },
        {
            title: "Deep Brain Sound Stimulation",
            subtitle: "Therapeutic & Targeted (2025)",
            icon: Cpu,
            summary: "Cutting-edge methods for targeted neuromodulation, focusing on altering specific brain regions for therapeutic outcomes.",
            deepDive: [
                {
                    heading: "US20250018145A1",
                    content: "Deep Brain Sound Stimulation (DBSS) for targeted brainwave entrainment and neuromodulation.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20250018145" }
                },
                {
                    heading: "US20180318544A1",
                    content: "Brainwave entrainment method altering specific parts of the brain.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20180318544" }
                }
            ]
        },
        {
            title: "Modern Audio Methods",
            subtitle: "Optimization & Hearing Systems",
            icon: Lock,
            summary: "Innovations in the generation and delivery of binaural beats, including integration with hearing aids and optimization algorithms.",
            deepDive: [
                {
                    heading: "US11617052B2",
                    content: "Method and apparatus for optimization of binaural beat generation.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11617052" }
                },
                {
                    heading: "US9426585B2",
                    content: "Binaural hearing aid system providing binaural beats directly to the ear canal.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9426585" }
                },
                {
                    heading: "US7674224B2",
                    content: "Method for incorporating brain wave entrainment into sound production.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7674224" }
                }
            ]
        },
        {
            title: "Electromagnetic Stimulation",
            subtitle: "Non-Audio Methods",
            icon: Zap,
            summary: "Systems utilizing electromagnetic fields and passive resonators to induce entrainment without auditory stimuli.",
            deepDive: [
                {
                    heading: "US8579793B1",
                    content: "Apparatus to affect brainwave entrainment over premises power-line wiring.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8579793" }
                },
                {
                    heading: "US11376443B2",
                    content: "Passive resonator and method of use for brain wave entrainment.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11376443" }
                }
            ]
        },
        {
            title: "Foundational Patents",
            subtitle: "Monroe & Flanagan (Historical)",
            icon: Lock,
            summary: "The original patents that established the field of Frequency Following Response (FFR) and neurophone technology.",
            deepDive: [
                {
                    heading: "US Patent 5356368A (Monroe)",
                    content: "Method of Inducing Mental States. The foundational patent for Hemi-Sync.",
                    link: { label: "Google Patents", url: "https://patents.google.com/patent/US5356368A/en" }
                },
                {
                    heading: "US Patent 3393279A (Flanagan)",
                    content: "Neurophone. Transmitting sound through skin via ultrasonic vibration.",
                    link: { label: "Google Patents", url: "https://patents.google.com/patent/US3393279A/en" }
                }
            ]
        },
        {
            title: "Neural Measurement",
            subtitle: "Detection Systems",
            icon: Brain,
            summary: "Hardware and methods for detecting brain states to verify and calibrate entrainment efficacy.",
            deepDive: [
                {
                    heading: "US10918325B2",
                    content: "Brain wave measuring device and system.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10918325" }
                },
                {
                    heading: "US5678560A",
                    content: "Brain-wave analysis method and apparatus.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5678560" }
                }
            ]
        },
        {
            title: "Visual Stimulation",
            subtitle: "Light Entrainment",
            icon: Eye,
            summary: "Methods utilizing stroboscopic light for frequency following response.",
            deepDive: [
                {
                    heading: "US20110015470A1",
                    content: "Strobe light for brain wave entrainment.",
                    link: { label: "USPTO PDF", url: "https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20110015470" }
                }
            ]
        }
    ],
    independent: [
        {
            title: "Auditory Beats in the Brain",
            subtitle: "Dr. Gerald Oster (1973)",
            code: "Scientific American",
            icon: Lightbulb,
            summary: "The seminal paper that distinguished 'Binaural Beats' from physical beats. Oster proved that binaural beats are processed in the brainstem (Superior Olivary Complex), making them a diagnostic tool for neurological function.",
            deepDive: [
                {
                    heading: "Key Finding",
                    content: "Oster demonstrated that while 'monaural' beats are a physical interference of sound waves in the air, 'binaural' beats are a cognitive illusion created by the brain's attempt to locate the sound source. This forces neural communication between hemispheres."
                },
                {
                    heading: "Link",
                    content: "Original Scientific American Article.",
                    link: { label: "Read Abstract", url: "https://www.scientificamerican.com/article/auditory-beats-in-the-brain/" }
                }
            ]
        },
        {
            title: "God Helmet Experiments",
            subtitle: "Dr. Michael Persinger",
            code: "Laurentian University",
            icon: Lightbulb,
            summary: "Research into the effects of weak complex magnetic fields on the temporal lobes. Subjects reported 'sensed presence' and mystical experiences.",
            deepDive: [
                {
                    heading: "Temporal Lobe Transients",
                    content: "Persinger's work suggests that micro-seizures or specific firing patterns in the temporal lobes are responsible for the feeling of 'God' or 'Universal Connection'. NeuroSyncPro's 'Speculative' protocols attempt to mimic these firing patterns using audio modulation."
                }
            ]
        }
    ],
    tmi: [
        {
            title: "The Monroe Institute",
            subtitle: "Focus Levels & Algorithms",
            code: "TMI-RESEARCH",
            icon: Brain,
            summary: "Founded by Robert Monroe, TMI classified altered states into 'Focus Levels'. NeuroSyncPro reconstructs these states using modern DSP.",
            deepDive: [
                {
                    heading: "Focus 10: Mind Awake / Body Asleep",
                    content: "Algorithm: A strong 10Hz Alpha signal faded gradually into a 4Hz Theta signal over 15 minutes. Pink noise is used to gate out external sensory input."
                },
                {
                    heading: "Focus 12: Expanded Awareness",
                    content: "Algorithm: Retains the somatic 4Hz Theta lock (body asleep) but introduces a high-frequency 18Hz-22Hz Beta signal. This creates a paradoxical state of high mental arousal within a sleeping body."
                },
                {
                    heading: "Focus 15: State of No Time",
                    content: "Algorithm: Drops the carrier frequency to <100Hz and creates a binaural beat of 0.5Hz to 1.0Hz (Deep Delta). Subjectively, the linear perception of time degrades in this state."
                },
                {
                    heading: "Focus 21: The Bridge",
                    content: "Algorithm: The 'Edge of Reality'. Utilizes the 'Gamma-Epsilon Bridge' theory—simultaneous 40Hz Gamma and 0.1Hz Epsilon. This theoretically integrates the highest and lowest bandwidths of consciousness."
                }
            ]
        }
    ],
    biophysics: [
        {
            title: "Orch-OR Theory",
            subtitle: "Penrose & Hameroff",
            code: "QUANTUM-BIO",
            icon: Microscope,
            summary: "Orchestrated Objective Reduction. The theory that consciousness originates from quantum vibrational computations in the brain's microtubules.",
            deepDive: [
                {
                    heading: "Microtubule Resonance",
                    content: "Microtubules are protein structures inside neurons. Hameroff suggests they resonate in the Megahertz range. However, 'beat frequencies' of these vibrations may step down into the EEG range (Gamma/Alpha), allowing audio entrainment to theoretically influence quantum neural processing."
                },
                {
                    heading: "Link",
                    content: "Review the theory.",
                    link: { label: "ScienceDirect", url: "https://www.sciencedirect.com/topics/neuroscience/orchestrated-objective-reduction" }
                }
            ]
        },
        {
            title: "Pineal Piezoelectricity",
            subtitle: "S.B. Lang et al.",
            code: "BIO-ELECTRO",
            icon: Microscope,
            summary: "The study of calcite micro-crystals found within the human pineal gland.",
            deepDive: [
                {
                    heading: "The Mechanism",
                    content: "Calcite micro-crystals are piezoelectric—they generate an electric charge when mechanically stressed. High-frequency audio or EM fields could theoretically cause these crystals to vibrate, generating internal electric fields within the brain's 'Third Eye'."
                }
            ]
        },
        {
            title: "Coupled Oscillators",
            subtitle: "The Physics of Entrainment",
            code: "HUYGENS",
            icon: Globe,
            summary: "Why entrainment works. Based on Christian Huygens' observation of pendulum clocks synchronizing.",
            deepDive: [
                {
                    heading: "Energy Efficiency",
                    content: "Nature seeks the lowest energy state. Two out-of-sync oscillators require more energy to maintain than two synchronized ones. The brain 'entrains' to the external rhythm (FFR) because it is metabolically efficient to do so."
                }
            ]
        }
    ]
};

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
    const [expandedCat, setExpandedCat] = useState<string | null>('defense');
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    if (!isOpen) return null;

    const toggleItem = (id: string) => setExpandedItem(expandedItem === id ? null : id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-neuro-900 border border-neuro-700 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-neuro-700 flex justify-between items-start bg-neuro-800/50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-neuro-500" />
                            Research & Intelligence Database
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Classified Projects, Patent Archive, and Biophysics
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Main Layout - Responsive */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Navigation (Mobile: Top Scroll Bar, Desktop: Side Bar) */}
                    <div className="w-full md:w-64 bg-neuro-800/30 border-b md:border-b-0 md:border-r border-neuro-700 p-4 gap-2 shrink-0 overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col">
                        {[
                            { id: 'defense', label: 'Defense Intel', icon: Shield, color: 'text-red-400' },
                            { id: 'clinical', label: 'Clinical Trials', icon: Activity, color: 'text-teal-400' },
                            { id: 'comparison', label: 'Protocol Matrix', icon: LayoutGrid, color: 'text-white' },
                            { id: 'stack_audit', label: 'Stack Analyzer', icon: Layers, color: 'text-neuro-500' },
                            { id: 'addiction', label: 'Addiction Recovery', icon: Pill, color: 'text-orange-400' },
                            { id: 'patents', label: 'Patent Archive', icon: Lock, color: 'text-yellow-400' },
                            { id: 'tmi', label: 'Monroe Institute', icon: Brain, color: 'text-blue-400' },
                            { id: 'independent', label: 'Academic / Indep.', icon: Lightbulb, color: 'text-green-400' },
                            { id: 'biophysics', label: 'Biophysics', icon: Microscope, color: 'text-purple-400' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setExpandedCat(cat.id); setExpandedItem(null); }}
                                className={`w-auto md:w-full flex-shrink-0 flex items-center gap-3 p-3 rounded-lg transition-all whitespace-nowrap ${
                                    expandedCat === cat.id 
                                    ? 'bg-neuro-700 border border-neuro-600 shadow-lg' 
                                    : 'hover:bg-white/5 text-gray-400'
                                }`}
                            >
                                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                                <span className={`text-sm font-bold ${expandedCat === cat.id ? 'text-white' : ''}`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-black/20">
                        {expandedCat === 'comparison' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <ComparisonChart />
                            </div>
                        ) : expandedCat === 'stack_audit' ? (
                            <StackAnalyzer />
                        ) : (
                        <div className="space-y-6">
                            {expandedCat && RESEARCH_DB[expandedCat]?.map((item, i) => (
                                <div key={i} className="bg-neuro-800/40 border border-neuro-700 rounded-xl overflow-hidden transition-all hover:border-neuro-600">
                                    <button onClick={() => toggleItem(`${expandedCat}-${i}`)} className="w-full flex justify-between items-start p-6 hover:bg-white/5 text-left">
                                        <div className="flex gap-4">
                                            <div className="mt-1 p-3 bg-neuro-900 rounded-lg border border-neuro-700 text-neuro-400 shrink-0"><item.icon className="w-6 h-6" /></div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h3 className="text-base md:text-lg font-bold text-gray-100">{item.title}</h3>
                                                    {item.code && <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400 whitespace-nowrap">{item.code}</span>}
                                                </div>
                                                <div className="text-xs font-bold text-neuro-500 mb-2">{item.subtitle}</div>
                                                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 md:line-clamp-none">{item.summary}</p>
                                            </div>
                                        </div>
                                        <div className={`transition-transform duration-300 ml-2 ${expandedItem === `${expandedCat}-${i}` ? 'rotate-180' : ''}`}><ChevronDown className="w-5 h-5 text-gray-500" /></div>
                                    </button>
                                    {expandedItem === `${expandedCat}-${i}` && (
                                        <div className="border-t border-neuro-700/50 bg-black/20 p-6 space-y-6 animate-in slide-in-from-top-2">
                                            {item.deepDive.map((dive, d) => (
                                                <div key={d} className="pl-4 border-l-2 border-neuro-500/30">
                                                    <h4 className="text-sm font-bold text-white mb-2">{dive.heading}</h4>
                                                    <p className="text-sm text-gray-400 leading-relaxed mb-2">{dive.content}</p>
                                                    {dive.link && (
                                                        <a href={dive.link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-neuro-400 hover:text-neuro-300 hover:underline mt-1">
                                                            <ExternalLink className="w-3 h-3" /> {dive.link.label}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

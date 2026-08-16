import React from 'react';
import { Moon, Target, Zap, Wind, Wand2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

interface FirstRunModalProps {
  onDismiss: () => void;
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showIcon={false} variant="gradient" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Neuroacoustic sessions designed to support sleep, focus, calm, energy, and more — rooted in peer-reviewed research.
          </p>
        </div>

        {/* Sample goal icons */}
        <div className="flex justify-center gap-4 py-3 px-8">
          {[
            { icon: Moon,   color: 'text-blue-300',   label: 'Sleep'     },
            { icon: Target, color: 'text-yellow-400',  label: 'Focus'     },
            { icon: Wind,   color: 'text-teal-400',    label: 'Calm'      },
            { icon: Zap,    color: 'text-orange-400',  label: 'Energy'    },
          ].map(({ icon: Icon, color, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-neuro-700/50 my-2" />

        {/* Modes explanation */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3">
          {/* Guided */}
          <div className="bg-neuro-500/10 border border-neuro-500/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-neuro-400" />
              <span className="font-bold text-sm text-white">Guided</span>
              <span className="text-[9px] bg-neuro-500/20 text-neuro-400 px-1.5 py-0.5 rounded font-mono">DEFAULT</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Pick a goal — Sleep, Focus, Calm — and get a curated list of matching sessions.
            </p>
          </div>

          {/* Expert */}
          <div className="bg-white/5 border border-neuro-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="font-bold text-sm text-gray-300">Expert</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Full protocol library with categories, evidence filters, and technical details.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 px-8 pb-4">
          You can switch modes at any time using the toggle in the sidebar.
        </p>

        {/* CTA */}
        <div className="px-6 pb-7">
          <button
            onClick={onDismiss}
            className="w-full py-3.5 bg-neuro-500 hover:bg-neuro-400 text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-neuro-500/30"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[10px] text-gray-700 mt-2">
            No account needed — works entirely in your browser
          </p>
        </div>
      </div>
    </div>
  );
};

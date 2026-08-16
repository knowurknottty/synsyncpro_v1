// src/components/RoutineBuilderWelcome.tsx
// Engaging welcome screen - shows value prop before commitment

import React from 'react';
import { Sparkles, Clock, Target, Users, ChevronRight, X } from 'lucide-react';

interface RoutineBuilderWelcomeProps {
  onStart: () => void;
  onClose: () => void;
}

/**
 * Welcome screen for routine builder
 * Shows benefits, sets expectations, builds excitement
 */
export const RoutineBuilderWelcome: React.FC<RoutineBuilderWelcomeProps> = ({ onStart, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neuro-900 border border-neuro-700 rounded-xl max-w-2xl w-full p-8 space-y-6 animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neuro-500 via-purple-600 to-pink-500 animate-pulse-slow shadow-lg shadow-neuro-500/50">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Build Your Perfect Routine
          </h1>

          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Answer 7 quick questions and get a personalized protocol routine
            designed specifically for your goals, schedule, and experience level.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-neuro-800/50 to-neuro-800/30 border border-neuro-700 hover:border-neuro-600 transition-all group">
            <div className="w-12 h-12 rounded-full bg-neuro-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-neuro-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">2-3 Minutes</p>
            <p className="text-xs text-gray-400">Quick & painless setup. No account required.</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-800/50 to-purple-800/30 border border-purple-700 hover:border-purple-600 transition-all group">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Personalized</p>
            <p className="text-xs text-gray-400">Matched to your goals, time, and experience.</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-pink-800/50 to-pink-800/30 border border-pink-700 hover:border-pink-600 transition-all group">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Evidence-Based</p>
            <p className="text-xs text-gray-400">Transparent grading. No false promises.</p>
          </div>
        </div>

        {/* Example Preview */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <p className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Example Result:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded bg-black/20">
              <span className="text-2xl">🌅</span>
              <div>
                <p className="text-sm text-white font-medium">Morning: Focus Protocol</p>
                <p className="text-xs text-gray-400">25 min • 85% match • ⚡ Experimental</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded bg-black/20">
              <span className="text-2xl">🌙</span>
              <div>
                <p className="text-sm text-white font-medium">Evening: Deep Sleep Protocol</p>
                <p className="text-xs text-gray-400">30 min • 88% match • ⚡ Experimental</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStart}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-neuro-500 via-purple-600 to-pink-600 hover:from-neuro-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-neuro-500/30"
          >
            <Sparkles className="w-5 h-5" />
            Let's Build Your Routine
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 hover:text-white transition-colors"
        >
          Maybe Later
        </button>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-neuro-700">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>2,847+ users</span>
          </div>
          <span className="text-gray-700">•</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>2-3 min setup</span>
          </div>
          <span className="text-gray-700">•</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Free forever</span>
          </div>
        </div>
      </div>
    </div>
  );
};

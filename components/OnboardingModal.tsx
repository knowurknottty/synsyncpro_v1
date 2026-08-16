/**
 * OnboardingModal — First-time user setup
 * 
 * Collects:
 * - Display name (username)
 * - Privacy preferences (what to track)
 * - Research consent & data sharing preferences
 * - Session goals/intentions
 */

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Database, 
  Download, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check,
  Lock,
  Sparkles,
  Target
} from 'lucide-react';
import { Logo } from './Logo';
import { UserData, SessionRecord } from '../types';

interface PrivacySettings {
  trackSessionDuration: boolean;
  trackProtocolUsage: boolean;
  trackTimeOfDay: boolean;
  trackDeviceInfo: boolean;
  allowResearchExport: boolean;
  researchExportAnonymized: boolean;
}

interface OnboardingModalProps {
  onComplete: (profile: Partial<UserData>, privacy: PrivacySettings) => void;
  onSkip?: () => void;
}

const STEPS = ['profile', 'privacy', 'research', 'complete'] as const;
type Step = typeof STEPS[number];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [displayName, setDisplayName] = useState('');
  const [intention, setIntention] = useState('');
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    trackSessionDuration: true,
    trackProtocolUsage: true,
    trackTimeOfDay: true,
    trackDeviceInfo: false,
    allowResearchExport: false,
    researchExportAnonymized: true,
  });

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    } else {
      // Complete onboarding
      const profile: Partial<UserData> = {
        displayName: displayName.trim() || 'Anonymous',
        notes: intention,
        preferences: {
          privacy,
          onboardingCompleted: true,
          onboardingCompletedAt: Date.now(),
        },
      };
      onComplete(profile, privacy);
    }
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'profile':
        return displayName.trim().length >= 2;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Progress Bar */}
        <div className="h-1 bg-neuro-800">
          <div 
            className="h-full bg-gradient-to-r from-neuro-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showIcon={true} variant="gradient" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to SynSync Pro
          </h2>
          <p className="text-sm text-gray-400">
            Step {stepIndex + 1} of {STEPS.length}: {currentStep === 'profile' && 'Your Profile'}
            {currentStep === 'privacy' && 'Privacy Settings'}
            {currentStep === 'research' && 'Research Contribution'}
            {currentStep === 'complete' && 'Ready to Begin'}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: Profile */}
          {currentStep === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <User className="w-4 h-4 text-neuro-400" />
                  Choose Your Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter a name or pseudonym..."
                  className="w-full bg-black/40 border border-neuro-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-500 transition-colors"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  This is how you'll be identified in the app. You can change this anytime.
                </p>
              </div>

              <div className="bg-neuro-800/40 border border-neuro-700/50 rounded-xl p-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <Target className="w-4 h-4 text-neuro-400" />
                  Your Intention (Optional)
                </label>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="What brings you to SynSync? Sleep, focus, healing, exploration..."
                  rows={3}
                  className="w-full bg-black/40 border border-neuro-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This helps personalize your experience. Private to you.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Privacy */}
          {currentStep === 'privacy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-300 text-sm">Your Data, Your Control</h4>
                  <p className="text-xs text-blue-200/70 mt-1">
                    SynSync stores everything locally in your .syns file. 
                    Choose what you want to track for your own insights.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-neuro-400" />
                  Tracking Preferences
                </h4>
                
                {[
                  { key: 'trackSessionDuration', label: 'Session Duration', desc: 'How long you use each protocol' },
                  { key: 'trackProtocolUsage', label: 'Protocol History', desc: 'Which protocols you\'ve used' },
                  { key: 'trackTimeOfDay', label: 'Time of Day', desc: 'When you typically use SynSync' },
                  { key: 'trackDeviceInfo', label: 'Device Information', desc: 'Mobile vs desktop usage patterns' },
                ].map(({ key, label, desc }) => (
                  <div 
                    key={key}
                    className="flex items-center justify-between p-4 bg-neuro-800/30 border border-neuro-700/50 rounded-xl hover:bg-neuro-800/50 transition-colors cursor-pointer"
                    onClick={() => togglePrivacy(key as keyof PrivacySettings)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{label}</span>
                        {privacy[key as keyof PrivacySettings] ? (
                          <Eye className="w-3 h-3 text-green-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    </div>
                    <div className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${privacy[key as keyof PrivacySettings] ? 'bg-neuro-500' : 'bg-gray-700'}
                    `}>
                      <div className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${privacy[key as keyof PrivacySettings] ? 'translate-x-7' : 'translate-x-1'}
                      `} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Research */}
          {currentStep === 'research' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-300 text-sm">Contribute to Research</h4>
                  <p className="text-xs text-purple-200/70 mt-1">
                    Help advance neuroacoustic science by sharing anonymized usage patterns.
                    You control exactly what to share.
                  </p>
                </div>
              </div>

              <div 
                className="p-4 bg-neuro-800/30 border border-neuro-700/50 rounded-xl hover:bg-neuro-800/50 transition-colors cursor-pointer"
                onClick={() => togglePrivacy('allowResearchExport')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-neuro-400" />
                      Allow Research Export
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable the export feature for contributing to research
                    </p>
                  </div>
                  <div className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${privacy.allowResearchExport ? 'bg-neuro-500' : 'bg-gray-700'}
                  `}>
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${privacy.allowResearchExport ? 'translate-x-7' : 'translate-x-1'}
                    `} />
                  </div>
                </div>
              </div>

              {privacy.allowResearchExport && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div 
                    className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl cursor-pointer"
                    onClick={() => togglePrivacy('researchExportAnonymized')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors
                        ${privacy.researchExportAnonymized 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-600'
                        }
                      `}>
                        {privacy.researchExportAnonymized && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-300 text-sm flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          Anonymize Research Data
                        </h4>
                        <p className="text-xs text-green-200/70 mt-1">
                          Remove your display name, notes, and any identifying information 
                          before export. Only session patterns and protocol effectiveness are shared.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neuro-800/40 rounded-xl p-4 text-xs text-gray-400 space-y-2">
                    <p className="font-semibold text-gray-300">What gets exported:</p>
                    <ul className="space-y-1 ml-4">
                      <li>✓ Protocol ID and duration</li>
                      <li>✓ Time of day (hour only)</li>
                      <li>✓ Self-reported outcomes (if any)</li>
                    </ul>
                    <p className="font-semibold text-gray-300 mt-3">What stays private:</p>
                    <ul className="space-y-1 ml-4">
                      <li>✗ Your display name</li>
                      <li>✗ Personal notes</li>
                      <li>✗ Your unique user ID</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-neuro-500 to-cyan-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  You're All Set, {displayName || 'Explorer'}!
                </h3>
                <p className="text-sm text-gray-400">
                  Your profile is ready. Your .syns file now contains your preferences 
                  and will store your session history.
                </p>
              </div>

              <div className="bg-neuro-800/40 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Profile: <span className="text-white">{displayName || 'Anonymous'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Tracking: <span className="text-white">{Object.values(privacy).filter(Boolean).length - (privacy.allowResearchExport ? 2 : 0) - (privacy.researchExportAnonymized ? 1 : 0)} metrics enabled</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Research: <span className="text-white">{privacy.allowResearchExport ? (privacy.researchExportAnonymized ? 'Anonymized' : 'Full') : 'Disabled'}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-neuro-700/50 flex items-center justify-between">
          {onSkip && currentStep !== 'complete' && (
            <button
              onClick={onSkip}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
          )}
          
          <div className="ml-auto flex gap-3">
            {stepIndex > 0 && (
              <button
                onClick={() => setCurrentStep(STEPS[stepIndex - 1])}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-neuro-500 text-black font-semibold rounded-lg hover:bg-neuro-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 'complete' ? 'Enter SynSync' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { PrivacySettings };

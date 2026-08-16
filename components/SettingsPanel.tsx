import React from 'react';
import { X, Settings as SettingsIcon, Eye, EyeOff, Volume2, Palette, Headphones, Zap, Download, Shield, User } from 'lucide-react';
import { UIMode } from '../src/labels';

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Current settings
  uiMode: UIMode;
  scanlinesEnabled: boolean;
  reduceMotion: boolean;
  defaultVolume: number;
  theme: string;
  headphoneWarning: boolean;

  // Callbacks
  onUiModeChange: (mode: UIMode) => void;
  onScanlinesToggle: (enabled: boolean) => void;
  onReduceMotionToggle: (enabled: boolean) => void;
  onDefaultVolumeChange: (volume: number) => void;
  onThemeChange: (theme: string) => void;
  onHeadphoneWarningToggle: (enabled: boolean) => void;
  onOpenDataExport?: () => void;
  onOpenUserProfile?: () => void;
}

/**
 * Settings Panel Component
 *
 * Provides user preferences and customization options:
 * - UI Mode (Guided vs Expert)
 * - Visual preferences (scanlines, motion)
 * - Audio defaults
 * - Theme selection
 * - Safety preferences
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  uiMode,
  scanlinesEnabled,
  reduceMotion,
  defaultVolume,
  theme,
  headphoneWarning,
  onUiModeChange,
  onScanlinesToggle,
  onReduceMotionToggle,
  onDefaultVolumeChange,
  onThemeChange,
  onHeadphoneWarningToggle,
  onOpenDataExport,
  onOpenUserProfile,
}) => {
  if (!isOpen) return null;

  const themes = [
    { id: 'neural', name: 'Neural (Default)', color: 'bg-neuro-500' },
    { id: 'alien', name: 'Alien', color: 'bg-green-500' },
    { id: 'cosmic', name: 'Cosmic', color: 'bg-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neuro-900 border border-neuro-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-neuro-700/50 bg-neuro-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neuro-500/10">
              <SettingsIcon className="w-5 h-5 text-neuro-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* User Profile */}
          {onOpenUserProfile && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neuro-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Your Profile</h3>
              </div>
              <div className="bg-neuro-800/30 border border-neuro-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neuro-500 to-cyan-400 flex items-center justify-center text-black font-bold shrink-0">
                    U
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">View Your Profile</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      Check your stats, session history, manage prescriptions, and update your file.
                    </p>
                    <button
                      onClick={() => {
                        onOpenUserProfile();
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neuro-500/20 hover:bg-neuro-500/30 border border-neuro-500/50 rounded-lg text-neuro-300 text-sm font-medium transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Open Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-neuro-700/30" />

          {/* UI Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neuro-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Interface Mode</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Choose how you want to browse sessions
            </p>
            <div className="flex gap-2 bg-black/40 p-1 border border-neuro-700/50 rounded-lg">
              <button
                onClick={() => onUiModeChange('guided')}
                className={`flex-1 py-2.5 text-sm font-bold rounded transition-colors ${
                  uiMode === 'guided'
                    ? 'bg-neuro-500 text-black'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Guided
              </button>
              <button
                onClick={() => onUiModeChange('expert')}
                className={`flex-1 py-2.5 text-sm font-bold rounded transition-colors ${
                  uiMode === 'expert'
                    ? 'bg-neuro-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Expert
              </button>
            </div>
            <div className="text-[10px] text-gray-600 space-y-1">
              <p>• <strong>Guided:</strong> Goal-based navigation with friendly names</p>
              <p>• <strong>Expert:</strong> Full protocol library with technical details</p>
            </div>
          </div>

          <div className="border-t border-neuro-700/30" />

          {/* Visual Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-neuro-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Visual Effects</h3>
            </div>

            {/* Scanlines Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="scanlines-toggle" className="text-sm text-gray-300 font-medium">
                  Scanlines Effect
                </label>
                <p className="text-xs text-gray-500">Retro CRT overlay (may cause eye strain)</p>
              </div>
              <button
                id="scanlines-toggle"
                onClick={() => onScanlinesToggle(!scanlinesEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  scanlinesEnabled ? 'bg-neuro-500' : 'bg-neuro-800'
                }`}
                aria-pressed={scanlinesEnabled}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    scanlinesEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="reduce-motion-toggle" className="text-sm text-gray-300 font-medium">
                  Reduce Motion
                </label>
                <p className="text-xs text-gray-500">Minimize animations for accessibility</p>
              </div>
              <button
                id="reduce-motion-toggle"
                onClick={() => onReduceMotionToggle(!reduceMotion)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  reduceMotion ? 'bg-neuro-500' : 'bg-neuro-800'
                }`}
                aria-pressed={reduceMotion}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    reduceMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-neuro-700/30" />

          {/* Audio Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-neuro-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Audio</h3>
            </div>

            {/* Default Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="default-volume" className="text-sm text-gray-300 font-medium">
                  Default Volume
                </label>
                <span className="text-sm font-mono text-neuro-300">
                  {Math.round(defaultVolume * 100)}%
                </span>
              </div>
              <input
                id="default-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={defaultVolume}
                onChange={(e) => onDefaultVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neuro-700 rounded-lg appearance-none cursor-pointer accent-neuro-500"
                aria-label="Default volume slider"
              />
              <p className="text-xs text-gray-500">
                Starting volume for all sessions (0.7 safety limit enforced)
              </p>
            </div>

            {/* Headphone Warning */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="headphone-warning-toggle" className="text-sm text-gray-300 font-medium flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Headphone Reminder
                </label>
                <p className="text-xs text-gray-500">Show headphone notice for binaural protocols</p>
              </div>
              <button
                id="headphone-warning-toggle"
                onClick={() => onHeadphoneWarningToggle(!headphoneWarning)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  headphoneWarning ? 'bg-neuro-500' : 'bg-neuro-800'
                }`}
                aria-pressed={headphoneWarning}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    headphoneWarning ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-neuro-700/30" />

          {/* Data Export */}
          {onOpenDataExport && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-neuro-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Your Data</h3>
              </div>
              <div className="bg-neuro-800/30 border border-neuro-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">Export & Privacy</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      View, export, or share your data for research. 
                      Choose what to include and anonymize if desired.
                    </p>
                    <button
                      onClick={() => {
                        onOpenDataExport();
                        onClose();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neuro-500/20 hover:bg-neuro-500/30 border border-neuro-500/50 rounded-lg text-neuro-300 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Open Data Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-neuro-700/30" />

          {/* Theme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-neuro-400" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Theme</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    theme === t.id
                      ? 'border-neuro-500 bg-neuro-500/10'
                      : 'border-neuro-700/50 bg-neuro-800/30 hover:border-neuro-600'
                  }`}
                >
                  <div className={`w-6 h-6 rounded ${t.color}`} />
                  <span className="text-sm font-medium text-white">{t.name}</span>
                  {theme === t.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-neuro-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neuro-700/50 bg-neuro-900/50 shrink-0">
          <p className="text-xs text-gray-600 text-center">
            Settings are saved automatically and persist across sessions
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

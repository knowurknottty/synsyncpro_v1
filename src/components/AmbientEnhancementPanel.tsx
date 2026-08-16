/**
 * AmbientEnhancementPanel.tsx
 * Group 6: Ambient Enhancement & Masking UI
 * 
 * Provides user controls for:
 * - Module 15: Pink Noise Environmental Masker
 * - Module 16: Binaural Nature Sound Mixer
 */

import React, { useState, useEffect } from 'react';
import { PinkNoiseEnvironmentalMasker, PinkNoiseParams } from '../modules/PinkNoiseEnvironmentalMasker';
import { BinauralNatureSoundMixer, NatureSoundParams, NatureSoundType } from '../modules/BinauralNatureSoundMixer';

interface AmbientEnhancementPanelProps {
  audioContext: AudioContext;
  destination: AudioNode;
  enabled: boolean;
}

export const AmbientEnhancementPanel: React.FC<AmbientEnhancementPanelProps> = ({
  audioContext,
  destination,
  enabled
}) => {
  // Module instances
  const [pinkNoise] = useState(() => new PinkNoiseEnvironmentalMasker(audioContext));
  const [natureMixer] = useState(() => new BinauralNatureSoundMixer(audioContext));
  
  // Pink noise state
  const [pinkNoiseEnabled, setPinkNoiseEnabled] = useState(false);
  const [pinkNoiseIntensity, setPinkNoiseIntensity] = useState(0.3);
  const [safetyLimit, setSafetyLimit] = useState(80); // dB
  
  // Nature sound state
  const [natureSoundEnabled, setNatureSoundEnabled] = useState(false);
  const [selectedNatureSound, setSelectedNatureSound] = useState<NatureSoundType>('rain');
  const [natureSoundVolume, setNatureSoundVolume] = useState(0.5);
  const [spatialAzimuth, setSpatialAzimuth] = useState(0); // degrees
  
  // Level monitoring
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    if (enabled) {
      pinkNoise.connect(destination);
      natureMixer.connect(destination);
    } else {
      pinkNoise.disconnect();
      natureMixer.disconnect();
    }
  }, [enabled, pinkNoise, natureMixer, destination]);

  useEffect(() => {
    if (pinkNoiseEnabled) {
      pinkNoise.setParams({
        intensity: pinkNoiseIntensity,
        safetyLimit: safetyLimit
      } as PinkNoiseParams);
      pinkNoise.start();
    } else {
      pinkNoise.stop();
    }
  }, [pinkNoiseEnabled, pinkNoiseIntensity, safetyLimit, pinkNoise]);

  useEffect(() => {
    if (natureSoundEnabled) {
      natureMixer.setParams({
        soundType: selectedNatureSound,
        volume: natureSoundVolume,
        spatialPosition: { azimuth: spatialAzimuth, elevation: 0 },
        crossfadeDuration: 2
      } as NatureSoundParams);
      natureMixer.start();
    } else {
      natureMixer.stop();
    }
  }, [natureSoundEnabled, selectedNatureSound, natureSoundVolume, spatialAzimuth, natureMixer]);

  const natureSoundOptions: NatureSoundType[] = ['rain', 'ocean', 'forest', 'stream', 'wind', 'birds', 'campfire'];

  return (
    <div className="ambient-enhancement-panel bg-gray-900 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">
        🌊 Ambient Enhancement & Masking
      </h2>
      
      {/* Pink Noise Section */}
      <div className="pink-noise-section mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            🔉 Pink Noise Masker
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pinkNoiseEnabled}
              onChange={(e) => setPinkNoiseEnabled(e.target.checked)}
              className="sr-only peer"
              aria-label="Enable pink noise"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {pinkNoiseEnabled && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intensity: {(pinkNoiseIntensity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pinkNoiseIntensity}
                onChange={(e) => setPinkNoiseIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Pink noise intensity"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Safety Limit: {safetyLimit} dB
                {safetyLimit >= 85 && <span className="ml-2 text-red-500 text-xs">⚠️ MAX</span>}
              </label>
              <input
                type="range"
                min="60"
                max="85"
                step="1"
                value={safetyLimit}
                onChange={(e) => setSafetyLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Safety limit in decibels"
              />
              <p className="text-xs text-gray-400 mt-1">
                🔬 RVP A+ | Voss-McCartney Algorithm
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Nature Sound Section */}
      <div className="nature-sound-section p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            🌲 Nature Sound Mixer
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={natureSoundEnabled}
              onChange={(e) => setNatureSoundEnabled(e.target.checked)}
              className="sr-only peer"
              aria-label="Enable nature sounds"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        
        {natureSoundEnabled && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sound Type
              </label>
              <select
                value={selectedNatureSound}
                onChange={(e) => setSelectedNatureSound(e.target.value as NatureSoundType)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Nature sound type"
              >
                {natureSoundOptions.map(sound => (
                  <option key={sound} value={sound}>
                    {sound.charAt(0).toUpperCase() + sound.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume: {(natureSoundVolume * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={natureSoundVolume}
                onChange={(e) => setNatureSoundVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Nature sound volume"
              />
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Spatial Position: {spatialAzimuth}°
                <span className="ml-2 text-xs text-gray-400">
                  ({spatialAzimuth < -30 ? 'Left' : spatialAzimuth > 30 ? 'Right' : 'Center'})
                </span>
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={spatialAzimuth}
                onChange={(e) => setSpatialAzimuth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Spatial azimuth angle"
              />
              <p className="text-xs text-gray-400 mt-1">
                🔬 RVP A | Binaural Spatial Positioning
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
        <p className="text-xs text-blue-200">
          <strong>Group 6:</strong> Ambient Enhancement & Masking<br/>
          Pink noise (-3dB/octave) provides superior frequency masking for study/work environments.
          Nature sounds enhance relaxation and reduce perceived silence discomfort.
        </p>
      </div>
    </div>
  );
};

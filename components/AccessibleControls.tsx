// path: components/AccessibleControls.tsx

/**
 * AccessibleControls
 * Wrapper for primary playback / session controls with WCAG-friendly affordances.
 * Intended as a reusable panel you can drop around any protocol player.
 */

import React, { useRef } from "react";
import "../src/safety/accessibility.css";
import { useFocusManagement } from "../src/safety/WCAGCompliance";

export interface AccessibleControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onOpenSafetySettings?: () => void;
  onOpenPhotosensitivityScreening?: () => void;
  onOpenSplCalibration?: () => void;
  masterVolume: number;
  onMasterVolumeChange: (value: number) => void;
}

export const AccessibleControls: React.FC<AccessibleControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStop,
  onOpenSafetySettings,
  onOpenPhotosensitivityScreening,
  onOpenSplCalibration,
  masterVolume,
  onMasterVolumeChange,
}) => {
  const panelRef = useRef<HTMLElement | null>(null);
  useFocusManagement(panelRef);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value)) {
      onMasterVolumeChange(value);
    }
  };

  return (
    <section
      ref={panelRef}
      className="accessible-controls"
      aria-label="Playback and safety controls"
    >
      <header className="accessible-controls__header">
        <h3>Session Controls</h3>
      </header>

      <div className="accessible-controls__row">
        <button
          type="button"
          className="button primary"
          onClick={onTogglePlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? "Pause session" : "Start session"}
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={onStop}
        >
          Stop
        </button>
      </div>

      <div className="accessible-controls__row">
        <label htmlFor="master-volume">
          Master volume
          <span className="sr-only">
            Use left and right arrows to adjust volume.
          </span>
        </label>
        <input
          id="master-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={handleVolumeChange}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={masterVolume}
          aria-label="Master volume"
        />
      </div>

      <div className="accessible-controls__row accessible-controls__row--secondary">
        {onOpenSafetySettings && (
          <button
            type="button"
            className="button tertiary"
            onClick={onOpenSafetySettings}
          >
            Safety settings
          </button>
        )}
        {onOpenPhotosensitivityScreening && (
          <button
            type="button"
            className="button tertiary"
            onClick={onOpenPhotosensitivityScreening}
          >
            Photosensitivity check
          </button>
        )}
        {onOpenSplCalibration && (
          <button
            type="button"
            className="button tertiary"
            onClick={onOpenSplCalibration}
          >
            SPL calibration
          </button>
        )}
      </div>
    </section>
  );
};

export default AccessibleControls;

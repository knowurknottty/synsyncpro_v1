// path: components/SPLCalibrationWizard.tsx

/**
 * SPLCalibrationWizard
 * Step-by-step wizard to calibrate SPL estimates using a reference tone
 * and user-reported loudness or external SPL meter readings.
 */

import React, { useState, useCallback } from "react";
import "../src/safety/accessibility.css";

export interface SPLCalibrationWizardProps {
  /** Whether the wizard is currently shown. */
  isOpen: boolean;
  /** Triggered when wizard should be closed. */
  onClose: () => void;
  /** Start/stop playing the calibration tone. */
  onToggleCalibrationTone: (isOn: boolean) => void;
  /** Current tone playback state injected from audio layer. */
  isTonePlaying: boolean;
  /**
   * Called when calibration result is ready.
   * `calibrationFactor` can be used to scale raw SPL readings.
   */
  onComplete: (calibrationFactor: number) => void;
}

type StepId = 0 | 1 | 2;

export const SPLCalibrationWizard: React.FC<SPLCalibrationWizardProps> = ({
  isOpen,
  onClose,
  onToggleCalibrationTone,
  isTonePlaying,
  onComplete,
}) => {
  const [step, setStep] = useState<StepId>(0);
  const [reportedSpl, setReportedSpl] = useState<string>("");
  const [targetSpl, setTargetSpl] = useState<string>("70"); // default comfortable ref
  const [error, setError] = useState<string | null>(null);

  const goNext = useCallback(() => {
    setError(null);
    setStep((prev) => (prev === 2 ? 2 : ((prev + 1) as StepId)));
  }, []);

  const goBack = useCallback(() => {
    setError(null);
    setStep((prev) => (prev === 0 ? 0 : ((prev - 1) as StepId)));
  }, []);

  const handleToneToggle = useCallback(() => {
    onToggleCalibrationTone(!isTonePlaying);
  }, [isTonePlaying, onToggleCalibrationTone]);

  const handleSubmit = useCallback(() => {
    const reported = Number.parseFloat(reportedSpl);
    const target = Number.parseFloat(targetSpl);

    if (!Number.isFinite(reported) || !Number.isFinite(target) || target <= 0) {
      setError("Please provide valid numeric values for SPL.");
      return;
    }

    // Simple linear factor: factor * measured = user‑reported
    const calibrationFactor = reported / target;
    onComplete(calibrationFactor);
    onToggleCalibrationTone(false);
    onClose();
  }, [onClose, onComplete, onToggleCalibrationTone, reportedSpl, targetSpl]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spl-calibration-title"
      >
        <header>
          <h2 id="spl-calibration-title">SPL Calibration Wizard</h2>
          <p>
            This optional calibration step helps align in‑app SPL estimates with
            your playback device and environment.
          </p>
        </header>

        {step === 0 && (
          <section aria-label="Calibration overview">
            <h3>How this works</h3>
            <ul>
              <li>We play a steady reference tone at a fixed output level.</li>
              <li>
                You either read SPL from an external meter or adjust based on
                subjective comfort.
              </li>
              <li>
                We compute a calibration factor that refines safety monitoring.
              </li>
            </ul>
          </section>
        )}

        {step === 1 && (
          <section aria-label="Reference tone playback">
            <h3>Play reference tone</h3>
            <p>
              Ensure you are in a typical listening environment for your
              sessions. Avoid very noisy backgrounds during calibration.
            </p>
            <button
              type="button"
              className="button primary"
              onClick={handleToneToggle}
              aria-pressed={isTonePlaying}
            >
              {isTonePlaying ? "Stop reference tone" : "Start reference tone"}
            </button>
          </section>
        )}

        {step === 2 && (
          <section aria-label="Enter SPL readings">
            <h3>Enter measured levels</h3>
            <p>
              If you have a handheld SPL meter, place it at ear position and
              read the A‑weighted value. Otherwise, estimate based on
              loudness: typical conversation is around 60–65 dB(A).
            </p>

            <div className="form-row">
              <label htmlFor="target-spl">
                Target reference level (dB(A))
              </label>
              <input
                id="target-spl"
                type="number"
                inputMode="decimal"
                value={targetSpl}
                onChange={(e) => setTargetSpl(e.target.value)}
                min={40}
                max={90}
              />
            </div>

            <div className="form-row">
              <label htmlFor="measured-spl">
                Measured / perceived level (dB(A))
              </label>
              <input
                id="measured-spl"
                type="number"
                inputMode="decimal"
                value={reportedSpl}
                onChange={(e) => setReportedSpl(e.target.value)}
                min={40}
                max={100}
              />
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
          </section>
        )}

        <footer className="wizard-footer">
          <button
            type="button"
            className="button secondary"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </button>
          {step < 2 && (
            <button
              type="button"
              className="button primary"
              onClick={goNext}
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              className="button primary"
              onClick={handleSubmit}
            >
              Save calibration
            </button>
          )}
          <button
            type="button"
            className="button tertiary"
            onClick={onClose}
          >
            Cancel
          </button>
        </footer>
      </div>
    </>
  );
};

export default SPLCalibrationWizard;

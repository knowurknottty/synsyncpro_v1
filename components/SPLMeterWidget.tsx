// path: components/SPLMeterWidget.tsx

/**
 * SPLMeterWidget
 * Real-time sound pressure level visualization against WHO / OSHA guidance.
 * This is a UI wrapper; the underlying audio measurement should be provided
 * via props so we stay decoupled from Web Audio specifics.
 */

import React from "react";
import "../src/safety/accessibility.css";

export interface SPLMeterWidgetProps {
  /** Current SPL estimate in dB(A). */
  spl: number | null;
  /** Safe SPL threshold in dB(A) for current protocol. */
  safeThreshold: number;
  /** Hard cap that should trigger immediate warnings. */
  hardLimit: number;
  /** Optional rolling average SPL for smoother display. */
  averageSpl?: number | null;
  /** Whether measurement stream is active. */
  isActive: boolean;
  /** Called when user clicks “More safety info”. */
  onRequestSafetyInfo?: () => void;
}

/**
 * Classify SPL into qualitative bands.
 */
function classifySpl(
  spl: number | null,
  safeThreshold: number,
  hardLimit: number,
): "unknown" | "safe" | "caution" | "unsafe" {
  if (spl == null || Number.isNaN(spl)) return "unknown";
  if (spl <= safeThreshold) return "safe";
  if (spl > hardLimit) return "unsafe";
  return "caution";
}

export const SPLMeterWidget: React.FC<SPLMeterWidgetProps> = ({
  spl,
  averageSpl,
  safeThreshold,
  hardLimit,
  isActive,
  onRequestSafetyInfo,
}) => {
  const status = classifySpl(spl, safeThreshold, hardLimit);

  const label =
    spl == null || Number.isNaN(spl) ? "Not available" : `${spl.toFixed(1)} dB(A)`;

  const percentOfLimit =
    spl == null || Number.isNaN(spl)
      ? 0
      : Math.max(0, Math.min(100, (spl / hardLimit) * 100));

  return (
    <section
      className="spl-meter-widget"
      aria-label="Sound pressure level monitor"
    >
      <header className="spl-header">
        <h3>SPL Monitor</h3>
        <p className="spl-subtitle">
          Tracks playback loudness relative to safety guidelines.
        </p>
      </header>

      <div className="spl-main">
        <div className="spl-gauge" aria-hidden="true">
          <div className="spl-gauge-track">
            <div
              className={`spl-gauge-fill spl-gauge-fill--${status}`}
              style={{ width: `${percentOfLimit}%` }}
            />
          </div>
          <div className="spl-gauge-markers">
            <span className="spl-marker spl-marker--safe">
              Safe ≤ {safeThreshold} dB
            </span>
            <span className="spl-marker spl-marker--limit">
              Limit {hardLimit} dB
            </span>
          </div>
        </div>

        <div className="spl-readout">
          <div className="spl-value" aria-live="polite">
            <span className="spl-value-label">Current level</span>
            <span className="spl-value-number">{label}</span>
          </div>

          {averageSpl != null && !Number.isNaN(averageSpl) && (
            <div className="spl-avg">
              <span className="spl-avg-label">Rolling average</span>
              <span className="spl-avg-number">
                {averageSpl.toFixed(1)} dB(A)
              </span>
            </div>
          )}

          <div className="spl-status">
            <span className={`spl-status-pill spl-status-pill--${status}`}>
              {status === "unknown" && (isActive ? "Calibrating…" : "Idle")}
              {status === "safe" && "Within recommended range"}
              {status === "caution" && "Elevated level – consider lowering volume"}
              {status === "unsafe" && "Unsafe – reduce volume immediately"}
            </span>
          </div>
        </div>
      </div>

      <footer className="spl-footer">
        <button
          type="button"
          className="button tertiary"
          onClick={onRequestSafetyInfo}
        >
          More safety guidance
        </button>
        <p className="spl-footnote">
          This display is informational only and does not replace a certified
          sound level meter.
        </p>
      </footer>
    </section>
  );
};

export default SPLMeterWidget;

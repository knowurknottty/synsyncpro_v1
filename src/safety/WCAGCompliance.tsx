// path: src/safety/WCAGCompliance.tsx

/**
 * Module 20: WCAG Compliance System
 * Comprehensive accessibility validation and enforcement for WCAG 2.1 AA standards.
 *
 * Features:
 * - Real-time contrast ratio validation
 * - Keyboard navigation testing and enforcement
 * - ARIA label validation
 * - Focus management helpers
 * - Color blindness simulation hooks via root CSS classes
 *
 * @module WCAGCompliance
 * @version 1.0.0
 */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import "./accessibility.css";

export interface WCAGComplianceConfig {
  level: "A" | "AA" | "AAA";
  enableAutoFix: boolean;
  reportingMode: "silent" | "warning" | "strict";
  colorBlindnessMode?: "protanopia" | "deuteranopia" | "tritanopia" | "none";
}

export interface AccessibilityIssue {
  id: string;
  severity: "error" | "warning" | "info";
  wcagCriterion: string;
  element: string;
  description: string;
  recommendation: string;
  timestamp: number;
}

export interface ContrastRatio {
  ratio: number;
  passes: boolean;
  level: "AA" | "AAA";
  foreground: string;
  background: string;
}

export interface WCAGComplianceProps {
  config?: Partial<WCAGComplianceConfig>;
  onIssueDetected?: (issue: AccessibilityIssue) => void;
  onComplianceChange?: (isCompliant: boolean, issues: AccessibilityIssue[]) => void;
}

const DEFAULT_CONFIG: WCAGComplianceConfig = {
  level: "AA",
  enableAutoFix: true,
  reportingMode: "warning",
  colorBlindnessMode: "none",
};

/**
 * Calculate relative luminance using WCAG 2.1 formula.
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute contrast ratio between two hex colors.
 */
function getContrastRatio(color1: string, color2: string): number {
  const parseColor = (color: string): [number, number, number] => {
    const hex = color.replace("#", "");
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  };

  const lum1 = getLuminance(parseColor(color1));
  const lum2 = getLuminance(parseColor(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast ratio for text per WCAG thresholds.
 */
export function validateContrastRatio(
  foreground: string,
  background: string,
  fontSize: number,
  isBold: boolean,
  level: "AA" | "AAA" = "AA",
): ContrastRatio {
  const ratio = getContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

  const minAA = isLargeText ? 3 : 4.5;
  const minAAA = isLargeText ? 4.5 : 7;

  const passes = level === "AAA" ? ratio >= minAAA : ratio >= minAA;

  return {
    ratio,
    passes,
    level,
    foreground,
    background,
  };
}

/**
 * React hook wrapper for contrast validation.
 */
export function useContrastValidation(
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false,
  level: "AA" | "AAA" = "AA",
): ContrastRatio {
  return validateContrastRatio(foreground, background, fontSize, isBold, level);
}

/**
 * Hook for adding/removing focus classes on an element.
 */
export function useFocusManagement(elementRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleFocus = () => el.classList.add("has-focus");
    const handleBlur = () => el.classList.remove("has-focus");

    el.addEventListener("focus", handleFocus);
    el.addEventListener("blur", handleBlur);

    return () => {
      el.removeEventListener("focus", handleFocus);
      el.removeEventListener("blur", handleBlur);
    };
  }, [elementRef]);
}

/**
 * Internal: scan DOM for basic accessibility issues.
 * NOTE: intentionally conservative to avoid false positives and heavy work in the render path.
 */
function collectAccessibilityIssues(config: WCAGComplianceConfig): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const now = Date.now();

  // Images missing alt/ARIA
  document.querySelectorAll("img").forEach((img, index) => {
    if (!img.alt && !img.getAttribute("aria-label")) {
      issues.push({
        id: `img-alt-${index}-${now}`,
        severity: "error",
        wcagCriterion: "1.1.1",
        element: "img",
        description: "Image is missing alt text or ARIA label.",
        recommendation:
          "Add an alt attribute or aria-label that describes the image's purpose.",
        timestamp: now,
      });
    }
  });

  // Heading hierarchy
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
  );
  let lastLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1] || "0", 10);
    if (lastLevel !== 0 && level - lastLevel > 1) {
      issues.push({
        id: `heading-${index}-${now}`,
        severity: "warning",
        wcagCriterion: "1.3.1",
        element: heading.tagName.toLowerCase(),
        description: `Heading level jumps from h${lastLevel} to h${level}.`,
        recommendation: "Maintain sequential heading levels without skipping.",
        timestamp: now,
      });
    }
    lastLevel = level;
  });

  // Buttons without accessible name
  document.querySelectorAll("button").forEach((button, index) => {
    const text = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute("aria-label");
    const hasLabelledBy = button.getAttribute("aria-labelledby");

    if (!text && !hasAriaLabel && !hasLabelledBy) {
      issues.push({
        id: `button-${index}-${now}`,
        severity: "error",
        wcagCriterion: "4.1.2",
        element: "button",
        description: "Button has no accessible name.",
        recommendation:
          "Add visible text, aria-label, or aria-labelledby describing the action.",
        timestamp: now,
      });
    }
  });

  // Inputs without labels
  document
    .querySelectorAll("input, select, textarea")
    .forEach((input, index) => {
      const type = input.getAttribute("type");
      if (type === "hidden") return;

      const hasAriaLabel = input.getAttribute("aria-label");
      const hasAriaLabelledBy = input.getAttribute("aria-labelledby");
      const hasLabel =
        input.id &&
        document.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`);

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasLabel) {
        issues.push({
          id: `input-${index}-${now}`,
          severity: "error",
          wcagCriterion: "3.3.2",
          element: input.tagName.toLowerCase(),
          description: "Form control has no associated label.",
          recommendation:
            "Associate with a label element or provide aria-label/aria-labelledby.",
          timestamp: now,
        });
      }
    });

  // Interactive elements without keyboard access
  document
    .querySelectorAll<HTMLElement>("[onclick], [onkeypress]")
    .forEach((el, index) => {
      const tag = el.tagName.toLowerCase();
      const hasTabIndex = el.hasAttribute("tabindex");
      const isNativeInteractive =
        tag === "button" ||
        tag === "a" ||
        tag === "input" ||
        tag === "select" ||
        tag === "textarea";

      if (!isNativeInteractive && !hasTabIndex) {
        issues.push({
          id: `keyboard-${index}-${now}`,
          severity: "error",
          wcagCriterion: "2.1.1",
          element: tag,
          description: "Interactive element is not keyboard reachable.",
          recommendation:
            "Ensure element has tabindex=0 and keyboard event handlers for activation.",
          timestamp: now,
        });
      }
    });

  // Optional auto-fix for keyboard accessibility
  if (config.enableAutoFix) {
    issues.forEach((issue) => {
      if (issue.wcagCriterion === "2.1.1") {
        try {
          const candidates = document.querySelectorAll<HTMLElement>(issue.element);
          candidates.forEach((el) => {
            if (!el.hasAttribute("tabindex")) {
              el.setAttribute("tabindex", "0");
            }
          });
        } catch {
          // best-effort; do not throw
        }
      }
    });
  }

  return issues;
}

/**
 * Main WCAG compliance monitor component.
 *
 * Mount this once near the root of the app (e.g., inside App.tsx)
 * to continuously scan and report accessibility issues.
 */
export const WCAGCompliance: React.FC<WCAGComplianceProps> = ({
  config: userConfig,
  onIssueDetected,
  onComplianceChange,
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);

  const performScan = useCallback(() => {
    const detected = collectAccessibilityIssues(config);
    if (!detected.length) return;

    if (config.reportingMode !== "silent") {
      detected.forEach((issue) => {
        if (config.reportingMode === "strict" && issue.severity === "error") {
          // eslint-disable-next-line no-console
          console.error(`[WCAG ${issue.wcagCriterion}] ${issue.description}`);
        } else if (config.reportingMode === "warning") {
          // eslint-disable-next-line no-console
          console.warn(`[WCAG ${issue.wcagCriterion}] ${issue.description}`);
        }
        onIssueDetected?.(issue);
      });
    }

    setIssues((prev) => {
      const merged = [...prev, ...detected];
      const hasErrors = merged.some((i) => i.severity === "error");
      onComplianceChange?.(!hasErrors, merged);
      return merged;
    });
  }, [config, onIssueDetected, onComplianceChange]);

  // Color blindness simulation via root classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("protanopia", "deuteranopia", "tritanopia");

    if (config.colorBlindnessMode && config.colorBlindnessMode !== "none") {
      root.classList.add(config.colorBlindnessMode);
    }
  }, [config.colorBlindnessMode]);

  // Periodic scanning
  useEffect(() => {
    setIsScanning(true);
    performScan();
    setIsScanning(false);

    scanIntervalRef.current = window.setInterval(() => {
      performScan();
    }, 5000);

    return () => {
      if (scanIntervalRef.current != null) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [performScan]);

  // Keyboard navigation quality-of-life improvements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }

      // Alt+M: Skip to main content
      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        const main = document.querySelector<HTMLElement>("main, [role='main']");
        if (main) {
          if (!main.hasAttribute("tabindex")) {
            main.setAttribute("tabindex", "-1");
          }
          main.focus();
          main.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  if (config.reportingMode === "silent") {
    return null;
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="wcag-compliance-monitor" role="status" aria-live="polite">
      {isScanning && (
        <div className="scanning-indicator">
          Scanning for accessibility issues…
        </div>
      )}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="accessibility-issues-summary">
          <span className="sr-only">
            {errorCount} accessibility errors and {warningCount} warnings detected.
          </span>
        </div>
      )}
    </div>
  );
};

export default WCAGCompliance;

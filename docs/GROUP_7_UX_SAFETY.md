<!-- path: docs/GROUP_7_UX_SAFETY.md -->

# Group 7 – UX Safety & Accessibility

> UX-layer safety envelope for SynSync: SPL awareness, photosensitivity screening,
> accessible controls, and WCAG 2.1 AA support across the app shell.

---

## 1. Scope and goals

Group 7 adds a coherent UX safety layer on top of the lower-level safety
modules (17: AuditorySafetyMonitor, 18: PhotosensitivitySafetyScreener,
19: TBD) to ensure that users see, understand, and can act on safety
signals in real time.

### 1.1 Objectives

- Provide a consistent, non-alarming but explicit safety UX.
- Gate high-risk features (visual entrainment, high SPL) behind screening
  and calibration flows.
- Move the application toward WCAG 2.1 AA compliance for core flows.

---

## 2. Module 20 – WCAG accessibility

Module 20 is implemented as `src/safety/WCAGCompliance.tsx` plus
shared CSS in `src/safety/accessibility.css`.

### 2.1 Responsibilities

- Monitor the live DOM for a bounded set of accessibility issues.
- Surface issues via console (for devs) and via ARIA-friendly status
  messages (for assistive tech).
- Provide hooks that other components can consume for contrast and focus
  management.
- Expose configuration for:
  - Conformance level: A / AA / AAA.
  - Reporting mode: silent / warning / strict.
  - Color-blindness simulation: none / protanopia / deuteranopia / tritanopia.

### 2.2 Mounting

- Mount exactly once near the root of the React tree, for example:

```tsx
// inside App.tsx (simplified)
import { WCAGCompliance } from "./src/safety/WCAGCompliance";

function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <WCAGCompliance
        config={{
          level: "AA",
          reportingMode: import.meta.env.DEV ? "warning" : "silent",
        }}
      />
      <main id="main" role="main" tabIndex={-1}>
        {/* Existing app content */}
      </main>
    </>
  );
}

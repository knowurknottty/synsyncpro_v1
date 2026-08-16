# SynSync Pro Responsive Consolidation

Canonical visual baseline: the desktop research-instrument cockpit shown in the July 2026 reference capture.

## Invariants

- Preserve the desktop 3-column instrument layout at cockpit widths.
- Mobile and tablet remain the same product: same terminology, semantic colors, session state, phase strip, visualizer hierarchy, tuning controls, evidence, and contraindications.
- Responsive changes may alter placement, disclosure, and navigation, but not feature meaning or protocol behavior.
- No audio-engine, protocol-registry, evidence-grade, safety, access-control, or export behavior may change during this pass.

## Layout classes

- `compact`: below 640 CSS px
- `medium`: 640–1099 CSS px
- `cockpit`: 1100 CSS px and above

Classification uses `matchMedia`, not an ad-hoc resize-only width check. Layout mode must remain stable across orientation changes and browser chrome changes.

## Validation ledger

Required before merge:

1. `npm run type-check`
2. `npm test -- --run`
3. `npm run build`
4. No horizontal document overflow at 375, 390, 430, 768, 1024, 1280, 1440, and 1728 CSS px.
5. Active protocol, playback state, tuning values, and selected visualizer survive layout changes.
6. Exactly one audio context and one visualizer render loop remain active after viewport transitions.
7. Mobile safe-area insets and dynamic viewport units are honored.
8. BioCAPT independent review: inspect the diff for UI regression, state duplication, hidden controls, accessibility, and safety/evidence drift.

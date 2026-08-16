# Shell Audit: DesktopApp.tsx vs MobileApp.tsx

> **Generated:** 2026-07-09
> **Files analyzed:** `components/DesktopApp.tsx` (735 lines), `components/MobileApp.tsx` (587 lines)

---

## 1. DesktopApp.tsx — Detailed Inventory

### 1.1 Child Components Rendered

| Component | Props / Notes |
|---|---|
| `UserProfile` | `isOpen`, `accessSession`, `onClose`, `onUpdateSession`, `onRequestNewFile` |
| `SourcesModal` | `isOpen={modals.sources}`, `onClose` |
| `LegalModal` | `isOpen={modals.legal}`, `onClose` |
| `DownloadPortal` | `isOpen={modals.download}`, `onClose` |
| `SafetyGateModal` | `isOpen`, `onClose`, `onClearance`, `protocol` |
| `Logo` | Sidebar header, `size="lg"`, `showIcon={false}`, `variant="default"` |
| `GuidedHome` | Sidebar content in guided mode — `protocols`, `selectedId`, `onSelect`, `prescription` |
| `ProtocolList` | Sidebar content in expert mode — `protocols`, `selectedId`, `onSelect`, `mode` |
| `Visualizer` | Main visualizer — `audioEngine`, `isPlaying`, `mode`, `complexity`, `background`, `hdEnabled` |
| `SessionProgress` | Bottom of visualizer container — `audioEngine` |
| `GuidanceOverlay` | Overlays on visualizer — `modes`, `breathRatio`, `mantra`, `elapsedTime`, `onClose` |
| `PhaseTimeline` | Expert right column — `protocol`, `audioEngine` |
| `ManualTuningPanel` | Expert right column — `audioEngine` |
| `WavExporter` | Below protocol info card — `protocol`, `audioEngine` |

### 1.2 Local State Variables

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `vizMode` | `string` | `'oscilloscope'` | Active visualizer render mode |
| `isFullscreen` | `boolean` | `false` | Whether visualizer is in fullscreen |
| `activeGuidances` | `Set<SessionGuidance>` | `new Set()` | Active guidance overlay modes |
| `profileOpen` | `boolean` | `false` | User profile panel visibility |

### 1.3 Refs

| Ref | Type | Purpose |
|---|---|---|
| `vizContainerRef` | `HTMLDivElement` | Target for fullscreen request |

### 1.4 Event Handlers

| Handler | Trigger | Description |
|---|---|---|
| `toggleGuidance(id)` | Guidance pill buttons | Toggle a guidance mode on/off; socratic is exclusive |
| `handleDownloadFile()` | (defined but no direct trigger in render — likely passed down) | Creates blob URL and triggers browser download |
| `handleFullscreen()` | Fullscreen toggle button | Toggle fullscreen on the visualizer container |
| `onClick → onSelectProtocol(null)` | Logo button in sidebar | Clear protocol and return to home view |
| `onClick → onSetUiMode('guided')` | Guided toggle button | Switch to guided mode |
| `onClick → onSetUiMode('expert')` | Expert toggle button | Switch to expert mode |
| `onClick → onSetAppMode('scientific')` | Scientific toggle button | Filter to research-backed protocols only |
| `onClick → onSetAppMode('speculative')` | Exploratory toggle button | Include all protocols |
| `onClick → onOpenModal('sources')` | Library button | Open sources modal |
| `onClick → onOpenModal('legal')` | Legal button | Open legal modal |
| `onClick → onOpenModal('settings')` | Settings button | Open settings modal |
| `onClick` (Back) | ChevronLeft button on visualizer | Exit fullscreen |
| `onClick → onVolumeChange(parseFloat)` | Volume range input | Adjust master volume |
| `onClick → setProfileOpen(true)` | Profile button in header | Open user profile panel |
| `onClick → onPlay()` | Play/Pause button (80×80 circle) | Start or pause protocol playback |
| `onClick → setVizMode(m.id)` | Visualizer mode picker pills | Switch visualizer render mode |
| `onClick → setActiveGuidances(new Set())` | Audio Only pill | Clear all guidance modes |
| `onClick → onOpenModal('download')` | "Get Portable App" button | Open download portal |

### 1.5 UI Sections

| Section | Location | Description |
|---|---|---|
| Scanlines overlay | Root level | `pointer-events-none`, opacity 20% |
| Modals (5) | Root level | UserProfile, Sources, Legal, Download, SafetyGate |
| **Sidebar** | `col-span-3` | Logo, UI Mode toggle, App Mode toggle (expert-only), scrollable protocol list (GuidedHome or ProtocolList), footer with Library/Legal/Settings buttons |
| **Header bar** | Main content, `h-16` | Session status indicator (pulsing dot + label), volume slider, profile button |
| **Visualizer container** | Left column, `col-span-7` | Aspect-video container with Visualizer, gradient overlay, back button, fullscreen toggle, floating guidance switcher, SessionProgress at bottom, GuidanceOverlay |
| Visualizer mode picker | Below visualizer | Horizontal scrollable pill row — 4 modes (guided) or 10 modes (expert) |
| Guidance multi-select picker | Below mode picker | Horizontal scrollable pill row with Audio Only + 4 guidance modes |
| **Protocol Info card** | Left column | Title, evidence level badge, section badge, time-of-day badge (expert), onset time (expert), play/pause button (80×80), description, usage goal, "Get Portable App" button |
| WavExporter | Below protocol info | WAV export controls |
| **Right column** | `col-span-5` | Varies by uiMode |
| — Guided right column | — | Best time card, Contraindications card, "Switch to Expert" upsell card |
| — Expert right column | — | PhaseTimeline, ManualTuningPanel, How It Works (algoDesc), Research Background, Source Citation, Contraindications |
| Empty state | Main content (no protocol) | Headphones icon + "Choose a session from the panel" |

---

## 2. MobileApp.tsx — Detailed Inventory

### 2.1 Child Components Rendered

| Component | Props / Notes |
|---|---|
| `UserProfile` | `isOpen`, `accessSession`, `onClose`, `onUpdateSession`, `onRequestNewFile` |
| `SourcesModal` | `isOpen={modals.sources}`, `onClose` |
| `LegalModal` | `isOpen={modals.legal}`, `onClose` |
| `SafetyGateModal` | `isOpen`, `onClose`, `onClearance`, `protocol` |
| `Logo` | Header, `size="sm"`, `showIcon={false}`, `variant="simple"` |
| `ProtocolGallery` | Archive tab — `protocols`, `selectedId`, `mode`, `onSelect`, `onNavigateToSession` |
| `Visualizer` | Session tab mini-preview — `audioEngine`, `isPlaying`, `mode` (oscilloscope or cymatics), `complexity`, `background`, `hdEnabled={false}` |
| `SessionProgress` | Session tab — `audioEngine` |
| `GuidanceOverlay` | Session tab overlay — `modes`, `breathRatio`, `mantra`, `elapsedTime`, `onClose` |
| `WavExporter` | Session tab — `protocol`, `audioEngine` |
| `BioInsights` | Tech tab — `audioEngine`, `activeProtocol`, `isPlaying` |
| `ManualTuningPanel` | Tech tab — `audioEngine` |
| `VisualizerView` | Viz tab (immersive) — `audioEngine`, `activeProtocol`, `audioState`, `uiMode`, `isPlayingCurrent`, `onPlay`, `onBack` |

### 2.2 Local State Variables

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `activeGuidances` | `Set<SessionGuidance>` | `new Set()` | Active guidance overlay modes |
| `cymaticsSubstrate` | `boolean` | `false` | Toggle mini-visualizer between oscilloscope and cymatics |
| `profileOpen` | `boolean` | `false` | User profile panel visibility |

### 2.3 Event Handlers

| Handler | Trigger | Description |
|---|---|---|
| `toggleGuidance(id)` | Guidance pill buttons | Toggle a guidance mode; socratic is exclusive |
| `handleDownloadFile()` | (defined, no direct trigger in render) | Creates blob URL and triggers browser download |
| `handleCentreButton()` | Centre pill nav button | If no protocol → archive; else play + switch to viz tab |
| `handleGallerySelect(p)` | ProtocolGallery `onSelect` | Select protocol and switch to session tab |
| `onClick → onSetMobileTab('archive')` | Back button (ArrowLeft) in header | Navigate back to gallery |
| `onClick → onSetUiMode('guided')` | Guided toggle button | Switch to guided mode |
| `onClick → onSetUiMode('expert')` | Expert toggle button | Switch to expert mode |
| `onClick → setProfileOpen(true)` | Profile button in header | Open user profile panel |
| `onClick → onVolumeChange(parseFloat)` | Volume range input | Adjust master volume |
| `onClick → setCymaticsSubstrate(v => !v)` | Cymatics toggle on mini visualizer | Toggle between oscilloscope/cymatics |
| `onClick → onSetMobileTab('viz')` | "Expand" button on mini visualizer | Switch to immersive viz tab |
| `onClick → setActiveGuidances(new Set())` | Audio Only pill | Clear all guidance modes |
| `onClick → onPlay()` | Play/Pause button (session tab) | Start or pause protocol playback |
| `onClick → onSetMobileTab('viz')` | "Open Visualizer" button (session tab) | Switch to immersive viz tab |
| `onClick → onSetMobileTab(tab)` | Floating pill nav items | Navigate between archive/session/tech/viz |

### 2.4 UI Sections

| Section | Location | Description |
|---|---|---|
| Scanlines overlay | Root level | `pointer-events-none`, opacity 10% |
| Modals (4) | Root level | UserProfile, Sources, Legal, SafetyGate |
| **Header** | `h-16`, hidden in immersive viz mode | Back/Logo, UI Mode toggle, Profile button, Volume slider |
| **Archive tab** | `mobileTab === 'archive'` | `ProtocolGallery` — full-screen scrollable grid |
| **Session tab** | `mobileTab === 'session'` | Mini visualizer (with cymatics toggle + expand button), guidance multi-select row, protocol info card (title, evidence level, play/pause button, session goal, SessionProgress), "Open Visualizer" button, WavExporter, empty state |
| **Tech tab** | `mobileTab === 'tech'` | BioInsights, ManualTuningPanel, DSP Algorithm display, Research Background, Source Citation, session expiry footer |
| **Viz tab** | `mobileTab === 'viz'` | `VisualizerView` — full-screen immersive visualizer |
| GuidanceOverlay | Session tab only (when active) | Overlays on session content |
| **Floating Pill Navigation** | Fixed bottom, hidden in immersive viz mode | Left items (Gallery, Insights), Centre button (Play/Waves), Right items (Session, Visualize) |
| Ambient glows | Fixed background | Two blurred cyan circles for atmosphere |

---

## 3. DIFF Table — Shared vs. Exclusive Elements

### 3.1 Shared Elements (Both Components)

| Element | DesktopApp | MobileApp | Notes |
|---|---|---|---|
| **Visualizer** | Full-size, aspect-video, in left column | Mini preview in session tab + VisualizerView in viz tab | Desktop: single instance; Mobile: two modes |
| **SessionProgress** | Bottom of visualizer container | Inside session tab protocol card | Same component, different placement |
| **GuidanceOverlay** | Always rendered over visualizer | Session tab only, conditional on `guidanceModes.length > 0` | Same component, different trigger logic |
| **ManualTuningPanel** | Expert right column | Tech tab | Same component, different parent container |
| **WavExporter** | Below protocol info card in left column | Bottom of session tab | Same component |
| **SafetyGateModal** | Root-level modal | Root-level modal | Identical usage |
| **SourcesModal** | Root-level modal | Root-level modal | Identical usage |
| **LegalModal** | Root-level modal | Root-level modal | Identical usage |
| **UserProfile** | Root-level modal, controlled by `profileOpen` | Root-level modal, controlled by `profileOpen` | Identical usage |
| **Logo** | Sidebar header (`size="lg"`, `variant="default"`) | Header (`size="sm"`, `variant="simple"`) | Different size/variant |
| **UI Mode toggle** | Sidebar (Guided/Expert) | Header (Guided/Expert) | Same functionality, different placement |
| **Volume control** | Header bar with label + slider + % | Header with icon + compact slider | Same functionality, different layout |
| **Profile button** | Header bar (pill-shaped with name) | Header (icon-only circle) | Same action, different design |
| **Play/Pause** | 80×80 circle in protocol info card | 56×56 circle in session tab card | Different size, same behavior |
| **Session status indicator** | Pulsing dot + "Session Active/Ready" label in header | Implied via play state (no explicit status text) | Desktop has explicit indicator |
| **activeGuidances state** | `Set<SessionGuidance>` | `Set<SessionGuidance>` | Identical state + toggle logic |
| **profileOpen state** | `boolean` | `boolean` | Identical pattern |
| **toggleGuidance handler** | useCallback with same logic | useCallback with same logic | Identical implementation |
| **handleDownloadFile handler** | Blob download utility | Blob download utility | Identical implementation |
| **mantraForOverlay** | Derived from activeProtocol or DEFAULT_MANTRA | Derived from activeProtocol or DEFAULT_MANTRA | Identical computation |
| **DEFAULT_MANTRA** | Module-level constant | Module-level constant | Identical values |
| **Scanlines overlay** | Root level, opacity 20% | Root level, opacity 10% | Same structure, different opacity |
| **Empty state** | Headphones icon + "Choose a session" | Headphones icon + "Tap Gallery to browse" | Same pattern, different copy |
| **Protocol info card** | Title, evidence level, session goal, play/pause | Title, evidence level, session goal, play/pause | Same data displayed, different layout |
| **Guidance multi-select** | Horizontal pill row below mode picker | Horizontal pill row in session tab | Same pills, different context |
| **safetyCleared prop** | Not in props (uses modals.safetyGate) | Passed as `safetyCleared` prop | Different prop interface |

### 3.2 Elements ONLY in DesktopApp

| Element | Description |
|---|---|
| `ProtocolList` | Expert-mode sidebar protocol list component |
| `GuidedHome` | Guided-mode sidebar home/goals grid component |
| `DownloadPortal` | Download portal modal (absent from MobileApp) |
| `PhaseTimeline` | Expert right-column phase structure visualization |
| **12-column grid layout** | `grid grid-cols-12` with `col-span-3` sidebar + `col-span-9` main |
| **Sidebar (col-span-3)** | Persistent left panel with logo, mode toggles, protocol list, footer buttons |
| **App Mode toggle** | Research-Backed / Exploratory toggle (expert mode only) |
| **Visualizer mode picker** | Full row of 4 (guided) or 10 (expert) visualizer mode pills |
| **Full-screen visualizer** | Aspect-video container with fullscreen API support |
| **Fullscreen toggle button** | `requestFullscreen()` / `exitFullscreen()` on visualizer container |
| **`isFullscreen` state** | Tracks fullscreen state via `fullscreenchange` event |
| **`vizMode` state** | Controls which visualizer render mode is active |
| **`vizContainerRef`** | Ref for fullscreen target element |
| **Floating guidance switcher** | Vertical icon buttons overlaid on visualizer (right side) |
| **Back button on visualizer** | ChevronLeft overlay button to exit fullscreen |
| **Sidebar footer buttons** | Library, Legal, Settings buttons in sidebar bottom |
| **Expert right column details** | How It Works (algoDesc), Research Background, Source Citation panels |
| **Guided right column** | Best time card, Contraindications card, "Switch to Expert" upsell |
| **"Get Portable App" button** | Opens download portal modal |
| **Visualizer mode descriptions** | `VIZ_MODE_DESCRIPTIONS` tooltip data for each mode |
| **GUIDED_VIZ_MODES / EXPERT_VIZ_MODES** | Separate mode arrays per UI mode |
| **WEBGL_MODES set** | Modes requiring `hdEnabled=true` |
| **`safetyCleared`** | Not present as a prop (handled differently) |
| **`mobileTab` prop** | Not present (no tab navigation) |
| **`onSetMobileTab` prop** | Not present |

### 3.3 Elements ONLY in MobileApp

| Element | Description |
|---|---|
| `ProtocolGallery` | Full-screen protocol browsing grid (archive tab) |
| `VisualizerView` | Immersive full-screen visualizer component (viz tab) |
| `BioInsights` | Technical insights panel (tech tab) |
| **Tab-based navigation** | `mobileTab` state with 4 tabs: archive, session, tech, viz |
| **`onSetMobileTab` prop** | Tab navigation callback |
| **`mobileTab` prop** | Current active tab |
| **`safetyCleared` prop** | Explicit prop (vs. modal-controlled in Desktop) |
| **Floating pill navigation** | Fixed bottom nav with left items, centre button, right items |
| **Centre button (FAB)** | 56×56 floating action button — Play/Waves icon, cyan glow |
| **Browser back interception** | `popstate` listener + `pushState` to route back through in-app tabs |
| **Cymatics substrate toggle** | Toggle on mini visualizer between oscilloscope and cymatics |
| **`cymaticsSubstrate` state** | Boolean controlling mini visualizer mode |
| **`isImmersive` derived flag** | `mobileTab === 'viz'` — hides header + nav in viz tab |
| **`showBack` derived flag** | Controls back button visibility in header |
| **`NAV_ITEMS_LEFT` / `NAV_ITEMS_RIGHT`** | Static nav configuration arrays |
| **`MOBILE_GUIDANCE` array** | Guidance mode config (4 items vs. Desktop's 5) |
| **Ambient glows** | Two fixed blurred cyan circles for visual atmosphere |
| **Session expiry footer** | `AccessKeyService.formatExpiry()` display in tech tab |
| **DSP Algorithm display** | `activeProtocol.algoDesc` in tech tab |
| **Research Background** | `activeProtocol.researchContext` in tech tab |
| **Source Citation** | `activeProtocol.citation` in tech tab |
| **`AccessKeyService` import** | Not imported in DesktopApp |
| **Slide-in animations** | `animate-in slide-in-from-right-4` transitions between tabs |
| **Safe area padding** | `safe-area-pb` class for iOS notch/home indicator |
| **`WebkitOverflowScrolling: 'touch'`** | iOS momentum scrolling on scroll containers |

---

## 4. Prop Interface Comparison

### DesktopApp Props

| Prop | Type |
|---|---|
| `audioEngine` | `AudioEngine` |
| `activeProtocol` | `Protocol \| null` |
| `audioState` | `AudioState` |
| `appMode` | `'scientific' \| 'speculative'` |
| `uiMode` | `'guided' \| 'expert'` |
| `isPlayingCurrent` | `boolean` |
| `modals` | `Record<string, boolean>` |
| `accessSession` | `AccessSession` |
| `onSelectProtocol` | `(protocol: Protocol) => void` |
| `onSetAppMode` | `(mode) => void` |
| `onSetUiMode` | `(mode) => void` |
| `onPlay` | `() => void` |
| `onVolumeChange` | `(volume: number) => void` |
| `onOpenModal` | `(modal: string) => void` |
| `onCloseModal` | `(modal: string) => void` |
| `onSafetyCleared` | `() => void` |
| `onUpdateSession` | `(s: AccessSession) => void` |

### MobileApp Props (superset of Desktop)

| Prop | Type | Differs from Desktop? |
|---|---|---|
| All Desktop props | (same) | Same |
| `mobileTab` | `MobileTab` (`'archive' \| 'session' \| 'tech' \| 'viz'`) | **New** — Desktop has no tabs |
| `safetyCleared` | `boolean` | **New** — Desktop doesn't receive this |
| `onSetMobileTab` | `(tab: MobileTab) => void` | **New** — Desktop has no tab navigation |

---

## 5. Summary

**Architecture difference:** DesktopApp uses a persistent sidebar + main content 12-column grid. MobileApp uses a 4-tab architecture with floating pill navigation and slide-in transitions.

**Component reuse:** 8 components are shared (Visualizer, SessionProgress, GuidanceOverlay, ManualTuningPanel, WavExporter, SafetyGateModal, SourcesModal, LegalModal, UserProfile). 3 are exclusive to Desktop (ProtocolList, GuidedHome, DownloadPortal). 3 are exclusive to Mobile (ProtocolGallery, VisualizerView, BioInsights).

**State divergence:** Desktop manages `vizMode` + `isFullscreen` + ref (for fullscreen visualizer control). Mobile manages `cymaticsSubstrate` + tab navigation. Both share `activeGuidances` and `profileOpen` with identical logic.

**Key duplication risk:** The `toggleGuidance`, `handleDownloadFile`, `mantraForOverlay`, and `DEFAULT_MANTRA` implementations are duplicated verbatim between both files. The modal rendering block (UserProfile, SourcesModal, LegalModal, SafetyGateModal) is also near-identical.

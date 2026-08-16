/**
 * Shared shell components for responsive layout consolidation.
 *
 * These components extract the common UI elements from DesktopApp and MobileApp
 * into reusable pieces. The ResponsiveShell (Stage 3B) will compose these with
 * layout-specific wrappers.
 *
 * Components:
 * - useSessionShell: shared state hook (vizMode, guidances, profile)
 * - ShellModals: shared modal layer (SafetyGate, Sources, Legal, UserProfile, Download)
 * - ProtocolInfoCard: protocol details + play button
 * - GuidancePicker: guidance mode multi-select
 * - VizModePicker: visualizer mode selector
 * - UiModeToggle: Guided/Expert toggle
 */

export { useSessionShell, getMantraForOverlay, DEFAULT_MANTRA, GUIDANCE_MODES } from './useSessionShell.ts';
export type { UseSessionShellReturn } from './useSessionShell.ts';

export { ShellModals } from './ShellModals.tsx';
export type { ShellModalsProps } from './ShellModals.tsx';

export { ProtocolInfoCard } from './ProtocolInfoCard.tsx';
export type { ProtocolInfoCardProps } from './ProtocolInfoCard.tsx';

export { GuidancePicker } from './GuidancePicker.tsx';
export type { GuidancePickerProps } from './GuidancePicker.tsx';

export { VizModePicker } from './VizModePicker.tsx';
export type { VizModePickerProps, VizMode } from './VizModePicker.tsx';

export { UiModeToggle } from './UiModeToggle.tsx';
export type { UiModeToggleProps } from './UiModeToggle.tsx';

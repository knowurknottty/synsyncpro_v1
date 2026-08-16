import React from 'react';
import { Protocol, AccessSession } from '../../types.ts';
import { UserProfile } from '../UserProfile.tsx';
import { SourcesModal } from '../SourcesModal.tsx';
import { LegalModal } from '../LegalModal.tsx';
import { DownloadPortal } from '../DownloadPortal.tsx';
import { SafetyGateModal } from '../SafetyGateModal.tsx';

/**
 * Shared modal layer extracted from DesktopApp + MobileApp.
 *
 * Both components render the same set of modals with identical props.
 * This component centralizes them so ResponsiveShell can render once.
 */

export interface ShellModalsProps {
  modals: Record<string, boolean>;
  accessSession: AccessSession;
  activeProtocol: Protocol | null;
  profileOpen: boolean;
  onCloseModal: (modal: string) => void;
  onSafetyCleared: () => void;
  onUpdateSession: (s: AccessSession) => void;
  onCloseProfile: () => void;
}

export const ShellModals: React.FC<ShellModalsProps> = React.memo(({
  modals,
  accessSession,
  activeProtocol,
  profileOpen,
  onCloseModal,
  onSafetyCleared,
  onUpdateSession,
  onCloseProfile,
}) => (
  <>
    <UserProfile
      isOpen={profileOpen}
      accessSession={accessSession}
      onClose={onCloseProfile}
      onUpdateSession={onUpdateSession}
      onRequestNewFile={onCloseProfile}
    />
    <SourcesModal isOpen={!!modals.sources} onClose={() => onCloseModal('sources')} />
    <LegalModal isOpen={!!modals.legal} onClose={() => onCloseModal('legal')} />
    <DownloadPortal isOpen={!!modals.download} onClose={() => onCloseModal('download')} />
    <SafetyGateModal
      isOpen={!!modals.safetyGate}
      onClose={() => onCloseModal('safetyGate')}
      onClearance={onSafetyCleared}
      protocol={activeProtocol}
    />
  </>
));

ShellModals.displayName = 'ShellModals';

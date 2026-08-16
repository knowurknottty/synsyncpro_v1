import { lazy } from 'react';

/**
 * Lazy-loaded modal components for code splitting and performance
 *
 * These modals are code-split and only loaded when needed,
 * reducing initial bundle size and improving initial load time.
 *
 * Usage:
 * const LazySourcesModal = lazyModals.SourcesModal;
 *
 * In JSX, wrap with Suspense:
 * <Suspense fallback={<LoadingSpinner />}>
 *   <LazySourcesModal isOpen={isOpen} onClose={onClose} />
 * </Suspense>
 */

export const lazyModals = {
  /**
   * Lazy-loaded SourcesModal component
   * Research sources and references
   */
  SourcesModal: lazy(() =>
    import('../../components/SourcesModal.tsx').then((module) => ({
      default: module.SourcesModal,
    }))
  ),

  /**
   * Lazy-loaded LegalModal component
   * Legal disclaimers and terms
   */
  LegalModal: lazy(() =>
    import('../../components/LegalModal.tsx').then((module) => ({
      default: module.LegalModal,
    }))
  ),

  /**
   * Lazy-loaded DownloadPortal component
   * Protocol download functionality
   */
  DownloadPortal: lazy(() =>
    import('../../components/DownloadPortal.tsx').then((module) => ({
      default: module.DownloadPortal,
    }))
  ),

  /**
   * Lazy-loaded SafetyGateModal component
   * Safety screening and clearance
   */
  SafetyGateModal: lazy(() =>
    import('../../components/SafetyGateModal.tsx').then((module) => ({
      default: module.SafetyGateModal,
    }))
  ),
};

/**
 * Optional: Create a wrapper component with Suspense built-in
 * for easier usage without needing to wrap every modal
 */
export const createLazyModalWrapper = (LazyComponent: any, fallback?: React.ReactNode) => {
  return (props: any) => {
    const { Suspense } = require('react');
    return (
      <Suspense fallback={fallback || null}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

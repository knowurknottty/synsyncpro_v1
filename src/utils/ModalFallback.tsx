import React from 'react';

/**
 * Fallback component shown while lazy modals are loading
 * Minimal and non-intrusive to avoid layout shift
 */
export const ModalFallback: React.FC = () => (
  <div data-testid="modal-fallback" className="invisible">
    {/* Invisible fallback to prevent layout shift */}
  </div>
);

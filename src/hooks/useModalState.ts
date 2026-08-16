import { useState, useCallback } from 'react';

export type ModalKey = 'sources' | 'legal' | 'download' | 'safetyGate' | 'manual' | 'biofeedback' | 'settings' | 'dataExport' | 'userProfile';

export type ModalState = Record<ModalKey, boolean>;

const initialModalState: ModalState = {
  sources: false,
  legal: false,
  download: false,
  safetyGate: false,
  manual: false,
  biofeedback: false,
  settings: false,
  dataExport: false,
  userProfile: false,
};

export function useModalState(initialState: Partial<ModalState> = {}) {
  const [modals, setModals] = useState<ModalState>({
    ...initialModalState,
    ...initialState,
  });

  const toggle = useCallback((modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: !m[modal] }));
  }, []);

  const open = useCallback((modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: true }));
  }, []);

  const close = useCallback((modal: ModalKey) => {
    setModals(m => ({ ...m, [modal]: false }));
  }, []);

  const closeAll = useCallback(() => {
    setModals(initialModalState);
  }, []);

  return { modals, toggle, open, close, closeAll };
}

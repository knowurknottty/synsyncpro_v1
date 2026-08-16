import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ──── Types ─────────────────────────────────────────────────────────────────────
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Position from which the drawer slides in */
  position?: 'left' | 'right' | 'bottom';
  /** Width for left/right drawers, height for bottom */
  size?: string;
  /** Optional title displayed in the header */
  title?: string;
  /** Whether to show a close button in the header */
  showClose?: boolean;
}

// ──── Component ─────────────────────────────────────────────────────────────────
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = '80%',
  title,
  showClose = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Position-based styles
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return {
          container: 'left-0 top-0 bottom-0',
          transform: isOpen ? 'translate-x-0' : '-translate-x-full',
          width: size,
          height: '100%',
        };
      case 'right':
        return {
          container: 'right-0 top-0 bottom-0',
          transform: isOpen ? 'translate-x-0' : 'translate-x-full',
          width: size,
          height: '100%',
        };
      case 'bottom':
        return {
          container: 'bottom-0 left-0 right-0',
          transform: isOpen ? 'translate-y-0' : 'translate-y-full',
          width: '100%',
          height: size,
        };
      default:
        return {};
    }
  };

  const positionStyles = getPositionStyles();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`absolute ${positionStyles.container} bg-neuro-800 shadow-2xl transition-transform duration-300 ease-in-out ${positionStyles.transform}`}
        style={{ width: positionStyles.width, height: positionStyles.height }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-neuro-700">
            {title && (
              <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neuro-700 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

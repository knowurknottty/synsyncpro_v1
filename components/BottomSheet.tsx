import React, { useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

// ──── Types ─────────────────────────────────────────────────────────────────────
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Height when fully open */
  maxHeight?: string;
  /** Whether the sheet can be dragged to close */
  dismissible?: boolean;
  /** Optional title */
  title?: string;
}

// ──── Component ─────────────────────────────────────────────────────────────────
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  maxHeight = '80vh',
  dismissible = true,
  title,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

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

  // Touch handling for drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dismissible) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dismissible || !sheetRef.current) return;
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!dismissible || !sheetRef.current) return;
    const deltaY = currentY.current - startY.current;
    
    // Close if dragged more than 100px or velocity is high
    if (deltaY > 100) {
      onClose();
    } else {
      // Snap back
      sheetRef.current.style.transform = '';
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-neuro-800 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out"
        style={{ maxHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {dismissible && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-neuro-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neuro-700 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: `calc(${maxHeight} - 80px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
};

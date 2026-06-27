import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RiAlertLine } from '@remixicon/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  confirmingLabel?: string;
  icon?: React.ReactNode;
  variant?: 'danger' | 'warning';
}

/**
 * A fully portalled confirmation modal that renders directly on document.body,
 * escaping all overflow:hidden and z-index constraints.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmingLabel = 'Processing...',
  icon,
  variant = 'danger',
}) => {
  // Close on Escape
  useCallback(() => {}, []);
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, loading, onClose]);

  const accentColor = variant === 'danger' ? 'red' : 'amber';

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && onClose()}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`relative w-full max-w-md bg-theme-bg-primary rounded-3xl shadow-2xl border p-8 overflow-hidden ${
              accentColor === 'red' ? 'border-red-500/20' : 'border-amber-500/20'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto ${
                accentColor === 'red'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              {icon ?? <RiAlertLine size={28} />}
            </div>

            {/* Title */}
            <h3
              className={`text-2xl font-display font-extrabold text-center mb-3 ${
                accentColor === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {title}
            </h3>

            {/* Description */}
            <p className="text-center text-theme-text-secondary leading-relaxed mb-8 text-sm">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={onClose} disabled={loading} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-white ${
                  accentColor === 'red'
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'
                }`}
              >
                {loading ? confirmingLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modal, document.body);
};

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

/**
 * Modal — generic overlay dialog. Renders via a portal so it always
 * sits above page content regardless of where it's mounted, closes on
 * Escape or backdrop click, and locks body scroll while open.
 */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-6 shadow-lift"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-xl font-medium">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-mist">
            <FiX size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

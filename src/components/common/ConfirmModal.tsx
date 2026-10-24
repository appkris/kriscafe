import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import { useConfirmStore } from '../../store/confirmStore';
import './ConfirmModal.css';

export const ConfirmModal: React.FC = () => {
  const { isOpen, options, isLoading, closeConfirm, executeConfirm } = useConfirmStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeConfirm]);

  if (!isOpen || !options) return null;

  const variant = options.variant || 'danger';

  const renderIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 size={26} strokeWidth={2.2} />;
      case 'warning':
        return <AlertTriangle size={26} strokeWidth={2.2} />;
      case 'info':
      default:
        return <HelpCircle size={26} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" onClick={closeConfirm}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon-bubble confirm-icon-bubble--${variant}`}>
          {renderIcon()}
        </div>

        <div>
          <h2 className="confirm-title">{options.title}</h2>
          <p className="confirm-message">{options.message}</p>
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn--cancel"
            onClick={closeConfirm}
            disabled={isLoading}
          >
            {options.cancelText || 'Batal'}
          </button>

          <button
            type="button"
            className={`confirm-btn confirm-btn--${variant}`}
            onClick={executeConfirm}
            disabled={isLoading}
            autoFocus
          >
            {isLoading ? 'Memproses...' : options.confirmText || 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

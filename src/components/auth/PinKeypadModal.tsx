import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Lock, X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/auth';
import './PinKeypadModal.css';

interface PinKeypadModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  requiredRole?: 'OWNER' | 'ANY';
  hintText?: string;
  onSuccess: (role?: UserRole) => void;
  onCancel?: () => void;
}

export const PinKeypadModal: React.FC<PinKeypadModalProps> = ({
  isOpen,
  title = 'Masukkan PIN',
  subtitle = 'Masukkan 4 digit PIN otorisasi',
  requiredRole = 'ANY',
  hintText = 'Default Kasir: 1234 | Owner: 8888',
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { unlockWithPin, verifyOwnerPin } = useAuthStore();

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setIsError(false);
      setErrorMessage('');
    }
  }, [pin.length]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
    setErrorMessage('');
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    setIsError(false);
    setErrorMessage('');
  }, []);

  // Verifikasi PIN otomatis saat mencapai 4 digit
  useEffect(() => {
    if (pin.length !== 4) return;

    let isMounted = true;

    const verify = async () => {
      if (requiredRole === 'OWNER') {
        const isOwner = await verifyOwnerPin(pin);
        if (!isMounted) return;

        if (isOwner) {
          setPin('');
          onSuccess('OWNER');
        } else {
          setIsError(true);
          setErrorMessage('PIN Owner salah! Hanya Owner/Supervisor yang diizinkan.');
          setTimeout(() => {
            if (isMounted) setPin('');
          }, 350);
        }
      } else {
        const result = await unlockWithPin(pin);
        if (!isMounted) return;

        if (result.success) {
          setPin('');
          onSuccess(result.role);
        } else {
          setIsError(true);
          setErrorMessage(result.message || 'PIN tidak valid.');
          setTimeout(() => {
            if (isMounted) setPin('');
          }, 350);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [pin, requiredRole, verifyOwnerPin, unlockWithPin, onSuccess]);

  // Support physical keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleDelete, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="pin-modal-overlay" role="dialog" aria-modal="true">
      <div className="pin-modal-card">
        {onCancel && (
          <button
            type="button"
            className="pin-cancel-btn"
            onClick={onCancel}
            aria-label="Tutup"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        )}

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: requiredRole === 'OWNER' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(224, 138, 60, 0.15)',
          color: requiredRole === 'OWNER' ? 'var(--status-warning)' : 'var(--accent-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-2)'
        }}>
          {requiredRole === 'OWNER' ? <ShieldAlert size={26} /> : <Lock size={26} />}
        </div>

        <div>
          <h2 className="pin-modal-title">{title}</h2>
          <p className="pin-modal-subtitle">{subtitle}</p>
        </div>

        {/* 4 Dot Indicator */}
        <div className={`pin-dots-container ${isError ? 'pin-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`pin-dot ${isFilled ? 'pin-dot--filled' : ''} ${isError ? 'pin-dot--error' : ''}`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--status-danger)',
            minHeight: '18px',
            margin: '0'
          }}>
            {errorMessage}
          </p>
        )}

        {/* 3x4 Touch Keypad */}
        <div className="pin-keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="pin-key-btn"
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="pin-key-btn pin-key-btn--action"
            onClick={handleClear}
            title="Bersihkan"
          >
            C
          </button>
          <button
            type="button"
            className="pin-key-btn"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            type="button"
            className="pin-key-btn pin-key-btn--action"
            onClick={handleDelete}
            title="Hapus Digit"
            aria-label="Hapus Digit"
          >
            <Delete size={20} />
          </button>
        </div>

        {hintText && (
          <div className="pin-hint-tag">
            💡 {hintText}
          </div>
        )}
      </div>
    </div>
  );
};

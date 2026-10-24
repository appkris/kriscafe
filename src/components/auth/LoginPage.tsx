import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Shield, User, Delete, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/auth';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CASHIER');
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { loginWithPin } = useAuthStore();

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

  // Verifikasi otomatis saat PIN 4 digit terisi
  useEffect(() => {
    if (pin.length !== 4) return;

    let isMounted = true;

    const performLogin = async () => {
      const result = await loginWithPin(pin, selectedRole);
      if (!isMounted) return;

      if (!result.success) {
        setIsError(true);
        setErrorMessage(result.message || 'PIN tidak valid.');
        setTimeout(() => {
          if (isMounted) setPin('');
        }, 350);
      }
    };

    performLogin();

    return () => {
      isMounted = false;
    };
  }, [pin, selectedRole, loginWithPin]);

  // Support keyboard fisik untuk kemudahan testing / laptop kasir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete]);

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Coffee size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="login-title">KrisCafe POS</h1>
            <p className="login-subtitle">Sistem Kasir Kantin & Kafe Modern • Touch-First</p>
          </div>
        </div>

        {/* Role Selector Tabs: Kasir vs Admin */}
        <div className="login-role-selector">
          <button
            type="button"
            id="role-tab-cashier"
            className={`login-role-btn ${selectedRole === 'CASHIER' ? 'login-role-btn--active login-role-btn--cashier' : ''}`}
            onClick={() => {
              setSelectedRole('CASHIER');
              setPin('');
              setIsError(false);
              setErrorMessage('');
            }}
          >
            <span className="login-role-label">
              <User size={16} /> Kasir
            </span>
            <span className="login-role-desc">Layar Penjualan</span>
          </button>

          <button
            type="button"
            id="role-tab-admin"
            className={`login-role-btn ${selectedRole === 'ADMIN' ? 'login-role-btn--active login-role-btn--admin' : ''}`}
            onClick={() => {
              setSelectedRole('ADMIN');
              setPin('');
              setIsError(false);
              setErrorMessage('');
            }}
          >
            <span className="login-role-label">
              <Shield size={16} /> Admin
            </span>
            <span className="login-role-desc">Laporan & Pengaturan</span>
          </button>
        </div>

        {/* 4 Bulatan Indikator PIN */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Masukkan PIN 4-Digit {selectedRole === 'CASHIER' ? 'Kasir' : 'Admin'}:
          </span>
          <div className={`login-dots-container ${isError ? 'login-shake' : ''}`}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`login-dot ${isFilled ? 'login-dot--filled' : ''} ${isError ? 'login-dot--error' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--status-danger)',
            margin: '0',
            textAlign: 'center',
            minHeight: '18px'
          }}>
            {errorMessage}
          </p>
        )}

        {/* 3x4 Touch Keypad */}
        <div className="login-keypad-grid">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              id={`login-key-${digit}`}
              className="login-key-btn"
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            id="login-key-clear"
            className="login-key-btn login-key-btn--action"
            onClick={handleClear}
            title="Bersihkan"
          >
            C
          </button>
          <button
            type="button"
            id="login-key-0"
            className="login-key-btn"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            type="button"
            id="login-key-backspace"
            className="login-key-btn login-key-btn--action"
            onClick={handleDelete}
            title="Hapus Digit"
            aria-label="Hapus Digit"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Quick Demo Hint */}
        <div className="login-hint-badge">
          <Sparkles size={13} color="var(--accent-hover)" />
          <span>Default PIN: <strong>Kasir = 1234</strong> | <strong>Admin = 8888</strong></span>
        </div>
      </div>
    </div>
  );
};

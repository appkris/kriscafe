import React, { useState, useEffect } from 'react';
import { KeyRound, X, Check, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './ChangePinModal.css';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const { getStoredPins, changePin } = useAuthStore();
  const [currentCashierPin, setCurrentCashierPin] = useState<string>('1234');
  const [currentAdminPin, setCurrentAdminPin] = useState<string>('8888');

  const [newCashierPin, setNewCashierPin] = useState<string>('');
  const [newAdminPin, setNewAdminPin] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getStoredPins().then((pins) => {
      if (isMounted) {
        setCurrentCashierPin(pins.cashierPin);
        setCurrentAdminPin(pins.adminPin);
        setNewCashierPin(pins.cashierPin);
        setNewAdminPin(pins.adminPin);
        setSaveMessage(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, getStoredPins]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newCashierPin.length !== 4 || !/^\d{4}$/.test(newCashierPin)) {
      setSaveMessage('PIN Kasir harus tepat 4 angka numerik!');
      return;
    }

    if (newAdminPin.length !== 4 || !/^\d{4}$/.test(newAdminPin)) {
      setSaveMessage('PIN Admin harus tepat 4 angka numerik!');
      return;
    }

    await changePin('CASHIER', newCashierPin);
    await changePin('ADMIN', newAdminPin);

    setSaveMessage('✅ PIN berhasil diperbarui!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="change-pin-overlay" role="dialog" aria-modal="true">
      <div className="change-pin-card">
        <div className="change-pin-header">
          <h2 className="change-pin-title">
            <KeyRound size={20} color="var(--accent-hover)" />
            Pengaturan PIN Keamanan
          </h2>
          <button type="button" className="change-pin-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="change-pin-group">
            <label className="change-pin-label" htmlFor="cashierPinInput">
              <span>PIN Kasir (Operasi Kasir)</span>
              <span className="change-pin-current">Aktif: {currentCashierPin}</span>
            </label>
            <input
              id="cashierPinInput"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="change-pin-input"
              value={newCashierPin}
              onChange={(e) => setNewCashierPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 Angka"
              required
            />
          </div>

          <div className="change-pin-group">
            <label className="change-pin-label" htmlFor="adminPinInput">
              <span>PIN Admin (Laporan & Menu)</span>
              <span className="change-pin-current">Aktif: {currentAdminPin}</span>
            </label>
            <input
              id="adminPinInput"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="change-pin-input"
              value={newAdminPin}
              onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 Angka"
              required
            />
          </div>

          {saveMessage && (
            <p style={{
              fontSize: 'var(--text-xs)',
              color: saveMessage.startsWith('✅') ? 'var(--status-success)' : 'var(--status-danger)',
              margin: '0',
              textAlign: 'center',
              fontWeight: 600
            }}>
              {saveMessage}
            </p>
          )}

          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-app)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Shield size={14} color="var(--accent-hover)" />
            <span>PIN tersimpan secara lokal di browser/perangkat ini (Offline-First).</span>
          </div>

          <div className="change-pin-actions">
            <button type="button" className="change-pin-btn change-pin-btn--cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="change-pin-btn change-pin-btn--save">
              <Check size={16} /> Simpan PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

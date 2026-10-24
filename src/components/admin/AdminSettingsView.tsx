import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sliders, 
  Store, 
  KeyRound, 
  Database, 
  Save, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  HardDrive
} from 'lucide-react';
import { db } from '../../db';
import { resetDatabaseToDefaults } from '../../db/seed';
import { useAuthStore } from '../../store/authStore';
import './AdminSettingsView.css';

export const AdminSettingsView: React.FC = () => {
  const { getStoredPins, changePin } = useAuthStore();

  // Profil Kafe State
  const [storeName, setStoreName] = useState<string>('KrisCafe');
  const [storeTagline, setStoreTagline] = useState<string>('Kantin & Cafe Sederhana');
  const [storeAddress, setStoreAddress] = useState<string>('Kantin Sentral Lt. 1, Blok B-08');
  const [storePhone, setStorePhone] = useState<string>('081234567890');
  const [receiptFooter, setReceiptFooter] = useState<string>('Terima kasih atas kunjungannya!');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // PIN Management State
  const [cashierPin, setCashierPin] = useState<string>('1234');
  const [adminPin, setAdminPin] = useState<string>('8888');
  const [pinSavedMsg, setPinSavedMsg] = useState<string | null>(null);

  // Database Reset State
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Live Counts from IndexedDB
  const menuCount = useLiveQuery(() => db.menus.count(), []);
  const categoryCount = useLiveQuery(() => db.categories.count(), []);
  const transactionCount = useLiveQuery(() => db.transactions.count(), []);

  // Ambil pengaturan saat komponen dimuat
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const name = await db.settings.get('store_name');
      const tagline = await db.settings.get('store_tagline');
      const address = await db.settings.get('store_address');
      const phone = await db.settings.get('store_phone');
      const footer = await db.settings.get('receipt_footer');
      const pins = await getStoredPins();

      if (!isMounted) return;

      if (name) setStoreName(name.value);
      if (tagline) setStoreTagline(tagline.value);
      if (address) setStoreAddress(address.value);
      if (phone) setStorePhone(phone.value);
      if (footer) setReceiptFooter(footer.value);

      setCashierPin(pins.cashierPin);
      setAdminPin(pins.adminPin);
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [getStoredPins]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.settings.put({ key: 'store_name', value: storeName });
    await db.settings.put({ key: 'store_tagline', value: storeTagline });
    await db.settings.put({ key: 'store_address', value: storeAddress });
    await db.settings.put({ key: 'store_phone', value: storePhone });
    await db.settings.put({ key: 'receipt_footer', value: receiptFooter });

    setProfileSavedMsg('✅ Profil kafe & format struk berhasil disimpan!');
    setTimeout(() => setProfileSavedMsg(null), 3000);
  };

  const handleSavePins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashierPin.length !== 4 || !/^\d{4}$/.test(cashierPin)) {
      setPinSavedMsg('❌ PIN Kasir harus berupa 4 digit angka!');
      return;
    }
    if (adminPin.length !== 4 || !/^\d{4}$/.test(adminPin)) {
      setPinSavedMsg('❌ PIN Admin harus berupa 4 digit angka!');
      return;
    }

    await changePin('CASHIER', cashierPin);
    await changePin('ADMIN', adminPin);

    setPinSavedMsg('✅ PIN Kasir & Admin berhasil diperbarui!');
    setTimeout(() => setPinSavedMsg(null), 3000);
  };

  const handleResetData = async () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin me-reset data menu dan kategori ke data demo bawaan KrisCafe? Data transaksi tetap aman.'
    );
    if (!confirmReset) return;

    setIsResetting(true);
    await resetDatabaseToDefaults();
    setIsResetting(false);
    setResetSuccessMsg('✅ Data demo menu & kategori berhasil dipulihkan!');
    setTimeout(() => setResetSuccessMsg(null), 3000);
  };

  return (
    <div className="admin-settings-container">
      {/* Header View */}
      <div className="admin-settings-header">
        <h1 className="admin-settings-title">
          <Sliders size={26} color="var(--accent-hover)" />
          Pengaturan Sistem & Otoritas Admin
        </h1>
        <p className="admin-settings-subtitle">
          Kelola profil kafe, struk belanja, keamanan PIN staf, serta informasi database offline-first.
        </p>
      </div>

      <div className="admin-cards-grid">
        {/* Card 1: Profil Kafe & Struk */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-icon">
              <Store size={20} />
            </div>
            <div>
              <h2 className="admin-card-title">Profil Kafe & Format Struk</h2>
              <p className="admin-card-desc">Informasi ini akan tercetak otomatis pada struk thermal dan WhatsApp</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputStoreName">Nama Kafe / Usaha</label>
              <input
                id="inputStoreName"
                className="admin-form-input"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputStoreTagline">Slogan / Tagline</label>
              <input
                id="inputStoreTagline"
                className="admin-form-input"
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputStorePhone">Nomor WhatsApp Kasir / Kafe</label>
              <input
                id="inputStorePhone"
                type="tel"
                className="admin-form-input"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="0812xxxx"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputStoreAddress">Alamat Kafe</label>
              <input
                id="inputStoreAddress"
                className="admin-form-input"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Lokasi gerai / kantin"
                required
              />
            </div>

            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label" htmlFor="inputReceiptFooter">Pesan Kaki Struk (Receipt Footer)</label>
              <textarea
                id="inputReceiptFooter"
                className="admin-form-textarea"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                placeholder="Contoh: Terima kasih atas kunjungannya!"
              />
            </div>

            {profileSavedMsg && (
              <div style={{ gridColumn: '1 / -1', color: 'var(--status-success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                {profileSavedMsg}
              </div>
            )}

            <button type="submit" className="admin-btn-save">
              <Save size={16} /> Simpan Profil Kafe
            </button>
          </form>
        </div>

        {/* Card 2: Keamanan PIN Akses */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-icon" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: 'var(--status-warning)' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="admin-card-title">Keamanan PIN Akses (Kasir & Admin)</h2>
              <p className="admin-card-desc">Gunakan 4 digit angka untuk masing-masing peran saat login di layar awal</p>
            </div>
          </div>

          <form onSubmit={handleSavePins} className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputCashierPin">
                <span>PIN Kasir (Area Kasir Saja)</span>
                <span style={{ color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>Aktif: {cashierPin}</span>
              </label>
              <input
                id="inputCashierPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                className="admin-form-input"
                style={{ textAlign: 'center', letterSpacing: '4px', fontFamily: 'var(--font-mono)' }}
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="inputAdminPin">
                <span>PIN Admin (Akses Penuh)</span>
                <span style={{ color: 'var(--status-warning)', fontFamily: 'var(--font-mono)' }}>Aktif: {adminPin}</span>
              </label>
              <input
                id="inputAdminPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                className="admin-form-input"
                style={{ textAlign: 'center', letterSpacing: '4px', fontFamily: 'var(--font-mono)' }}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>

            {pinSavedMsg && (
              <div style={{
                gridColumn: '1 / -1',
                color: pinSavedMsg.startsWith('✅') ? 'var(--status-success)' : 'var(--status-danger)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600
              }}>
                {pinSavedMsg}
              </div>
            )}

            <button type="submit" className="admin-btn-save">
              <ShieldCheck size={16} /> Simpan Perubahan PIN
            </button>
          </form>
        </div>

        {/* Card 3: Status Sistem & Database Offline */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--status-success)' }}>
              <Database size={20} />
            </div>
            <div>
              <h2 className="admin-card-title">Informasi Sistem & Database Offline-First</h2>
              <p className="admin-card-desc">Semua data tersimpan aman secara lokal di perangkat kasir via IndexedDB</p>
            </div>
          </div>

          <div className="admin-system-stats">
            <div className="admin-stat-box">
              <span className="admin-stat-num">{categoryCount ?? '...'}</span>
              <span className="admin-stat-label">Kategori Menu</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-num">{menuCount ?? '...'}</span>
              <span className="admin-stat-label">Total Menu Terdaftar</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-num">{transactionCount ?? '...'}</span>
              <span className="admin-stat-label">Transaksi Tersimpan</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-num" style={{ color: 'var(--status-success)', fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> Offline Ready
              </span>
              <span className="admin-stat-label">PWA Service Worker Aktif</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="admin-btn-save"
              style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}
              onClick={handleResetData}
              disabled={isResetting}
            >
              <RefreshCw size={15} className={isResetting ? 'spin' : ''} />
              {isResetting ? 'Memulihkan Data...' : 'Reset Menu ke Data Demo Awal'}
            </button>
          </div>

          {resetSuccessMsg && (
            <div style={{ color: 'var(--status-success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              {resetSuccessMsg}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <HardDrive size={13} />
            <span>KrisCafe Engine v1.0.0 • SQLite/Capacitor Native Bridge Ready • Dexie 4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Coffee, 
  ShoppingBag, 
  TrendingUp, 
  SlidersHorizontal,
  Lock,
  Crown,
  User,
  KeyRound
} from 'lucide-react';
import { db, menuRepository } from '../db';
import type { MenuItem } from '../types/database';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { CategoryTabs } from '../components/pos/CategoryTabs';
import { SearchBar } from '../components/pos/SearchBar';
import { MenuGrid } from '../components/pos/MenuGrid';
import { CartSidebar } from '../components/pos/CartSidebar';
import { ItemNotesModal } from '../components/pos/ItemNotesModal';
import { PaymentModal } from '../components/pos/PaymentModal';
import { DailyReportsView } from '../components/reports/DailyReportsView';
import { MenuManagementView } from '../components/menu/MenuManagementView';
import { PinKeypadModal } from '../components/auth/PinKeypadModal';
import { ChangePinModal } from '../components/auth/ChangePinModal';
import './PosPage.css';

type MainViewTab = 'pos' | 'reports' | 'menus';

export const PosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainViewTab>('pos');
  const [pendingTab, setPendingTab] = useState<MainViewTab | null>(null);
  const [isSupervisorAuthOpen, setIsSupervisorAuthOpen] = useState<boolean>(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notesModalMenu, setNotesModalMenu] = useState<MenuItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const { items: cartItems, addItem } = useCartStore();
  const { currentSession, isScreenLocked, lockScreen, initAuth } = useAuthStore();

  // Inisialisasi default PIN jika belum ada
  useEffect(() => {
    initAuth().catch(console.error);
  }, [initAuth]);

  // Ambil kategori dari IndexedDB
  const categories = useLiveQuery(
    () => db.categories.orderBy('display_order').toArray(),
    []
  );

  // Ambil menu aktif berdasarkan kategori dan pencarian
  const menus = useLiveQuery(async () => {
    if (searchQuery.trim()) {
      return await menuRepository.search(searchQuery, selectedCategory);
    }
    return await menuRepository.getByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  // Hitung jumlah item tiap menu yang ada di keranjang
  const cartItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of cartItems) {
      counts[item.menuId] = (counts[item.menuId] || 0) + item.quantity;
    }
    return counts;
  }, [cartItems]);

  const handleAddToCart = (menu: MenuItem) => {
    addItem(menu);
  };

  const handleOpenNotesModal = (menu: MenuItem) => {
    setNotesModalMenu(menu);
  };

  const handleConfirmNotes = (menu: MenuItem, notes: string) => {
    addItem(menu, notes);
  };

  const handleProceedToCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  // Navigasi dengan Role Guard (Kasir vs Owner)
  const handleTabNavigation = (targetTab: MainViewTab) => {
    if (targetTab === 'pos') {
      setActiveTab('pos');
      return;
    }

    // Tab 'reports' dan 'menus' dilindungi PIN Supervisor/Owner
    if (currentSession?.role === 'OWNER') {
      setActiveTab(targetTab);
    } else {
      setPendingTab(targetTab);
      setIsSupervisorAuthOpen(true);
    }
  };

  const handleSupervisorAuthSuccess = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    setIsSupervisorAuthOpen(false);
  };

  const handleOpenPinSettings = () => {
    if (currentSession?.role === 'OWNER') {
      setIsChangePinOpen(true);
    } else {
      // Minta PIN Owner terlebih dahulu
      setPendingTab(null);
      setIsSupervisorAuthOpen(true);
    }
  };

  const isOwner = currentSession?.role === 'OWNER';

  return (
    <div className="pos-layout">
      {/* Kolom Kiri: Katalog Menu & Navigasi */}
      <section className="pos-catalog-section">
        {/* Topbar POS */}
        <header className="pos-topbar">
          <div className="pos-brand">
            <div className="pos-brand-logo">
              <Coffee size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="pos-brand-name">KrisCafe POS</div>
              <div className="pos-brand-status">
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--status-success)', display: 'inline-block' }} />
                <span>Kasir Siap • Shift 1</span>
              </div>
            </div>
          </div>

          {/* Navigation Mode Selector */}
          <div style={{ display: 'flex', gap: 'var(--space-1)', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              id="tab-btn-pos"
              className={`category-tab-btn ${activeTab === 'pos' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => handleTabNavigation('pos')}
            >
              <ShoppingBag size={14} />
              <span>Kasir</span>
            </button>
            <button
              type="button"
              id="tab-btn-reports"
              className={`category-tab-btn ${activeTab === 'reports' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => handleTabNavigation('reports')}
            >
              <TrendingUp size={14} />
              <span>Laporan & Shift</span>
              {!isOwner && <Lock size={11} style={{ opacity: 0.6, marginLeft: 2 }} />}
            </button>
            <button
              type="button"
              id="tab-btn-menus"
              className={`category-tab-btn ${activeTab === 'menus' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => handleTabNavigation('menus')}
            >
              <SlidersHorizontal size={14} />
              <span>Kelola Menu</span>
              {!isOwner && <Lock size={11} style={{ opacity: 0.6, marginLeft: 2 }} />}
            </button>
          </div>

          {activeTab === 'pos' && (
            <div className="pos-search-container">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari menu kafe (nama / deskripsi)..."
              />
            </div>
          )}

          {/* Security & Role Controls */}
          <div className="pos-auth-controls">
            <div className={`pos-role-tag ${isOwner ? 'pos-role-tag--owner' : 'pos-role-tag--cashier'}`}>
              {isOwner ? <Crown size={13} /> : <User size={13} />}
              <span>{isOwner ? 'Owner' : 'Kasir'}</span>
            </div>

            <button
              type="button"
              id="btn-pin-settings"
              className="pos-icon-btn"
              onClick={handleOpenPinSettings}
              title="Pengaturan PIN Keamanan"
            >
              <KeyRound size={14} />
              <span className="hide-mobile">PIN</span>
            </button>

            <button
              type="button"
              id="btn-lock-screen"
              className="pos-icon-btn"
              onClick={lockScreen}
              title="Kunci Layar Kasir"
            >
              <Lock size={14} />
              <span>Kunci</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body based on Active Tab */}
        {activeTab === 'pos' ? (
          <>
            {/* Kategori Tabs */}
            <div className="pos-categories-bar">
              <CategoryTabs
                categories={categories || []}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalCount={menus?.length}
              />
            </div>

            {/* Menu Grid Scroll Area */}
            <div className="pos-menu-scroll-area">
              <MenuGrid
                menus={menus || []}
                cartItemCounts={cartItemCounts}
                onAddToCart={handleAddToCart}
                onOpenNotesModal={handleOpenNotesModal}
              />
            </div>
          </>
        ) : activeTab === 'reports' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <DailyReportsView />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <MenuManagementView />
          </div>
        )}
      </section>

      {/* Kolom Kanan: Sidebar Keranjang Sentuh (Hanya saat di Tab Kasir) */}
      {activeTab === 'pos' && (
        <CartSidebar onProceedToCheckout={handleProceedToCheckout} />
      )}

      {/* Modal Varian & Catatan Khusus */}
      <ItemNotesModal
        menu={notesModalMenu}
        isOpen={notesModalMenu !== null}
        onClose={() => setNotesModalMenu(null)}
        onConfirm={handleConfirmNotes}
      />

      {/* Modal Pembayaran, Kalkulator Cepat & Cetak Struk */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Modal Otorisasi Supervisor (Saat Kasir mencoba akses Laporan/Menu) */}
      <PinKeypadModal
        isOpen={isSupervisorAuthOpen}
        title="Otorisasi Supervisor"
        subtitle="Masukkan PIN Owner (8888) untuk membuka hak akses ini"
        requiredRole="OWNER"
        hintText="Default PIN Owner: 8888"
        onSuccess={handleSupervisorAuthSuccess}
        onCancel={() => {
          setPendingTab(null);
          setIsSupervisorAuthOpen(false);
        }}
      />

      {/* Modal Kunci Layar Penuh (Saat tombol Kunci ditekan) */}
      <PinKeypadModal
        isOpen={isScreenLocked}
        title="KrisCafe POS Terkunci"
        subtitle="Masukkan PIN Kasir (1234) atau PIN Owner (8888) untuk membuka"
        requiredRole="ANY"
        hintText="Kasir: 1234 | Owner: 8888"
        onSuccess={() => {}}
      />

      {/* Modal Ubah PIN Kasir & Owner */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
};

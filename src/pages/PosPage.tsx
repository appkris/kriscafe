import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Coffee,
  ShoppingBag,
  TrendingUp,
  SlidersHorizontal,
  Sliders,
  Lock,
  LogOut,
  Shield,
  User
} from 'lucide-react';
import { db, menuRepository } from '../db';
import type { MenuItem } from '../types/database';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from '../components/auth/LoginPage';
import { CategoryTabs } from '../components/pos/CategoryTabs';
import { SearchBar } from '../components/pos/SearchBar';
import { MenuGrid } from '../components/pos/MenuGrid';
import { CartSidebar } from '../components/pos/CartSidebar';
import { ItemNotesModal } from '../components/pos/ItemNotesModal';
import { PaymentModal } from '../components/pos/PaymentModal';
import { DailyReportsView } from '../components/reports/DailyReportsView';
import { MenuManagementView } from '../components/menu/MenuManagementView';
import { AdminSettingsView } from '../components/admin/AdminSettingsView';
import { PinKeypadModal } from '../components/auth/PinKeypadModal';
import './PosPage.css';

type MainViewTab = 'pos' | 'reports' | 'menus' | 'settings';

export const PosPage: React.FC = () => {
  const { currentSession, isScreenLocked, lockScreen, logout, initAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<MainViewTab>('pos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notesModalMenu, setNotesModalMenu] = useState<MenuItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const { items: cartItems, addItem, setIsMobileCartOpen } = useCartStore();
  const totalCartQuantity = useMemo(() => cartItems.reduce((acc, i) => acc + i.quantity, 0), [cartItems]);

  // Inisialisasi default setting & PIN jika belum ada
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

  // Jika belum login, tampilkan Layar Login Halaman Awal
  if (!currentSession) {
    return <LoginPage />;
  }

  const isAdmin = currentSession.role === 'ADMIN';

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
                <span className="status-dot status-dot--active" />
                <span>{isAdmin ? 'Administrator' : 'Kasir'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tab Selector: HANYA DITAMPILKAN JIKA ROLE ADMIN */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: 'var(--space-1)', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                id="tab-btn-pos"
                className={`category-tab-btn ${activeTab === 'pos' ? 'category-tab-btn--active' : ''}`}
                style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
                onClick={() => setActiveTab('pos')}
              >
                <ShoppingBag size={14} />
                <span>Kasir</span>
              </button>
              <button
                type="button"
                id="tab-btn-reports"
                className={`category-tab-btn ${activeTab === 'reports' ? 'category-tab-btn--active' : ''}`}
                style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
                onClick={() => setActiveTab('reports')}
              >
                <TrendingUp size={14} />
                <span>Laporan & Shift</span>
              </button>
              <button
                type="button"
                id="tab-btn-menus"
                className={`category-tab-btn ${activeTab === 'menus' ? 'category-tab-btn--active' : ''}`}
                style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
                onClick={() => setActiveTab('menus')}
              >
                <SlidersHorizontal size={14} />
                <span>Kelola Menu</span>
              </button>
              <button
                type="button"
                id="tab-btn-settings"
                className={`category-tab-btn ${activeTab === 'settings' ? 'category-tab-btn--active' : ''}`}
                style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
                onClick={() => setActiveTab('settings')}
              >
                <Sliders size={14} />
                <span>Pengaturan</span>
              </button>
            </div>
          )}

          {/* Auth & Session Controls */}
          <div className="pos-auth-controls">
            {/* Tombol Keranjang Khusus Layar HP / Mobile */}
            <button
              type="button"
              id="btn-mobile-cart-header"
              className="pos-mobile-cart-btn"
              onClick={() => setIsMobileCartOpen(true)}
              title="Lihat Pesanan Kasir"
              aria-label="Lihat Pesanan Kasir"
            >
              <ShoppingBag size={15} />
              {totalCartQuantity > 0 && (
                <span className="pos-mobile-cart-badge">{totalCartQuantity}</span>
              )}
            </button>

            <div className={`pos-role-tag ${isAdmin ? 'pos-role-tag--owner' : 'pos-role-tag--cashier'}`}>
              {isAdmin ? <Shield size={13} /> : <User size={13} />}
              <span>{isAdmin ? 'Admin' : 'Kasir'}</span>
            </div>

            <button
              type="button"
              id="btn-lock-screen"
              className="pos-icon-btn"
              onClick={lockScreen}
              title="Kunci Layar Sentuh"
            >
              <Lock size={14} />
              <span className="hide-mobile">Kunci</span>
            </button>

            <button
              type="button"
              id="btn-logout"
              className="pos-icon-btn"
              onClick={logout}
              title="Keluar ke Halaman Awal"
              style={{ color: 'var(--status-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body based on Active Tab */}
        {activeTab === 'pos' ? (
          <>
            {/* Kategori Tabs & Search Form Sejajar */}
            <div className="pos-categories-bar">
              <div className="pos-categories-and-search">
                <CategoryTabs
                  categories={categories || []}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  totalCount={menus?.length}
                />
                <div className="pos-inline-search">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Cari menu..."
                  />
                </div>
              </div>
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
        ) : activeTab === 'menus' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <MenuManagementView />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AdminSettingsView />
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

      {/* Modal Kunci Layar (Screen Lock) */}
      <PinKeypadModal
        isOpen={isScreenLocked}
        title="KrisCafe POS Terkunci"
        subtitle="Masukkan PIN untuk membuka kembali layar kasir"
        requiredRole="ANY"
        hintText={isAdmin ? 'Admin: 8888' : 'Kasir: 1234'}
        onSuccess={() => { }}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Coffee, 
  Wifi, 
  CheckCircle2, 
  ShoppingBag, 
  TrendingUp, 
  SlidersHorizontal 
} from 'lucide-react';
import { db, menuRepository } from '../db';
import type { MenuItem } from '../types/database';
import { useCartStore } from '../store/cartStore';
import { CategoryTabs } from '../components/pos/CategoryTabs';
import { SearchBar } from '../components/pos/SearchBar';
import { MenuGrid } from '../components/pos/MenuGrid';
import { CartSidebar } from '../components/pos/CartSidebar';
import { ItemNotesModal } from '../components/pos/ItemNotesModal';
import { PaymentModal } from '../components/pos/PaymentModal';
import { DailyReportsView } from '../components/reports/DailyReportsView';
import { MenuManagementView } from '../components/menu/MenuManagementView';
import { Badge } from '../components/common/Badge';
import './PosPage.css';

type MainViewTab = 'pos' | 'reports' | 'menus';

export const PosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainViewTab>('pos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notesModalMenu, setNotesModalMenu] = useState<MenuItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const { items: cartItems, addItem } = useCartStore();

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
              className={`category-tab-btn ${activeTab === 'pos' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => setActiveTab('pos')}
            >
              <ShoppingBag size={14} />
              <span>Kasir</span>
            </button>
            <button
              type="button"
              className={`category-tab-btn ${activeTab === 'reports' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => setActiveTab('reports')}
            >
              <TrendingUp size={14} />
              <span>Laporan & Shift</span>
            </button>
            <button
              type="button"
              className={`category-tab-btn ${activeTab === 'menus' ? 'category-tab-btn--active' : ''}`}
              style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}
              onClick={() => setActiveTab('menus')}
            >
              <SlidersHorizontal size={14} />
              <span>Kelola Menu</span>
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

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="accent">
              <Wifi size={12} /> Offline PWA
            </Badge>
            <Badge variant="success">
              <CheckCircle2 size={12} /> Android Ready
            </Badge>
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
    </div>
  );
};

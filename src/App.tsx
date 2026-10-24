import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Coffee, 
  CheckCircle2, 
  Database, 
  Wifi, 
  Search, 
  RotateCcw,
  ShoppingBag,
  Package
} from 'lucide-react';
import { db, seedDatabaseIfEmpty, resetDatabaseToDefaults, menuRepository } from './db';
import type { MenuItem } from './types/database';
import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import './App.css';

export const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(true);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  // Inisialisasi Seeder IndexedDB saat komponen pertama kali dimuat
  useEffect(() => {
    async function initDB() {
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error('Failed to seed database:', err);
      } finally {
        setIsSeeding(false);
      }
    }
    initDB();
  }, []);

  // Live query kategori dari IndexedDB
  const categories = useLiveQuery(
    () => db.categories.orderBy('display_order').toArray(),
    []
  );

  // Live query menu berdasarkan kategori aktif dan pencarian
  const menus = useLiveQuery(async () => {
    if (searchQuery.trim()) {
      return await menuRepository.search(searchQuery, selectedCategory);
    }
    return await menuRepository.getByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  // Total statistik di database lokal
  const stats = useLiveQuery(async () => {
    const totalMenus = await db.menus.count();
    const activeMenus = await db.menus.filter(m => m.is_active).count();
    const totalTransactions = await db.transactions.count();
    return { totalMenus, activeMenus, totalTransactions };
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleResetData = async () => {
    if (confirm('Reset seluruh menu dan kategori ke data awal?')) {
      await resetDatabaseToDefaults();
      setSelectedMenu(null);
    }
  };

  const handleQuickStockDecrement = async (menuId: string, currentStock: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await menuRepository.updateStock(menuId, Math.max(0, currentStock - 1));
  };

  return (
    <div className="app-shell">
      {/* App Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand__logo">
            <Coffee size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="brand__title">KrisCafe POS</div>
            <div className="brand__subtitle">Kantin & Cafe Point of Sale</div>
          </div>
        </div>

        <div className="header-status">
          <Badge variant="accent">
            <Wifi size={12} /> Local-First DB
          </Badge>
          <Badge variant="success">
            <CheckCircle2 size={12} /> Phase 1 Live
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Status Banner */}
        <div className="status-banner">
          <div className="status-banner__header">
            <div className="status-banner__title">
              Phase 1: Database Klien (Dexie.js IndexedDB) & Seeding
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<RotateCcw size={14} />}
                onClick={handleResetData}
              >
                Reset Default
              </Button>
              <Badge variant="success">
                <Database size={13} /> {stats?.totalMenus || 0} Menu di Memori
              </Badge>
            </div>
          </div>
          <p className="status-banner__desc">
            Database lokal Dexie.js aktif dengan 6 tabel terstruktur (categories, menus, transactions, transaction_items, cashier_shifts, settings). 
            Data dimuat secara instan (0ms) tanpa dependensi jaringan.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Semua Menu
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari menu kafe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                paddingRight: '12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)'
              }}
            />
          </div>
        </div>

        {/* Live Menu Grid from IndexedDB */}
        <Card elevated className="demo-card">
          <div className="section-title">
            <Package size={18} />
            Katalog Menu Live dari IndexedDB ({menus?.length || 0} Tersedia)
          </div>

          {isSeeding ? (
            <p style={{ color: 'var(--text-muted)' }}>Sedang memuat data awal...</p>
          ) : menus && menus.length > 0 ? (
            <div className="menu-preview-grid">
              {menus.map((item) => {
                const isSelected = selectedMenu?.id === item.id;
                const isOutOfStock = !item.is_unlimited_stock && item.stock === 0;

                return (
                  <Card
                    key={item.id}
                    interactive={!isOutOfStock}
                    borderedAccent={isSelected}
                    className="sample-menu-card"
                    onClick={() => !isOutOfStock && setSelectedMenu(item)}
                    style={{
                      opacity: isOutOfStock ? 0.45 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="sample-menu-header">
                      <span className="sample-menu-name">{item.name}</span>
                      {isOutOfStock ? (
                        <Badge variant="danger">HABIS</Badge>
                      ) : item.is_unlimited_stock ? (
                        <Badge variant="default">Unlimited</Badge>
                      ) : (
                        <Badge variant={item.stock <= 5 ? 'warning' : 'success'}>
                          Sisa {item.stock}
                        </Badge>
                      )}
                    </div>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                      <span className="sample-menu-price">{formatRupiah(item.price)}</span>

                      {!item.is_unlimited_stock && (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ fontSize: '11px', padding: '2px 8px', height: '28px' }}
                          onClick={(e) => handleQuickStockDecrement(item.id, item.stock, e)}
                          title="Simulasi potong 1 stok di database"
                        >
                          -1 Stok
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
              Tidak ada menu yang sesuai dengan kata kunci pencarian.
            </p>
          )}
        </Card>

        {/* Phase Readiness Bar */}
        <div className="touch-check-bar">
          <div className="touch-check-info">
            <ShoppingBag size={20} color="var(--accent-hover)" />
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                Siap Melangkah ke Phase 2:
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Layar Kasir Sentuh (POS Grid, Tabs Kategori, Search, Keranjang Belanja Zustand)
              </div>
            </div>
          </div>

          <Badge variant="accent">Phase 1 Verified</Badge>
        </div>
      </main>
    </div>
  );
};

export default App;

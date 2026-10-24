import React, { useState } from 'react';
import { 
  Coffee, 
  CheckCircle2, 
  Smartphone, 
  Layers, 
  ShoppingBag, 
  Plus, 
  Check, 
  Wifi, 
  Database 
} from 'lucide-react';
import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import './App.css';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isUnlimited: boolean;
}

const SAMPLE_ITEMS: DemoItem[] = [
  { id: '1', name: 'Kopi Susu Gula Aren', category: 'Coffee', price: 18000, stock: 24, isUnlimited: false },
  { id: '2', name: 'Americano Dingin', category: 'Coffee', price: 15000, stock: 0, isUnlimited: true },
  { id: '3', name: 'Roti Bakar Cokelat Keju', category: 'Camilan', price: 20000, stock: 12, isUnlimited: false },
  { id: '4', name: 'Mie Goreng Spesial', category: 'Makanan', price: 22000, stock: 0, isUnlimited: false },
];

export const App: React.FC = () => {
  const [clickCount, setClickCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<string | null>('1');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
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
            <Wifi size={12} /> Offline-Ready
          </Badge>
          <Badge variant="success">
            <CheckCircle2 size={12} /> Phase 0 Active
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Status Banner */}
        <div className="status-banner">
          <div className="status-banner__header">
            <div className="status-banner__title">
              Phase 0: Fondasi Proyek & Design Tokens
            </div>
            <Badge variant="success">
              <Check size={14} /> System Verified
            </Badge>
          </div>
          <p className="status-banner__desc">
            Vite 6 + React 19 + TypeScript berhasil terpasang dengan sistem tokens Vanilla CSS anti-slop, 
            ergonomi tombol sentuh min. 44px, palet slate gelap hangat, dan tipografi Plus Jakarta Sans.
          </p>
        </div>

        {/* Verification Grid */}
        <div className="section-grid">
          {/* Demo 1: Button Variants & Touch Feedback */}
          <Card elevated className="demo-card">
            <div className="section-title">
              <Smartphone size={18} />
              Ergonomi Tombol Sentuh (Min 44px - 56px)
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Uji coba responsivitas ketukan. Tombol memiliki efek *micro-press scale* instan tanpa jeda.
            </p>

            <div className="button-stack">
              <Button 
                variant="primary" 
                size="md"
                icon={<ShoppingBag size={18} />}
                onClick={() => setClickCount(prev => prev + 1)}
              >
                Bayar Cepat ({clickCount})
              </Button>
              <Button variant="secondary" size="md">Batal</Button>
              <Button variant="outline" size="md">Opsi</Button>
              <Button variant="danger" size="md">Hapus</Button>
            </div>

            <div style={{ marginTop: 'var(--space-2)' }}>
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                icon={<Plus size={20} />}
                onClick={() => setClickCount(prev => prev + 1)}
              >
                Tombol Aksi Utama POS (Tinggi 56px)
              </Button>
            </div>
          </Card>

          {/* Demo 2: Badge & Status Indicators */}
          <Card elevated className="demo-card">
            <div className="section-title">
              <Layers size={18} />
              Badge & Status Visual POS
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Indikator status yang jelas dan kontras tinggi untuk memudahkan kasir membedakan ketersediaan menu.
            </p>

            <div className="badge-stack">
              <Badge variant="accent">Coffee</Badge>
              <Badge variant="default">Makanan</Badge>
              <Badge variant="success">Tersedia (24)</Badge>
              <Badge variant="warning">Menipis (2)</Badge>
              <Badge variant="danger">Habis</Badge>
              <Badge variant="default">Meja #04</Badge>
              <Badge variant="accent">QRIS</Badge>
              <Badge variant="success">Tunai Pas</Badge>
            </div>
          </Card>
        </div>

        {/* Demo 3: Interactive Menu Cards Preview */}
        <Card elevated className="demo-card">
          <div className="section-title">
            <Coffee size={18} />
            Simulasi Kartu Menu Layar Sentuh
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Ketuk kartu di bawah untuk menguji seleksi menu kasir:
          </p>

          <div className="menu-preview-grid">
            {SAMPLE_ITEMS.map((item) => {
              const isSelected = selectedItem === item.id;
              const isOutOfStock = !item.isUnlimited && item.stock === 0;

              return (
                <Card
                  key={item.id}
                  interactive={!isOutOfStock}
                  borderedAccent={isSelected}
                  className="sample-menu-card"
                  onClick={() => !isOutOfStock && setSelectedItem(item.id)}
                  style={{
                    opacity: isOutOfStock ? 0.45 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="sample-menu-header">
                    <span className="sample-menu-name">{item.name}</span>
                    {isOutOfStock ? (
                      <Badge variant="danger">HABIS</Badge>
                    ) : item.isUnlimited ? (
                      <Badge variant="default">Unlimited</Badge>
                    ) : (
                      <Badge variant="success">Sisa {item.stock}</Badge>
                    )}
                  </div>
                  <div className="sample-menu-price">{formatRupiah(item.price)}</div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Phase Readiness Bar */}
        <div className="touch-check-bar">
          <div className="touch-check-info">
            <Database size={20} color="var(--accent-hover)" />
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                Siap Melangkah ke Phase 1:
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Integrasi Database Klien (Dexie.js IndexedDB) & Seeding Menu Awal Kafe
              </div>
            </div>
          </div>

          <Badge variant="accent">Phase 0 Complete</Badge>
        </div>
      </main>
    </div>
  );
};

export default App;

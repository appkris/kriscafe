import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Minus, 
  Search, 
  Check, 
  X, 
  Infinity as InfinityIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { db, menuRepository } from '../../db';
import type { Category } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import './MenuManagementView.css';

export const MenuManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form Tambah Menu
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuCategoryId, setNewMenuCategoryId] = useState<string>('cat-coffee');
  const [newMenuPrice, setNewMenuPrice] = useState<string>('15000');
  const [newMenuStock, setNewMenuStock] = useState<string>('20');
  const [newMenuUnlimited, setNewMenuUnlimited] = useState<boolean>(false);

  // Ambil kategori dari IndexedDB
  const categories = useLiveQuery(
    () => db.categories.orderBy('display_order').toArray(),
    []
  );

  // Ambil semua menu dari IndexedDB (termasuk yang tidak aktif)
  const menus = useLiveQuery(async () => {
    let all = await db.menus.toArray();
    if (selectedCategory !== 'all') {
      all = all.filter((m) => m.category_id === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      all = all.filter((m) => m.name.toLowerCase().includes(q));
    }
    return all;
  }, [selectedCategory, searchQuery]);

  const handleUpdateStock = async (menuId: string, currentStock: number, delta: number) => {
    const updated = Math.max(0, currentStock + delta);
    await menuRepository.updateStock(menuId, updated);
  };

  const handleToggleUnlimited = async (menuId: string) => {
    await menuRepository.toggleUnlimited(menuId);
  };

  const handleToggleActive = async (menuId: string) => {
    await menuRepository.toggleActive(menuId);
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) {
      alert('Nama menu wajib diisi');
      return;
    }

    const priceNum = Number(newMenuPrice.replace(/[^0-9]/g, '')) || 0;
    const stockNum = Number(newMenuStock.replace(/[^0-9]/g, '')) || 0;

    const newId = `menu-custom-${Date.now()}`;
    const now = new Date().toISOString();

    await db.menus.add({
      id: newId,
      category_id: newMenuCategoryId,
      name: newMenuName.trim(),
      price: priceNum,
      is_unlimited_stock: newMenuUnlimited,
      stock: newMenuUnlimited ? 999 : stockNum,
      is_active: true,
      created_at: now,
      updated_at: now
    });

    // Reset Form & Tutup Modal
    setNewMenuName('');
    setNewMenuPrice('15000');
    setNewMenuStock('20');
    setNewMenuUnlimited(false);
    setIsAddModalOpen(false);
  };

  return (
    <div className="menu-mgmt-container">
      {/* Topbar Kelola Menu */}
      <div className="menu-mgmt-topbar">
        <div>
          <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            Manajemen Menu & Stok
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Atur kuota porsi harian, toggle stok habis, dan tambah menu kafe baru.
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Tambah Menu Baru
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Semua ({menus?.length || 0})
          </Button>
          {categories?.map((cat: Category) => (
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

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '36px', height: '38px' }}
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Menu & Stok */}
      <div className="menu-mgmt-table-card">
        <table className="menu-mgmt-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Kontrol Stok Porsi</th>
              <th>Mode Unlimited</th>
              <th>Ketersediaan</th>
            </tr>
          </thead>
          <tbody>
            {menus?.map((item) => (
              <tr key={item.id} style={{ opacity: item.is_active ? 1 : 0.5 }}>
                <td>
                  <Badge variant={item.is_active ? 'success' : 'danger'}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>
                  <Badge variant="default">
                    {categories?.find((c) => c.id === item.category_id)?.name || item.category_id}
                  </Badge>
                </td>
                <td className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>
                  {receiptService.formatRupiah(item.price)}
                </td>
                <td>
                  {item.is_unlimited_stock ? (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Selalu Ada</span>
                  ) : (
                    <div className="stock-stepper">
                      <button
                        type="button"
                        className="stock-stepper-btn"
                        onClick={() => handleUpdateStock(item.id, item.stock, -1)}
                        title="Kurang 1"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="stock-stepper-val">{item.stock}</span>
                      <button
                        type="button"
                        className="stock-stepper-btn"
                        onClick={() => handleUpdateStock(item.id, item.stock, 1)}
                        title="Tambah 1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <Button
                    variant={item.is_unlimited_stock ? 'outline' : 'ghost'}
                    size="sm"
                    icon={<InfinityIcon size={14} />}
                    onClick={() => handleToggleUnlimited(item.id)}
                    style={{ fontSize: '11px', height: '32px' }}
                  >
                    {item.is_unlimited_stock ? 'Unlimited' : 'Terbatas'}
                  </Button>
                </td>
                <td>
                  <Button
                    variant={item.is_active ? 'secondary' : 'danger'}
                    size="sm"
                    icon={item.is_active ? <ToggleRight size={16} color="var(--status-success)" /> : <ToggleLeft size={16} />}
                    onClick={() => handleToggleActive(item.id)}
                    style={{ fontSize: '11px', height: '32px' }}
                  >
                    {item.is_active ? 'Tersedia' : 'Habis'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Menu Baru */}
      {isAddModalOpen && (
        <div className="shift-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="shift-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shift-modal-header">
              <span style={{ fontWeight: 'bold' }}>Tambah Menu Baru</span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMenu} className="add-menu-form" style={{ padding: 'var(--space-6)' }}>
              <div className="form-group">
                <label className="form-label">NAMA MENU</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Es Kopi Pandan"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">KATEGORI</label>
                <select
                  className="form-select"
                  value={newMenuCategoryId}
                  onChange={(e) => setNewMenuCategoryId(e.target.value)}
                >
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">HARGA JUAL (RP)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="15000"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={newMenuUnlimited}
                    onChange={(e) => setNewMenuUnlimited(e.target.checked)}
                  />
                  <span>Stok Selalu Tersedia (Unlimited)</span>
                </label>
              </div>

              {!newMenuUnlimited && (
                <div className="form-group">
                  <label className="form-label">KUOTA PORSI AWAL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="20"
                    value={newMenuStock}
                    onChange={(e) => setNewMenuStock(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              )}

              <div className="shift-modal-footer" style={{ margin: 'var(--space-4) -24px -24px -24px' }}>
                <Button variant="ghost" size="md" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  Simpan Menu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

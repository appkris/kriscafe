import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Minus, 
  Search, 
  Check, 
  X, 
  ToggleLeft,
  ToggleRight,
  FolderPlus,
  Upload,
  Image as ImageIcon,
  Edit2,
  Coffee,
  Utensils
} from 'lucide-react';
import { db, menuRepository } from '../../db';
import type { Category, MenuItem } from '../../types/database';
import { receiptService } from '../../services/receiptService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import './MenuManagementView.css';

export const MenuManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal State
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  // Form Tambah Kategori
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Form Tambah Menu
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuCategoryId, setNewMenuCategoryId] = useState<string>('cat-coffee');
  const [newMenuPrice, setNewMenuPrice] = useState<string>('15000');
  const [newMenuStock, setNewMenuStock] = useState<string>('20');
  const [newMenuUnlimited, setNewMenuUnlimited] = useState<boolean>(false);
  const [newMenuImage, setNewMenuImage] = useState<string>('');

  // Form Edit Menu
  const [editName, setEditName] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [editUnlimited, setEditUnlimited] = useState<boolean>(false);
  const [editImage, setEditImage] = useState<string>('');

  // Ambil kategori dari IndexedDB
  const categories = useLiveQuery(
    () => db.categories.orderBy('display_order').toArray(),
    []
  );

  // Ambil menu dari IndexedDB
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

  // Upload Foto Handler (Konversi ke base64 Data URL)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan Kategori Baru
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newId = `cat-${slug}-${Date.now().toString().slice(-4)}`;
    const nextOrder = (categories?.length || 0) + 1;

    await db.categories.add({
      id: newId,
      name: trimmed,
      display_order: nextOrder,
      created_at: new Date().toISOString()
    });

    setNewCategoryName('');
    setIsAddCategoryOpen(false);
  };

  // Simpan Menu Baru
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) {
      alert('Nama menu wajib diisi.');
      return;
    }

    const priceNum = Number(newMenuPrice.replace(/[^0-9]/g, '')) || 0;
    const stockNum = Number(newMenuStock.replace(/[^0-9]/g, '')) || 0;
    const newId = `menu-custom-${Date.now()}`;
    const now = new Date().toISOString();

    await db.menus.add({
      id: newId,
      category_id: newMenuCategoryId || categories?.[0]?.id || 'cat-coffee',
      name: newMenuName.trim(),
      price: priceNum,
      image_url: newMenuImage || undefined,
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
    setNewMenuImage('');
    setIsAddMenuOpen(false);
  };

  // Buka Edit Modal
  const handleOpenEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setEditName(menu.name);
    setEditCategoryId(menu.category_id);
    setEditPrice(menu.price.toString());
    setEditStock(menu.stock.toString());
    setEditUnlimited(menu.is_unlimited_stock);
    setEditImage(menu.image_url || '');
  };

  // Simpan Edit Menu
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;

    const priceNum = Number(editPrice.replace(/[^0-9]/g, '')) || 0;
    const stockNum = Number(editStock.replace(/[^0-9]/g, '')) || 0;

    await db.menus.update(editingMenu.id, {
      name: editName.trim(),
      category_id: editCategoryId,
      price: priceNum,
      image_url: editImage || undefined,
      is_unlimited_stock: editUnlimited,
      stock: editUnlimited ? 999 : stockNum,
      updated_at: new Date().toISOString()
    });

    setEditingMenu(null);
  };

  return (
    <div className="menu-mgmt-container">
      {/* Topbar Kelola Menu */}
      <div className="menu-mgmt-topbar">
        <div>
          <h1 className="menu-mgmt-title">Manajemen Menu & Kategori</h1>
          <p className="menu-mgmt-subtitle">Atur foto, harga, kategori baru, dan ketersediaan porsi.</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            size="md"
            id="btn-add-category"
            icon={<FolderPlus size={16} />}
            onClick={() => setIsAddCategoryOpen(true)}
          >
            + Kategori
          </Button>

          <Button
            variant="primary"
            size="md"
            id="btn-add-menu"
            icon={<Plus size={16} />}
            onClick={() => setIsAddMenuOpen(true)}
          >
            + Menu Baru
          </Button>
        </div>
      </div>

      {/* Filter Kategori & Pencarian */}
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

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '34px', height: '36px', fontSize: '13px' }}
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
              <th style={{ width: '56px' }}>Foto</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok Porsi</th>
              <th>Ketersediaan</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menus?.map((item) => (
              <tr key={item.id} style={{ opacity: item.is_active ? 1 : 0.6 }}>
                <td>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="menu-table-thumb" />
                  ) : (
                    <div className="menu-table-thumb-placeholder">
                      {item.category_id.includes('coffee') ? <Coffee size={18} /> : <Utensils size={18} />}
                    </div>
                  )}
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
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleToggleUnlimited(item.id)}
                      title="Ubah ke stok terbatas"
                    >
                      <Badge variant="default">Unlimited</Badge>
                    </button>
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
                    variant={item.is_active ? 'secondary' : 'danger'}
                    size="sm"
                    icon={item.is_active ? <ToggleRight size={16} color="var(--status-success)" /> : <ToggleLeft size={16} />}
                    onClick={() => handleToggleActive(item.id)}
                    style={{ fontSize: '11px', height: '30px' }}
                  >
                    {item.is_active ? 'Tersedia' : 'Habis'}
                  </Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 size={13} />}
                    onClick={() => handleOpenEdit(item)}
                    style={{ fontSize: '11px', height: '30px', padding: '0 8px' }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Kategori Baru */}
      {isAddCategoryOpen && (
        <div className="shift-modal-overlay" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="shift-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="shift-modal-header">
              <span style={{ fontWeight: 'bold' }}>Tambah Kategori Baru</span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsAddCategoryOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="add-menu-form" style={{ padding: 'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="inputCatName">NAMA KATEGORI</label>
                <input
                  id="inputCatName"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Dessert, Paket Nasi, dll."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="shift-modal-footer" style={{ margin: 'var(--space-2) -20px -20px -20px' }}>
                <Button variant="ghost" size="md" onClick={() => setIsAddCategoryOpen(false)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  Simpan Kategori
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Menu Baru */}
      {isAddMenuOpen && (
        <div className="shift-modal-overlay" onClick={() => setIsAddMenuOpen(false)}>
          <div className="shift-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shift-modal-header">
              <span style={{ fontWeight: 'bold' }}>Tambah Menu Baru</span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsAddMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMenu} className="add-menu-form" style={{ padding: 'var(--space-5)' }}>
              {/* Upload Foto Menu */}
              <div className="form-group">
                <label className="form-label">FOTO MENU</label>
                <div className="photo-upload-box">
                  {newMenuImage ? (
                    <img src={newMenuImage} alt="Preview" className="photo-upload-preview" />
                  ) : (
                    <div className="photo-upload-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="photo-upload-actions">
                    <label htmlFor="upload-new-menu" className="photo-upload-label-btn">
                      <Upload size={14} />
                      <span>{newMenuImage ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </label>
                    <input
                      id="upload-new-menu"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, setNewMenuImage)}
                    />
                    {newMenuImage && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        onClick={() => setNewMenuImage('')}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

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

              <div className="shift-modal-footer" style={{ margin: 'var(--space-2) -20px -20px -20px' }}>
                <Button variant="ghost" size="md" onClick={() => setIsAddMenuOpen(false)}>
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

      {/* Modal Edit Menu */}
      {editingMenu && (
        <div className="shift-modal-overlay" onClick={() => setEditingMenu(null)}>
          <div className="shift-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shift-modal-header">
              <span style={{ fontWeight: 'bold' }}>Edit Menu & Foto</span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setEditingMenu(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="add-menu-form" style={{ padding: 'var(--space-5)' }}>
              {/* Upload Foto Menu Edit */}
              <div className="form-group">
                <label className="form-label">FOTO MENU</label>
                <div className="photo-upload-box">
                  {editImage ? (
                    <img src={editImage} alt="Preview" className="photo-upload-preview" />
                  ) : (
                    <div className="photo-upload-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="photo-upload-actions">
                    <label htmlFor="upload-edit-menu" className="photo-upload-label-btn">
                      <Upload size={14} />
                      <span>{editImage ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </label>
                    <input
                      id="upload-edit-menu"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, setEditImage)}
                    />
                    {editImage && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        onClick={() => setEditImage('')}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NAMA MENU</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">KATEGORI</label>
                <select
                  className="form-select"
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
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
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={editUnlimited}
                    onChange={(e) => setEditUnlimited(e.target.checked)}
                  />
                  <span>Stok Selalu Tersedia (Unlimited)</span>
                </label>
              </div>

              {!editUnlimited && (
                <div className="form-group">
                  <label className="form-label">KUOTA PORSI</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              )}

              <div className="shift-modal-footer" style={{ margin: 'var(--space-2) -20px -20px -20px' }}>
                <Button variant="ghost" size="md" onClick={() => setEditingMenu(null)}>
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

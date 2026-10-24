# ⚡ Frontend State & Routing Architecture - KrisCafe

## 1. Arsitektur State Management (Zustand + Dexie.js)

KrisCafe memisahkan state menjadi 2 domain yang jelas:
1. **Persistent State (Disimpan di IndexedDB via Dexie.js):**
   * Data master: `categories`, `menus`, `transactions`, `cashier_shifts`, `settings`.
   * Bersifat permanen di perangkat lokal dan tidak hilang saat browser di-refresh.
2. **Ephemeral / Active State (Dikelola oleh Zustand):**
   * `cartStore`: Item yang sedang dipilih kasir saat ini, kuantitas, catatan, modal pembayaran terbuka/tertutup.
   * `uiStore`: Mode tampilan (Grid vs List), active category tab, offline/online banner status.
   * `authStore`: Shift kasir aktif, nama kasir saat bertugas.

---

## 2. Struktur Cart Store (Zustand)

```typescript
interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'DINE_IN' | 'TAKEAWAY';
  tableNumber: string;
  customerName: string;
  
  // Actions
  addItem: (menu: Menu, notes?: string) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY') => void;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;
  clearCart: () => void;
  
  // Computed (Selectors)
  subtotal: () => number;
  totalItems: () => number;
}
```

---

## 3. Strategi Routing & Navigasi Layar Kasir

Aplikasi POS memerlukan transisi layar instan tanpa *flicker*:
* **Halaman Utama (POS Touch Screen - `/`):** Layar kasir harian tempat transaksi 90% waktu berjalan.
* **Halaman Riwayat & Struk (`/transactions`):** Pencarian transaksi cepat, cetak ulang struk (*reprint*), filter tanggal.
* **Halaman Kelola Menu & Stok (`/menus`):** Update stok porsi harian, tambah menu baru, atur harga.
* **Halaman Laporan Harian & Shift (`/reports`):** Rekap omzet, cetak ringkasan shift kasir (*closing shift report*).
* **Halaman Pengaturan (`/settings`):** Konfigurasi nama toko, alamat di struk, koneksi printer Bluetooth, nomor WhatsApp toko.

---

## 4. Error Handling & Loading State Rules

1. **Zero Disruptive Loaders:**
   * Di layar POS, operasi penambahan item ke keranjang atau toggle kategori tidak boleh menampilkan loading spinner layar penuh. Semuanya dieksekusi secara instan (0ms).
2. **Optimistic Updates:**
   * Pengurangan kuota stok terjadi secara optimis di IndexedDB saat transaksi selesai.
3. **Pemberitahuan Ringkas (Toasts):**
   * Toast notifikasi melayang di pojok kanan atas / bawah dengan waktu tayang maksimal 2 detik agar tidak menghalangi tombol kasir.

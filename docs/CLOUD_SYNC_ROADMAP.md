# ☁️ KrisCafe Multi-Device & Cloud Sync Roadmap (Rencana Masa Depan)

> **Dokumen Arsitektur & Roadmap Teknis** untuk sinkronisasi multi-perangkat (2 Device Kasir + 1 Device Admin/Owner) berbasis prinsip *Local-First with Cloud Sync*.
>
> ⚠️ **Status:** Tahap Perencanaan & Peletakan Pondasi (Belum dieksekusi). Fokus saat ini adalah penyempurnaan UI/UX POS.

---

## 1. Latar Belakang & Kebutuhan Bisnis

Pada skala kafe/kantin yang berkembang, seringkali dibutuhkan:
1. **Device Kasir 1:** Tablet di kasir utama (pemesanan umum / *dine-in*).
2. **Device Kasir 2:** Tablet di kasir kedua (pemesanan *takeaway*, antrean panjang, atau lantai 2).
3. **Device Admin / Owner:** Laptop atau smartphone pemilik di rumah/kantor untuk memantau omzet harian secara *real-time* dan memperbarui menu/harga.

Tantangan utama pada sistem web murni adalah: **IndexedDB terisolasi di masing-masing perangkat fisik**. Oleh karena itu, dibutuhkan jembatan sinkronisasi *cloud* tanpa mengorbankan kecepatan lokal kasir.

---

## 2. Prinsip Arsitektur: *Local-First, Cloud-Synced*

```
               ┌──────────────────────┐
               │    Device Kasir 1    │
               │  [Local IndexedDB]   │
               └──────────┬───────────┘
                          │ (Push Transaksi Offline-to-Online)
                          ▼
               ┌──────────────────────┐
               │  Cloud Database /    │ ◄───► [ Device Admin / Owner ]
               │  Serverless Backend  │        (Pantau Omzet & Update Menu)
               └──────────▲───────────┘
                          │ (Push Transaksi Offline-to-Online)
               ┌──────────┴───────────┐
               │    Device Kasir 2    │
               │  [Local IndexedDB]   │
               └──────────────────────┘
```

### Prinsip Kerja:
1. **Zero-Latency POS (100% Offline-First):**
   - Transaksi kasir disimpan ke IndexedDB lokal terlebih dahulu (< 50ms).
   - Kasir **tidak pernah menunggu respon server cloud** saat mencetak struk.
2. **Background Sync:**
   - Worker di latar belakang mendeteksi status internet (`navigator.onLine`).
   - Jika online, transaksi lokal yang belum sinkron (`synced_to_server === false`) dikirim ke Cloud DB.
3. **Admin Centralized Aggregation:**
   - Dashboard Admin membaca data gabungan dari Cloud DB untuk menyajikan laporan omzet total, perbandingan kasir, dan menu terlaris.
4. **Menu Pull & Cache:**
   - Saat Admin mengubah harga atau menambah menu baru di Cloud, tablet kasir otomatis mengunduh (*pull*) pembaruan data saat tersambung internet.

---

## 3. Strategi Pencegahan Konflik Data (Conflict Prevention)

### 3.1 Pencegahan Nomor Invoice Tabrakan
Setiap kasir memiliki identitas register unik (`device_id`):
- Kasir 1: `KASIR-01` -> Format Invoice: `INV-K1-YYYYMMDD-0001`
- Kasir 2: `KASIR-02` -> Format Invoice: `INV-K2-YYYYMMDD-0001`
Dengan prefix per-device, tidak akan pernah terjadi konflik nomor transaksi di cloud database.

### 3.2 Pemisahan Uang Laci Kasir (Cash Drawer & Shift)
- Masing-masing kasir memulai shift mandiri dengan modal awal tersendiri (`starting_cash`).
- Kasir 1 bertanggung jawab atas fisik uang laci 1.
- Kasir 2 bertanggung jawab atas fisik uang laci 2.
- Laporan Admin menampilkan rekapitulasi per kasir serta total omzet keseluruhan.

### 3.3 Penanganan Stok Bersama (Shared Stock)
- **Menu Unlimited:** Tidak terpengaruh kuota porsi.
- **Menu Terbatas:**
  - Tiap kasir mengurangkan stok lokalnya secara instan.
  - Saat tersinkron ke cloud, cloud menghitung total stok tersisa dan mengirimkan pembaruan ke perangkat kasir lainnya.

---

## 4. Pondasi Data yang Disiapkan (Foundation Ready)

Struktur tabel di IndexedDB telah disiapkan untuk mendukung skenario ini:

```typescript
export interface Transaction {
  id: string;
  invoice_number: string;
  device_id?: string;            // 'KASIR-01' | 'KASIR-02'
  synced_to_server: boolean;     // false jika belum terunggah ke Cloud
  synced_at?: string;            // Timestamp waktu berhasil sync
  // ... field lainnya
}

export interface CashierShift {
  id: string;
  device_id?: string;            // Menandai laci kasir perangkat tertentu
  cashier_name: string;
  starting_cash: number;
  actual_cash?: number;
  status: ShiftStatus;
}
```

---

## 5. Pilihan Backend Cloud di Masa Depan

| Teknologi | Kelebihan | Rekomendasi |
| :--- | :--- | :--- |
| **Supabase (PostgreSQL)** | • Dukungan Realtime WebSockets bawaan<br>• Row Level Security (RLS)<br>• REST API instan & SDK TypeScript matang<br>• Free Tier sangat cukup untuk kantin/kafe | ⭐ **Pilihan Utama (Sangat Direkomendasikan)** |
| **Firebase Firestore** | • NoSQL Document, integrasi Google mudah<br>• Realtime listener bawaan | Alternatif |
| **PocketBase / Go** | • Single binary ringan, bisa self-hosted di VPS murah | Alternatif hemat biaya |

---

## 6. Tahapan Pelaksanaan Masa Depan (Future Phase Plan)

1. **Step 1 - Identitas Perangkat:**
   - Menambahkan pengaturan Device ID di Admin Settings (`KASIR-01`, `KASIR-02`, atau `ADMIN-OWNER`).
2. **Step 2 - Cloud Database Setup:**
   - Membuat skema tabel di Supabase/PostgreSQL (`transactions`, `menus`, `categories`, `shifts`).
3. **Step 3 - Sync Engine Service:**
   - Implementasi `pushPendingTransactions()` & `pullRemoteMenuUpdates()`.
   - Listener online/offline dengan status indikator visual di topbar (🟢 *Tersinkron*, 🟡 *Menunggu Jaringan*).
4. **Step 4 - Dashboard Agregasi Owner:**
   - Tampilan omzet real-time multi-kasir di perangkat Owner.

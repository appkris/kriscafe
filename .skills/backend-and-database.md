# 🗄️ Backend & Database Architecture - KrisCafe

## 1. Dual-Database Paradigm (Local-First Sync)

KrisCafe mengadopsi model **Local-First Database**:
* **Database Klien (IndexedDB via Dexie.js):** Sebagai sumber kebenaran instan (*immediate source of truth*) pada perangkat kasir. Seluruh operasi kasir (baca menu, tambah pesanan, simpan transaksi) selesai dalam 0ms tanpa menunggu jaringan.
* **Database Pusat (SQLite / PostgreSQL):** Menyimpan rekap multi-perangkat, histori transaksi permanen, dan sinkronisasi laporan owner via REST API.

---

## 2. Skema Entitas Relasional (Database Schema)

```sql
-- 1. Kategori Menu
CREATE TABLE categories (
    id TEXT PRIMARY KEY,               -- UUID v4
    name TEXT NOT NULL,                -- e.g. 'Coffee', 'Non-Coffee', 'Makanan', 'Camilan'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daftar Menu & Kontrol Stok
CREATE TABLE menus (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,            -- Dalam Rupiah tanpa desimal (e.g. 18000)
    image_url TEXT,
    is_unlimited_stock BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0,           -- Porsi tersedia saat ini
    is_active BOOLEAN DEFAULT true,    -- Toggle manual (tersedia / nonaktif)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transaksi Penjualan
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,               -- Format: KC-YYYYMMDD-XXXX (e.g. KC-20261024-0001)
    invoice_number TEXT UNIQUE NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL,      -- 'CASH' | 'QRIS' | 'TRANSFER'
    amount_paid INTEGER NOT NULL,      -- Uang yang diserahkan pembeli
    change_due INTEGER NOT NULL,       -- Uang kembalian
    customer_name TEXT,
    table_number TEXT,                 -- Meja / Nomor Antrean (opsional)
    order_type TEXT DEFAULT 'DINE_IN', -- 'DINE_IN' | 'TAKEAWAY'
    cashier_name TEXT NOT NULL,
    status TEXT DEFAULT 'COMPLETED',   -- 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
    synced_to_server BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Detail Item Transaksi
CREATE TABLE transaction_items (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    menu_id TEXT NOT NULL,
    menu_name TEXT NOT NULL,           -- Simpan nama menu saat transaksi (immutable)
    price INTEGER NOT NULL,            -- Simpan harga saat transaksi
    quantity INTEGER NOT NULL,
    notes TEXT,                        -- e.g. 'Less sugar', 'Pedas Lv 2'
    item_subtotal INTEGER NOT NULL
);

-- 5. Sesi Kasir / Shift Kasir
CREATE TABLE cashier_shifts (
    id TEXT PRIMARY KEY,
    cashier_name TEXT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    starting_cash INTEGER NOT NULL,    -- Modal kembalian awal di laci
    expected_cash INTEGER,             -- starting_cash + total penjualan tunai
    actual_cash INTEGER,               -- Uang fisik saat dihitung tutup shift
    cash_difference INTEGER,           -- Selisih uang kas
    status TEXT DEFAULT 'OPEN'         -- 'OPEN' | 'CLOSED'
);
```

---

## 3. Protokol Sinkronisasi Data (Sync Protocol)

1. **Queue Transaksi Offline:**
   * Setiap transaksi baru di IndexedDB ditandai `synced_to_server: false`.
2. **Sync Trigger:**
   * Dijalankan otomatis saat event `window.addEventListener('online')` atau interval hening setiap 60 detik.
3. **Idempotency:**
   * Setiap transaksi memiliki `id` UUID unik sehingga sinkronisasi ulang (*retry*) tidak akan menduplikasi transaksi di server jika koneksi sempat terputus di tengah jalan.

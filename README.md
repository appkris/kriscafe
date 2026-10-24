# ☕ KrisCafe - Modern Web POS (Point of Sale)

> **KrisCafe** adalah aplikasi kasir (Point of Sale) berbasis web modern yang dirancang khusus untuk kantin, kafe sederhana, pujasera/food court, dan warmindo. Mengutamakan kecepatan eksekusi di layar sentuh (tablet/smartphone), 100% *offline-first*, dan siap dikemas menjadi aplikasi Android native (`.apk`).

---

## 🌟 Fitur Utama (MVP Versi 1.0)

1. **Layar Kasir Sentuh Cepat (Touch-First POS):**
   * Antarmuka responsif untuk Tablet & Smartphone dengan tombol sentuh berukuran ergonomis (min. 44px).
   * Filter kategori instan & pencarian menu super cepat.
   * Pemilihan jenis pesanan (*Dine-In* / *Takeaway*) dan nomor meja/antrean.
   * Kalkulator nominal uang tunai cepat (*Uang Pas, 10k, 20k, 50k, 100k*) dengan hitungan kembalian otomatis.
   * Dukungan pembayaran Tunai dan QRIS.

2. **Offline-First & Local Storage (Dexie.js / IndexedDB):**
   * Transaksi tersimpan instan di perangkat kasir tanpa bergantung pada koneksi internet.
   * Tidak ada jeda loading *spinner* di tengah antrean kasir.
   * Background sync otomatis saat internet kembali tersambung.

3. **Manajemen Menu & Stok Ringkas:**
   * Kelola menu & kategori dengan mudah.
   * Kontrol stok porsi per menu (*Unlimited* atau kuota porsi harian).
   * Tombol cepat toggle "Stok Habis" langsung dari layar kasir.

4. **Struk Thermal & Struk Digital:**
   * Format cetak struk thermal 58mm / 80mm yang ringkas dan hemat kertas.
   * Opsi kirim struk digital instan via WhatsApp.

5. **Laporan & Rekap Shift Harian:**
   * Ringkasan omzet harian, jumlah transaksi, dan perbandingan Tunai vs QRIS.
   * Daftar menu terlaris (*Best Sellers*).
   * Rekap kasir harian (*Open Cash* vs *Close Cash*) untuk mendeteksi selisih uang kas.

---

## 🛠️ Tech Stack & Bahan

* **Frontend:** React 19 + TypeScript + Vite 6
* **Styling:** Modern Vanilla CSS (Design Tokens & CSS Variables, Anti-Slop, Dark Slate Theme)
* **Client Database (Offline-First):** Dexie.js (IndexedDB)
* **State Management:** Zustand
* **PWA & Offline Worker:** `vite-plugin-pwa`
* **Hardware & Struk:** ESC/POS & Web Print API
* **Mobile Packaging (Android APK):** Capacitor.js

---

## 📂 Struktur Proyek

```text
appkriscafe/
├── .skills/                          # Knowledge Base & Aturan Arsitektur
│   ├── stack-and-architecture.md
│   ├── ui-ux-anti-slop-guidelines.md
│   ├── backend-and-database.md
│   └── frontend-state-and-routing.md
├── docs/                             # Dokumentasi Teknis
│   ├── PRD.md                        # Product Requirements Document
│   └── DATABASE_SCHEMA.md            # Skema Entitas Relasional & Dexie
├── brain.md                          # Panduan arsitektur sistem
├── .gitignore                        # Konfigurasi Git ignore
└── README.md                         # Dokumentasi utama proyek
```

---

## 🚀 Langkah Push ke GitHub

Untuk menghubungkan repositori lokal ini ke akun GitHub Anda:

```bash
# 1. Pastikan Anda berada di direktori proyek:
cd "d:\PROJECT WEB\appkriscafe"

# 2. Inisialisasi Git dan Commit awal:
git init
git add .
git commit -m "feat: inisialisasi arsitektur, dokumentasi PRD, skema DB, dan skills KrisCafe"

# 3. Ubah branch utama menjadi main:
git branch -M main

# 4. Tambahkan remote repository GitHub Anda (ganti URL dengan repository GitHub Anda):
git remote add origin https://github.com/USERNAME/kriscafe.git

# 5. Push ke GitHub:
git push -u origin main
```

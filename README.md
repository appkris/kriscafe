# KrisCafe - Modern Web POS (Point of Sale)

> **KrisCafe** adalah aplikasi kasir (Point of Sale) berbasis web modern yang dirancang khusus untuk kantin, kafe sederhana, pujasera/food court, dan warmindo. Mengutamakan kecepatan eksekusi di layar sentuh (tablet/smartphone), 100% *offline-first*, dan siap dikemas menjadi aplikasi Android native (`.apk`).

---

## Fitur Utama (MVP Versi 1.0)

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

6. **Layar Login Awal & Pemisahan Hak Akses (Kasir vs Admin):**
   * **Login Sekali di Awal (Dedicated Login Screen):** Tidak perlu input PIN berulang-ulang di setiap tab. Cukup login sekali saat membuka aplikasi di awal shift.
   * **Area Kasir Eksklusif (Default PIN `1234`):** Kasir hanya melihat katalog menu, filter kategori, pencarian, dan keranjang sentuh. Tab laporan omzet harian, manajemen menu, dan pengaturan sistem **disembunyikan sepenuhnya** sehingga operasional fokus dan aman.
   * **Otoritas Penuh Admin (Default PIN `8888`):** Administrator memiliki akses ke seluruh 4 tab: Kasir, Laporan & Shift, Kelola Menu & Stok, serta **Pengaturan Sistem** (profil kafe, format struk, ganti PIN, & reset database demo).
   * **Tombol Kunci & Logout:** Tombol Kunci Layar sentuh untuk mengamankan kasir sementara dan tombol Keluar (Logout) untuk mengakhiri sesi kerja.

---

## Tech Stack & Bahan

* **Frontend:** React 19 + TypeScript + Vite 6
* **Styling:** Modern Vanilla CSS (Design Tokens & CSS Variables, Anti-Slop, Dark Slate Theme)
* **Client Database (Offline-First):** Dexie.js (IndexedDB)
* **State Management:** Zustand
* **PWA & Offline Worker:** `vite-plugin-pwa`
* **Hardware & Struk:** ESC/POS & Web Print API
* **Mobile Packaging (Android APK):** Capacitor.js

---

## Struktur Proyek

```text
├── .skills/                          # Knowledge Base & Aturan Arsitektur (Lokal)
├── docs/                             # Dokumentasi Teknis
│   ├── MASTER_PLAN.md                # Master Blueprint, Roadmap, User Flow & Master Prompt
│   ├── SECURITY_AUTH_PLAN.md         # Rencana Keamanan, PIN Auth & Role Guard
│   ├── CLOUD_SYNC_ROADMAP.md         # Roadmap Multi-Device (2 Kasir + 1 Owner) & Cloud Sync
│   ├── PRD.md                        # Product Requirements Document
│   └── DATABASE_SCHEMA.md            # Skema Entitas Relasional & Dexie
├── android/                          # Proyek Native Android (Capacitor)
├── public/                           # Aset Ikon PWA & Favicon
├── src/                              # Source Code Aplikasi POS
├── capacitor.config.ts               # Konfigurasi Capacitor Native
├── vite.config.ts                    # Konfigurasi Vite & PWA Service Worker
├── .gitignore                        # Konfigurasi Git ignore
└── README.md                         # Dokumentasi utama proyek
```

---

## 🏃 Cara Menjalankan Aplikasi

### 1. Mode Development (Web)
```bash
# Jalankan dev server lokal
npm run dev
# Buka di browser: http://localhost:5173
```

### 2. Instalasi PWA di Tablet / Smartphone (Tanpa Install Play Store)
1. Buka browser **Google Chrome** di tablet atau smartphone Android Anda.
2. Akses alamat web KrisCafe.
3. Tekan menu titik tiga di kanan atas Chrome, lalu pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** atau klik ikon install di address bar.
4. Aplikasi akan terpasang di layar beranda tablet dan dapat dibuka *fullscreen* tanpa *address bar*, serta **100% tetap berfungsi meski WiFi/internet mati**.

### 3. Membangun Installer Android Native (.apk) via Capacitor
```bash
# 1. Build aset web & sinkronisasi ke folder Android:
npm run build:android

# 2. Buka proyek di Android Studio untuk generate file .apk:
npm run cap:open

# Atau build APK langsung dari terminal (jika Android SDK / Gradle terpasang):
cd android
./gradlew assembleDebug
# File APK akan berada di: android/app/build/outputs/apk/debug/app-debug.apk
```

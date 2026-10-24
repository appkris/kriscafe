# 📋 Product Requirements Document (PRD) - KrisCafe POS

## 1. Ringkasan Produk
* **Nama Produk:** KrisCafe POS
* **Tipe Aplikasi:** Progressive Web App (PWA) + Android Native Wrapper (Capacitor)
* **Target Pengguna:** Pemilik & Kasir Kantin, Pujasera/Food Court, Kedai Kopi Sederhana, Warmindo.
* **Tujuan Utama:** Mempercepat antrean kasir dengan antarmuka sentuh responsif (tablet/HP), menjamin transaksi tetap berjalan saat internet mati (*offline-first*), serta kemudahan mencetak struk thermal 58mm atau struk digital via WhatsApp.

---

## 2. Kebutuhan Fungsional (MVP Versi 1.0)

### Modul 1: Layar Kasir Sentuh (POS Core)
1. **Grid & Daftar Menu:**
   * Tampilan kartu menu sentuh dengan foto/ikon, nama, harga, dan badge kategori.
   * Filter cepat berdasarkan kategori (*Semua, Kopi, Minuman Segar, Makanan, Camilan*).
   * Kolom pencarian instan berdasarkan nama menu.
2. **Interaksi Keranjang Belanja:**
   * Menambah menu dengan sekali ketuk.
   * Mengatur jumlah porsi (+ / -) dengan target sentuh jari yang lega (min 44px).
   * Memberikan catatan khusus per item (misal: "Pedas Lv 1", "Es Dipisah").
   * Opsi jenis pesanan: **Dine-In** (Makan di Tempat) atau **Takeaway** (Bungkus).
   * Input nomor meja / antrean (opsional).
3. **Kalkulator Pembayaran & Kembalian Cepat:**
   * Pilihan metode: **Tunai** atau **QRIS**.
   * Jika Tunai: Tombol nominal instan (*Uang Pas, Rp10.000, Rp20.000, Rp50.000, Rp100.000*).
   * Hitung kembalian secara otomatis tanpa jeda.

### Modul 2: Manajemen Menu & Stok Ringkas
1. Tambah, edit, dan hapus menu & kategori.
2. Kontrol stok per porsi:
   * Mode *Unlimited* (selalu tersedia).
   * Mode *Terbatas* (input kuota porsi, berkurang otomatis saat pesanan lunas).
3. Toggle "Stok Habis" langsung dari layar kasir untuk respon cepat saat jam makan siang.

### Modul 3: Cetak Struk & Struk WhatsApp
1. **Struk Thermal 58mm / 80mm:**
   * Cetak instan via browser print atau koneksi thermal Bluetooth ESC/POS.
   * Layout struk standar: Header toko, info invoice, daftar item + catatan, total, metode bayar, kembalian, footer ucapan terima kasih.
2. **Struk Digital WhatsApp:**
   * Tombol kirim ke WhatsApp: Membuka link `https://wa.me/{nomor}?text={pesan}` berisi rangkuman invoice yang rapi.

### Modul 4: Rekap & Laporan Harian
1. Omzet penjualan harian, jumlah transaksi, dan rekap metode bayar (Tunai vs QRIS).
2. 5 Menu terlaris hari ini (*Best Sellers*).
3. Riwayat transaksi lengkap dengan fitur cetak ulang struk (*reprint*).
4. Rekap shift kasir sederhana (modal kasir awal vs uang kas fisik akhir).

---

## 3. Kebutuhan Non-Fungsional

1. **Performa & Latensi:** Waktu respon penambahan menu ke keranjang < 50ms; proses checkout lokal < 200ms.
2. **Keandalan Offline (100% Offline Capable):** Seluruh fungsi inti kasir tetap berjalan penuh meski koneksi WiFi terputus.
3. **Kompatibilitas:** Responsif optimal pada layar tablet 8" - 11" (mode landscape & portrait) serta smartphone layar 5.5" - 6.7".

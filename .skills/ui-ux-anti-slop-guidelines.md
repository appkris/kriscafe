# 🎨 UI/UX & Anti-Slop Guidelines - KrisCafe

## 1. Filosofi Desain: Anti-AI Slop & Human-Crafted POS

Aplikasi kasir bukan landing page promosi. Aplikasi kasir digunakan oleh operator di bawah tekanan antrean dan mata lelah setelah berjam-jam bekerja. Desain harus:
1. **Fungsional & Kritis:** Informasi harga, total, dan nama produk harus terbaca seketika (*glanceable*).
2. **Anti-Gimmick:** Tidak ada gradien ungu-biru norak, tidak ada efek blur kaca (*glassmorphism*) berat yang memakan GPU tablet, tidak ada animasi lambat yang menghambat ritme kerja kasir.
3. **Ergonomi Layar Sentuh:** Semua area sentuh (*hit target*) wajib berukuran minimal 44px - 52px agar tidak terjadi salah tekan (*fat-finger error*).

---

## 2. Palet Warna (Tailored Warm Minimalist)

Warna terinspirasi dari nuansa kafe hangat, kopi, dan slate modern yang menenangkan mata:

```css
:root {
  /* Surface & Background */
  --bg-app: #0F1115;              /* Dark slate canvas untuk hemat daya layar OLED/tablet */
  --bg-surface: #181B20;          /* Card & container */
  --bg-surface-elevated: #22262E; /* Active elements & input field */
  --border-subtle: #2C323B;       /* Pembatas tipis */
  --border-focus: #4F5866;

  /* Typography */
  --text-primary: #F3F4F6;        /* Teks utama kontras tinggi */
  --text-secondary: #9CA3AF;      /* Deskripsi, kategori */
  --text-muted: #6B7280;          /* Placeholder & timestamps */

  /* Brand & Accents (Warm Amber / Espresso) */
  --accent-primary: #E08A3C;      /* Warm Amber/Caramel - fokus utama */
  --accent-hover: #F09A4D;
  --accent-subtle: rgba(224, 138, 60, 0.12);

  /* Status Tokens */
  --status-success: #10B981;      /* Transaksi lunas */
  --status-warning: #F59E0B;      /* Stok menipis */
  --status-danger: #EF4444;       /* Stok habis / batal */
  --status-info: #3B82F6;         /* Pending / sync */
}
```

---

## 3. Tipografi & Hierarki Visual

* **Font Utama:** Sans-serif modern berdaya baca tinggi (*Inter*, *Plus Jakarta Sans*, atau *system-ui*).
* **Ukuran Teks:**
  * Nominal Total Belanja: `28px - 34px`, tebal (`font-weight: 700`), warna kontras tinggi.
  * Nama Menu: `16px - 18px`, tebal (`font-weight: 600`), maksimal 2 baris dengan ellipsis.
  * Harga Item: `14px - 16px`, warna aksen atau putih.
  * Kategori & Tag: `12px - 13px`, uppercase atau badge ringkas.

---

## 4. Pola Interaksi Sentuh (Touch UX Rules)

1. **Target Sentuh Besar:**
   * Tombol kuantitas `+` dan `-`: minimal `44px x 44px`.
   * Kartu Menu: minimal tinggi `90px` untuk tata letak daftar, atau `120px` untuk grid.
   * Tombol Pembayaran Utama: tinggi minimal `56px` melintang penuh (*full width*).
2. **Kalkulator Uang Tunai Instan:**
   * Tombol pecahan uang (10k, 20k, 50k, 100k, Pas) berada tepat di atas atau di samping keypad angka dengan tinggi tombol minimal `48px`.
3. **Visual Feedback Seketika:**
   * Setiap ketukan memberikan *micro-press state* (`transform: scale(0.97)` atau highlight instan) tanpa durasi animasi bertele-tele (< 100ms).
   * Suara *beep* opsional (bisa diaktifkan/dinonaktifkan di pengaturan) untuk memastikan transaksi tercatat.
4. **Indikator Stok Habis (Out of Stock):**
   * Kartu menu yang stoknya 0 otomatis berstatus redup (*opacity: 0.45*), tombol tidak dapat diklik, dan memiliki badge "HABIS" kontras tinggi di tengah kartu.

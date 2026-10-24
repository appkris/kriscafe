# 🏗️ Tech Stack & Architecture - KrisCafe

## 1. Core Technology Decisions

KrisCafe dirancang sebagai aplikasi Kasir (POS) modern berbasis web yang mengutamakan kecepatan eksekusi di layar sentuh (tablet/smartphone), keandalan saat jaringan offline (*offline-first*), serta kemudahan dikonversi menjadi installer Android native (`.apk`).

### Tech Stack Matrix

| Layer | Pilihan Teknologi | Alasan & Keunggulan |
| :--- | :--- | :--- |
| **Runtime & Bundler** | Vite 6 + TypeScript | Build super kencang, HMR instan, type safety penuh, ukuran bundle minimal. |
| **Frontend Framework** | React 19 (SPA Architecture) | Ideal untuk aplikasi POS interaktif, zero latency rendering, integrasi mulus dengan Capacitor & IndexedDB. |
| **Styling & Design System** | Modern Vanilla CSS (Design Tokens) | Bebas dependensi berat, kontrol layout 100%, ukuran file CSS sangat kecil, performa rendering tinggi di perangkat mobile entry-level. |
| **Client-Side DB (Offline)** | Dexie.js (IndexedDB) | Menyimpan menu, keranjang, riwayat transaksi, dan sesi kasir langsung di memori lokal perangkat tanpa perlu koneksi internet. |
| **State Management** | Zustand | Sangat ringan (< 1KB), reaktif, tanpa boilerplate berlebih, ideal untuk state keranjang kasir (*cart*) dan modal popup. |
| **PWA & Offline Service Worker** | `vite-plugin-pwa` (Workbox) | Caching otomatis seluruh asset, manifest PWA untuk instalasi fullscreen tanpa address bar di Android & tablet. |
| **Native Mobile Wrapper** | Capacitor.js (Android) | Membungkus web app menjadi file `.apk` native resmi dengan akses hardware printer bluetooth dan mode kiosk. |
| **Struk & Hardware** | ESC/POS + Web Print API | Kompatibel dengan printer thermal Bluetooth/USB 58mm & 80mm standar pasar. |

---

## 2. Arsitektur Data Flow (Offline-First Local-First)

```
[Touch Screen (Tablet/HP)]
          │
          ▼
   [Zustand Store] (Cart & Order State)
          │
    (Checkout)
          │
          ▼
   [Dexie.js / IndexedDB] ──► (Instant Save & Print Thermal Receipt - 0ms Lag)
          │
          ▼
   [Sync Queue Engine]
          │
   (Network Check)
    ├── Online  ──► [REST API / Cloud Database Sync] ──► [Server Database]
    └── Offline ──► [Pending Queue in IndexedDB] (Sync when online reconnects)
```

---

## 3. Struktur Direktori Terencana

```text
appkriscafe/
├── .skills/                          # Knowledge base arsitektur & guideline
├── docs/                             # Dokumentasi proyek & PRD
├── public/                           # Assets statis, logo, PWA icons
│   └── icons/
├── src/
│   ├── assets/                       # Image menu, audio click/beep
│   ├── components/                   # UI components modular
│   │   ├── common/                   # Button, Modal, Badge, Input, Toast
│   │   ├── pos/                      # MenuGrid, MenuCard, Cart, PaymentModal
│   │   ├── reports/                  # SummaryCards, BestSellerList, ShiftModal
│   │   └── receipt/                  # ThermalReceipt58, WhatsAppShare
│   ├── db/                           # IndexedDB schema & repository (Dexie.js)
│   ├── hooks/                        # Custom hooks (useCart, useOfflineSync, usePrinter)
│   ├── layouts/                      # AppLayout, PosLayout, AdminLayout
│   ├── pages/                        # POS, MenuManagement, Reports, Settings
│   ├── services/                     # PrinterService, WhatsAppService, SyncService
│   ├── store/                        # Zustand stores (cartStore, authStore, uiStore)
│   ├── styles/                       # Design tokens, variables, reset, utilities
│   │   ├── tokens.css                # Color, spacing, radius, typography
│   │   ├── global.css                # Base styling & touch resets
│   │   └── print.css                 # 58mm thermal print layout
│   ├── types/                        # TypeScript definitions
│   ├── utils/                        # Currency formatter, date, validation
│   ├── App.tsx
│   └── main.tsx
├── android/                          # Folder Capacitor Android (saat build APK)
├── capacitor.config.ts               # Konfigurasi Capacitor native
├── vite.config.ts                    # Konfigurasi Vite & PWA plugin
└── package.json
```

# LostFind: Aplikasi Pelaporan dan Pencarian Barang Hilang di Kampus

> **Tugas Akhir Praktikum Pengembangan Perangkat Bergerak (PPB)**  
> **Nama Praktikan:** Andri Pratama  
> **NIM:** 21120124140134  
> **Materi / Platform:** Progressive Web App (PWA) & Web Service (TypeScript)  
> **Tahun:** 2026  

---

## 📱 Tentang LostFind

**LostFind** adalah aplikasi Progressive Web App (PWA) modern yang dirancang untuk mempermudah civitas akademika kampus (mahasiswa, dosen, dan staf) dalam melaporkan barang yang hilang maupun mempublikasikan barang temuan secara terpusat, cepat, dan transparan.

Aplikasi ini dilengkapi dengan:
- **Bottom Navigation Bar** untuk navigasi intuitif pada perangkat bergerak.
- **RESTful API Web Service** mandiri berbasis Node.js, Express.js, dan Supabase PostgreSQL (sesuai Modul 1).
- **Offline-First Resilience**: Dukungan Service Worker dan caching lokal (`localStorage` fallback) sehingga aplikasi tetap dapat dibuka dan berfungsi penuh saat offline atau tanpa server.
- **Auto-Save Drafts**: Fitur penyimpanan formulir otomatis agar data laporan tidak hilang saat halaman tertutup tanpa sengaja.
- **Verifikasi Klaim Kepemilikan**: Alur pengajuan bukti ciri khusus bagi pemilik sah sebelum pengambilan di pos pengamanan/satpam kampus.
- **Integrasi Direct Contact**: Tombol komunikasi langsung via WhatsApp dan panggilan telepon.

---

## 🎯 Pemenuhan Syarat Tugas Akhir

| No | Syarat Tugas Akhir | Implementasi pada LostFind |
|:--:|---|---|
| **1** | **API (Web Service) buatan sendiri sesuai Modul 1** | Backend Express.js dengan arsitektur MVC (`server/models`, `server/controllers`, `server/routes`, `server/config/supabaseClient.ts`), mendukung operasi CRUD untuk Items, Categories, dan Claims serta export koleksi Postman. |
| **2** | **Memiliki Bottom Navigation Bar** | Terdapat Bottom Navigation Bar di bagian bawah layar dengan 5 menu navigasi, indikator tab aktif, badge jumlah laporan, dan tombol lapor cepat di tengah. |
| **3** | **Memiliki minimal 5 halaman** | 1. Halaman Barang Hilang (Lost Items)<br>2. Halaman Barang Ditemukan (Found Items)<br>3. Halaman Buat Laporan (Report Form)<br>4. Halaman Aktivitas & Klaim Saya (My Activity)<br>5. Halaman Profil Praktikan & Tentang Aplikasi |
| **4** | **Minimal 2 halaman utama memiliki list & item dapat diklik ke detail** | • **Halaman 1 (Barang Hilang):** List kartu barang hilang $\rightarrow$ Klik untuk membuka detail barang, foto resolusi tinggi, lokasi, kontak WhatsApp, dan imbalan.<br>• **Halaman 2 (Barang Ditemukan):** List kartu barang temuan $\rightarrow$ Klik untuk membuka detail barang, lokasi diamankan, dan formulir pengajuan klaim.<br>• *(Bonus)* **Halaman 4 (Aktivitas Saya):** List laporan & klaim $\rightarrow$ Klik untuk melihat progres verifikasi. |
| **5** | **Memiliki 1 halaman Profile/About aplikasi** | Halaman ke-5 memuat identitas **Andri Pratama (NIM: 21120124140134)**, deskripsi arsitektur sistem LostFind, panduan pos pengamanan kampus, status PWA, serta tombol replay splash screen. |
| **6** | **Mengunggah source code ke GitHub** | Repositori terstruktur rapi dengan Git, `.gitignore`, TypeScript type safety, dan dokumentasi lengkap. |
| **7** | **PWA wajib di-deploy menggunakan free hosting** | Dilengkapi konfigurasi `vercel.json` dan manifest PWA standar produksi untuk deployment instan ke platform Vercel. |

---

## 🛠️ Tech Stack

- **Frontend & PWA:** React 19, TypeScript, Vite, `vite-plugin-pwa`, Workbox, Lucide React
- **Backend API:** Node.js, Express.js, TypeScript (`tsx`), CORS, Dotenv, `@supabase/supabase-js`
- **Database:** Supabase PostgreSQL (didukung Embedded High-Speed Offline Fallback)
- **Styling:** Modern Responsive CSS (Design Tokens, Glassmorphism, Mobile-First Layout)

---

## 📂 Struktur Proyek

```
Tugas Akhir/
├── server/                                  # Backend RESTful API (Modul 1)
│   ├── config/
│   │   ├── supabaseClient.ts                # Inisialisasi Supabase / Fallback
│   │   └── seedData.ts                      # Data awal kampus
│   ├── controllers/
│   │   ├── itemController.ts                # Controller CRUD barang
│   │   ├── categoryController.ts            # Controller CRUD kategori
│   │   └── claimController.ts               # Controller pengajuan klaim
│   ├── models/
│   │   ├── itemModel.ts                     # Query data barang
│   │   ├── categoryModel.ts                 # Query data kategori
│   │   └── claimModel.ts                    # Query data klaim
│   ├── routes/
│   │   ├── itemRoutes.ts                    # Routing /api/items
│   │   ├── categoryRoutes.ts                # Routing /api/categories
│   │   └── claimRoutes.ts                   # Routing /api/claims
│   ├── index.ts                             # Entrypoint server Express
│   └── schema.sql                           # Skema tabel PostgreSQL
├── public/
│   ├── favicon.svg
│   ├── icon-192.png                         # PWA App Icon 192x192
│   ├── icon-512.png                         # PWA App Icon 512x512
│   ├── logo.png
│   └── presets/                             # Ikon vektor barang bawaan
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── BottomNav.tsx                # Bottom Navigation Bar
│   │   │   ├── Header.tsx                   # Top Bar & status online
│   │   │   ├── PWABadge.tsx                 # Install prompt & offline banner
│   │   │   ├── SplashScreen.tsx             # Splash Screen animasi
│   │   │   └── ConfirmModal.tsx             # Dialog konfirmasi aksi
│   │   ├── items/
│   │   │   ├── ItemCard.tsx                 # Kartu item barang
│   │   │   ├── ItemDetailModal.tsx          # Halaman detail & klaim barang
│   │   │   └── ClaimDetailModal.tsx         # Detail status klaim posko
│   │   └── filters/
│   │       └── SearchFilterBar.tsx          # Pencarian & filter kategori
│   ├── hooks/
│   │   ├── useItems.ts                      # Hook fetch barang & filter
│   │   └── useClaims.ts                     # Hook fetch klaim saya
│   ├── pages/
│   │   ├── LostItemsPage.tsx                # Halaman 1: Barang Hilang
│   │   ├── FoundItemsPage.tsx               # Halaman 2: Barang Ditemukan
│   │   ├── ReportPage.tsx                   # Halaman 3: Buat Laporan Baru
│   │   ├── MyActivityPage.tsx               # Halaman 4: Aktivitas & Klaim Saya
│   │   └── ProfileAboutPage.tsx             # Halaman 5: Profil & Tentang
│   ├── services/
│   │   ├── itemService.ts                   # Komunikasi API & offline cache
│   │   ├── claimService.ts                  # Layanan klaim kepemilikan
│   │   └── userService.ts                   # Identitas mahasiswa & UUID
│   ├── types/
│   │   └── index.ts                         # Definisi tipe TypeScript
│   ├── utils/
│   │   ├── draftStorage.ts                  # Auto-save draf formulir
│   │   ├── helpers.ts                       # Format tanggal, WA URL, badge
│   │   └── initialData.ts                   # Data referensi kampus
│   ├── config/
│   │   └── api.ts                           # Axios client & interceptor
│   ├── App.tsx                              # Root App & State Management
│   ├── App.css                              # Desain antarmuka responsif
│   └── main.tsx
├── LostFind_API.postman_collection.json     # Koleksi Postman siap import
├── vercel.json                              # Konfigurasi deployment Vercel
├── vite.config.ts                           # Konfigurasi Vite & PWA Manifest
└── package.json
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18 ke atas (disarankan v20 atau v24)
- Git

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Aplikasi
Tersedia beberapa cara menjalankan aplikasi:

- **Menjalankan Frontend PWA saja (Client):**
  ```bash
  npm run dev
  ```
  Buka browser di: `http://localhost:5173`

- **Menjalankan Backend API Web Service saja:**
  ```bash
  npm run server
  ```
  API berjalan di: `http://localhost:5000/api`

- **Menjalankan Keduanya Bersamaan (Full-Stack Mode):**
  ```bash
  npm run dev:all
  ```

---

## 📡 Dokumentasi Endpoint RESTful API (Modul 1)

Base URL: `http://localhost:5000/api`

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api` | Cek status kesehatan server API |
| `GET` | `/api/items` | Mengambil seluruh daftar barang (support query `?type=lost` atau `?type=found`) |
| `GET` | `/api/items/:id` | Mengambil detail barang berdasarkan ID |
| `POST` | `/api/items` | Menambahkan laporan barang hilang atau temuan baru |
| `PUT` | `/api/items/:id` | Memperbarui data/status laporan barang |
| `DELETE` | `/api/items/:id` | Menghapus laporan barang |
| `GET` | `/api/items/stats` | Mengambil ringkasan statistik barang kampus |
| `GET` | `/api/categories` | Mengambil daftar kategori barang |
| `POST` | `/api/categories` | Menambahkan kategori baru |
| `GET` | `/api/claims` | Mengambil daftar klaim kepemilikan |
| `POST` | `/api/claims` | Mengajukan klaim kepemilikan barang temuan |
| `PUT` | `/api/claims/:id` | Memperbarui status klaim (*pending*, *verified*, *completed*) |

> **Pengujian Postman:** File `LostFind_API.postman_collection.json` sudah disediakan di root folder. Anda cukup membuka Postman $\rightarrow$ klik **Import** $\rightarrow$ pilih file tersebut untuk menguji semua endpoint.

---

## 📲 Pengujian Fitur PWA pada Smartphone

1. Jalankan build produksi lokal dengan host:
   ```bash
   npm run build
   npm run preview -- --host
   ```
2. Hubungkan laptop dan smartphone ke jaringan WiFi yang sama (atau gunakan hotspot seluler).
3. Buka browser (Chrome di Android atau Safari di iOS) pada smartphone, lalu ketik alamat IP yang muncul pada terminal (contoh: `http://192.168.1.xxx:4173`).
4. Klik tombol menu browser $\rightarrow$ pilih **"Add to Home Screen"** atau **"Install App"**.
5. Ikon **LostFind** akan terpasang di beranda HP Anda dan dapat dibuka selayaknya aplikasi *native* Android/iOS tanpa bilah alamat browser, serta dapat digunakan saat koneksi dimatikan (mode pesawat/offline).

---

## 🌐 Panduan Deployment ke Vercel (Free Hosting)

1. **Inisialisasi Git dan Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi LostFind PWA Tugas Akhir PPB"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/lostfind-pwa.git
   git push -u origin main
   ```
2. **Deploy di Vercel:**
   - Kunjungi [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
   - Klik **"Add New..."** $\rightarrow$ **"Project"**.
   - Pilih repositori `lostfind-pwa`.
   - Vercel akan otomatis mendeteksi Framework Preset **Vite**.
   - Klik **Deploy**.
3. Dalam 1-2 menit, link aplikasi produksi Anda akan aktif (contoh: `https://lostfind-pwa.vercel.app`) dan siap diakses asisten dosen penguji responsi.

---
*Dibuat dengan dedikasi untuk Tugas Akhir Praktikum Pengembangan Perangkat Bergerak (PPB) 2026.*

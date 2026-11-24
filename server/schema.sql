-- ========================================================
-- LostFind - Skema Database PostgreSQL (Supabase / Neon DB)
-- Pengembang: Andri Pratama (21120124140134)
-- ========================================================

-- 1. Tabel Kategori Barang
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "iconName" TEXT DEFAULT 'HelpCircle'
);

-- 2. Tabel Laporan Barang Hilang & Ditemukan
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT,
  "contactName" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved')),
  "rewardInfo" TEXT,
  "securedAt" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ,
  "userId" TEXT NOT NULL
);

-- Index pencarian & performa
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items (type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items ("createdAt" DESC);

-- 3. Tabel Klaim Kepemilikan Barang
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  "itemId" TEXT REFERENCES public.items(id) ON DELETE CASCADE,
  "itemTitle" TEXT NOT NULL,
  "itemType" TEXT NOT NULL,
  "itemImageUrl" TEXT,
  "claimantName" TEXT NOT NULL,
  "claimantNim" TEXT,
  "claimantPhone" TEXT NOT NULL,
  "proofDescription" TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  "verificationNotes" TEXT,
  "userId" TEXT NOT NULL
);

-- Index klaim
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims ("itemId");
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims ("userId");

-- ========================================================
-- Seed Data Awal Kategori (Categories)
-- ========================================================
INSERT INTO public.categories (id, name, description, "iconName") VALUES
  ('cat-1', 'Elektronik', 'Laptop, HP, Charger, TWS, Flashdisk', 'Laptop'),
  ('cat-2', 'Dokumen & Kartu', 'KTM, KTP, SIM, Buku Catatan, Sertifikat', 'CreditCard'),
  ('cat-3', 'Kunci & Aksesoris', 'Kunci motor, kunci kos, jam tangan, kacamata', 'Key'),
  ('cat-4', 'Tas & Dompet', 'Ransel, tote bag, dompet uang/kartu', 'Briefcase'),
  ('cat-5', 'Pakaian & Perlengkapan', 'Jaket, almamater, payung, botol minum, helm', 'Shirt'),
  ('cat-6', 'Lainnya', 'Barang dan perlengkapan lainnya', 'HelpCircle')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- Seed Data Awal Barang (Items)
-- ========================================================
INSERT INTO public.items (id, title, type, category, location, date, time, description, "imageUrl", "contactName", "contactPhone", status, "rewardInfo", "securedAt", "userId") VALUES
  ('item-101', 'KTM Undip a.n. Andri Pratama', 'lost', 'Dokumen & Kartu', 'Perpustakaan Pusat Lantai 2', '2026-11-23', '14:15 WIB', 'KTM tertinggal di meja kubikel nomor 14 saat mengerjakan laporan praktikum. Terdapat stiker hologram fakultas.', '/presets/ktm.svg', 'Andri Pratama', '081234567890', 'open', 'Terima kasih & traktiran es kopi', NULL, 'user-andri-01'),
  ('item-102', 'Laptop ASUS VivoBook Hitam', 'lost', 'Elektronik', 'Gedung Kuliah Bersama (GKB) Ruang 304', '2026-11-22', '16:45 WIB', 'Laptop 14 inch warna slate grey dengan sleeve hitam. Ada stiker logo React dan GitHub di casing belakang.', '/presets/laptop.svg', 'Nadia Salsabila', '085712345678', 'open', 'Uang tanda terima kasih Rp 200.000', NULL, 'user-nadia-02'),
  ('item-103', 'Gantungan Kunci Motor Honda Vario', 'lost', 'Kunci & Aksesoris', 'Parkiran Sepeda Motor Gedung B', '2026-11-24', '08:30 WIB', 'Kunci motor ada gantungan boneka rajut warna biru dan remote alarm hitam.', '/presets/kunci.svg', 'Bagus Hendra', '082198765432', 'open', NULL, NULL, 'user-bagus-03'),
  ('item-104', 'Dompet Kulit Coklat Baellerry', 'found', 'Tas & Dompet', 'Kantin Fakultas Teknik (Meja Barat)', '2026-11-24', '11:45 WIB', 'Ditemukan dompet kulit coklat tebal berisi sejumlah uang tunai dan kartu minimarket. Diserahkan ke pos pengamanan.', '/presets/dompet.svg', 'Petugas Satpam Rahmat', '081399887766', 'open', NULL, 'Pos Satpam Utama Gerbang Barat', 'user-satpam-01'),
  ('item-105', 'Tumbler Stainless Steel Tosca (500ml)', 'found', 'Pakaian & Perlengkapan', 'Gedung Serba Guna (GSG) Tribun Utara', '2026-11-23', '18:10 WIB', 'Tumbler tahan dingin warna hijau tosca dengan tutup hitam. Ditinggalkan di bangku tribun setelah kegiatan seminar.', '/presets/botol.svg', 'Panitia Seminar (Dimas)', '087811223344', 'open', NULL, 'Ruang Sekretariat BEM', 'user-dimas-04'),
  ('item-106', 'Helm Motor KYT Merah Glossy', 'found', 'Pakaian & Perlengkapan', 'Parkiran Utama Rektorat', '2026-11-22', '17:30 WIB', 'Helm diletakkan di atas spion motor orang lain dan tidak diambil hingga malam hari. Sudah diamankan oleh staf keamanan.', '/presets/helm.svg', 'Pos Satpam Rektorat', '081277665544', 'claimed', NULL, 'Pos Satpam Rektorat Gedung A', 'user-satpam-02')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- Seed Data Awal Klaim (Claims)
-- ========================================================
INSERT INTO public.claims (id, "itemId", "itemTitle", "itemType", "itemImageUrl", "claimantName", "claimantNim", "claimantPhone", "proofDescription", status, "verificationNotes", "userId") VALUES
  ('claim-201', 'item-106', 'Helm Motor KYT Merah Glossy', 'found', '/presets/helm.svg', 'Rian Pratama Putra', '21120123120045', '081299881122', 'Ada baret kecil di visor sebelah kiri atas dan stiker service resmi Honda di bagian belakang helm.', 'verified', 'Ciri-ciri fisik cocok. Silakan bawa KTM fisik dan STNK untuk serah terima di Pos Satpam Rektorat.', 'user-rian-05')
ON CONFLICT (id) DO NOTHING;

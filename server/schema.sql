-- ========================================================
-- LostFind - Skema Database PostgreSQL (Supabase / Neon DB)
-- Pengembang: Andri Pratama (21120124140134)
-- ========================================================

-- 1. Tabel Kategori Barang
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  iconName TEXT DEFAULT 'HelpCircle'
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
  imageUrl TEXT,
  contactName TEXT NOT NULL,
  contactPhone TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved')),
  rewardInfo TEXT,
  securedAt TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ,
  userId TEXT NOT NULL
);

-- Index pencarian & performa
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items (type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (createdAt DESC);

-- 3. Tabel Klaim Kepemilikan Barang
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  itemId TEXT REFERENCES public.items(id) ON DELETE CASCADE,
  itemTitle TEXT NOT NULL,
  itemType TEXT NOT NULL,
  itemImageUrl TEXT,
  claimantName TEXT NOT NULL,
  claimantNim TEXT,
  claimantPhone TEXT NOT NULL,
  proofDescription TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
  submittedAt TIMESTAMPTZ DEFAULT NOW(),
  verificationNotes TEXT,
  userId TEXT NOT NULL
);

-- Index klaim
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims (itemId);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims (userId);

-- ========================================================
-- Seed Data Awal Kategori
-- ========================================================
INSERT INTO public.categories (id, name, description, iconName) VALUES
  ('cat-1', 'Elektronik', 'Laptop, HP, Charger, TWS, Flashdisk', 'Laptop'),
  ('cat-2', 'Dokumen & Kartu', 'KTM, KTP, SIM, Buku Catatan, Sertifikat', 'CreditCard'),
  ('cat-3', 'Kunci & Aksesoris', 'Kunci motor, kunci kos, jam tangan, kacamata', 'Key'),
  ('cat-4', 'Tas & Dompet', 'Ransel, tote bag, dompet uang/kartu', 'Briefcase'),
  ('cat-5', 'Pakaian & Perlengkapan', 'Jaket, almamater, payung, botol minum, helm', 'Shirt'),
  ('cat-6', 'Lainnya', 'Barang dan perlengkapan lainnya', 'HelpCircle')
ON CONFLICT (id) DO NOTHING;

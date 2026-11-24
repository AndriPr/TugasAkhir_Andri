export interface DbCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface DbItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  date: string;
  time: string;
  description: string;
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  status: 'open' | 'claimed' | 'resolved';
  rewardInfo?: string;
  securedAt?: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export interface DbClaim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: 'lost' | 'found';
  itemImageUrl: string;
  claimantName: string;
  claimantNim: string;
  claimantPhone: string;
  proofDescription: string;
  status: 'pending' | 'verified' | 'rejected' | 'completed';
  submittedAt: string;
  verificationNotes?: string;
  userId: string;
}

export const INITIAL_CATEGORIES: DbCategory[] = [
  { id: 'cat-1', name: 'Elektronik', description: 'Laptop, HP, Charger, TWS, Flashdisk', iconName: 'Laptop' },
  { id: 'cat-2', name: 'Dokumen & Kartu', description: 'KTM, KTP, SIM, Buku Catatan, Sertifikat', iconName: 'CreditCard' },
  { id: 'cat-3', name: 'Kunci & Aksesoris', description: 'Kunci motor, kunci kos, jam tangan, kacamata', iconName: 'Key' },
  { id: 'cat-4', name: 'Tas & Dompet', description: 'Ransel, tote bag, dompet uang/kartu', iconName: 'Briefcase' },
  { id: 'cat-5', name: 'Pakaian & Perlengkapan', description: 'Jaket, almamater, payung, botol minum, helm', iconName: 'Shirt' },
  { id: 'cat-6', name: 'Lainnya', description: 'Barang dan perlengkapan lainnya', iconName: 'HelpCircle' },
];

export const INITIAL_ITEMS: DbItem[] = [
  {
    id: 'item-101',
    title: 'KTM Undip a.n. Andri Pratama',
    type: 'lost',
    category: 'Dokumen & Kartu',
    location: 'Perpustakaan Pusat Lantai 2',
    date: '2026-11-23',
    time: '14:15 WIB',
    description: 'KTM tertinggal di meja kubikel nomor 14 saat mengerjakan laporan praktikum. Terdapat stiker hologram fakultas.',
    imageUrl: '/presets/ktm.svg',
    contactName: 'Andri Pratama',
    contactPhone: '081234567890',
    status: 'open',
    rewardInfo: 'Terima kasih & traktiran es kopi',
    createdAt: new Date('2026-11-23T14:30:00Z').toISOString(),
    userId: 'user-andri-01',
  },
  {
    id: 'item-102',
    title: 'Laptop ASUS VivoBook Hitam',
    type: 'lost',
    category: 'Elektronik',
    location: 'Gedung Kuliah Bersama (GKB) Ruang 304',
    date: '2026-11-22',
    time: '16:45 WIB',
    description: 'Laptop 14 inch warna slate grey dengan sleeve hitam. Ada stiker logo React dan GitHub di casing belakang.',
    imageUrl: '/presets/laptop.svg',
    contactName: 'Nadia Salsabila',
    contactPhone: '085712345678',
    status: 'open',
    rewardInfo: 'Uang tanda terima kasih Rp 200.000',
    createdAt: new Date('2026-11-22T17:00:00Z').toISOString(),
    userId: 'user-nadia-02',
  },
  {
    id: 'item-103',
    title: 'Gantungan Kunci Motor Honda Vario',
    type: 'lost',
    category: 'Kunci & Aksesoris',
    location: 'Parkiran Sepeda Motor Gedung B',
    date: '2026-11-24',
    time: '08:30 WIB',
    description: 'Kunci motor ada gantungan boneka rajut warna biru dan remote alarm hitam.',
    imageUrl: '/presets/kunci.svg',
    contactName: 'Bagus Hendra',
    contactPhone: '082198765432',
    status: 'open',
    createdAt: new Date('2026-11-24T09:00:00Z').toISOString(),
    userId: 'user-bagus-03',
  },
  {
    id: 'item-104',
    title: 'Dompet Kulit Coklat Baellerry',
    type: 'found',
    category: 'Tas & Dompet',
    location: 'Kantin Fakultas Teknik (Meja Barat)',
    date: '2026-11-24',
    time: '11:45 WIB',
    description: 'Ditemukan dompet kulit coklat tebal berisi sejumlah uang tunai dan kartu minimarket. Diserahkan ke pos pengamanan.',
    imageUrl: '/presets/dompet.svg',
    contactName: 'Petugas Satpam Rahmat',
    contactPhone: '081399887766',
    status: 'open',
    securedAt: 'Pos Satpam Utama Gerbang Barat',
    createdAt: new Date('2026-11-24T12:00:00Z').toISOString(),
    userId: 'user-satpam-01',
  },
  {
    id: 'item-105',
    title: 'Tumbler Stainless Steel Tosca (500ml)',
    type: 'found',
    category: 'Pakaian & Perlengkapan',
    location: 'Gedung Serba Guna (GSG) Tribun Utara',
    date: '2026-11-23',
    time: '18:10 WIB',
    description: 'Tumbler tahan dingin warna hijau tosca dengan tutup hitam. Ditinggalkan di bangku tribun setelah kegiatan seminar.',
    imageUrl: '/presets/botol.svg',
    contactName: 'Panitia Seminar (Dimas)',
    contactPhone: '087811223344',
    status: 'open',
    securedAt: 'Ruang Sekretariat BEM',
    createdAt: new Date('2026-11-23T18:45:00Z').toISOString(),
    userId: 'user-dimas-04',
  },
  {
    id: 'item-106',
    title: 'Helm Motor KYT Merah Glossy',
    type: 'found',
    category: 'Pakaian & Perlengkapan',
    location: 'Parkiran Utama Rektorat',
    date: '2026-11-22',
    time: '17:30 WIB',
    description: 'Helm diletakkan di atas spion motor orang lain dan tidak diambil hingga malam hari. Sudah diamankan oleh staf keamanan.',
    imageUrl: '/presets/helm.svg',
    contactName: 'Pos Satpam Rektorat',
    contactPhone: '081277665544',
    status: 'claimed',
    securedAt: 'Pos Satpam Rektorat Gedung A',
    createdAt: new Date('2026-11-22T18:00:00Z').toISOString(),
    userId: 'user-satpam-02',
  },
];

export const INITIAL_CLAIMS: DbClaim[] = [
  {
    id: 'claim-201',
    itemId: 'item-106',
    itemTitle: 'Helm Motor KYT Merah Glossy',
    itemType: 'found',
    itemImageUrl: '/presets/helm.svg',
    claimantName: 'Rian Pratama Putra',
    claimantNim: '21120123120045',
    claimantPhone: '081299881122',
    proofDescription: 'Ada baret kecil di visor sebelah kiri atas dan stiker service resmi Honda di bagian belakang helm.',
    status: 'verified',
    submittedAt: new Date('2026-11-23T09:30:00Z').toISOString(),
    verificationNotes: 'Ciri-ciri fisik cocok. Silakan bawa KTM fisik dan STNK untuk serah terima di Pos Satpam Rektorat.',
    userId: 'user-rian-05',
  },
];

export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Elektronik'
  | 'Dokumen & Kartu'
  | 'Kunci & Aksesoris'
  | 'Tas & Dompet'
  | 'Pakaian & Perlengkapan'
  | 'Lainnya';

export type ItemStatus = 'open' | 'claimed' | 'resolved';

export interface LostFindItem {
  id: string;
  title: string;
  type: ItemType;
  category: string;
  location: string;
  date: string;
  time: string;
  description: string;
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  status: ItemStatus;
  rewardInfo?: string;
  securedAt?: string; // Khusus barang temuan: tempat disimpan (Pos Satpam, Dekanat, dll)
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export type ClaimStatus = 'pending' | 'verified' | 'rejected' | 'completed';

export interface ItemClaim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  itemImageUrl: string;
  claimantName: string;
  claimantNim: string;
  claimantPhone: string;
  proofDescription: string;
  status: ClaimStatus;
  submittedAt: string;
  verificationNotes?: string;
  userId: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  nim: string;
  programStudi: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export type ActiveTab = 'lost' | 'found' | 'report' | 'activity' | 'profile';

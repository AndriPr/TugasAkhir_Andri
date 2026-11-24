import { apiClient } from '../config/api';
import { ItemClaim } from '../types';
import { INITIAL_CLAIMS } from '../utils/initialData';
import { itemService } from './itemService';

const LOCAL_CLAIMS_KEY = 'lostfind_local_claims';

const getLocalClaims = (): ItemClaim[] => {
  try {
    const raw = localStorage.getItem(LOCAL_CLAIMS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(INITIAL_CLAIMS));
    return INITIAL_CLAIMS;
  } catch {
    return INITIAL_CLAIMS;
  }
};

const setLocalClaims = (claims: ItemClaim[]): void => {
  try {
    localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(claims));
  } catch {}
};

export const claimService = {
  async getClaims(userId?: string): Promise<{ success: boolean; data: ItemClaim[] }> {
    try {
      const response: any = await apiClient.get('/claims', { params: { userId } });
      if (response && response.success && Array.isArray(response.data)) {
        if (!userId) setLocalClaims(response.data);
        return { success: true, data: response.data };
      }
    } catch {}

    let claims = getLocalClaims();
    if (userId) {
      claims = claims.filter((c) => c.userId === userId);
    }
    return { success: true, data: claims };
  },

  async createClaim(payload: Partial<ItemClaim>): Promise<{ success: boolean; data: ItemClaim }> {
    const newClaim: ItemClaim = {
      id: payload.id || `claim-${Date.now()}`,
      itemId: payload.itemId || '',
      itemTitle: payload.itemTitle || 'Barang Kampus',
      itemType: payload.itemType || 'found',
      itemImageUrl: payload.itemImageUrl || '/presets/ktm.svg',
      claimantName: payload.claimantName || 'Mahasiswa',
      claimantNim: payload.claimantNim || '-',
      claimantPhone: payload.claimantPhone || '-',
      proofDescription: payload.proofDescription || '',
      status: payload.status || 'pending',
      submittedAt: new Date().toISOString(),
      verificationNotes: 'Sedang ditinjau oleh staf keamanan posko.',
      userId: payload.userId || 'user-andri-01',
    };

    try {
      const response: any = await apiClient.post('/claims', payload);
      if (response && response.success && response.data) {
        const current = getLocalClaims();
        setLocalClaims([response.data, ...current]);
        // Update status barang jadi 'claimed'
        if (newClaim.itemId) {
          await itemService.updateItem(newClaim.itemId, { status: 'claimed' });
        }
        return { success: true, data: response.data };
      }
    } catch {}

    const current = getLocalClaims();
    setLocalClaims([newClaim, ...current]);
    if (newClaim.itemId) {
      await itemService.updateItem(newClaim.itemId, { status: 'claimed' });
    }
    return { success: true, data: newClaim };
  },

  async updateClaimStatus(
    id: string,
    status: ItemClaim['status'],
    verificationNotes?: string
  ): Promise<{ success: boolean; data: ItemClaim | null }> {
    try {
      const response: any = await apiClient.put(`/claims/${id}`, { status, verificationNotes });
      if (response && response.success && response.data) {
        const current = getLocalClaims();
        const idx = current.findIndex((c) => c.id === id);
        if (idx !== -1) {
          current[idx] = response.data;
          setLocalClaims(current);
        }
        return { success: true, data: response.data };
      }
    } catch {}

    const current = getLocalClaims();
    const idx = current.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, data: null };
    current[idx].status = status;
    if (verificationNotes) current[idx].verificationNotes = verificationNotes;
    setLocalClaims(current);
    return { success: true, data: current[idx] };
  },
};

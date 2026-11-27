import { apiClient } from '../config/api';
import { ItemClaim } from '../types';
import { INITIAL_CLAIMS } from '../utils/initialData';
import { itemService } from './itemService';
import {
  LOCAL_CLAIMS_KEY,
  enqueueSyncOp,
  processSyncQueue,
} from '../utils/syncQueue';

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
  async getClaims(
    userId?: string
  ): Promise<{ success: boolean; data: ItemClaim[] }> {
    try {
      if (typeof navigator === 'undefined' || navigator.onLine) {
        await processSyncQueue();
      }
      const response: any = await apiClient.get('/claims', {
        params: { userId },
      });
      if (response && response.success && Array.isArray(response.data)) {
        const serverClaims = response.data as ItemClaim[];
        const localClaims = getLocalClaims();
        const serverIds = new Set(serverClaims.map((c) => c.id));
        const unsynced = localClaims.filter(
          (c) => c.pendingSync && !serverIds.has(c.id) && (!userId || c.userId === userId)
        );
        const merged = [...unsynced, ...serverClaims];
        if (!userId) setLocalClaims(merged);
        return { success: true, data: merged };
      }
    } catch {}

    let claims = getLocalClaims();
    if (userId) {
      claims = claims.filter((c) => c.userId === userId);
    }
    return { success: true, data: claims };
  },

  async createClaim(
    payload: Partial<ItemClaim>
  ): Promise<{ success: boolean; data: ItemClaim; synced: boolean }> {
    const cleanPayload: ItemClaim = {
      id:
        payload.id ||
        `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      const response: any = await apiClient.post('/claims', cleanPayload);
      if (response && response.success && response.data) {
        const savedClaim: ItemClaim = { ...response.data, pendingSync: false };
        const current = getLocalClaims().filter((c) => c.id !== savedClaim.id);
        setLocalClaims([savedClaim, ...current]);
        if (cleanPayload.itemId) {
          await itemService.updateItem(cleanPayload.itemId, { status: 'claimed' });
        }
        return { success: true, data: savedClaim, synced: true };
      }
    } catch {
      // Offline: simpan di localStorage dan antrean sync
    }

    const offlineClaim: ItemClaim = { ...cleanPayload, pendingSync: true };
    const current = getLocalClaims().filter((c) => c.id !== offlineClaim.id);
    setLocalClaims([offlineClaim, ...current]);
    enqueueSyncOp('CREATE_CLAIM', offlineClaim.id, cleanPayload);

    if (cleanPayload.itemId) {
      await itemService.updateItem(cleanPayload.itemId, { status: 'claimed' });
    }
    return { success: true, data: offlineClaim, synced: false };
  },

  async updateClaimStatus(
    id: string,
    status: ItemClaim['status'],
    verificationNotes?: string
  ): Promise<{ success: boolean; data: ItemClaim | null }> {
    const updateBody = { status, verificationNotes };
    try {
      const response: any = await apiClient.put(`/claims/${id}`, updateBody);
      if (response && response.success && response.data) {
        const current = getLocalClaims();
        const idx = current.findIndex((c) => c.id === id);
        const syncedClaim: ItemClaim = { ...response.data, pendingSync: false };
        if (idx !== -1) {
          current[idx] = syncedClaim;
          setLocalClaims(current);
        }
        return { success: true, data: syncedClaim };
      }
    } catch {
      // Offline fallback + enqueue
    }

    const current = getLocalClaims();
    const idx = current.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, data: null };
    current[idx] = {
      ...current[idx],
      status,
      ...(verificationNotes ? { verificationNotes } : {}),
      pendingSync: true,
    };
    setLocalClaims(current);
    enqueueSyncOp('UPDATE_CLAIM', id, updateBody);
    return { success: true, data: current[idx] };
  },
};

import { apiClient } from '../config/api';
import { LostFindItem } from '../types';
import { INITIAL_ITEMS } from '../utils/initialData';
import {
  LOCAL_ITEMS_KEY,
  enqueueSyncOp,
  getSyncQueue,
  processSyncQueue,
} from '../utils/syncQueue';

const getLocalItems = (): LostFindItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
    return INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
};

const setLocalItems = (items: LostFindItem[]): void => {
  try {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
  } catch {}
};

const applyFilter = (
  source: LostFindItem[],
  params: {
    type?: 'lost' | 'found';
    category?: string;
    search?: string;
    status?: string;
    userId?: string;
  }
): LostFindItem[] => {
  let items = [...source];
  if (params.type) {
    items = items.filter((i) => i.type === params.type);
  }
  if (params.category && params.category !== 'Semua') {
    items = items.filter(
      (i) => i.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  if (params.status) {
    items = items.filter((i) => i.status === params.status);
  }
  if (params.userId) {
    items = items.filter((i) => i.userId === params.userId);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const itemService = {
  async getItems(
    params: {
      type?: 'lost' | 'found';
      category?: string;
      search?: string;
      status?: string;
      userId?: string;
    } = {}
  ): Promise<{ success: boolean; data: LostFindItem[]; isOffline: boolean }> {
    try {
      // Flush pending offline ops first when online
      if (typeof navigator === 'undefined' || navigator.onLine) {
        await processSyncQueue();
      }

      const response: any = await apiClient.get('/items', { params });
      if (response && response.success && Array.isArray(response.data)) {
        const serverItems = response.data as LostFindItem[];

        // Keep any remaining unsynced local items visible alongside server items
        const localItems = getLocalItems();
        const serverIds = new Set(serverItems.map((i) => i.id));
        const pendingDeletes = new Set(
          getSyncQueue()
            .filter((op) => op.action === 'DELETE_ITEM')
            .map((op) => op.targetId)
        );
        const unsyncedLocals = localItems.filter(
          (i) => i.pendingSync && !serverIds.has(i.id)
        );

        const merged = [
          ...unsyncedLocals,
          ...serverItems.filter((i) => !pendingDeletes.has(i.id)),
        ];

        // Update local cache only on unfiltered fetch so full list is cached
        if (!params.type && !params.category && !params.search && !params.userId) {
          setLocalItems(merged);
        }

        return { success: true, data: merged, isOffline: false };
      }
      throw new Error('API response invalid');
    } catch {
      const filtered = applyFilter(getLocalItems(), params);
      return { success: true, data: filtered, isOffline: true };
    }
  },

  async getItemById(
    id: string
  ): Promise<{ success: boolean; data: LostFindItem | null }> {
    try {
      const response: any = await apiClient.get(`/items/${id}`);
      if (response && response.success && response.data) {
        return { success: true, data: response.data };
      }
      throw new Error('Item not found on API');
    } catch {
      const items = getLocalItems();
      const found = items.find((i) => i.id === id) || null;
      return { success: !!found, data: found };
    }
  },

  async createItem(
    payload: Partial<LostFindItem>
  ): Promise<{ success: boolean; data: LostFindItem; synced: boolean }> {
    const cleanPayload: LostFindItem = {
      id:
        payload.id ||
        `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title || 'Barang Laporan',
      type: payload.type || 'lost',
      category: payload.category || 'Lainnya',
      location: payload.location || 'Area Kampus',
      date: payload.date || new Date().toISOString().split('T')[0],
      time: payload.time || '12:00 WIB',
      description: payload.description || '',
      imageUrl: payload.imageUrl || '/presets/ktm.svg',
      contactName: payload.contactName || 'Anonim',
      contactPhone: payload.contactPhone || '081200000000',
      status: payload.status || 'open',
      rewardInfo: payload.rewardInfo,
      securedAt: payload.securedAt,
      createdAt: new Date().toISOString(),
      userId: payload.userId || 'user-andri-01',
    };

    try {
      const response: any = await apiClient.post('/items', cleanPayload);
      if (response && response.success && response.data) {
        const savedItem: LostFindItem = { ...response.data, pendingSync: false };
        const current = getLocalItems().filter((i) => i.id !== savedItem.id);
        setLocalItems([savedItem, ...current]);
        return { success: true, data: savedItem, synced: true };
      }
    } catch {
      // Offline: simpan ke localStorage dan daftarkan ke antrean sync
    }

    const offlineItem: LostFindItem = { ...cleanPayload, pendingSync: true };
    const current = getLocalItems().filter((i) => i.id !== offlineItem.id);
    setLocalItems([offlineItem, ...current]);
    enqueueSyncOp('CREATE_ITEM', offlineItem.id, cleanPayload);

    return { success: true, data: offlineItem, synced: false };
  },

  async updateItem(
    id: string,
    payload: Partial<LostFindItem>
  ): Promise<{ success: boolean; data: LostFindItem | null }> {
    const { pendingSync: _ps, ...cleanUpdate } = payload;

    try {
      const response: any = await apiClient.put(`/items/${id}`, cleanUpdate);
      if (response && response.success && response.data) {
        const current = getLocalItems();
        const idx = current.findIndex((i) => i.id === id);
        const syncedItem: LostFindItem = { ...response.data, pendingSync: false };
        if (idx !== -1) {
          current[idx] = syncedItem;
          setLocalItems(current);
        }
        return { success: true, data: syncedItem };
      }
    } catch {
      // Offline fallback + enqueue update
    }

    const current = getLocalItems();
    const idx = current.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, data: null };
    current[idx] = {
      ...current[idx],
      ...cleanUpdate,
      updatedAt: new Date().toISOString(),
      pendingSync: true,
    };
    setLocalItems(current);
    enqueueSyncOp('UPDATE_ITEM', id, cleanUpdate);

    return { success: true, data: current[idx] };
  },

  async deleteItem(id: string): Promise<boolean> {
    let synced = false;
    try {
      await apiClient.delete(`/items/${id}`);
      synced = true;
    } catch {
      // Offline fallback + enqueue delete
    }

    const current = getLocalItems();
    setLocalItems(current.filter((i) => i.id !== id));
    if (!synced) {
      enqueueSyncOp('DELETE_ITEM', id);
    }
    return true;
  },

  async getStats(): Promise<{
    total: number;
    lost: number;
    found: number;
    resolved: number;
  }> {
    try {
      const res: any = await apiClient.get('/items/stats');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch {}

    const items = getLocalItems();
    return {
      total: items.length,
      lost: items.filter((i) => i.type === 'lost').length,
      found: items.filter((i) => i.type === 'found').length,
      resolved: items.filter((i) => i.status === 'resolved').length,
    };
  },
};

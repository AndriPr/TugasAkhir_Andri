import { apiClient } from '../config/api';
import { LostFindItem, ApiResponse } from '../types';
import { INITIAL_ITEMS } from '../utils/initialData';

const LOCAL_ITEMS_KEY = 'lostfind_local_items';

// Inisialisasi local storage jika belum ada
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

export const itemService = {
  async getItems(params: {
    type?: 'lost' | 'found';
    category?: string;
    search?: string;
    status?: string;
    userId?: string;
  } = {}): Promise<{ success: boolean; data: LostFindItem[]; isOffline: boolean }> {
    try {
      // Coba fetch dari backend RESTful API
      const response: any = await apiClient.get('/items', { params });
      if (response && response.success && Array.isArray(response.data)) {
        // Simpan cache ke local storage
        if (!params.type && !params.category && !params.search) {
          setLocalItems(response.data);
        }
        return { success: true, data: response.data, isOffline: false };
      }
      throw new Error('API response invalid');
    } catch {
      // Fallback ke offline local storage
      let items = getLocalItems();
      if (params.type) {
        items = items.filter((i) => i.type === params.type);
      }
      if (params.category && params.category !== 'Semua') {
        items = items.filter((i) => i.category.toLowerCase() === params.category!.toLowerCase());
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
      return { success: true, data: items, isOffline: true };
    }
  },

  async getItemById(id: string): Promise<{ success: boolean; data: LostFindItem | null }> {
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

  async createItem(payload: Partial<LostFindItem>): Promise<{ success: boolean; data: LostFindItem }> {
    const newItem: LostFindItem = {
      id: payload.id || `item-${Date.now()}`,
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
      const response: any = await apiClient.post('/items', payload);
      if (response && response.success && response.data) {
        // Sinkronisasi ke cache lokal juga
        const current = getLocalItems();
        setLocalItems([response.data, ...current]);
        return { success: true, data: response.data };
      }
    } catch {
      // Simpan lokal saat offline
    }

    const current = getLocalItems();
    const updated = [newItem, ...current];
    setLocalItems(updated);
    return { success: true, data: newItem };
  },

  async updateItem(id: string, payload: Partial<LostFindItem>): Promise<{ success: boolean; data: LostFindItem | null }> {
    try {
      const response: any = await apiClient.put(`/items/${id}`, payload);
      if (response && response.success && response.data) {
        const current = getLocalItems();
        const idx = current.findIndex((i) => i.id === id);
        if (idx !== -1) {
          current[idx] = response.data;
          setLocalItems(current);
        }
        return { success: true, data: response.data };
      }
    } catch {
      // offline fallback
    }

    const current = getLocalItems();
    const idx = current.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, data: null };
    current[idx] = { ...current[idx], ...payload, updatedAt: new Date().toISOString() };
    setLocalItems(current);
    return { success: true, data: current[idx] };
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/items/${id}`);
    } catch {
      // offline
    }
    const current = getLocalItems();
    const filtered = current.filter((i) => i.id !== id);
    setLocalItems(filtered);
    return true;
  },

  async getStats(): Promise<{ total: number; lost: number; found: number; resolved: number }> {
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

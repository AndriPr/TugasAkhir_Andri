import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { INITIAL_ITEMS, DbItem } from '../config/seedData';

let memoryItems: DbItem[] = [...INITIAL_ITEMS];

export interface ItemFilterParams {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
  status?: string;
  userId?: string;
}

export const ItemModel = {
  async getAll(params: ItemFilterParams = {}): Promise<DbItem[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('items').select('*').order('createdAt', { ascending: false });
      if (params.type) query = query.eq('type', params.type);
      if (params.category && params.category !== 'Semua') query = query.eq('category', params.category);
      if (params.status) query = query.eq('status', params.status);
      if (params.userId) query = query.eq('userId', params.userId);
      if (params.search) query = query.ilike('title', `%${params.search}%`);

      const { data, error } = await query;
      if (!error && data) {
        return data as DbItem[];
      }
      if (error) console.warn('[ItemModel.getAll] Supabase fallback:', error.message);
    }

    // Embedded store filtering
    let result = [...memoryItems];
    if (params.type) {
      result = result.filter((item) => item.type === params.type);
    }
    if (params.category && params.category !== 'Semua') {
      result = result.filter((item) => item.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.status) {
      result = result.filter((item) => item.status === params.status);
    }
    if (params.userId) {
      result = result.filter((item) => item.userId === params.userId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<DbItem | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
      if (!error && data) return data as DbItem;
    }
    const found = memoryItems.find((item) => item.id === id);
    return found || null;
  },

  async create(payload: Partial<DbItem>): Promise<DbItem> {
    const newItem: DbItem = {
      id: payload.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title || 'Barang Tanpa Judul',
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
      userId: payload.userId || 'anon-user',
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('items').insert([newItem]).select().single();
      if (!error && data) return data as DbItem;
    }

    memoryItems.unshift(newItem);
    return newItem;
  },

  async update(id: string, payload: Partial<DbItem>): Promise<DbItem | null> {
    const { pendingSync: _ps, ...rest } = payload as Partial<DbItem> & { pendingSync?: boolean };
    const updatePayload = {
      ...rest,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as DbItem;
      if (error) console.warn('[ItemModel.update] Supabase fallback:', error.message);
    }

    const index = memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    memoryItems[index] = { ...memoryItems[index], ...updatePayload };
    return memoryItems[index];
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) return true;
    }

    const index = memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return false;
    memoryItems.splice(index, 1);
    return true;
  },
};

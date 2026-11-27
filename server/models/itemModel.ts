import {
  supabase,
  isSupabaseConfigured,
  assertDatabaseAvailableOnCloud,
} from '../config/supabaseClient.js';
import { INITIAL_ITEMS, DbItem } from '../config/seedData.js';

let memoryItems: DbItem[] = [...INITIAL_ITEMS];

export interface ItemFilterParams {
  type?: 'lost' | 'found';
  category?: string;
  search?: string;
  status?: string;
  userId?: string;
}

const pickWritableItemFields = (payload: Partial<DbItem>): Partial<DbItem> => {
  const allowed: Partial<DbItem> = {};
  if (payload.title !== undefined) allowed.title = payload.title;
  if (payload.type !== undefined) allowed.type = payload.type;
  if (payload.category !== undefined) allowed.category = payload.category;
  if (payload.location !== undefined) allowed.location = payload.location;
  if (payload.date !== undefined) allowed.date = payload.date;
  if (payload.time !== undefined) allowed.time = payload.time;
  if (payload.description !== undefined) allowed.description = payload.description;
  if (payload.imageUrl !== undefined) allowed.imageUrl = payload.imageUrl;
  if (payload.contactName !== undefined) allowed.contactName = payload.contactName;
  if (payload.contactPhone !== undefined) allowed.contactPhone = payload.contactPhone;
  if (payload.status !== undefined) allowed.status = payload.status;
  if (payload.rewardInfo !== undefined) allowed.rewardInfo = payload.rewardInfo;
  if (payload.securedAt !== undefined) allowed.securedAt = payload.securedAt;
  if (payload.userId !== undefined) allowed.userId = payload.userId;
  return allowed;
};

export const ItemModel = {
  async getAll(params: ItemFilterParams = {}): Promise<DbItem[]> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('items')
        .select('*')
        .order('createdAt', { ascending: false });
      if (params.type) query = query.eq('type', params.type);
      if (params.category && params.category !== 'Semua') {
        query = query.eq('category', params.category);
      }
      if (params.status) query = query.eq('status', params.status);
      if (params.userId) query = query.eq('userId', params.userId);
      if (params.search) query = query.ilike('title', `%${params.search}%`);

      const { data, error } = await query;
      if (error) {
        console.error('[ItemModel.getAll] Supabase error:', error.message);
        throw new Error(`Gagal mengambil data dari Supabase: ${error.message}`);
      }
      return (data || []) as DbItem[];
    }

    // Local embedded store filtering (only when running locally without Supabase env)
    let result = [...memoryItems];
    if (params.type) {
      result = result.filter((item) => item.type === params.type);
    }
    if (params.category && params.category !== 'Semua') {
      result = result.filter(
        (item) => item.category.toLowerCase() === params.category!.toLowerCase()
      );
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

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<DbItem | null> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[ItemModel.getById] Supabase error:', error.message);
        throw new Error(`Gagal membaca detail item dari Supabase: ${error.message}`);
      }
      return (data as DbItem | null) || null;
    }

    const found = memoryItems.find((item) => item.id === id);
    return found || null;
  },

  async create(payload: Partial<DbItem>): Promise<DbItem> {
    assertDatabaseAvailableOnCloud();

    const newItem: DbItem = {
      id:
        payload.id ||
        `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      createdAt: payload.createdAt || new Date().toISOString(),
      userId: payload.userId || 'anon-user',
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .insert([newItem])
        .select()
        .single();
      if (error) {
        console.error('[ItemModel.create] Supabase error:', error.message);
        throw new Error(`Gagal menyimpan laporan ke Supabase: ${error.message}`);
      }
      return data as DbItem;
    }

    memoryItems.unshift(newItem);
    return newItem;
  },

  async update(id: string, payload: Partial<DbItem>): Promise<DbItem | null> {
    assertDatabaseAvailableOnCloud();

    const updatePayload = {
      ...pickWritableItemFields(payload),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[ItemModel.update] Supabase error:', error.message);
        throw new Error(`Gagal memperbarui item di Supabase: ${error.message}`);
      }
      return (data as DbItem | null) || null;
    }

    const index = memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    memoryItems[index] = { ...memoryItems[index], ...updatePayload };
    return memoryItems[index];
  },

  async remove(id: string): Promise<boolean> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) {
        console.error('[ItemModel.remove] Supabase error:', error.message);
        throw new Error(`Gagal menghapus item dari Supabase: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const index = memoryItems.findIndex((item) => item.id === id);
    if (index === -1) return false;
    memoryItems.splice(index, 1);
    return true;
  },
};

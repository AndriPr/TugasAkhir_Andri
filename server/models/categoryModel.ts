import {
  supabase,
  isSupabaseConfigured,
  assertDatabaseAvailableOnCloud,
} from '../config/supabaseClient.js';
import { INITIAL_CATEGORIES, DbCategory } from '../config/seedData.js';

let memoryCategories: DbCategory[] = [...INITIAL_CATEGORIES];

export const CategoryModel = {
  async getAll(): Promise<DbCategory[]> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('[CategoryModel.getAll] Supabase error:', error.message);
        throw new Error(`Gagal mengambil kategori dari Supabase: ${error.message}`);
      }
      return (data || []) as DbCategory[];
    }
    return memoryCategories;
  },

  async getById(id: string): Promise<DbCategory | null> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[CategoryModel.getById] Supabase error:', error.message);
        throw new Error(`Gagal membaca kategori dari Supabase: ${error.message}`);
      }
      return (data as DbCategory | null) || null;
    }
    const found = memoryCategories.find((c) => c.id === id);
    return found || null;
  },

  async create(payload: Partial<DbCategory>): Promise<DbCategory> {
    assertDatabaseAvailableOnCloud();

    const newCategory: DbCategory = {
      id: payload.id || `cat-${Date.now()}`,
      name: payload.name || 'Kategori Baru',
      description: payload.description || '',
      iconName: payload.iconName || 'HelpCircle',
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();
      if (error) {
        console.error('[CategoryModel.create] Supabase error:', error.message);
        throw new Error(`Gagal menambah kategori di Supabase: ${error.message}`);
      }
      return data as DbCategory;
    }

    memoryCategories.unshift(newCategory);
    return newCategory;
  },

  async update(id: string, payload: Partial<DbCategory>): Promise<DbCategory | null> {
    assertDatabaseAvailableOnCloud();

    const updatePayload: Partial<DbCategory> = {};
    if (payload.name !== undefined) updatePayload.name = payload.name;
    if (payload.description !== undefined) updatePayload.description = payload.description;
    if (payload.iconName !== undefined) updatePayload.iconName = payload.iconName;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[CategoryModel.update] Supabase error:', error.message);
        throw new Error(`Gagal memperbarui kategori di Supabase: ${error.message}`);
      }
      return (data as DbCategory | null) || null;
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryCategories[index] = { ...memoryCategories[index], ...updatePayload };
    return memoryCategories[index];
  },

  async remove(id: string): Promise<boolean> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) {
        console.error('[CategoryModel.remove] Supabase error:', error.message);
        throw new Error(`Gagal menghapus kategori dari Supabase: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    memoryCategories.splice(index, 1);
    return true;
  },
};

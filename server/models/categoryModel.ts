import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { INITIAL_CATEGORIES, DbCategory } from '../config/seedData';

let memoryCategories: DbCategory[] = [...INITIAL_CATEGORIES];

export const CategoryModel = {
  async getAll(): Promise<DbCategory[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data && data.length > 0) {
        return data as DbCategory[];
      }
    }
    return memoryCategories;
  },

  async getById(id: string): Promise<DbCategory | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data as DbCategory;
    }
    const found = memoryCategories.find((c) => c.id === id);
    return found || null;
  },

  async create(payload: Partial<DbCategory>): Promise<DbCategory> {
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
      if (!error && data) return data as DbCategory;
    }

    memoryCategories.unshift(newCategory);
    return newCategory;
  },

  async update(id: string, payload: Partial<DbCategory>): Promise<DbCategory | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as DbCategory;
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryCategories[index] = { ...memoryCategories[index], ...payload };
    return memoryCategories[index];
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return true;
    }

    const index = memoryCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    memoryCategories.splice(index, 1);
    return true;
  },
};

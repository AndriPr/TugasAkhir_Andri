import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { INITIAL_CLAIMS, DbClaim } from '../config/seedData';
import { ItemModel } from './itemModel';

let memoryClaims: DbClaim[] = [...INITIAL_CLAIMS];

export const ClaimModel = {
  async getAll(userId?: string): Promise<DbClaim[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('claims').select('*').order('submittedAt', { ascending: false });
      if (userId) query = query.eq('userId', userId);
      const { data, error } = await query;
      if (!error && data) {
        return data as DbClaim[];
      }
      if (error) console.warn('[ClaimModel.getAll] Supabase fallback:', error.message);
    }

    if (userId) {
      return memoryClaims.filter((c) => c.userId === userId);
    }
    return memoryClaims;
  },

  async getById(id: string): Promise<DbClaim | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('claims').select('*').eq('id', id).single();
      if (!error && data) return data as DbClaim;
    }
    const found = memoryClaims.find((c) => c.id === id);
    return found || null;
  },

  async create(payload: Partial<DbClaim>): Promise<DbClaim> {
    const newClaim: DbClaim = {
      id: payload.id || `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      verificationNotes: payload.verificationNotes || 'Menunggu verifikasi fisik oleh posko keamanan.',
      userId: payload.userId || 'anon-user',
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('claims').insert([newClaim]).select().single();
      if (!error && data) {
        // Update item status to 'claimed'
        if (newClaim.itemId) {
          await ItemModel.update(newClaim.itemId, { status: 'claimed' });
        }
        return data as DbClaim;
      }
    }

    memoryClaims.unshift(newClaim);
    if (newClaim.itemId) {
      await ItemModel.update(newClaim.itemId, { status: 'claimed' });
    }
    return newClaim;
  },

  async update(id: string, payload: Partial<DbClaim>): Promise<DbClaim | null> {
    const { pendingSync: _ps, ...cleanPayload } = payload as Partial<DbClaim> & {
      pendingSync?: boolean;
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .update(cleanPayload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as DbClaim;
      if (error) console.warn('[ClaimModel.update] Supabase fallback:', error.message);
    }

    const index = memoryClaims.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryClaims[index] = { ...memoryClaims[index], ...cleanPayload };
    return memoryClaims[index];
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('claims').delete().eq('id', id);
      if (!error) return true;
    }

    const index = memoryClaims.findIndex((c) => c.id === id);
    if (index === -1) return false;
    memoryClaims.splice(index, 1);
    return true;
  },
};

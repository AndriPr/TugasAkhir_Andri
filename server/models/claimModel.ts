import {
  supabase,
  isSupabaseConfigured,
  assertDatabaseAvailableOnCloud,
} from '../config/supabaseClient.js';
import { INITIAL_CLAIMS, DbClaim } from '../config/seedData.js';
import { ItemModel } from './itemModel.js';

let memoryClaims: DbClaim[] = [...INITIAL_CLAIMS];

const pickWritableClaimFields = (payload: Partial<DbClaim>): Partial<DbClaim> => {
  const allowed: Partial<DbClaim> = {};
  if (payload.status !== undefined) allowed.status = payload.status;
  if (payload.verificationNotes !== undefined) {
    allowed.verificationNotes = payload.verificationNotes;
  }
  if (payload.proofDescription !== undefined) {
    allowed.proofDescription = payload.proofDescription;
  }
  return allowed;
};

export const ClaimModel = {
  async getAll(userId?: string): Promise<DbClaim[]> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('claims')
        .select('*')
        .order('submittedAt', { ascending: false });
      if (userId) query = query.eq('userId', userId);

      const { data, error } = await query;
      if (error) {
        console.error('[ClaimModel.getAll] Supabase error:', error.message);
        throw new Error(`Gagal mengambil klaim dari Supabase: ${error.message}`);
      }
      return (data || []) as DbClaim[];
    }

    if (userId) {
      return memoryClaims.filter((c) => c.userId === userId);
    }
    return memoryClaims;
  },

  async getById(id: string): Promise<DbClaim | null> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[ClaimModel.getById] Supabase error:', error.message);
        throw new Error(`Gagal membaca detail klaim dari Supabase: ${error.message}`);
      }
      return (data as DbClaim | null) || null;
    }
    const found = memoryClaims.find((c) => c.id === id);
    return found || null;
  },

  async create(payload: Partial<DbClaim>): Promise<DbClaim> {
    assertDatabaseAvailableOnCloud();

    const newClaim: DbClaim = {
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
      submittedAt: payload.submittedAt || new Date().toISOString(),
      verificationNotes:
        payload.verificationNotes ||
        'Menunggu verifikasi fisik oleh posko keamanan.',
      userId: payload.userId || 'anon-user',
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .insert([newClaim])
        .select()
        .single();
      if (error) {
        console.error('[ClaimModel.create] Supabase error:', error.message);
        throw new Error(`Gagal menyimpan klaim ke Supabase: ${error.message}`);
      }
      if (newClaim.itemId) {
        await ItemModel.update(newClaim.itemId, { status: 'claimed' });
      }
      return data as DbClaim;
    }

    memoryClaims.unshift(newClaim);
    if (newClaim.itemId) {
      await ItemModel.update(newClaim.itemId, { status: 'claimed' });
    }
    return newClaim;
  },

  async update(id: string, payload: Partial<DbClaim>): Promise<DbClaim | null> {
    assertDatabaseAvailableOnCloud();

    const cleanPayload = pickWritableClaimFields(payload);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .update(cleanPayload)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[ClaimModel.update] Supabase error:', error.message);
        throw new Error(`Gagal memperbarui klaim di Supabase: ${error.message}`);
      }
      return (data as DbClaim | null) || null;
    }

    const index = memoryClaims.findIndex((c) => c.id === id);
    if (index === -1) return null;
    memoryClaims[index] = { ...memoryClaims[index], ...cleanPayload };
    return memoryClaims[index];
  },

  async remove(id: string): Promise<boolean> {
    assertDatabaseAvailableOnCloud();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) {
        console.error('[ClaimModel.remove] Supabase error:', error.message);
        throw new Error(`Gagal menghapus klaim dari Supabase: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const index = memoryClaims.findIndex((c) => c.id === id);
    if (index === -1) return false;
    memoryClaims.splice(index, 1);
    return true;
  },
};

import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '[LostFind Backend] SUPABASE_URL / SUPABASE_KEY belum disetel. Backend berjalan dengan High-Speed Embedded Store (Auto-Fallback).'
  );
} else {
  console.info('[LostFind Backend] Terhubung dengan Supabase PostgreSQL.');
}

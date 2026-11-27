import dotenv from 'dotenv';
import path from 'node:path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load root .env and fallback server/.env for local runs
dotenv.config();
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
}

interface EnvMatch {
  key: string;
  value: string;
}

const pickEnv = (exactKeys: string[], suffixes: string[] = []): EnvMatch | null => {
  for (const key of exactKeys) {
    const val = process.env[key]?.trim();
    if (val) return { key, value: val };
  }
  for (const suffix of suffixes) {
    const matchKey = Object.keys(process.env).find(
      (k) => k.endsWith(suffix) && Boolean(process.env[k]?.trim())
    );
    if (matchKey) {
      return { key: matchKey, value: process.env[matchKey]!.trim() };
    }
  }
  return null;
};

const urlMatch = pickEnv(
  ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'],
  ['_SUPABASE_URL']
);

const keyMatch = pickEnv(
  [
    'SUPABASE_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_ANON_KEY',
  ],
  [
    '_SUPABASE_SECRET_KEY',
    '_SUPABASE_SERVICE_ROLE_KEY',
    '_SUPABASE_KEY',
    '_SUPABASE_ANON_KEY',
    '_SUPABASE_PUBLISHABLE_KEY',
  ]
);

const supabaseUrl = urlMatch?.value || '';
const supabaseKey = keyMatch?.value || '';

export const detectedUrlEnvKey = urlMatch?.key || null;
export const detectedKeyEnvKey = keyMatch?.key || null;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface SupabaseHealthStatus {
  provider: 'supabase' | 'memory-fallback';
  configured: boolean;
  connected: boolean;
  detectedUrlEnv: string | null;
  detectedKeyEnv: string | null;
  error: string | null;
}

export const checkSupabaseHealth = async (): Promise<SupabaseHealthStatus> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      provider: 'memory-fallback',
      configured: false,
      connected: false,
      detectedUrlEnv: detectedUrlEnvKey,
      detectedKeyEnv: detectedKeyEnvKey,
      error:
        'Environment variable URL atau Key Supabase tidak ditemukan di runtime server.',
    };
  }

  try {
    const { error } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true });
    if (error) {
      return {
        provider: 'supabase',
        configured: true,
        connected: false,
        detectedUrlEnv: detectedUrlEnvKey,
        detectedKeyEnv: detectedKeyEnvKey,
        error: error.message,
      };
    }

    return {
      provider: 'supabase',
      configured: true,
      connected: true,
      detectedUrlEnv: detectedUrlEnvKey,
      detectedKeyEnv: detectedKeyEnvKey,
      error: null,
    };
  } catch (err: any) {
    return {
      provider: 'supabase',
      configured: true,
      connected: false,
      detectedUrlEnv: detectedUrlEnvKey,
      detectedKeyEnv: detectedKeyEnvKey,
      error: err?.message || 'Gagal menghubungi server Supabase',
    };
  }
};

/**
 * Ensures Vercel serverless functions fail visibly instead of silently saving
 * into ephemeral RAM when Supabase env variables are missing.
 */
export const assertDatabaseAvailableOnCloud = (): void => {
  if (!isSupabaseConfigured && process.env.VERCEL) {
    throw new Error(
      'Database Supabase belum terkonfigurasi di Vercel Environment Variables (dibutuhkan URL & Key Supabase).'
    );
  }
};

if (!isSupabaseConfigured) {
  console.info(
    '[LostFind Backend] SUPABASE_URL / SUPABASE_KEY belum disetel.' +
      (process.env.VERCEL
        ? ' Serverless mode membutuhkan env Supabase!'
        : ' Mode lokal menggunakan High-Speed Embedded Store.')
  );
} else {
  console.info(
    `[LostFind Backend] Terhubung dengan Supabase PostgreSQL (${detectedUrlEnvKey} + ${detectedKeyEnvKey}).`
  );
}

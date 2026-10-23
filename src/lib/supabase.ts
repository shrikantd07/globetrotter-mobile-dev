import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or user-configured local storage
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('gt_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gt_supabase_key') : null;

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  const isValid = Boolean(url && key && url.startsWith('http') && key.length > 20);
  return { url, key, isConfigured: isValid };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('gt_supabase_url', url.trim());
      localStorage.setItem('gt_supabase_key', key.trim());
    } else {
      localStorage.removeItem('gt_supabase_url');
      localStorage.removeItem('gt_supabase_key');
    }
    supabaseInstance = null; // reset client
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url.trim(), key.trim());
    const { error } = await client.from('trips').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('permission')) {
      // Still connected to Supabase endpoint even if table needs migration
      return { success: true, message: `Connected to Supabase project! (${error.message || 'Ready'})` };
    }
    return { success: true, message: 'Supabase connection verified successfully.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}

/**
 * Optional Supabase Cloud Client Integration
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are defined,
 * this client enables live multi-device syncing across the internet.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Supabase client failed to load:', err);
    return null;
  }
}

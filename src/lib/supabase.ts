import { createClient } from "@supabase/supabase-js";

/**
 * Retrieve the current Supabase configuration from local storage
 * with fallbacks to environment variables.
 */
export function getSupabaseConfig() {
  const url = localStorage.getItem("gothwad_supabase_url") || 
              (import.meta as any).env.VITE_SUPABASE_URL || 
              "";
  const anonKey = localStorage.getItem("gothwad_supabase_anon_key") || 
                  (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
                  "";
  return { 
    url: url.trim(), 
    anonKey: anonKey.trim() 
  };
}

/**
 * Initialize and return a new Supabase client instance based on active credentials.
 */
export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

/**
 * Global reactive client (for simple imports, though it might be stale if credentials change.
 * It's safer to call getSupabaseClient() directly for real-time changes).
 */
export const supabase = getSupabaseClient();

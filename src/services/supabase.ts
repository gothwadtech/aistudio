import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { safeStorage } from "../utils/safeStorage";

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string | null = null;
  private anonKey: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    // Attempt to load from storage or env
    this.url = safeStorage.getItem("gothwad_supabase_url") || (import.meta as any).env?.VITE_SUPABASE_URL || null;
    this.anonKey = safeStorage.getItem("gothwad_supabase_anon_key") || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || null;
    
    if (this.url && this.anonKey) {
      try {
        this.client = createClient(this.url, this.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  configure(url: string, anonKey: string) {
    if (!url.trim() || !anonKey.trim()) {
      safeStorage.removeItem("gothwad_supabase_url");
      safeStorage.removeItem("gothwad_supabase_anon_key");
      this.url = null;
      this.anonKey = null;
      this.client = null;
      return;
    }

    safeStorage.setItem("gothwad_supabase_url", url.trim());
    safeStorage.setItem("gothwad_supabase_anon_key", anonKey.trim());
    this.url = url.trim();
    this.anonKey = anonKey.trim();
    
    try {
      this.client = createClient(this.url, this.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client on configure:", err);
      this.client = null;
      throw err;
    }
  }

  disconnect() {
    safeStorage.removeItem("gothwad_supabase_url");
    safeStorage.removeItem("gothwad_supabase_anon_key");
    if (this.client) {
      this.client.auth.signOut();
    }
    this.url = null;
    this.anonKey = null;
    this.client = null;
  }

  getClient(): SupabaseClient | null {
    if (!this.client) {
      this.loadFromStorage();
    }
    return this.client;
  }

  isConfigured(): boolean {
    return !!this.getClient();
  }

  getUrl(): string {
    return this.url || "";
  }

  getAnonKey(): string {
    return this.anonKey || "";
  }

  async signInWithGitHub(redirectTo?: string) {
    const client = this.getClient();
    if (!client) {
      throw new Error("Supabase is not configured. Please supply Supabase URL and Anon Key.");
    }

    const { data, error } = await client.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo,user,delete_repo",
        redirectTo: redirectTo || window.location.origin,
        skipBrowserRedirect: true
      }
    });

    if (error) throw error;
    
    if (data?.url) {
      if (window.top) {
        window.top.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    }
    return data;
  }

  async getSessionGitHubToken(): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;
    
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    
    // Supabase returns provider_token for OAuth connections
    return data.session.provider_token || null;
  }
}

export const supabaseService = new SupabaseService();

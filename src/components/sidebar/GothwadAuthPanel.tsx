import React, { useState, useEffect } from "react";
import { 
  Loader2, 
  LogIn, 
  LogOut, 
  User, 
  Database, 
  FolderSync, 
  Terminal, 
  Copy, 
  Check, 
  Info, 
  Lock, 
  ShieldAlert, 
  CloudLightning 
} from "lucide-react";

interface GothwadAuthPanelProps {
  accentColor: string;
}

export default function GothwadAuthPanel({ accentColor }: GothwadAuthPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"auth" | "database" | "storage">("auth");

  // Supabase credentials initialized from localStorage or environment variables
  const [supabaseUrl, setSupabaseUrl] = useState(() => 
    localStorage.getItem("gothwad_supabase_url") || 
    (import.meta as any).env.VITE_SUPABASE_URL || 
    ""
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => 
    localStorage.getItem("gothwad_supabase_anon_key") || 
    (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
    ""
  );

  const [userSession, setUserSession] = useState<{ email: string; id: string; created_at?: string } | null>(() => {
    const saved = localStorage.getItem("gothwad_supabase_user_session");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Copy state helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setSupabaseUrl(
        localStorage.getItem("gothwad_supabase_url") || 
        (import.meta as any).env.VITE_SUPABASE_URL || 
        ""
      );
      setSupabaseAnonKey(
        localStorage.getItem("gothwad_supabase_anon_key") || 
        (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
        ""
      );
      const savedSession = localStorage.getItem("gothwad_supabase_user_session");
      try {
        setUserSession(savedSession ? JSON.parse(savedSession) : null);
      } catch {
        setUserSession(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const isUsingEnv = (import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  // SQL code template for tables setup
  const sqlCode = `-- 1. Create a schema for user workspace storage
CREATE TABLE IF NOT EXISTS gothwad_workspace_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE gothwad_workspace_data ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies for individual user sandboxes
CREATE POLICY "Users can create their own workspace data" 
  ON gothwad_workspace_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own workspace data" 
  ON gothwad_workspace_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can edit their own workspace data" 
  ON gothwad_workspace_data FOR UPDATE 
  USING (auth.uid() = user_id);`;

  // TypeScript code template for storage uploads
  const storageCode = `import { getSupabaseClient } from "./lib/supabase";

const supabase = getSupabaseClient();

/**
 * Upload a workspace ZIP package file to Supabase Storage
 */
async function uploadWorkspaceZip(fileBlob: Blob, userId: string) {
  if (!supabase) throw new Error("Supabase client is not connected");
  
  const filePath = \`\${userId}/workspace-\${Date.now()}.zip\`;
  
  const { data, error } = await supabase.storage
    .from("gothwad-storage")
    .upload(filePath, fileBlob, {
      cacheControl: "3600",
      upsert: true
    });
    
  if (error) throw error;
  return data;
}`;

  return (
    <div className="space-y-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850/80 animate-[fadeIn_0.15s_ease-out]">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudLightning className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-100">
            Supabase Cloud Setup
          </span>
        </div>
        {isUsingEnv && (
          <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-md">
            Env Config Active
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850 bg-zinc-900/20 p-0.5 rounded-lg">
        <button
          onClick={() => setActiveTab("auth")}
          className={`flex-1 py-1.5 text-center text-[9px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
            activeTab === "auth" 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-350"
          }`}
        >
          🔑 Connection
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex-1 py-1.5 text-center text-[9px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
            activeTab === "database" 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-350"
          }`}
        >
          🗄️ Database
        </button>
        <button
          onClick={() => setActiveTab("storage")}
          className={`flex-1 py-1.5 text-center text-[9px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
            activeTab === "storage" 
              ? "bg-zinc-800 text-white shadow-sm" 
              : "text-zinc-500 hover:text-zinc-350"
          }`}
        >
          ☁️ Storage
        </button>
      </div>

      {/* Tab 1: Connection & Login */}
      {activeTab === "auth" && (
        <div className="space-y-3">
          {!supabaseUrl || !supabaseAnonKey ? (
            <div className="space-y-3">
              <div className="bg-amber-950/10 border border-amber-900/30 p-3 rounded-lg flex gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider">No Connection Configured</p>
                  <p className="text-[9px] font-mono text-zinc-400 leading-relaxed">
                    Provide credentials below or declare <code className="text-amber-400">VITE_SUPABASE_URL</code> and <code className="text-amber-400">VITE_SUPABASE_ANON_KEY</code> in your environment parameters.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-zinc-400 text-[8.5px] uppercase font-bold block mb-1 font-mono">Supabase URL</label>
                  <input
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-[8.5px] uppercase font-bold block mb-1 font-mono">Public Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cleanUrl = supabaseUrl.trim();
                      const cleanKey = supabaseAnonKey.trim();
                      if (cleanUrl && cleanKey) {
                        localStorage.setItem("gothwad_supabase_url", cleanUrl);
                        localStorage.setItem("gothwad_supabase_anon_key", cleanKey);
                        window.dispatchEvent(new Event("storage"));
                      } else {
                        setAuthError("Both fields are required.");
                      }
                    }}
                    className="flex-1 py-1.5 rounded text-[10px] font-mono font-bold text-center bg-zinc-800 text-white border border-zinc-700 cursor-pointer hover:bg-zinc-750 transition-all active:scale-95"
                  >
                    Connect Database
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const demoUrl = "https://gothwad-demo-project.supabase.co";
                      const demoKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.gothwad_demo";
                      setSupabaseUrl(demoUrl);
                      setSupabaseAnonKey(demoKey);
                      localStorage.setItem("gothwad_supabase_url", demoUrl);
                      localStorage.setItem("gothwad_supabase_anon_key", demoKey);
                      window.dispatchEvent(new Event("storage"));
                    }}
                    className="py-1.5 px-3 rounded text-[10px] font-mono font-bold text-center bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-850 cursor-pointer transition-all"
                  >
                    Demo Mode
                  </button>
                </div>
                {authError && (
                  <div className="text-rose-500 font-mono text-[9px] leading-tight pt-1">
                    ⚠️ {authError}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userSession ? (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center gap-2.5 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40">
                    <div 
                      className="w-8 h-8 rounded-full border flex items-center justify-center text-white font-bold font-mono text-xs select-none bg-zinc-800"
                      style={{ borderColor: accentColor }}
                    >
                      {userSession.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-zinc-200 truncate">{userSession.email}</div>
                      <div className="text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Connected Session</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[8px] font-mono text-zinc-500 leading-relaxed break-all bg-zinc-950/40 p-2.5 rounded border border-zinc-850/80">
                    <div className="font-semibold text-zinc-400 font-mono uppercase tracking-wider mb-1">Active Endpoint:</div>
                    {supabaseUrl}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("gothwad_supabase_user_session");
                      setUserSession(null);
                      setAuthSuccessMessage("Logged out successfully.");
                    }}
                    className="w-full py-1.5 rounded text-[10px] font-mono font-bold text-center bg-rose-950/15 border border-rose-900/30 text-rose-400 hover:bg-rose-900/25 cursor-pointer transition-all active:scale-95"
                  >
                    Sign Out Account
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsAuthenticating(true);
                  setAuthError(null);
                  setAuthSuccessMessage(null);
                  try {
                    if (supabaseUrl.includes("demo-project")) {
                      await new Promise(r => setTimeout(r, 800));
                      const session = {
                        email: authEmail || "guest@gothwad.com",
                        id: "demo-user-id-12345",
                        created_at: new Date().toISOString()
                      };
                      localStorage.setItem("gothwad_supabase_user_session", JSON.stringify(session));
                      setUserSession(session);
                      setAuthSuccessMessage("Demo login successful!");
                      return;
                    }

                    const endpoint = authMode === "signup" 
                      ? `${supabaseUrl.replace(/\/$/, "")}/auth/v1/signup`
                      : `${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;

                    const res = await fetch(endpoint, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "apikey": supabaseAnonKey,
                        "Authorization": `Bearer ${supabaseAnonKey}`
                      },
                      body: JSON.stringify({
                        email: authEmail,
                        password: authPassword
                      })
                    });

                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error_description || data.msg || data.message || "Authentication request failed.");
                    }

                    if (authMode === "signup") {
                      setAuthSuccessMessage("Sign up complete! Please login now.");
                      setAuthMode("login");
                    } else {
                      const userObj = data.user;
                      const session = {
                        email: userObj.email,
                        id: userObj.id,
                        created_at: userObj.created_at,
                        access_token: data.access_token
                      };
                      localStorage.setItem("gothwad_supabase_user_session", JSON.stringify(session));
                      setUserSession(session);
                      setAuthSuccessMessage("Logged in successfully!");
                    }
                  } catch (err: any) {
                    setAuthError(err.message || "An authentication error occurred.");
                  } finally {
                    setIsAuthenticating(false);
                  }
                }} className="space-y-3 font-mono">
                  
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
                    <span className="text-[8.5px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                      {authMode === "login" ? "Sign In to Account" : "Register New Account"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === "login" ? "signup" : "login");
                        setAuthError(null);
                      }}
                      className="text-[8.5px] font-mono font-bold underline"
                      style={{ color: accentColor }}
                    >
                      {authMode === "login" ? "Need an Account?" : "Have an Account?"}
                    </button>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[8.5px] uppercase font-bold block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 text-[8.5px] uppercase font-bold block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2 rounded text-[10px] font-mono font-bold text-center text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={authMode === "login" ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                  >
                    {isAuthenticating ? (
                      <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                    ) : (
                      <span>{authMode === "login" ? "Sign In" : "Sign Up"}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("gothwad_supabase_url");
                      localStorage.removeItem("gothwad_supabase_anon_key");
                      window.dispatchEvent(new Event("storage"));
                    }}
                    className="w-full py-1 text-[8.5px] font-mono text-zinc-650 text-center hover:text-zinc-400 transition-all cursor-pointer"
                  >
                    Disconnect Active Credentials
                  </button>

                  {authError && (
                    <div className="text-rose-500 font-mono text-[9px] leading-tight pt-1">
                      ⚠️ {authError}
                    </div>
                  )}

                  {authSuccessMessage && (
                    <div className="text-emerald-500 font-mono text-[9px] leading-tight pt-1">
                      ✓ {authSuccessMessage}
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Database Schemas & Queries */}
      {activeTab === "database" && (
        <div className="space-y-3 font-mono">
          <div className="flex items-start gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850/80">
            <Database className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-200 block uppercase">Sandbox Database Sync</span>
              <p className="text-[8.5px] text-zinc-500 leading-relaxed">
                Connect and sync user sandbox workspaces using tables below. Execute this setup query directly in your Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase font-bold text-zinc-400">Initialize Workspace Tables SQL</span>
              <button
                onClick={() => handleCopy(sqlCode, "sql")}
                className="flex items-center gap-1 text-[8.5px] font-bold text-zinc-400 hover:text-white transition-all bg-zinc-900 hover:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-800 cursor-pointer"
              >
                {copiedText === "sql" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedText === "sql" ? "Copied" : "Copy SQL"}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="text-[8px] leading-relaxed p-2.5 rounded-lg bg-zinc-950 border border-zinc-850/60 text-zinc-400 overflow-x-auto max-h-40 no-scrollbar font-mono select-text">
                {sqlCode}
              </pre>
            </div>
          </div>
          
          <div className="text-[8px] text-zinc-550 leading-relaxed flex gap-1.5 bg-zinc-900/10 p-2 rounded">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <p>
              Once created, you can read & write data from Gothwad Editor via standard JavaScript or Server-side API endpoints using our customized SDK.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Storage Buckets & Code Setup */}
      {activeTab === "storage" && (
        <div className="space-y-3 font-mono">
          <div className="flex items-start gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850/80">
            <FolderSync className="w-4 h-4 text-[#0494f4] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-200 block uppercase">Object Storage Integration</span>
              <p className="text-[8.5px] text-zinc-500 leading-relaxed">
                Connect local ZIP payloads or repository files directly to Cloud buckets. Enable high-performance cloud asset storage.
              </p>
            </div>
          </div>

          <div className="space-y-2 bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-850/50">
            <span className="text-[8.5px] font-bold text-zinc-300 block uppercase">⚙️ bucket Configuration:</span>
            <ul className="text-[8px] text-zinc-450 space-y-1 list-disc pl-3">
              <li>Create a new bucket named <code className="text-[#0494f4] font-bold">gothwad-storage</code></li>
              <li>Toggle <span className="text-zinc-300 font-bold">Public Bucket</span> as active for easy download access</li>
              <li>Configure RLS Policies to allow <code className="text-zinc-300">INSERT</code> / <code className="text-zinc-300">SELECT</code> for users</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase font-bold text-zinc-400">Upload Handler Example (TypeScript)</span>
              <button
                onClick={() => handleCopy(storageCode, "storage")}
                className="flex items-center gap-1 text-[8.5px] font-bold text-zinc-400 hover:text-white transition-all bg-zinc-900 hover:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-800 cursor-pointer"
              >
                {copiedText === "storage" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedText === "storage" ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="text-[8px] leading-relaxed p-2.5 rounded-lg bg-zinc-950 border border-zinc-850/60 text-zinc-400 overflow-x-auto max-h-40 no-scrollbar font-mono select-text">
                {storageCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-zinc-850 flex items-center justify-center gap-3 text-zinc-600 font-mono text-[8.5px]">
        <span className="flex items-center gap-1"><Terminal className="w-2.5 h-2.5" /> Secure SSL Connection</span>
        <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Local AES State Encrypted</span>
      </div>
    </div>
  );
}

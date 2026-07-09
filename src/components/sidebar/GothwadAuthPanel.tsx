import React, { useState, useEffect } from "react";
import { Loader2, LogIn, LogOut, User } from "lucide-react";

interface GothwadAuthPanelProps {
  accentColor: string;
}

export default function GothwadAuthPanel({ accentColor }: GothwadAuthPanelProps) {
  // Supabase connection & authentication states
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("gothwad_supabase_url") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("gothwad_supabase_anon_key") || "");
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

  useEffect(() => {
    const handleStorageChange = () => {
      setSupabaseUrl(localStorage.getItem("gothwad_supabase_url") || "");
      setSupabaseAnonKey(localStorage.getItem("gothwad_supabase_anon_key") || "");
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

  return (
    <div className="space-y-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 animate-[fadeIn_0.15s_ease-out]">
      <span className="text-[#375a7f] font-mono font-bold uppercase tracking-wider text-[9px] block" style={{ color: accentColor }}>
        Gothwad AI Login Engine
      </span>
      
      {!supabaseUrl || !supabaseAnonKey ? (
        <div className="space-y-2.5">
          <p className="text-zinc-500 text-[9px] leading-relaxed font-mono">
            Provide your Supabase credentials to enable real user authentication and session synchronization.
          </p>
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-zinc-550 text-[8px] uppercase font-bold block mb-1 font-mono">Supabase URL</label>
              <input
                type="text"
                placeholder="https://xxxx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
              />
            </div>
            <div>
              <label className="text-zinc-550 text-[8px] uppercase font-bold block mb-1 font-mono">Public Anon Key</label>
              <input
                type="password"
                placeholder="paste public anon key"
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
                className="flex-1 py-1.5 rounded text-[9.5px] font-mono font-bold text-center bg-zinc-800 text-white border border-zinc-700 cursor-pointer hover:bg-zinc-750 transition-all"
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
                className="py-1.5 px-2.5 rounded text-[9.5px] font-mono font-bold text-center bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-850 cursor-pointer transition-all"
              >
                Demo Setup
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
        <div>
          {userSession ? (
            <div className="space-y-3 font-mono">
              <div className="flex items-center gap-2.5 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/40">
                <div 
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-white font-bold font-mono text-xs select-none"
                  style={{ borderColor: accentColor }}
                >
                  {userSession.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-zinc-200 truncate">{userSession.email}</div>
                  <div className="text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-wider mt-0.5">🟢 Connected Session</div>
                </div>
              </div>
              <div className="text-[8px] font-mono text-zinc-550 leading-relaxed break-all bg-zinc-950/40 p-2 rounded border border-zinc-850">
                <div className="font-semibold text-zinc-400 font-mono">ENDPOINT URL:</div>
                {supabaseUrl}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("gothwad_supabase_user_session");
                  setUserSession(null);
                  setAuthSuccessMessage("Logged out successfully.");
                }}
                className="w-full py-1.5 rounded text-[9.5px] font-mono font-bold text-center bg-rose-950/15 border border-rose-900/30 text-rose-400 hover:bg-rose-900/25 cursor-pointer transition-all"
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
            }} className="space-y-2.5 font-mono">
              
              <div className="flex items-center justify-between border-b border-zinc-850 pb-1">
                <span className="text-[8px] font-mono text-zinc-550 uppercase font-bold">
                  {authMode === "login" ? "SIGN IN ACCOUNT" : "REGISTER USER"}
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
                  {authMode === "login" ? "Register" : "Sign In"}
                </button>
              </div>

              <div>
                <label className="text-zinc-550 text-[8px] uppercase font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="pawangothwad@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                />
              </div>

              <div>
                <label className="text-zinc-550 text-[8px] uppercase font-bold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="enter password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-zinc-750"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-1.5 rounded text-[9.5px] font-mono font-bold text-center text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                style={authMode === "login" ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
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
                className="w-full py-1 text-[8px] font-mono text-zinc-650 text-center hover:text-zinc-400 transition-all cursor-pointer"
              >
                Disconnect Database Setup
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
  );
}

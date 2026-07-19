import React, { useState } from "react";
import { Github, Key, AlertCircle, Loader2, Terminal, ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Database, Sliders } from "lucide-react";
import { motion } from "motion/react";
import { supabaseService } from "../services/supabase";

interface LoginScreenProps {
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerSupabaseOAuth: () => void;
  onTriggerOAuth?: () => void;
  authConfig?: { clientId: string; appUrl: string } | null;
  accentColor: string;
}

export default function LoginScreen({
  isLoading,
  error,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerSupabaseOAuth,
  onTriggerOAuth,
  authConfig,
  accentColor
}: LoginScreenProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPatFallback, setShowPatFallback] = useState(false);
  
  // Supabase self-configuration states on login screen
  const [showSbConfig, setShowSbConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState(() => supabaseService.getUrl());
  const [sbKey, setSbKey] = useState(() => supabaseService.getAnonKey());
  const [sbConfigured, setSbConfigured] = useState(() => supabaseService.isConfigured());
  const [sbSuccessMsg, setSbSuccessMsg] = useState("");
  const [sbErrorMsg, setSbErrorMsg] = useState("");

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbKey.trim()) {
      setSbErrorMsg("Both Supabase Project URL and Anon API Key are required.");
      return;
    }
    try {
      supabaseService.configure(sbUrl, sbKey);
      setSbConfigured(true);
      setSbErrorMsg("");
      setSbSuccessMsg("Supabase credentials saved successfully!");
      setTimeout(() => setSbSuccessMsg(""), 3000);
    } catch (err: any) {
      setSbErrorMsg(err.message || "Failed to initialize Supabase client.");
    }
  };

  const handleClearSupabase = () => {
    supabaseService.disconnect();
    setSbUrl("");
    setSbKey("");
    setSbConfigured(false);
    setSbErrorMsg("");
    setSbSuccessMsg("Supabase configuration cleared.");
    setTimeout(() => setSbSuccessMsg(""), 3000);
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-y-auto select-none font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: accentColor }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 my-8"
        id="login-container"
      >
        {/* Workspace Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 bg-zinc-850 rounded-2xl flex items-center justify-center border border-zinc-700/60 shadow-inner mb-4 relative group hover:border-zinc-600 transition-colors"
          >
            <Github className="w-7 h-7 text-zinc-100" />
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-zinc-900 flex items-center justify-center shadow"
              style={{ backgroundColor: accentColor }}
            >
              <Terminal className="w-2 h-2 text-white" />
            </div>
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">Gothwad Ai Studio</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1 leading-relaxed max-w-xs">
            Secure client-side workstation for interactive development & sandbox previews.
          </p>
        </div>

        {/* Errors Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold text-rose-400">Connection Failed</p>
              <p className="text-[11px] font-mono text-rose-300/80 leading-normal mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Option 1: Supabase OAuth Login Button (Primary and Recommended) */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={onTriggerSupabaseOAuth}
            disabled={isLoading || !sbConfigured}
            className="w-full py-3.5 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white border border-zinc-800"
            style={{ 
              background: sbConfigured ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)` : "#27272a",
              borderColor: sbConfigured ? `${accentColor}55` : "#3f3f46"
            }}
            id="supabase-oauth-button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4.5 h-4.5" />
            )}
            <span>Login & Connect with GitHub</span>
          </button>
          
          {!sbConfigured ? (
            <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-amber-400 leading-normal">
                Supabase OAuth setup required. Expand the <b>Configure Supabase</b> panel below to enter credentials or use the <b>PAT fallback</b> option to connect instantly.
              </p>
            </div>
          ) : (
            <p className="text-[10.5px] font-mono text-zinc-500 text-center leading-relaxed">
              Recommended: Instantly connect your repositories with secure 1-click Supabase authorization.
            </p>
          )}
        </div>

        {/* Config Supabase Drawer Option */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSbConfig(!showSbConfig)}
            className="w-full py-2 bg-zinc-950/20 hover:bg-zinc-950/50 border border-zinc-850/60 text-zinc-500 hover:text-zinc-300 rounded-xl font-mono text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Configure Supabase Backend</span>
            <span>{showSbConfig ? "▲" : "▼"}</span>
          </button>

          {showSbConfig && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleSaveSupabase}
              className="space-y-3.5 pt-3 mt-2 border-t border-zinc-850/50"
            >
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xxxx.supabase.co"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
                  required
                />
              </div>

              {sbErrorMsg && (
                <p className="text-[9.5px] font-mono text-rose-400 leading-normal bg-rose-950/10 border border-rose-900/30 p-2 rounded-lg">{sbErrorMsg}</p>
              )}
              {sbSuccessMsg && (
                <p className="text-[9.5px] font-mono text-emerald-400 leading-normal bg-emerald-950/10 border border-emerald-900/30 p-2 rounded-lg">{sbSuccessMsg}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 py-2 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  Save Credentials
                </button>
                {sbConfigured && (
                  <button
                    type="button"
                    onClick={handleClearSupabase}
                    className="bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 px-3 py-2 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </div>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-zinc-800/80" />
          <span className="relative bg-zinc-900/80 px-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            OR CONNECT MANUALLY
          </span>
        </div>

        {/* Option 2: PAT Fallback Option (Optional) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowPatFallback(!showPatFallback)}
            className="w-full py-2.5 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/70 text-zinc-400 hover:text-zinc-200 rounded-xl font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Use Personal Access Token (PAT)</span>
            <span className="text-[9px] text-zinc-650 font-bold">
              ({showPatFallback ? "Hide" : "Optional Fallback"})
            </span>
          </button>

          {showPatFallback && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={onPatSubmit} 
              className="space-y-4 pt-2 border-t border-zinc-900" 
              id="login-pat-form"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-semibold">
                    Personal Access Token
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,user&description=Gothwad%20Ai%20Studio"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono underline hover:text-white transition-colors flex items-center gap-1"
                    style={{ color: accentColor }}
                  >
                    <span>Create Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs font-mono py-2.5 pl-9 pr-4 rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-850 transition-all placeholder:text-zinc-650"
                    value={patInput}
                    onChange={(e) => onPatInputChange(e.target.value)}
                    required
                    id="github-pat-input"
                  />
                  <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !patInput.trim()}
                className="w-full py-2.5 rounded-xl font-mono font-bold text-xs bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-100 disabled:opacity-40 disabled:pointer-events-none"
                id="login-pat-submit-button"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Connect via Access Key</span>
              </button>
            </motion.form>
          )}
        </div>

        {/* Instructions toggle panel */}
        <div className="mt-6 border-t border-zinc-850 pt-4">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full text-center text-zinc-500 hover:text-zinc-400 text-[10.5px] font-mono flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{showInstructions ? "Hide instructions" : "How to create a GitHub token?"}</span>
            <span className="text-zinc-650">({showInstructions ? "▲" : "▼"})</span>
          </button>

          {showInstructions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 bg-zinc-950/40 border border-zinc-850/60 p-4 rounded-xl font-mono text-[10px] text-zinc-400 space-y-2 leading-relaxed"
            >
              <p className="font-bold text-zinc-300">Quick 3-step setup guide:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
                <li>
                  Click the <a href="https://github.com/settings/tokens/new?scopes=repo,user&description=Gothwad%20Ai%20Studio" target="_blank" rel="noreferrer" className="underline hover:text-white" style={{ color: accentColor }}>Create Token</a> link.
                </li>
                <li>
                  Set the token name to <code className="text-zinc-200">Gothwad AI Studio</code> and make sure the <code className="text-zinc-200">repo</code> and <code className="text-zinc-200">user</code> checkboxes are selected.
                </li>
                <li>
                  Click <code className="text-zinc-200">Generate token</code> at the bottom, copy the string, and paste it into the input above.
                </li>
              </ol>
              <p className="text-zinc-500 text-[9px] italic pt-1">
                Note: This is a client-only app. Your credentials are saved locally on your own browser and never transmitted to external third parties.
              </p>
            </motion.div>
          )}
        </div>

        {/* Verified security tagline */}
        <div className="mt-8 flex items-center justify-center gap-4 text-zinc-650 font-mono text-[9px] border-t border-zinc-850/40 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 
            <span>100% Client-Side Sandbox</span>
          </span>
          <span className="text-zinc-800">•</span>
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            <span>Encrypted Persistence</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

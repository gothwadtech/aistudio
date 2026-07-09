import React from "react";
import { Github, Key, AlertCircle, Loader2, Terminal, BookOpen } from "lucide-react";

interface AuthPanelProps {
  authConfig: { clientId: string; appUrl: string } | null;
  error: string | null;
  isLoading: boolean;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
}

export default function AuthPanel({
  authConfig,
  error,
  isLoading,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth
}: AuthPanelProps) {
  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl mx-auto font-sans">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-inner mb-3">
          <Github className="w-6 h-6 text-zinc-100" />
        </div>
        <h2 className="text-lg font-bold font-mono tracking-tight text-white">Connect GitHub Wallet</h2>
        <p className="text-zinc-500 text-[10.5px] font-mono mt-1 leading-relaxed">
          Unlock instant file explorer navigation, automated ZIP unpacking, and Git stage commits.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-rose-950/20 border border-rose-900/35 p-3 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-rose-450 leading-normal">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {authConfig?.clientId ? (
          <div className="space-y-3">
            <button
              onClick={onTriggerOAuth}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-2.5 rounded-lg font-mono font-bold text-[11.5px] transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Github className="w-4 h-4" />
              Connect via GitHub OAuth
            </button>
            <div className="bg-zinc-950/50 border border-zinc-800/60 p-3.5 rounded-lg font-mono text-[9.5px] leading-relaxed text-zinc-400 space-y-1.5">
              <p className="font-bold text-zinc-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#375a7f]" /> OAuth Mismatch Guide
              </p>
              <p>
                Ensure your registered GitHub Developer Settings match the current callback address exactly:
              </p>
              <div className="bg-zinc-900/80 border border-zinc-800 p-2 rounded text-[#059ffc] break-all select-all font-mono text-[9px] font-bold">
                {authConfig?.appUrl}/api/auth/github/callback
              </div>
              <p className="text-zinc-500 italic text-[9px]">
                Tip: Copy the string above and paste it into "Authorization callback URL" under GitHub App Settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/10 border border-amber-900/30 p-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9.5px] font-mono text-amber-500/80 leading-normal">
              Server OAuth Credentials are empty. Connect below using your GitHub Personal Access Token (PAT).
            </p>
          </div>
        )}

        <div className="relative my-1 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-zinc-800" />
          <span className="relative bg-zinc-900 px-3 font-mono text-[9px] text-zinc-500 uppercase">OR ACCESS KEY</span>
        </div>

        <form onSubmit={onPatSubmit} className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider">Personal Access Token</label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,user"
                target="_blank"
                rel="noreferrer"
                className="text-[#375a7f] hover:text-[#375a7f]/80 font-mono text-[9px] underline"
              >
                Generate Token
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono py-2 pl-8 pr-3 rounded-lg outline-none focus:border-zinc-700"
                value={patInput}
                onChange={(e) => onPatInputChange(e.target.value)}
                required
              />
              <Key className="w-3.5 h-3.5 text-zinc-650 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 py-1.5 rounded-lg font-mono font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Secure Sign-In
          </button>
        </form>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-850 flex items-center justify-center gap-4 text-zinc-600 font-mono text-[9px]">
        <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Safe Sandboxed Session</span>
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Local Persistence</span>
      </div>
    </div>
  );
}

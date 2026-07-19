import React from "react";
import { Github, ShieldCheck, Database, LayoutGrid, Terminal, MessageSquare, Code, Settings } from "lucide-react";
import { supabaseService } from "../../../../services/supabase";

interface GitHubConnectorProps {
  token: string | null;
  user: any;
  onLogout: () => void;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  authConfig: any;
}

export default function GitHubConnector({
  token,
  user,
  onLogout
}: GitHubConnectorProps) {
  const isSbConfigured = supabaseService.isConfigured();
  const sbUrl = supabaseService.getUrl();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar animate-[fadeIn_0.15s_ease-out] font-mono text-[10px]">
      
      {/* 1. Global Authorization Banner */}
      <div className="bg-emerald-950/25 border border-emerald-900/40 p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[9.5px]">
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>Universal Studio Session is Active</span>
        </div>
        <p className="text-zinc-400 text-[9.5px] leading-relaxed">
          Your entire Gothwad AI Studio workspace is authenticated and connected globally. This single session session powers the workspace files explorer, code editor commits, unpacker, AI generation loops, and database synchronizations.
        </p>
      </div>

      {/* 2. Authenticated Profile Context Card */}
      <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850/80 space-y-3">
        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Unified Identity Profile</span>
        
        {user ? (
          <div className="flex items-start gap-3.5">
            <img 
              src={user.avatar_url} 
              alt="avatar" 
              className="w-12 h-12 rounded-xl border border-zinc-800 shadow-md shrink-0 object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1 overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white leading-none">@{user.login}</p>
              <p className="text-zinc-400 font-sans text-[10px] truncate leading-tight">{user.name || "GitHub Developer"}</p>
              <p className="text-zinc-500 text-[9px] leading-snug line-clamp-2 mt-1">{user.bio || "Active Workspace Developer"}</p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 italic">No profile session retrieved.</p>
        )}

        {/* Stats Matrix */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
          <div className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-850/50">
            <span className="text-zinc-500 block text-[8px] uppercase">Public Repositories</span>
            <span className="text-zinc-200 font-bold text-xs mt-0.5 block">{user?.public_repos ?? "N/A"}</span>
          </div>
          <div className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-850/50">
            <span className="text-zinc-500 block text-[8px] uppercase">Followers Count</span>
            <span className="text-zinc-200 font-bold text-xs mt-0.5 block">{user?.followers ?? "N/A"}</span>
          </div>
        </div>
      </div>

      {/* 3. Global Feature Mapping (What is utilizing this token) */}
      <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850/80 space-y-3">
        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Studio Features Powered by Session</span>
        
        <div className="space-y-2.5">
          {/* Feature 1: Workspace IDE */}
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-850/55 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Code className="w-3.5 h-3.5 text-[#375a7f]" />
              <span className="text-zinc-300 font-bold truncate">Software Workspace & IDE</span>
            </div>
            <span className="text-emerald-500 font-bold uppercase text-[8.5px]">Active</span>
          </div>

          {/* Feature 2: Zip & Web Unpacker */}
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-850/55 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <LayoutGrid className="w-3.5 h-3.5 text-[#375a7f]" />
              <span className="text-zinc-300 font-bold truncate">Web Builder & Unpacker</span>
            </div>
            <span className="text-emerald-500 font-bold uppercase text-[8.5px]">Active</span>
          </div>

          {/* Feature 3: Gothwad Chat Sync */}
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-850/55 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-3.5 h-3.5 text-[#375a7f]" />
              <span className="text-zinc-300 font-bold truncate">AI Chat & Companion Sync</span>
            </div>
            <span className="text-emerald-500 font-bold uppercase text-[8.5px]">Active</span>
          </div>

          {/* Feature 4: Supabase Auth Broker */}
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-850/55 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <div className="min-w-0 leading-tight">
                <p className="text-zinc-300 font-bold truncate">Supabase Auth Backend</p>
                {isSbConfigured && (
                  <p className="text-[7.5px] text-zinc-500 truncate mt-0.5">{sbUrl}</p>
                )}
              </div>
            </div>
            <span className={`font-bold uppercase text-[8.5px] ${isSbConfigured ? "text-emerald-500" : "text-amber-500"}`}>
              {isSbConfigured ? "Connected" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Disconnect options */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full bg-rose-950/15 hover:bg-rose-900/25 text-rose-400 border border-rose-900/35 py-3 rounded-xl font-bold transition-all text-center cursor-pointer active:scale-99"
        >
          Disconnect Universal Session
        </button>
        <p className="text-[8.5px] text-zinc-600 text-center leading-normal">
          Disconnecting will securely remove the authorization keys from local cache and lock the Gothwad AI Studio workstation.
        </p>
      </div>

    </div>
  );
}

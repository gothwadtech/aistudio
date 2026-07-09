import React from "react";
import { Github, ShieldCheck, Link2 } from "lucide-react";

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
  onLogout,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  authConfig
}: GitHubConnectorProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">GitHub Pipeline Status</span>
        {token ? (
          <div className="flex items-center gap-3 py-1">
            <img 
              src={user?.avatar_url} 
              alt="avatar" 
              className="w-10 h-10 rounded-full border border-emerald-500/20 shadow-md shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white font-mono truncate">@{user?.login}</p>
              <p className="text-[9.5px] font-mono text-emerald-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authenticated Session</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 space-y-1">
            <div className="w-8 h-8 rounded-full bg-zinc-900/50 flex items-center justify-center mx-auto text-zinc-500">
              <Github className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono text-zinc-500">No active authorization hook</p>
          </div>
        )}
      </div>

      {!token ? (
        <form onSubmit={onPatSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wide block">GITHUB PERSONAL ACCESS TOKEN (PAT)</label>
            <p className="text-[9px] font-mono text-zinc-650 leading-normal">
              Generate a token in settings with <code className="bg-zinc-950 px-1 py-0.5 rounded text-amber-500 font-bold">repo</code> and <code className="bg-zinc-950 px-1 py-0.5 rounded text-amber-500 font-bold">delete_repo</code> permissions.
            </p>
            <input
              type="password"
              placeholder="paste ghp_... developer token"
              value={patInput}
              onChange={(e) => onPatInputChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer shadow-sm text-center"
            >
              Connect via Token
            </button>
            {authConfig && (
              <button
                type="button"
                onClick={onTriggerOAuth}
                className="px-3 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>OAuth</span>
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900 text-[10px] font-mono text-zinc-500 leading-normal space-y-1">
            <p className="text-zinc-400 font-bold">Session stats:</p>
            <p>• Repositories count: {user?.public_repos || 0}</p>
            <p>• Follower stack: {user?.followers || 0} users</p>
            <p>• Bio: {user?.bio || "Workspace developer companion"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 py-2 rounded-xl text-[10px] font-mono font-bold transition-colors text-center cursor-pointer"
          >
            Disconnect GitHub
          </button>
        </div>
      )}
    </div>
  );
}

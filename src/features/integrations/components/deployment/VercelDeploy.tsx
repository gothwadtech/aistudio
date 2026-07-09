import React from "react";
import { Cloud, Eye, EyeOff, AlertCircle, Loader2, Check, ExternalLink } from "lucide-react";
import { VercelProject } from "../../types";

interface VercelDeployProps {
  vercelToken: string;
  setVercelToken: (val: string) => void;
  showVercelToken: boolean;
  setShowVercelToken: (val: boolean) => void;
  vercelStatus: "idle" | "verifying" | "connected" | "error";
  vercelError: string;
  vercelProjects: VercelProject[];
  verifyVercel: (tokenVal: string) => void;
  handleDisconnectVercel: () => void;
}

export default function VercelDeploy({
  vercelToken,
  setVercelToken,
  showVercelToken,
  setShowVercelToken,
  vercelStatus,
  vercelError,
  vercelProjects,
  verifyVercel,
  handleDisconnectVercel
}: VercelDeployProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Vercel Pipeline Status</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">Vercel API</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            vercelStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {vercelStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {vercelStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">VERCEL ACCESS TOKEN</label>
            <p className="text-[9px] font-mono text-zinc-650 leading-relaxed">
              Create an access token inside Vercel Dashboard Settings. (Use <code className="bg-zinc-950 px-1 py-0.5 rounded text-amber-500">demo_token</code> for sandbox preview).
            </p>
            
            <div className="relative">
              <input
                type={showVercelToken ? "text" : "password"}
                placeholder="paste Vercel authorization token"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-3 pr-9 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowVercelToken(!showVercelToken)}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showVercelToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {vercelError && (
            <div className="p-2 border border-rose-900/30 bg-rose-950/10 rounded-lg text-rose-400 text-[10px] font-mono leading-normal flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{vercelError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={vercelStatus === "verifying"}
            onClick={() => verifyVercel(vercelToken)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {vercelStatus === "verifying" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{vercelStatus === "verifying" ? "Syncing..." : "Connect Vercel"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Active Projects ({vercelProjects.length})</span>
            {vercelProjects.map((p) => (
              <div key={p.id} className="p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold text-zinc-200 truncate pr-2">{p.name}</span>
                  <a 
                    href={p.targets?.production?.url ? `https://${p.targets.production.url}` : "#"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[9px] text-[#375a7f] hover:underline flex items-center gap-0.5"
                  >
                    <span>launch</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <span className="text-[8.5px] text-zinc-500 font-mono block mt-1">Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectVercel}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Vercel
          </button>
        </div>
      )}
    </div>
  );
}

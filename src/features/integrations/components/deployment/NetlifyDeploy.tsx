import React from "react";
import { Globe, Loader2, Check } from "lucide-react";
import { NetlifySite } from "../../types";

interface NetlifyDeployProps {
  netlifyToken: string;
  setNetlifyToken: (val: string) => void;
  netlifyStatus: "idle" | "verifying" | "connected" | "error";
  netlifySites: NetlifySite[];
  verifyNetlify: (tokenVal: string) => void;
  handleDisconnectNetlify: () => void;
}

export default function NetlifyDeploy({
  netlifyToken,
  setNetlifyToken,
  netlifyStatus,
  netlifySites,
  verifyNetlify,
  handleDisconnectNetlify
}: NetlifyDeployProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Netlify Status</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">Netlify API</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            netlifyStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {netlifyStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {netlifyStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">NETLIFY ACCESS TOKEN</label>
            <input
              type="password"
              placeholder="paste Netlify personal access token"
              value={netlifyToken}
              onChange={(e) => setNetlifyToken(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <button
            type="button"
            disabled={netlifyStatus === "verifying"}
            onClick={() => verifyNetlify(netlifyToken)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            {netlifyStatus === "verifying" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Connect Netlify</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Active Sites ({netlifySites.length})</span>
            {netlifySites.map((s) => (
              <div key={s.id} className="p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold text-zinc-200 truncate pr-2">{s.name}</span>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-[9px] text-[#375a7f] hover:underline">launch</a>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectNetlify}
            className="w-full bg-zinc-900 text-zinc-450 hover:text-white border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Netlify
          </button>
        </div>
      )}
    </div>
  );
}

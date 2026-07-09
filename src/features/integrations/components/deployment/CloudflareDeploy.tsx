import React from "react";
import { Layers, Check } from "lucide-react";

interface CloudflareDeployProps {
  cloudflareAccountId: string;
  setCloudflareAccountId: (val: string) => void;
  cloudflareToken: string;
  setCloudflareToken: (val: string) => void;
  cloudflareStatus: "idle" | "verifying" | "connected" | "error";
  cloudflareProjects: any[];
  verifyCloudflare: (token: string, accountId: string) => void;
  handleDisconnectCloudflare: () => void;
}

export default function CloudflareDeploy({
  cloudflareAccountId,
  setCloudflareAccountId,
  cloudflareToken,
  setCloudflareToken,
  cloudflareStatus,
  cloudflareProjects,
  verifyCloudflare,
  handleDisconnectCloudflare
}: CloudflareDeployProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Cloudflare Pages Status</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">CF Pages Integration</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            cloudflareStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {cloudflareStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {cloudflareStatus !== "connected" ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">CLOUDFLARE ACCOUNT ID</label>
            <input
              type="text"
              placeholder="e.g. 5e91e0a2b53..."
              value={cloudflareAccountId}
              onChange={(e) => setCloudflareAccountId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">CLOUDFLARE API BEARER TOKEN</label>
            <input
              type="password"
              placeholder="paste Cloudflare API Bearer token"
              value={cloudflareToken}
              onChange={(e) => setCloudflareToken(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => verifyCloudflare(cloudflareToken, cloudflareAccountId)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Connect Cloudflare</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Pages Projects ({cloudflareProjects.length})</span>
            {cloudflareProjects.map((cf) => (
              <div key={cf.name} className="p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold text-zinc-200 truncate pr-2">{cf.name}</span>
                  <a href={cf.subdomain ? `https://${cf.subdomain}` : "#"} target="_blank" rel="noreferrer" className="text-[9px] text-[#375a7f] hover:underline">link</a>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectCloudflare}
            className="w-full bg-zinc-900 text-zinc-450 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Cloudflare
          </button>
        </div>
      )}
    </div>
  );
}

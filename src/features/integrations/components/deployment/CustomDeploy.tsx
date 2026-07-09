import React from "react";
import { Cpu, Plus } from "lucide-react";

interface CustomDeployProps {
  customDeployUrl: string;
  setCustomDeployUrl: (val: string) => void;
  customDeployScript: string;
  setCustomDeployScript: (val: string) => void;
  customDeployStatus: "idle" | "verifying" | "connected";
  handleConnectCustomDeploy: () => void;
  handleDisconnectCustomDeploy: () => void;
}

export default function CustomDeploy({
  customDeployUrl,
  setCustomDeployUrl,
  customDeployScript,
  setCustomDeployScript,
  customDeployStatus,
  handleConnectCustomDeploy,
  handleDisconnectCustomDeploy
}: CustomDeployProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Custom deployment hook</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">Custom Webhook</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            customDeployStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {customDeployStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {customDeployStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">CUSTOM WEBHOOK TRIGGER URL</label>
            <input
              type="text"
              placeholder="e.g. https://my-server.com/hooks/deploy"
              value={customDeployUrl}
              onChange={(e) => setCustomDeployUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">PRE-DEPLOYMENT PIPELINE SHELL COMMANDS</label>
            <textarea
              rows={2}
              placeholder="e.g. npm run build"
              value={customDeployScript}
              onChange={(e) => setCustomDeployScript(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleConnectCustomDeploy}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Custom Pipeline</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-[10.5px] font-mono text-zinc-400 space-y-1.5">
            <p className="text-zinc-200 font-bold">Active Deployment Endpoint:</p>
            <p className="truncate text-emerald-500">{customDeployUrl}</p>
            <p className="text-[9px] text-zinc-500">Hook Trigger Action is ready. Gothwad Ai Studio will post ZIP payloads to this endpoint on sync commands.</p>
          </div>

          <button
            onClick={handleDisconnectCustomDeploy}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Delete Pipeline Hook
          </button>
        </div>
      )}
    </div>
  );
}

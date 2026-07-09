import React from "react";
import { Cpu, Check } from "lucide-react";

interface AppwriteSyncProps {
  appwriteEndpoint: string;
  setAppwriteEndpoint: (val: string) => void;
  appwriteProjectId: string;
  setAppwriteProjectId: (val: string) => void;
  appwriteApiKey: string;
  setAppwriteApiKey: (val: string) => void;
  appwriteStatus: "idle" | "verifying" | "connected" | "error";
  appwriteCollections: { name: string; size: string }[];
  verifyAppwrite: (endpoint: string, projectId: string, apiKey: string) => void;
  handleDisconnectAppwrite: () => void;
}

export default function AppwriteSync({
  appwriteEndpoint,
  setAppwriteEndpoint,
  appwriteProjectId,
  setAppwriteProjectId,
  appwriteApiKey,
  setAppwriteApiKey,
  appwriteStatus,
  appwriteCollections,
  verifyAppwrite,
  handleDisconnectAppwrite
}: AppwriteSyncProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Appwrite Server Hub</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-mono font-bold text-zinc-300">Appwrite API</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            appwriteStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {appwriteStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {appwriteStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">API ENDPOINT</label>
              <input
                type="text"
                value={appwriteEndpoint}
                onChange={(e) => setAppwriteEndpoint(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">PROJECT ID</label>
              <input
                type="text"
                placeholder="paste Appwrite Project ID"
                value={appwriteProjectId}
                onChange={(e) => setAppwriteProjectId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">API KEY / TOKEN SECRET</label>
              <input
                type="password"
                placeholder="Appwrite Service API Token"
                value={appwriteApiKey}
                onChange={(e) => setAppwriteApiKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => verifyAppwrite(appwriteEndpoint, appwriteProjectId, appwriteApiKey)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Connect Appwrite</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Active Database Buckets ({appwriteCollections.length})</span>
            {appwriteCollections.map((col) => (
              <div key={col.name} className="p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg flex items-center justify-between">
                <span className="text-[10.5px] font-mono font-bold text-zinc-200">{col.name}</span>
                <span className="text-[9px] text-zinc-500 font-mono">{col.size}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectAppwrite}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Appwrite
          </button>
        </div>
      )}
    </div>
  );
}

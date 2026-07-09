import React from "react";
import { Database, Network, Plus } from "lucide-react";

interface CustomDbSyncProps {
  customDbType: "postgresql" | "mysql" | "mongodb" | "sqlite";
  setCustomDbType: (val: "postgresql" | "mysql" | "mongodb" | "sqlite") => void;
  customDbUri: string;
  setCustomDbUri: (val: string) => void;
  customDbStatus: "idle" | "verifying" | "connected";
  handleConnectCustomDb: () => void;
  handleDisconnectCustomDb: () => void;
}

export default function CustomDbSync({
  customDbType,
  setCustomDbType,
  customDbUri,
  setCustomDbUri,
  customDbStatus,
  handleConnectCustomDb,
  handleDisconnectCustomDb
}: CustomDbSyncProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Custom Database Link</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">Raw Connection</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            customDbStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {customDbStatus === "connected" ? "🟢 Linked" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {customDbStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">DRIVER TYPE</label>
              <select
                value={customDbType}
                onChange={(e) => setCustomDbType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-2 text-xs text-zinc-300 focus:outline-none font-mono cursor-pointer"
              >
                <option value="postgresql">PostgreSQL driver</option>
                <option value="mysql">MySQL connector</option>
                <option value="mongodb">MongoDB cluster driver</option>
                <option value="sqlite">SQLite memory cache</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">CONNECTION STRING / URI</label>
              <input
                type="password"
                placeholder="postgresql://username:password@host:5432/database"
                value={customDbUri}
                onChange={(e) => setCustomDbUri(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectCustomDb}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Establish Connection</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-[10.5px] font-mono text-zinc-400 space-y-1.5">
            <p className="text-zinc-200 font-bold flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>Database Socket Active</span>
            </p>
            <p className="truncate text-zinc-500">{customDbUri}</p>
            <p className="text-[9px] text-zinc-500">Workspace ORM modules can run queries securely on this target.</p>
          </div>

          <button
            onClick={handleDisconnectCustomDb}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Destroy Connection Session
          </button>
        </div>
      )}
    </div>
  );
}

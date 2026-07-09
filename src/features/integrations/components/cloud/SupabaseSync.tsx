import React from "react";
import { Database, Check } from "lucide-react";
import { SupabaseTable } from "../../types";

interface SupabaseSyncProps {
  supabaseUrl: string;
  setSupabaseUrl: (val: string) => void;
  supabaseAnonKey: string;
  setSupabaseAnonKey: (val: string) => void;
  supabaseStatus: "idle" | "verifying" | "connected" | "error";
  supabaseTables: SupabaseTable[];
  verifySupabase: (url: string, key: string) => void;
  handleDisconnectSupabase: () => void;
}

export default function SupabaseSync({
  supabaseUrl,
  setSupabaseUrl,
  supabaseAnonKey,
  setSupabaseAnonKey,
  supabaseStatus,
  supabaseTables,
  verifySupabase,
  handleDisconnectSupabase
}: SupabaseSyncProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Supabase Connection status</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono font-bold text-zinc-300">Supabase SQL</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            supabaseStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {supabaseStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {supabaseStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">SUPABASE PROJECT URL</label>
              <input
                type="text"
                placeholder="e.g. https://xxxx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">SUPABASE PUBLIC ANON KEY</label>
              <input
                type="password"
                placeholder="paste Supabase public anon key"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => verifySupabase(supabaseUrl, supabaseAnonKey)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Connect Supabase</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest font-bold">Public Schema Collections</span>
            </div>
            {supabaseTables.map((t) => (
              <div key={t.name} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                <span className="text-[10.5px] font-mono font-bold text-zinc-200 block">{t.name}</span>
                <p className="text-[9px] text-zinc-500 font-sans mt-0.5 leading-normal">{t.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectSupabase}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Database
          </button>
        </div>
      )}
    </div>
  );
}

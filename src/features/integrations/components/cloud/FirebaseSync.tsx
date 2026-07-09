import React from "react";
import { Flame, AlertCircle, Loader2, Check, Box } from "lucide-react";

interface FirebaseSyncProps {
  firebaseProjectId: string;
  setFirebaseProjectId: (val: string) => void;
  firebaseConfigJson: string;
  setFirebaseConfigJson: (val: string) => void;
  firebaseStatus: "idle" | "verifying" | "connected" | "error";
  firebaseCollections: { name: string; count: number }[];
  firebaseError: string;
  verifyFirebase: (projectId: string, configJson: string) => void;
  handleDisconnectFirebase: () => void;
}

export default function FirebaseSync({
  firebaseProjectId,
  setFirebaseProjectId,
  firebaseConfigJson,
  setFirebaseConfigJson,
  firebaseStatus,
  firebaseCollections,
  firebaseError,
  verifyFirebase,
  handleDisconnectFirebase
}: FirebaseSyncProps) {
  return (
    <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 space-y-1.5">
        <span className="text-[9.5px] uppercase font-bold tracking-wider font-mono text-zinc-500 block">Firebase Pipeline Sync</span>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-300">Firestore DB</span>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase tracking-wider ${
            firebaseStatus === "connected" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-zinc-650 border-zinc-900"
          }`}>
            {firebaseStatus === "connected" ? "🟢 Connected" : "🔴 Offline"}
          </span>
        </div>
      </div>

      {firebaseStatus !== "connected" ? (
        <div className="space-y-3.5">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">FIREBASE PROJECT ID</label>
              <input
                type="text"
                placeholder="e.g. gothwad-studio-df643"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">WEB SDK CONFIG JSON (OPTIONAL)</label>
              <textarea
                rows={3}
                placeholder='{ "apiKey": "AIzaSy...", "authDomain": "..." }'
                value={firebaseConfigJson}
                onChange={(e) => setFirebaseConfigJson(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none font-mono resize-none"
              />
            </div>
          </div>

          {firebaseError && (
            <div className="p-2 border border-rose-900/30 bg-rose-950/10 rounded-lg text-rose-400 text-[10px] font-mono leading-normal flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{firebaseError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={firebaseStatus === "verifying"}
            onClick={() => verifyFirebase(firebaseProjectId, firebaseConfigJson)}
            className="w-full bg-[#375a7f] hover:bg-[#375a7f]/90 text-white py-2 rounded-xl text-[10.5px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            {firebaseStatus === "verifying" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{firebaseStatus === "verifying" ? "Authenticating Firestore..." : "Connect Firebase"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 space-y-2 max-h-[240px] overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest font-bold">Firestore Collections ({firebaseCollections.length})</span>
            {firebaseCollections.map((col) => (
              <div key={col.name} className="p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="text-[10.5px] font-mono font-bold text-zinc-200">{col.name}</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono">{col.count} documents</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleDisconnectFirebase}
            className="w-full bg-zinc-900 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-800 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center cursor-pointer"
          >
            Disconnect Firebase
          </button>
        </div>
      )}
    </div>
  );
}

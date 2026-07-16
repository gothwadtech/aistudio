import React from "react";
import { Laptop, Plus, Trash2, Clock, ChevronLeft, X } from "lucide-react";

interface WebsiteSession {
  id: string;
  prompt: string;
  sections: Array<{ id: string; label: string; checked: boolean }>;
  websiteHtml: string | null;
  timestamp: string;
}

interface LeftSidebarProps {
  accentColor: string;
  history: WebsiteSession[];
  activeHistoryId: string | null;
  onSelectHistory: (item: WebsiteSession) => void;
  onNewSession: () => void;
  onClearHistory: () => void;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

export default function LeftSidebar({
  accentColor,
  history,
  activeHistoryId,
  onSelectHistory,
  onNewSession,
  onClearHistory,
  onToggleSidebar,
  onBackToMain
}: LeftSidebarProps) {
  return (
    <div className="w-[260px] bg-zinc-900 border-r border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {(onToggleSidebar || onBackToMain) && (
            <button
              onClick={onToggleSidebar || onBackToMain}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Back"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 truncate">
            Landing Sites
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(history || []).length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Clear Sites History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Close Sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* New Website Action */}
      <div className="p-3 border-b border-zinc-850 shrink-0">
        <button
          onClick={onNewSession}
          className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-xs font-medium tracking-wide transition-all cursor-pointer active:scale-95"
          style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>New Landing Page</span>
        </button>
      </div>

      {/* Sites logs */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1">
          Recent Builds
        </span>

        {(!history || history.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
            <Laptop className="w-8 h-8 text-zinc-700 stroke-1" />
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">No sites logs</p>
          </div>
        ) : (
          <div className="space-y-1">
            {history.map((item) => {
              const isActive = activeHistoryId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item)}
                  className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer group ${
                    isActive
                      ? "bg-zinc-850/60 border-zinc-750 text-white"
                      : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" style={isActive ? { color: accentColor } : {}} />
                    <span className="text-xs font-sans font-medium truncate flex-1">
                      {item.prompt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-1">
                    <span>{(item?.sections || []).filter(s => s.checked).length} Sections</span>
                    <span>{item.timestamp}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

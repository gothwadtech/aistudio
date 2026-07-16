import React from "react";
import { MessageSquare, Plus, ChevronLeft, Trash2, Clock, X } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  selectedModel: string;
}

interface LeftSidebarProps {
  accentColor: string;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (id: string, e: React.MouseEvent) => void;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
  chatModels?: Array<{ value: string; label: string; desc: string }>;
  
  // Support for ChatPlaygroundStudio legacy history:
  history?: any[];
  activeHistoryId?: string | null;
  onSelectHistory?: (item: any) => void;
  onClearHistory?: () => void;
}

export default function LeftSidebar({
  accentColor,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onToggleSidebar,
  onBackToMain,
  chatModels = [],
  history,
  activeHistoryId,
  onSelectHistory,
  onClearHistory
}: LeftSidebarProps) {
  // Determine if we are rendering for main ChatStudio (using sessions) or ChatPlaygroundStudio (using history)
  const isPlaygroundMode = history !== undefined;

  return (
    <div className="w-[260px] bg-zinc-900 border-r border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
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
            {isPlaygroundMode ? "Sandbox History" : "Chat Archives"}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {isPlaygroundMode && onClearHistory && (history || []).length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-550 hover:text-rose-400 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Clear History"
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

      {/* New Session Action */}
      <div className="p-3 border-b border-zinc-850 shrink-0">
        <button
          onClick={onNewSession}
          className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-xs font-medium tracking-wide transition-all cursor-pointer active:scale-95"
          style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>{isPlaygroundMode ? "New Sandbox Run" : "New Chat Playground"}</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1">
          {isPlaygroundMode ? "Recent Runs" : "Chat History"}
        </span>

        {isPlaygroundMode ? (
          // Legacy Playground Studio rendering
          (!history || history.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-700 stroke-1" />
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">No history recorded</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => {
                const isActive = activeHistoryId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistory && onSelectHistory(item)}
                    className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer group ${
                      isActive
                        ? "bg-zinc-850/60 border-zinc-750 text-white"
                        : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" style={isActive ? { color: accentColor } : {}} />
                      <span className="text-xs font-sans font-medium truncate flex-1">
                        {item.prompt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-1">
                      <span>Temp: {item.temperature}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          // Standard Chat Studio rendering
          (!sessions || sessions.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-700 stroke-1" />
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">No chats active</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((item) => {
                const isActive = activeSessionId === item.id;
                
                // Find display labels for model
                const modelLabel = item.selectedModel
                  ? item.selectedModel.split(",").map((mKey: string) => {
                      const found = chatModels.find(m => m.value === mKey);
                      return found ? found.label.split(" (")[0] : mKey;
                    }).join(" + ")
                  : "No Model";

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectSession && onSelectSession(item.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? "bg-zinc-850/60 border-zinc-750 text-white"
                        : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0"
                        style={isActive ? { color: accentColor } : {}}
                      />
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs font-sans font-medium truncate">
                          {item.title || "Untitled Session"}
                        </span>
                        <span className="text-[8.5px] text-zinc-550 font-mono uppercase mt-0.5 truncate">
                          {modelLabel}
                        </span>
                      </div>
                    </div>

                    {sessions.length > 1 && onDeleteSession && (
                      <button
                        onClick={(e) => onDeleteSession(item.id, e)}
                        className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-zinc-800/40 shrink-0 ml-1.5"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

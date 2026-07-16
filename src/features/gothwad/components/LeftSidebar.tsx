import React from "react";
import { MessageSquare, Plus, Trash2, ChevronLeft, Sparkles, X } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
}

export interface GothwadSession {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
  timestamp: string;
}

interface LeftSidebarProps {
  accentColor: string;
  sessions: GothwadSession[];
  activeSessionId: string | null;
  onSelectSession: (session: GothwadSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearSessions: () => void;
  onToggleSidebar?: () => void;
}

export default function LeftSidebar({
  accentColor,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearSessions,
  onToggleSidebar
}: LeftSidebarProps) {
  return (
    <div className="w-[260px] bg-zinc-900 border-r border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Back"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[11.5px] font-mono font-bold text-zinc-100 tracking-tight leading-none uppercase truncate">
              Chat Workspace
            </span>
            <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
              GOTHWAD AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
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

      {/* New Chat Action */}
      <div className="p-3 border-b border-zinc-850 shrink-0">
        <button
          onClick={onNewSession}
          className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-xs font-medium tracking-wide transition-all cursor-pointer active:scale-95"
          style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>New Chat Playground</span>
        </button>
      </div>

      {/* Recent Chats list */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {(!sessions || sessions.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-700 stroke-1" />
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((item) => {
              const isActive = activeSessionId === item.id;
              return (
                <div
                  key={item.id}
                  className={`group relative w-full rounded-lg border flex items-center transition-all ${
                    isActive
                      ? "bg-zinc-850/50 border-zinc-800 text-white font-medium"
                      : "bg-transparent border-transparent hover:bg-zinc-850/20 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(item)}
                    className="flex-1 text-left py-1.5 px-2.5 flex items-center gap-2 overflow-hidden cursor-pointer"
                  >
                    <MessageSquare 
                      className="w-3.5 h-3.5 text-zinc-500 shrink-0 group-hover:text-zinc-400 transition-colors" 
                      style={isActive ? { color: accentColor } : {}} 
                    />
                    <span className="text-xs font-sans truncate flex-1 pr-6">
                      {item.title || "Untitled Conversation"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(item.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all cursor-pointer flex items-center justify-center"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

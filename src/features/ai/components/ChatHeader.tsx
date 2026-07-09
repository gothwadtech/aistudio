import React from "react";
import { Sparkles, Terminal, Settings, Trash2, ChevronRight, FileText } from "lucide-react";
import { GrixFileNode } from "../../../types/github";

interface ChatHeaderProps {
  onToggle: () => void;
  clearChat: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  setSelectedAgent: (val: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer") => void;
  agents: any;
  activeFile: GrixFileNode | null;
  fileSystemTree: GrixFileNode[];
  getFlatFilePaths: (nodes: GrixFileNode[]) => string[];
  accentColor: string;
}

export default function ChatHeader({
  onToggle,
  clearChat,
  showSettings,
  setShowSettings,
  selectedAgent,
  setSelectedAgent,
  agents,
  activeFile,
  fileSystemTree,
  getFlatFilePaths,
  accentColor
}: ChatHeaderProps) {
  return (
    <>
      {/* 1. Header Row */}
      <div className="h-14 min-h-[56px] border-b border-zinc-900 px-4 flex items-center justify-between bg-zinc-940">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative bg-zinc-900 border border-zinc-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-1 ring-zinc-900" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 tracking-wide flex items-center gap-1.5">
              Gothwad AI <span className="text-[9px] font-normal px-1 bg-zinc-800 text-zinc-400 rounded">v3.5</span>
            </h3>
            <p className="text-[9.5px] text-zinc-500 font-mono tracking-tight flex items-center gap-1">
              <Terminal className="w-2.5 h-2.5 text-zinc-600" />
              agent_online: true
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Settings cog toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${showSettings ? "bg-zinc-850 text-amber-400" : "text-zinc-500 hover:text-zinc-300"}`}
            title="AI Provider & Models Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Clear history button */}
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Panel Button */}
          <button
            id="btn-close-ai-companion"
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Collapse AI Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Expert Coding Agent Selection Slider */}
      <div className="px-3 py-2 bg-zinc-930 border-b border-zinc-900 flex flex-col gap-1.5">
        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Active Assistant Agent</span>
        <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
          {(Object.keys(agents) as Array<keyof typeof agents>).map((key) => {
            const ag = agents[key];
            const isSelected = selectedAgent === key;
            const Icon = ag.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedAgent(key as any)}
                className={`py-1.5 rounded flex flex-col items-center justify-center gap-1 transition-all relative ${
                  isSelected 
                    ? "bg-zinc-850 text-zinc-100 font-medium scale-[1.02]" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                }`}
                title={`${ag.name}: ${ag.desc}`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? ag.color : undefined }} />
                <span className="text-[9px] truncate max-w-full tracking-tight">{ag.name.split(" ")[0]}</span>
                {isSelected && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full" style={{ backgroundColor: ag.color }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context banner showing active file */}
      <div className="px-3 py-1.5 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
          <FileText className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500 font-mono shrink-0">context:</span>
          {activeFile ? (
            <span className="truncate text-zinc-300 font-mono font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
              {activeFile.name}
            </span>
          ) : (
            <span className="text-zinc-600 italic">No file open in editor</span>
          )}
        </div>
        <span className="text-[9px] px-1 bg-zinc-900 text-zinc-500 rounded border border-zinc-800 font-mono">
          {fileSystemTree.length > 0 ? `${getFlatFilePaths(fileSystemTree).length} files` : "No project"}
        </span>
      </div>
    </>
  );
}

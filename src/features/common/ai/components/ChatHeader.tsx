import React, { useState } from "react";
import { Settings, Trash2, ChevronRight, ChevronDown, Plus, SlidersHorizontal, Cpu, Sparkles, Menu } from "lucide-react";
import { GrixFileNode } from "../../../../types/github";

interface ChatHeaderProps {
  onToggle: () => void;
  clearChat: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  setSelectedAgent: (val: any) => void;
  agents: any;
  activeFile: GrixFileNode | null;
  fileSystemTree: GrixFileNode[];
  getFlatFilePaths: (nodes: GrixFileNode[]) => string[];
  accentColor: string;
  selectedModel: string;
  popularModels: Array<{ value: string; label: string; provider?: string }>;
  onModelChange: (val: string) => void;
  onNewSession: () => void;
  isMobile?: boolean;
  onOpenMenu?: () => void;
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
  accentColor,
  selectedModel,
  popularModels,
  onModelChange,
  onNewSession,
  isMobile = false,
  onOpenMenu
}: ChatHeaderProps) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const getModelLabel = (modelVal: string) => {
    const found = popularModels.find((m) => m.value === modelVal);
    if (found) return found.label.replace(" (Free)", "").replace(" (Standard)", "");
    return modelVal.split("/").pop() || modelVal;
  };

  return (
    <div className="relative shrink-0 select-none">
      {/* Unified Header Row - exactly styled like AI Chat Playground */}
      <div className="h-13 border-b border-zinc-850 bg-zinc-900/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger trigger for mobile menu drawer */}
          {isMobile && onOpenMenu && (
            <button 
              onClick={onOpenMenu}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center mr-1"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-[11.5px] font-mono font-bold tracking-tight text-zinc-100 uppercase">
                Gothwad AI Companion
              </h2>
              <div className="relative mt-0.5">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-500 hover:text-zinc-350 uppercase tracking-wider select-none transition-all duration-150 cursor-pointer"
                >
                  <span>{getModelLabel(selectedModel)}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-zinc-500 shrink-0 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Create New Session Button */}
          <button
            onClick={onNewSession}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            title="Create New Conversation"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Settings cog / parameters sidebar toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 ${
              showSettings ? "text-white border-zinc-700 bg-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Toggle Parameters & History"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Absolute Model Selection Dropdown Overlay */}
      {showModelDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowModelDropdown(false)}
          />
          <div className="absolute top-12 left-4 bg-zinc-950 border border-zinc-800 rounded-xl p-1 w-56 shadow-2xl z-50 flex flex-col font-mono text-[10px] animate-fade-in">
            <div className="px-2 py-1.5 text-[8px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 border-b border-zinc-900 mb-1">
              Select Active Engine
            </div>
            {popularModels.map((m) => {
              const isSelected = selectedModel === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    onModelChange(m.value);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-zinc-100 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <span>{m.label.replace(" (Free)", "").replace(" (Standard)", "")}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


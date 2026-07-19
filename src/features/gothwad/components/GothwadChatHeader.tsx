import React from "react";
import { Menu, SlidersHorizontal, ChevronDown, Plus, Sparkles } from "lucide-react";

interface GothwadChatHeaderProps {
  activeModelLabel: string;
  setShowHeaderModelMenu: (open: boolean) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
  showParametersPanel: boolean;
  setShowParametersPanel: (show: boolean) => void;
  onNewSession: () => void;
  accentColor: string;
}

export default function GothwadChatHeader({
  activeModelLabel,
  setShowHeaderModelMenu,
  showLeftSidebar,
  setShowLeftSidebar,
  showParametersPanel,
  setShowParametersPanel,
  onNewSession,
  accentColor
}: GothwadChatHeaderProps) {
  return (
    <div className="pt-1.5 pb-1.5 px-1 md:px-2 shrink-0 bg-transparent relative z-20 w-full select-none">
      <div className="w-full mx-auto">
        {/* Rounded Capsule Header bar matching the chat input style */}
        <div className="relative flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-850 rounded-2xl px-3 py-2 transition-all shadow-xl w-full h-[54px]">
          
          {/* Left Side Group: Sidebar Button + Brand Logo + Model Selector */}
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            {/* Left Side: Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`w-10 h-10 rounded-xl border transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center ${
                showLeftSidebar 
                  ? "bg-zinc-850 border-zinc-700 text-zinc-100" 
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850"
              }`}
              title={showLeftSidebar ? "Hide History" : "Show History"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Model Selector badge positioned directly next to the Logo */}
            <button
              onClick={() => setShowHeaderModelMenu(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-850 text-[10px] font-mono text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 rounded-xl transition-all cursor-pointer active:scale-95 truncate max-w-[150px] sm:max-w-[220px]"
              title="Change active language model engine"
            >
              <span className="truncate font-bold tracking-wider text-[8.5px] uppercase">{activeModelLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Right Side: Action Cluster (Plus + Parameter Toggle) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Create New Session Plus Button */}
            <button
              type="button"
              onClick={onNewSession}
              className="w-10 h-10 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center"
              title="Create New Chat"
            >
              <Plus className="w-5 h-5" style={{ color: accentColor }} />
            </button>

            {/* Parameters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowParametersPanel(!showParametersPanel)}
              className={`w-10 h-10 rounded-xl transition-all shrink-0 flex items-center justify-center border cursor-pointer active:scale-90 ${
                showParametersPanel
                  ? "border-zinc-700 text-white bg-zinc-850"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-850"
              }`}
              style={showParametersPanel ? { borderColor: accentColor, backgroundColor: `${accentColor}12` } : {}}
              title={showParametersPanel ? "Hide Parameters" : "Show Parameters"}
            >
              <SlidersHorizontal className="w-5 h-5" style={showParametersPanel ? { color: accentColor } : {}} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

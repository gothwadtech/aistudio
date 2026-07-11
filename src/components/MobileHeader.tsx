import React from "react";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  isDarkActive: boolean;
  accentColor: string;
  selectedRepo: { name: string } | null;
  activeFile: { name: string } | null;
  token: string | null;
  setIsLeftDrawerOpen: (open: boolean) => void;
  handleThemeModeChange: (mode: "light" | "dark" | "system") => void;
  selectRepo: (repo: any) => void;
  logout: () => void;
}

export default function MobileHeader({
  accentColor,
  selectedRepo,
  setIsLeftDrawerOpen,
}: MobileHeaderProps) {
  return (
    <div 
      className="h-13 border-b border-zinc-850 bg-zinc-900/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-40 select-none"
    >
      <div className="flex items-center gap-3">
        {/* Hamburger Button to Open Drawer */}
        <button 
          onClick={() => setIsLeftDrawerOpen(true)}
          className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-[11.5px] font-mono font-bold text-zinc-100 uppercase tracking-tight">Software Builder</span>
          <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">Workspace IDE</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Repository Pill */}
        {selectedRepo ? (
          <div 
            className="flex items-center gap-1.5 bg-zinc-950 text-zinc-300 border px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold truncate max-w-[140px]"
            style={{ borderColor: `${accentColor}25` }}
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="truncate">{selectedRepo.name}</span>
          </div>
        ) : (
          <div className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-850">
            No Repo
          </div>
        )}
      </div>
    </div>
  );
}

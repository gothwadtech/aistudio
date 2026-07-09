import React, { useState } from "react";
import { Menu, MoreVertical } from "lucide-react";

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
  isDarkActive,
  accentColor,
  selectedRepo,
  activeFile,
  token,
  setIsLeftDrawerOpen,
  handleThemeModeChange,
  selectRepo,
  logout,
}: MobileHeaderProps) {
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

  return (
    <div 
      className="h-14 min-h-[56px] border-b flex items-center justify-between px-3 z-40 shrink-0 transition-all duration-200"
      style={{ 
        backgroundColor: isDarkActive ? "#202124" : "#ffffff", 
        borderColor: isDarkActive ? "#202124" : "#e4e4e7" 
      }}
    >
      <div className="flex items-center gap-1">
        {/* Hamburger Button to Open Drawer */}
        <button 
          onClick={() => setIsLeftDrawerOpen(true)}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 ml-0.5">
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Gothwad Ai Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Repository Pill */}
        {selectedRepo ? (
          <div 
            className="flex items-center gap-1 bg-[#375a7f]/10 text-[#375a7f] border px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold truncate max-w-[120px]"
            style={{ borderColor: `${accentColor}30` }}
          >
            <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="truncate">{selectedRepo.name}</span>
          </div>
        ) : (
          <div className="text-[8px] font-mono text-zinc-400 dark:text-zinc-650 font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
            No Repo
          </div>
        )}

        {/* 3-dot Right Menu Ellipsis Button */}
        <div className="relative">
          <button
            onClick={() => setIsRightMenuOpen(!isRightMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Right Menu Dropdown */}
          {isRightMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRightMenuOpen(false)} />
              <div 
                className="absolute right-0 mt-1.5 w-48 rounded-xl border shadow-xl z-50 py-1.5 font-mono text-xs text-left animate-fade-in"
                style={{ 
                  backgroundColor: isDarkActive ? "#202124" : "#ffffff", 
                  borderColor: isDarkActive ? "#202124" : "#e4e4e7" 
                }}
              >
                <button
                  onClick={() => {
                    handleThemeModeChange(isDarkActive ? "light" : "dark");
                    setIsRightMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer flex items-center justify-between"
                >
                  <span>Toggle Theme</span>
                  <span className="text-[10px] text-zinc-400">
                    {isDarkActive ? "Light ☀️" : "Dark 🌙"}
                  </span>
                </button>

                {activeFile && (
                  <button
                    onClick={() => {
                      setIsRightMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850"
                  >
                    <span>Active File</span>
                    <span className="text-[9px] text-zinc-400 truncate max-w-[80px]">
                      {activeFile.name}
                    </span>
                  </button>
                )}

                {selectedRepo && (
                  <button
                    onClick={() => {
                      selectRepo(null);
                      setIsRightMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850"
                  >
                    <span>Close Repo</span>
                    <span className="text-[10px]">✕</span>
                  </button>
                )}

                {token && (
                  <button
                    onClick={() => {
                      logout();
                      setIsRightMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850"
                  >
                    <span>Disconnect Git</span>
                    <span className="text-[10px]">🔌</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

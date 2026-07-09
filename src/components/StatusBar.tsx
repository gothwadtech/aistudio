import React from "react";
import { GitBranch, RefreshCw, ShieldCheck, Terminal, Heart } from "lucide-react";

interface StatusBarProps {
  selectedRepo: { name: string; full_name: string; default_branch: string } | null;
  selectedBranch: string;
  isLoading: boolean;
  user: { login: string } | null;
  activeFile: { name: string; path: string } | null;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
}

export default function StatusBar({
  selectedRepo,
  selectedBranch,
  isLoading,
  user,
  activeFile,
  uiScale,
  onUiScaleChange
}: StatusBarProps) {
  return (
    <div className="w-full h-[22px] min-h-[22px] bg-zinc-950 border-t border-zinc-900 px-3 flex justify-between items-center select-none text-[10px] font-mono text-zinc-500 z-50">
      
      {/* Left: Branch and Sync details */}
      <div className="flex items-center gap-3">
        {selectedRepo ? (
          <div className="flex items-center gap-1 bg-[#375a7f]/15 text-[#375a7f] hover:bg-[#375a7f]/25 px-1.5 py-0.5 rounded transition-colors cursor-pointer font-bold">
            <GitBranch className="w-2.5 h-2.5" />
            <span>{selectedBranch || selectedRepo.default_branch}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-zinc-600">
            <GitBranch className="w-2.5 h-2.5" />
            <span>no branch</span>
          </div>
        )}

        {isLoading ? (
          <span className="flex items-center gap-1 text-amber-500 font-bold animate-pulse">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>Syncing with GitHub...</span>
          </span>
        ) : selectedRepo ? (
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden xs:inline">Workspace connected</span>
          </span>
        ) : (
          <span className="text-zinc-600">Repository Idle</span>
        )}
      </div>

      {/* Center: Repository Details or Active File Path */}
      <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-bold max-w-[40%] truncate">
        {activeFile ? (
          <span className="text-zinc-300">
            src/{activeFile.path}
          </span>
        ) : selectedRepo ? (
          <span>
            {selectedRepo.full_name}
          </span>
        ) : (
          <span>Welcome to Gothwad Ai Studio</span>
        )}
      </div>

      {/* Right: Coding Utilities and Profiles */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <div className="hidden xs:flex items-center gap-2 text-zinc-600 border-r border-zinc-900 pr-3">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span className="text-[#375a7f] font-semibold">TypeScript JSX</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {user ? (
            <span className="text-zinc-400 font-bold">@{user.login}</span>
          ) : (
            <span className="text-zinc-600">Guest</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-1.5 rounded text-[9px] font-bold">
          <Terminal className="w-2.5 h-2.5" />
          <span>Local Buffer</span>
        </div>

        {/* TV Scaling Selector */}
        <div className="flex items-center gap-1.5 text-zinc-500 border-l border-zinc-900 pl-3">
          <span className="text-[9px] uppercase font-bold text-zinc-600">Scale:</span>
          <select
            className="bg-zinc-900 border border-zinc-850 text-[10px] font-mono text-zinc-400 rounded px-1.5 py-0.5 outline-none cursor-pointer hover:text-zinc-200"
            value={uiScale}
            onChange={(e) => onUiScaleChange(parseFloat(e.target.value))}
            title="Adjust Zoom / Scale Factor (Highly useful for TVs or Large Screens)"
          >
            <option value="0.4">40% (PC View on TV)</option>
            <option value="0.5">50% (TV PC View)</option>
            <option value="0.6">60% (Compact TV)</option>
            <option value="0.7">70%</option>
            <option value="0.8">80%</option>
            <option value="0.9">90%</option>
            <option value="1.0">100% (Default)</option>
            <option value="1.15">115%</option>
            <option value="1.3">130%</option>
          </select>
        </div>
      </div>

    </div>
  );
}

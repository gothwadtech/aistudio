import React from "react";
import { LucideIcon, Menu, SlidersHorizontal } from "lucide-react";

interface GlobalStudioHeaderProps {
  title: string;
  badge?: React.ReactNode;
  badgeColor?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconClassName?: string;
  iconBoxClassName?: string;
  rightContent?: React.ReactNode;
  onToggleSidebar?: () => void;
  onToggleSettings?: () => void;
  showSettingsActive?: boolean;
}

export default function GlobalStudioHeader({
  title,
  badge,
  rightContent,
  onToggleSidebar,
  onToggleSettings,
  showSettingsActive = true
}: GlobalStudioHeaderProps) {
  return (
    <div className="h-13 border-b border-zinc-850 bg-zinc-900/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0 w-full select-none">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center"
            title="Toggle Menu / Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h2 className="text-[11.5px] font-mono font-bold tracking-tight text-zinc-100 uppercase leading-none">
            {title}
          </h2>
          {badge && (
            <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {rightContent}
        {onToggleSettings && (
          <button
            onClick={onToggleSettings}
            className={`p-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 ${
              showSettingsActive ? "text-white border-zinc-700 bg-zinc-900" : "text-zinc-400 hover:text-zinc-250"
            }`}
            title="Toggle Parameters Sidebar"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}


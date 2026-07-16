import React from "react";
import { CheckSquare, Square, Copy, Check, Trash2, ListCollapse, X } from "lucide-react";

interface SectionItem {
  id: string;
  label: string;
  checked: boolean;
}

interface RightSidebarProps {
  accentColor: string;
  sections: SectionItem[];
  onToggleSection: (id: string) => void;
  hasHtml: boolean;
  onCopy: () => void;
  copied: boolean;
  onDiscard: () => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  sections,
  onToggleSection,
  hasHtml,
  onCopy,
  copied,
  onDiscard,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Page Layout Settings
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Close Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Sections Selection */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <ListCollapse className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Target Components</span>
          </h2>
          <div className="space-y-1.5">
            {sections.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggleSection(s.id)}
                className="w-full text-left p-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 bg-zinc-950/40 flex items-center justify-between cursor-pointer transition-all"
              >
                <span className="text-xs font-medium text-zinc-400">{s.label}</span>
                {s.checked ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" style={{ color: accentColor }} />
                ) : (
                  <Square className="w-4 h-4 text-zinc-650" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Triggers */}
        {hasHtml && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Operations</h2>
            <div className="space-y-2">
              <button 
                onClick={onCopy}
                className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{copied ? "Copied" : "Copy Source Code"}</span>
              </button>
              <button 
                onClick={onDiscard}
                className="w-full py-2 px-3 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/20 hover:border-rose-900/30 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-350 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Discard HTML Markup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

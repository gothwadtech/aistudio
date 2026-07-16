import React from "react";
import { Layout, Play, Download, Trash2, X } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  font: string;
  bg: string;
}

interface RightSidebarProps {
  accentColor: string;
  templates: TemplateItem[];
  template: string;
  setTemplate: (val: string) => void;
  hasSlides: boolean;
  onPresenterMode: () => void;
  onExportPDF: () => void;
  onDiscard: () => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  templates,
  template,
  setTemplate,
  hasSlides,
  onPresenterMode,
  onExportPDF,
  onDiscard,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Visual Deck Controls
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
        {/* Templates selector */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Theme Templates</span>
          </h2>
          <div className="space-y-1.5">
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  template === t.id 
                    ? "bg-zinc-850/60 border-zinc-750 text-zinc-100" 
                    : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-500"
                }`}
                style={template === t.id ? { borderColor: accentColor } : {}}
              >
                <span className="text-xs font-semibold">{t.name}</span>
                <div className={`w-3.5 h-3.5 rounded-full border border-zinc-700 ${t.bg.split(" ")[0]}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Action triggers */}
        {hasSlides && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Operations</h2>
            <div className="space-y-2">
              <button 
                onClick={onPresenterMode}
                className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-zinc-400" />
                <span>Presenter Mode</span>
              </button>
              <button 
                onClick={onExportPDF}
                className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export to PDF</span>
              </button>
              <button 
                onClick={onDiscard}
                className="w-full py-2 px-3 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/20 hover:border-rose-900/30 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-350 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Discard Slide Deck</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

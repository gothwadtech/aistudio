import React from "react";
import { Sliders, Layers, X } from "lucide-react";

interface ModelItem {
  id: string;
  name: string;
  checked: boolean;
  response: string;
  latency: string;
}

interface RightSidebarProps {
  accentColor: string;
  temperature: number;
  setTemperature: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  modelsToCompare: ModelItem[];
  onToggleModel: (id: string) => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  modelsToCompare,
  onToggleModel,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Inference Parameters
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
        {/* Model Parameters block */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Model Parameters</span>
          </h2>

          <div className="bg-zinc-950/40 border border-zinc-850/50 rounded-xl p-3.5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Temperature</span>
                <span className="text-zinc-300 font-bold">{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.5" 
                step="0.05"
                value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Max Tokens</span>
                <span className="text-zinc-300 font-bold">{maxTokens}</span>
              </div>
              <input 
                type="range" 
                min="256" 
                max="8192" 
                step="256"
                value={maxTokens} 
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Model comparison settings */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Select Comparison Models</span>
          </h2>

          <div className="space-y-2">
            {modelsToCompare.map(m => (
              <label key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-850/40 bg-zinc-950/40 cursor-pointer select-none transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: m.checked ? accentColor : "#52525b" }} />
                  <span className="text-xs text-zinc-300 font-medium truncate">{m.name}</span>
                </div>
                <input 
                  type="checkbox"
                  checked={m.checked}
                  onChange={() => onToggleModel(m.id)}
                  className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 cursor-pointer"
                  style={{ accentColor }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

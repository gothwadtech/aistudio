import React from "react";
import { Compass, Sliders, Layout, X } from "lucide-react";

interface StyleItem {
  id: string;
  name: string;
  desc: string;
}

interface RatioItem {
  id: string;
  label: string;
  desc: string;
}

interface RightSidebarProps {
  accentColor: string;
  styles: StyleItem[];
  activeStyle: string;
  setActiveStyle: (id: string) => void;
  ratios: RatioItem[];
  activeRatio: string;
  setActiveRatio: (id: string) => void;
  cfgScale: number;
  setCfgScale: (val: number) => void;
  steps: number;
  setSteps: (val: number) => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  styles,
  activeStyle,
  setActiveStyle,
  ratios,
  activeRatio,
  setActiveRatio,
  cfgScale,
  setCfgScale,
  steps,
  setSteps,
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
        {/* Aspect Ratio selector */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Aspect Ratio</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {ratios.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRatio(r.id)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-0.5 transition-all cursor-pointer ${
                  activeRatio === r.id 
                    ? "bg-zinc-850 border-zinc-700 text-zinc-200" 
                    : "bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900 text-zinc-500"
                }`}
                style={activeRatio === r.id ? { borderColor: accentColor } : {}}
              >
                <span className="text-xs font-bold font-mono">{r.id}</span>
                <span className="text-[9px] text-zinc-500 font-medium leading-none">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CFG & Sampling steps */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Sampler Settings</span>
          </h2>

          <div className="bg-zinc-950/40 border border-zinc-850/50 rounded-xl p-3.5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">CFG Scale</span>
                <span className="text-zinc-300 font-bold">{cfgScale}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="15.0" 
                step="0.5"
                value={cfgScale} 
                onChange={(e) => setCfgScale(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Sampling Steps</span>
                <span className="text-zinc-300 font-bold">{steps}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="60" 
                value={steps} 
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Style presets */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Diffusion Preset Style</span>
          </h2>
          <div className="space-y-1.5">
            {styles.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStyle(s.id)}
                className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                  activeStyle === s.id 
                    ? "bg-zinc-850/60 border-zinc-750 text-zinc-100" 
                    : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300"
                }`}
                style={activeStyle === s.id ? { borderColor: accentColor } : {}}
              >
                <span className="text-xs font-semibold">{s.name}</span>
                <span className="text-[10px] text-zinc-500 leading-normal">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

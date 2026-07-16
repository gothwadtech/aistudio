import React from "react";
import { Compass, Sliders, PlayCircle, X } from "lucide-react";

interface MotionItem {
  id: string;
  name: string;
  desc: string;
}

interface RightSidebarProps {
  accentColor: string;
  motions: MotionItem[];
  motion: string;
  setMotion: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  motionStrength: number;
  setMotionStrength: (val: number) => void;
  fps: string;
  setFps: (val: string) => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  motions,
  motion,
  setMotion,
  duration,
  setDuration,
  motionStrength,
  setMotionStrength,
  fps,
  setFps,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Cinematic Settings
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
        {/* Timing & Frames */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <PlayCircle className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Timing & Frame Rates</span>
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 block mb-1.5 uppercase">Clip Duration</span>
              <div className="flex gap-1.5">
                {["4s", "8s", "12s"].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2 px-1 rounded-xl border text-[11px] font-bold font-mono transition-all cursor-pointer ${
                      duration === d 
                        ? "bg-zinc-850 border-zinc-700 text-zinc-200" 
                        : "bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900 text-zinc-500"
                    }`}
                    style={duration === d ? { borderColor: accentColor } : {}}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 block mb-1.5 uppercase">Target FPS</span>
              <div className="flex gap-1.5">
                {["24", "30", "60"].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFps(f)}
                    className={`flex-1 py-2 px-1 rounded-xl border text-[11px] font-bold font-mono transition-all cursor-pointer ${
                      fps === f 
                        ? "bg-zinc-850 border-zinc-700 text-zinc-200" 
                        : "bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900 text-zinc-500"
                    }`}
                    style={fps === f ? { borderColor: accentColor } : {}}
                  >
                    {f}fps
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Motion Velocity Strength */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Motion Parameters</span>
          </h2>

          <div className="bg-zinc-950/40 border border-zinc-850/50 rounded-xl p-3.5">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Velocity Strength</span>
              <span className="text-zinc-300 font-bold">{motionStrength}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={motionStrength} 
              onChange={(e) => setMotionStrength(Number(e.target.value))}
              className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
              style={{ accentColor }}
            />
          </div>
        </div>

        {/* Camera Motion Selection */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Camera Path Vector</span>
          </h2>
          <div className="space-y-1.5">
            {motions.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMotion(m.id)}
                className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                  motion === m.id 
                    ? "bg-zinc-850/60 border-zinc-750 text-zinc-100" 
                    : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-400"
                }`}
                style={motion === m.id ? { borderColor: accentColor } : {}}
              >
                <span className="text-xs font-semibold">{m.name}</span>
                <span className="text-[10px] text-zinc-500 leading-normal">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Sliders, Compass, Disc, X } from "lucide-react";

interface GenrePreset {
  id: string;
  name: string;
  desc: string;
}

interface RightSidebarProps {
  accentColor: string;
  genres: GenrePreset[];
  genre: string;
  setGenre: (val: string) => void;
  drumLevel: number;
  setDrumLevel: (val: number) => void;
  bassLevel: number;
  setBassLevel: (val: number) => void;
  synthLevel: number;
  setSynthLevel: (val: number) => void;
  vocalLevel: number;
  setVocalLevel: (val: number) => void;
  bpm: number;
  setBpm: (val: number) => void;
  musicalKey: string;
  setMusicalKey: (val: string) => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  genres,
  genre,
  setGenre,
  drumLevel,
  setDrumLevel,
  bassLevel,
  setBassLevel,
  synthLevel,
  setSynthLevel,
  vocalLevel,
  setVocalLevel,
  bpm,
  setBpm,
  musicalKey,
  setMusicalKey,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Audio Controls
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
        {/* Genre presets */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Genre Aesthetic</span>
          </h2>
          <div className="space-y-1.5">
            {genres.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenre(g.id)}
                className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all cursor-pointer ${
                  genre === g.id 
                    ? "bg-zinc-850/60 border-zinc-750 text-zinc-100" 
                    : "bg-zinc-950/20 border-transparent hover:bg-zinc-900 text-zinc-500"
                }`}
                style={genre === g.id ? { borderColor: accentColor } : {}}
              >
                <span className="text-xs font-semibold">{g.name}</span>
                <span className="text-[10px] text-zinc-500 leading-normal">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-track mixers */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Multi-Track Mixer</span>
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-500">Drums</span>
                <span className="font-mono text-zinc-400">{drumLevel}%</span>
              </div>
              <input type="range" value={drumLevel} onChange={(e) => setDrumLevel(Number(e.target.value))} className="w-full accent-indigo-500 bg-zinc-850 h-1 rounded appearance-none cursor-pointer" style={{ accentColor }} />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-500">Bass</span>
                <span className="font-mono text-zinc-400">{bassLevel}%</span>
              </div>
              <input type="range" value={bassLevel} onChange={(e) => setBassLevel(Number(e.target.value))} className="w-full accent-indigo-500 bg-zinc-850 h-1 rounded appearance-none cursor-pointer" style={{ accentColor }} />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-500">Synth</span>
                <span className="font-mono text-zinc-400">{synthLevel}%</span>
              </div>
              <input type="range" value={synthLevel} onChange={(e) => setSynthLevel(Number(e.target.value))} className="w-full accent-indigo-500 bg-zinc-850 h-1 rounded appearance-none cursor-pointer" style={{ accentColor }} />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-500">Vocals</span>
                <span className="font-mono text-zinc-400">{vocalLevel}%</span>
              </div>
              <input type="range" value={vocalLevel} onChange={(e) => setVocalLevel(Number(e.target.value))} className="w-full accent-indigo-500 bg-zinc-850 h-1 rounded appearance-none cursor-pointer" style={{ accentColor }} />
            </div>
          </div>
        </div>

        {/* BPM & Key Signatures */}
        <div className="space-y-3 border-t border-zinc-850 pt-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Scale & Tempo</h2>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Tempo</span>
              <span className="font-mono text-zinc-300 font-bold">{bpm} BPM</span>
            </div>
            <input 
              type="range" 
              min="60" 
              max="180" 
              value={bpm} 
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
              style={{ accentColor }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-500 block">Diatonic Key Signature</label>
            <select 
              value={musicalKey} 
              onChange={(e) => setMusicalKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 text-xs rounded-xl p-2.5 text-zinc-300 outline-none cursor-pointer"
            >
              <option value="C Minor">C Minor (Dark & Moody)</option>
              <option value="A Major">A Major (Bright & Cinematic)</option>
              <option value="F Major">F Major (Warm & Ethereal)</option>
              <option value="E Minor">E Minor (Space & Atmospheric)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

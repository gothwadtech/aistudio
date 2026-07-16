import React from "react";
import { Settings2, Volume2, X } from "lucide-react";

interface RightSidebarProps {
  accentColor: string;
  voiceModel: string;
  setVoiceModel: (val: string) => void;
  micGain: number;
  setMicGain: (val: number) => void;
  speechSpeed: number;
  setSpeechSpeed: (val: number) => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  voiceModel,
  setVoiceModel,
  micGain,
  setMicGain,
  speechSpeed,
  setSpeechSpeed,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Voice Configuration
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
        {/* Presets block */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Synthesis Presets</span>
          </h2>

          <div className="bg-zinc-950/40 border border-zinc-850/50 rounded-xl p-3.5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">Voice Actor Profile</label>
              <select 
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-xs rounded-xl p-2.5 text-zinc-300 outline-none cursor-pointer"
              >
                <option value="neural_female">Neural Female - Stella (Conversational)</option>
                <option value="neural_male">Neural Male - Arthur (Academic/Analytical)</option>
                <option value="neural_whisper">Neural Whispering - Selene (Ultra calm)</option>
                <option value="robotic">Cybernetic Synth - Gothwad-V3</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Mic Input Sensitivity</span>
                <span className="text-zinc-300 font-bold">{micGain}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={micGain} 
                onChange={(e) => setMicGain(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold">Speech Rate Speed</span>
                <span className="text-zinc-300 font-bold">{speechSpeed}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={speechSpeed} 
                onChange={(e) => setSpeechSpeed(Number(e.target.value))}
                className="w-full bg-zinc-850 rounded-lg appearance-none h-1 cursor-pointer"
                style={{ accentColor }}
              />
            </div>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="bg-zinc-950/40 border border-zinc-850/60 rounded-xl p-3.5 text-[11px] text-zinc-500 space-y-2.5 leading-relaxed">
          <span className="font-bold text-zinc-400 block font-mono text-[10px] uppercase tracking-wider">How to operate</span>
          <p>1. Ensure your browser microphone permissions are enabled.</p>
          <p>2. Tap the central glowing button to connect the duplex voice websocket socket.</p>
          <p>3. Start speaking. Visual transcripts will stream in real-time as speech synthesis replies.</p>
        </div>
      </div>
    </div>
  );
}

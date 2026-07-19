import React from "react";
import { SlidersHorizontal, Bot, Terminal, HelpCircle, X } from "lucide-react";

interface RightSidebarProps {
  accentColor: string;
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  onClose?: () => void;
}

export const SUPPORTED_MODELS = [
  { name: "Gemini 2.5 Flash", id: "google/gemini-2.5-flash", desc: "Super-fast generalist & multimodal", tag: "Fastest" },
  { name: "DeepSeek R1 Reasoning", id: "deepseek/deepseek-r1", desc: "Complex mathematical, code, and logic reasoning", tag: "Thinking" },
  { name: "Claude 3.5 Sonnet", id: "anthropic/claude-3.5-sonnet", desc: "Elite coding assistance & beautiful prose", tag: "Premium" },
  { name: "Llama 3.3 70B Instruct", id: "meta-llama/llama-3.3-70b-instruct", desc: "High-context conversational balance", tag: "Open Source" },
  { name: "Qwen 2.5 Coder 32B", id: "qwen/qwen-2.5-coder-32b-instruct", desc: "Specialist in syntax and software bugs", tag: "Coding" }
];

export default function RightSidebar({
  accentColor,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  topP,
  setTopP,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 truncate">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" style={{ color: accentColor }} />
          <span>Playground Params</span>
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
        {/* System Prompt (Persona Setter) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>System Persona</span>
            </h3>
            <span className="text-[9px] font-mono text-zinc-600">Behavior override</span>
          </div>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. 'You are a senior full-stack engineer. Speak concisely and output clean TypeScript blocks.'"
            className="w-full h-24 bg-zinc-950 border border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-2.5 text-xs placeholder-zinc-700 text-zinc-200 outline-none resize-none transition-all"
          />
        </div>

        {/* Sliders: Temperature, Max Tokens, Top P */}
        <div className="space-y-4 pt-1 border-t border-zinc-850/60">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Hyperparameters
          </h3>

          {/* Temperature */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Temperature</span>
              <span className="font-mono text-zinc-300 font-bold">{temperature}</span>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="1.2" 
              step="0.1"
              value={temperature} 
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full bg-zinc-800 rounded-lg appearance-none h-1 cursor-pointer"
              style={{ accentColor }}
            />
            <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Max Tokens</span>
              <span className="font-mono text-zinc-300 font-bold">{maxTokens}</span>
            </div>
            <input 
              type="range" 
              min="256" 
              max="8192" 
              step="128"
              value={maxTokens} 
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full bg-zinc-800 rounded-lg appearance-none h-1 cursor-pointer"
              style={{ accentColor }}
            />
            <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
              <span>256</span>
              <span>8192</span>
            </div>
          </div>

          {/* Top P */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Top P</span>
              <span className="font-mono text-zinc-300 font-bold">{topP}</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={topP} 
              onChange={(e) => setTopP(Number(e.target.value))}
              className="w-full bg-zinc-800 rounded-lg appearance-none h-1 cursor-pointer"
              style={{ accentColor }}
            />
            <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
              <span>Dynamic</span>
              <span>Fixed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Cpu, X, PlusCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { safeStorage } from "../../../utils/safeStorage";

export interface GothwadModelItem {
  id: string;
  name: string;
  desc: string;
  tag: string;
  isCustom?: boolean;
}

export const BASE_SUPPORTED_MODELS: GothwadModelItem[] = [
  { name: "Gemini 2.5 Flash", id: "google/gemini-2.5-flash", desc: "Super-fast generalist & multimodal", tag: "Fastest" },
  { name: "DeepSeek R1 Reasoning", id: "deepseek/deepseek-r1", desc: "Complex mathematical, code, and logic reasoning", tag: "Thinking" },
  { name: "Claude 3.5 Sonnet", id: "anthropic/claude-3.5-sonnet", desc: "Elite coding assistance & beautiful prose", tag: "Premium" },
  { name: "Llama 3.3 70B Instruct", id: "meta-llama/llama-3.3-70b-instruct", desc: "High-context conversational balance", tag: "Open Source" },
  { name: "Qwen 2.5 Coder 32B", id: "qwen/qwen-2.5-coder-32b-instruct", desc: "Specialist in syntax and software bugs", tag: "Coding" }
];

interface GothwadModelProps {
  accentColor: string;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function GothwadModel({
  accentColor,
  selectedModel,
  onSelectModel,
  onClose,
  isOpen
}: GothwadModelProps) {
  const [customModels, setCustomModels] = useState<GothwadModelItem[]>(() => {
    try {
      const saved = safeStorage.getItem("gothwad_custom_models");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [customModelId, setCustomModelId] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [customModelDesc, setCustomModelDesc] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    try {
      safeStorage.setItem("gothwad_custom_models", JSON.stringify(customModels));
    } catch (e) {}
  }, [customModels]);

  if (!isOpen) return null;

  const handleAddCustomModel = () => {
    if (!customModelId.trim()) {
      setCustomError("Model ID is required.");
      return;
    }
    if (!customModelName.trim()) {
      setCustomError("Display label is required.");
      return;
    }

    const trimmedId = customModelId.trim();
    const isDuplicate = 
      BASE_SUPPORTED_MODELS.some(m => m.id === trimmedId) || 
      customModels.some(m => m.id === trimmedId);

    if (isDuplicate) {
      setCustomError("A model with this ID is already registered.");
      return;
    }

    const newModel: GothwadModelItem = {
      id: trimmedId,
      name: customModelName.trim(),
      desc: customModelDesc.trim() || "User registered custom AI engine.",
      tag: "Custom",
      isCustom: true
    };

    setCustomModels(prev => [...prev, newModel]);
    onSelectModel(trimmedId);

    // Reset inputs
    setCustomModelId("");
    setCustomModelName("");
    setCustomModelDesc("");
    setCustomError(null);
  };

  const handleDeleteCustomModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomModels(prev => prev.filter(m => m.id !== id));
    if (selectedModel === id) {
      onSelectModel(BASE_SUPPORTED_MODELS[0].id);
    }
  };

  const allModels = [...BASE_SUPPORTED_MODELS, ...customModels];

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-opacity duration-150 animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Left sliding container - Perfectly matches the left sidebar height, bg, border and z-index */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-zinc-900 border-r border-zinc-850 z-[101] shadow-2xl flex flex-col h-full animate-slide-in-left select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Cpu className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
              Select Engine Model
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800/40 rounded-lg cursor-pointer transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Model List & Custom Add Form */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
          
          {/* Models List */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-500">Available Engines</div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 no-scrollbar border border-zinc-850/50 rounded-xl p-2 bg-zinc-950/20">
              {allModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectModel(m.id)}
                    className={`group flex flex-col p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected 
                        ? "bg-zinc-850/50 border-zinc-750/50 text-zinc-100" 
                        : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[11px] font-sans font-semibold truncate text-zinc-200">{m.name}</span>
                        <span className="text-[8px] text-zinc-500 truncate mt-0.5 font-mono">{m.id}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span 
                          className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isSelected 
                              ? "bg-indigo-950/60 text-indigo-300 border border-indigo-900/40" 
                              : "bg-zinc-900 text-zinc-500"
                          }`}
                          style={isSelected ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}30` } : {}}
                        >
                          {m.tag}
                        </span>
                        
                        {m.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomModel(m.id, e)}
                            className="p-1 text-zinc-650 hover:text-rose-450 rounded hover:bg-zinc-800 transition-colors"
                            title="Delete Custom Model"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 font-sans mt-1.5 leading-relaxed line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Model Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-t border-zinc-850 pt-4 mb-1">
              <PlusCircle className="w-3.5 h-3.5 text-zinc-500" style={{ color: accentColor }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                Register Custom Model
              </span>
            </div>

            {/* Form */}
            <div className="space-y-3 font-mono text-[10px]">
              <div className="space-y-1">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Model ID / OpenRouter Path</label>
                <input 
                  type="text"
                  placeholder="e.g. deepseek/deepseek-chat"
                  value={customModelId}
                  onChange={(e) => {
                    setCustomModelId(e.target.value);
                    setCustomError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Display Label</label>
                <input 
                  type="text"
                  placeholder="e.g. DeepSeek Chat"
                  value={customModelName}
                  onChange={(e) => {
                    setCustomModelName(e.target.value);
                    setCustomError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Short Description</label>
                <input 
                  type="text"
                  placeholder="e.g. High efficiency chat and logic model"
                  value={customModelDesc}
                  onChange={(e) => setCustomModelDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none focus:border-zinc-700 font-mono text-[10px]"
                />
              </div>

              {customError && (
                <div className="text-rose-400 font-bold text-[9px] leading-tight">
                  ✕ {customError}
                </div>
              )}

              <button
                onClick={handleAddCustomModel}
                className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
              >
                <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
                Register Custom Model
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

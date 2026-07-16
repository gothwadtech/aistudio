import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Sliders, 
  Send, 
  Maximize2, 
  Layers, 
  Cpu, 
  Trash2,
  RefreshCw
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface ChatPlaygroundStudioProps {
  accentColor: string;
  onToggleSidebar?: () => void;
}

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  temperature: number;
  maxTokens: number;
  results: Array<{ id: string; name: string; checked: boolean; response: string; latency: string }>;
}

export default function ChatPlaygroundStudio({ accentColor, onToggleSidebar }: ChatPlaygroundStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showParametersPanel, setShowParametersPanel] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1280;
    }
    return true;
  });
  const [showLeftSidebar, setShowLeftSidebar] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  
  // Model Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  // Comparing Models
  const [modelsToCompare, setModelsToCompare] = useState([
    { id: "gemini", name: "Gemini 2.5 Flash", checked: true, response: "", latency: "" },
    { id: "llama", name: "Llama 3.3 70B", checked: true, response: "", latency: "" },
    { id: "deepseek", name: "DeepSeek R1", checked: true, response: "", latency: "" }
  ]);

  // History state loaded from localstorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_chat");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleToggleModel = (id: string) => {
    setModelsToCompare(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const handleClear = () => {
    setPrompt("");
    setModelsToCompare(prev => prev.map(m => ({ ...m, response: "", latency: "" })));
    setActiveHistoryId(null);
  };

  const handleNewSession = () => {
    setPrompt("");
    setModelsToCompare(prev => prev.map(m => ({ ...m, response: "", latency: "" })));
    setActiveHistoryId(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_chat");
    } catch (e) {}
    setActiveHistoryId(null);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setPrompt(item.prompt);
    setTemperature(item.temperature);
    setMaxTokens(item.maxTokens);
    setModelsToCompare(item.results);
  };

  const handleComparePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    // Set to Thinking state
    setModelsToCompare(prev => prev.map(m => m.checked ? { ...m, response: "Thinking...", latency: "" } : m));

    // Simulate parallel streaming of responses
    setTimeout(() => {
      const responses: Record<string, { text: string; latency: string }> = {
        gemini: {
          text: `Here is the quick response on **"${prompt}"** via Gemini 2.5 Flash:\n\n1. **Direct Action:** Let's focus on immediate execution.\n2. **Analysis:** This query can be broken down into speed-optimized components.\n3. **Summary:** Flash handles this with a balanced and highly coherent response instantly.`,
          latency: "0.34s"
        },
        llama: {
          text: `Analyzing your prompt **"${prompt}"** using Meta's Llama 3.3 70B:\n\n* **Comprehensive Synthesis:** Under the lens of highly parameterized models, this prompt suggests a request for clear structured definitions.\n* **Key Pillars:** High vocabulary richness, solid alignment, and step-by-step paragraphs.\n* **Conclusion:** Highly aligned output that provides great depth for general requests.`,
          latency: "0.78s"
        },
        deepseek: {
          text: `<thought>\nUser requested: "${prompt}".\nAnalyzing reasoning steps needed for a deep and structurally correct exploration...\nEvaluating prime considerations...\nDetermining most robust sequence...\n</thought>\n\nBased on deep step-by-step chain-of-thought analysis for **"${prompt}"**:\n\n* **Foundational Layer:** We must parse this systematically.\n* **Logical Flow:** The optimal reasoning path shows that a step-by-step breakdown satisfies the semantic truth constraints of this query perfectly.`,
          latency: "1.45s"
        }
      };

      const finalResults = modelsToCompare.map(m => {
        if (!m.checked) return { ...m, response: "", latency: "" };
        const sim = responses[m.id] || { text: "No response available.", latency: "0.5s" };
        return {
          ...m,
          response: sim.text,
          latency: sim.latency
        };
      });

      setModelsToCompare(finalResults);

      // Create history item
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: temperature,
        maxTokens: maxTokens,
        results: finalResults
      };

      const nextHistory = [newItem, ...history];
      setHistory(nextHistory);
      try {
        localStorage.setItem("gothwad_history_chat", JSON.stringify(nextHistory));
      } catch (e) {}
      setActiveHistoryId(newItem.id);

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 font-sans text-zinc-300 relative">
      {/* 1. Left Sidebar */}
      {showLeftSidebar && (
        <>
          {/* Backdrop overlay to close when clicking outside */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30"
            onClick={() => setShowLeftSidebar(false)}
          />
          <div className="absolute left-0 top-0 h-full z-40 shrink-0 shadow-2xl bg-zinc-900 border-r border-zinc-850">
            <LeftSidebar
              accentColor={accentColor}
              history={history}
              activeHistoryId={activeHistoryId}
              onSelectHistory={handleSelectHistory}
              onNewSession={handleNewSession}
              onClearHistory={handleClearHistory}
              onToggleSidebar={() => setShowLeftSidebar(false)}
            />
          </div>
        </>
      )}

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <GlobalStudioHeader
          title="AI Chat Playground"
          badge="SANDBOX WORKSPACE"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Main prompt input bar */}
          <form onSubmit={handleComparePrompt} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-3 flex gap-2 shrink-0">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask all compared models a question (e.g. 'What is the speed of light in water?')..."
              className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-600 text-zinc-100 transition-all outline-none"
            />
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 hover:bg-zinc-850 rounded-xl border border-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all"
              title="Clear Sandbox"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-5 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <span>{isGenerating ? "Comparing..." : "Submit to All"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Response Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[350px]">
            {modelsToCompare.map(m => {
              if (!m.checked) return null;
              return (
                <div key={m.id} className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col h-full min-h-[300px]">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span className="text-xs font-bold text-zinc-200">{m.name}</span>
                    </div>
                    {m.latency && (
                      <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-850 text-zinc-500 px-2 py-0.5 rounded">
                        Latency: {m.latency}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[400px]">
                    {m.response ? (
                      <div className="text-xs text-zinc-400 leading-relaxed font-sans whitespace-pre-line select-text">
                        {m.response.includes("<thought>") ? (
                          <div>
                            <div className="bg-zinc-950/80 border border-zinc-850 rounded-lg p-2.5 mb-2.5 font-mono text-[11px] text-zinc-500 leading-normal relative overflow-hidden">
                              <span className="text-[9px] uppercase font-bold text-amber-500/80 tracking-widest block mb-1">Reasoning Process</span>
                              {m.response.split("</thought>")[0].replace("<thought>", "")}
                            </div>
                            <div>{m.response.split("</thought>")[1]}</div>
                          </div>
                        ) : (
                          m.response
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <Sparkles className="w-6 h-6 text-zinc-750 mb-2" />
                        <span className="text-[10px] text-zinc-600">Pending instruction...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar */}
      {showParametersPanel && (
        <>
          {/* Backdrop overlay to close when clicking outside */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30"
            onClick={() => setShowParametersPanel(false)}
          />
          <div className="absolute right-0 top-0 h-full z-40 shrink-0 shadow-2xl bg-zinc-900 border-l border-zinc-850">
            <RightSidebar
              accentColor={accentColor}
              temperature={temperature}
              setTemperature={setTemperature}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              modelsToCompare={modelsToCompare}
              onToggleModel={handleToggleModel}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

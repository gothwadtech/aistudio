import React, { useState } from "react";
import { 
  Presentation, 
  Sparkles, 
  Layout, 
  Layers, 
  Play, 
  Download, 
  Trash2, 
  Plus, 
  Settings2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface PresentationStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

interface PresentationSession {
  id: string;
  prompt: string;
  template: string;
  slides: any[];
  timestamp: string;
}

export default function PresentationStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: PresentationStudioProps) {
  const [prompt, setPrompt] = useState("");
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
  const [template, setTemplate] = useState("tech_slate");
  const [slides, setSlides] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const templates = [
    { id: "tech_slate", name: "Modern Tech Slate", font: "font-sans", bg: "bg-zinc-900 border-zinc-850 text-zinc-100" },
    { id: "minimal_swiss", name: "Minimal Swiss Light", font: "font-sans", bg: "bg-white border-zinc-200 text-zinc-950" },
    { id: "editorial_warm", name: "Editorial Serif Warm", font: "font-serif", bg: "bg-amber-50/90 border-amber-100 text-amber-950" }
  ];

  // History state
  const [history, setHistory] = useState<PresentationSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_presentation");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleGenerateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setProgress(0);
    setSlides([]);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          // Set beautiful compiled slide sequence
          const results = [
            {
              title: "Gothwad AI: The Intelligence Engine",
              subtitle: "India's First Neural Auto-Routing Framework",
              layout: "hero",
              bullets: [
                "Intelligent semantic query parsing",
                "Dynamic cost and latency threshold balance",
                "Self-healing model routing fallback layers"
              ]
            },
            {
              title: "The Routing Challenge",
              subtitle: "The Fragmented LLM Landscape",
              layout: "split",
              bullets: [
                "Dilemma: High cost models vs low capability small models",
                "Inconsistent API endpoints & fluctuating token rates",
                "Need for zero-devops local and cloud abstraction"
              ]
            },
            {
              title: "Neural Solution Architecture",
              subtitle: "Multi-layered Router Mechanics",
              layout: "bullets",
              bullets: [
                "Layer 1: Semantic analyzer token classification",
                "Layer 2: Real-time cost database indexing",
                "Layer 3: Parallel stream orchestration & failovers"
              ]
            },
            {
              title: "Future Milestone Roadmap",
              subtitle: "The Road to 10M Dispatched Queries",
              layout: "timeline",
              bullets: [
                "Q3 2026: Sub-millisecond latency caching",
                "Q4 2026: Native voice websocket interfaces",
                "Q1 2027: Edge-routed offline neural models"
              ]
            }
          ];
          setSlides(results);
          setActiveSlideIndex(0);

          // Save session to history list
          const newItem: PresentationSession = {
            id: Date.now().toString(),
            prompt,
            template,
            slides: results,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const nextHistory = [newItem, ...history];
          setHistory(nextHistory);
          try {
            localStorage.setItem("gothwad_history_presentation", JSON.stringify(nextHistory));
          } catch (e) {}
          setActiveHistoryId(newItem.id);

          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
    }
  };

  const handleSelectHistory = (item: PresentationSession) => {
    setActiveHistoryId(item.id);
    setPrompt(item.prompt);
    setTemplate(item.template);
    setSlides(item.slides);
    setActiveSlideIndex(0);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setPrompt("");
    setSlides([]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_presentation");
    } catch (e) {}
    setActiveHistoryId(null);
  };

  const handleDiscard = () => {
    setSlides([]);
  };

  const activeSlide = slides[activeSlideIndex];
  const activeTemplateObj = templates.find(t => t.id === template) || templates[0];

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
              onToggleSidebar={() => {
                setShowLeftSidebar(false);
                if (isMobile) {
                  onToggleSidebar?.();
                }
              }}
              onBackToMain={onBackToMain}
            />
          </div>
        </>
      )}

      {/* 2. Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <GlobalStudioHeader
          title="Presentation AI"
          badge="SLIDE DECK BUILDER"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Form Block */}
          <form onSubmit={handleGenerateDeck} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex gap-2 shrink-0">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter presentation topic or slide outlines (e.g. 'Investor pitch deck explaining auto-routing engine startup')..."
              className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-650 text-zinc-100 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-5 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{generating ? `Compiling ${progress}%` : "Generate Deck"}</span>
            </button>
          </form>

          {slides.length > 0 ? (
            <div className="flex-1 flex flex-col gap-4 min-h-[350px]">
              {/* Slide Workspace Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Thumbnails list panel */}
                <div className="md:col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto max-h-[380px] no-scrollbar">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block mb-2">Slide Outlines</span>
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`text-left p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                        activeSlideIndex === idx 
                          ? "bg-zinc-900 text-zinc-100" 
                          : "bg-zinc-950/40 text-zinc-500 hover:bg-zinc-900/60"
                      }`}
                      style={{ borderColor: activeSlideIndex === idx ? accentColor : "transparent" }}
                    >
                      <span className="text-[10px] font-mono text-zinc-650">SLIDE {idx + 1}</span>
                      <span className="text-xs font-bold truncate leading-none">{s.title}</span>
                    </button>
                  ))}
                </div>

                {/* Main active slide render canvas */}
                <div className="md:col-span-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between">
                  
                  {/* Slide Container Frame with visual templates applied */}
                  <div className={`flex-1 rounded-xl p-8 border flex flex-col justify-center shadow-2xl relative overflow-hidden transition-all duration-300 min-h-[250px] ${activeTemplateObj.bg} ${activeTemplateObj.font}`}>
                    <div className="space-y-4 max-w-xl">
                      <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">Gothwad Presentation AI</span>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight leading-snug">{activeSlide.title}</h2>
                        <h3 className="text-sm opacity-70 mt-1 font-medium">{activeSlide.subtitle}</h3>
                      </div>

                      <ul className="space-y-2 pt-4">
                        {activeSlide.bullets.map((b: string, i: number) => (
                          <li key={i} className="text-xs leading-relaxed flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer tags */}
                    <div className="flex justify-between items-center text-[9px] opacity-40 font-mono mt-8 border-t border-zinc-500/20 pt-4">
                      <span>AUTO-ROUTING MATRIX</span>
                      <span>PAGE {activeSlideIndex + 1} OF {slides.length}</span>
                    </div>
                  </div>

                  {/* Navigator triggers bar */}
                  <div className="flex justify-between items-center mt-4 px-2 shrink-0">
                    <button
                      onClick={handlePrevSlide}
                      disabled={activeSlideIndex === 0}
                      className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-850 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev Slide</span>
                    </button>
                    <button
                      onClick={handleNextSlide}
                      disabled={activeSlideIndex === slides.length - 1}
                      className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-850 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Next Slide</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden min-h-[350px]">
              {generating ? (
                <div className="flex flex-col items-center justify-center gap-3.5 z-10">
                  <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" style={{ borderTopColor: accentColor }} />
                  <div className="text-center">
                    <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Structuring layout slides...</span>
                    <span className="text-[11px] text-zinc-500 font-mono mt-1 block">{progress}% compiled</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 z-10">
                  <Presentation className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                  <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Presentation AI Deck Builder</h3>
                  <p className="text-[11px] text-zinc-600 max-w-sm mx-auto mt-1 leading-normal">Describe your slide deck goals, and Gothwad AI automatically constructs fully formatted professional slides.</p>
                </div>
              )}
              
              {/* Ambient grid */}
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
            </div>
          )}
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
              templates={templates}
              template={template}
              setTemplate={setTemplate}
              hasSlides={slides.length > 0}
              onPresenterMode={() => {}}
              onExportPDF={() => {}}
              onDiscard={handleDiscard}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

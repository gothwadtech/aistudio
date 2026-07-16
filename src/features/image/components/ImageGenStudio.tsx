import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  Sparkles, 
  Sliders, 
  Compass, 
  Download, 
  Maximize2,
  Trash2,
  ChevronRight,
  Eye,
  Settings,
  RefreshCw,
  Cpu
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface ImageGenStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

interface ImageSession {
  id: string;
  prompt: string;
  negativePrompt: string;
  activeStyle: string;
  activeRatio: string;
  cfgScale: number;
  steps: number;
  generatedImage: string | null;
  timestamp: string;
}

export default function ImageGenStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: ImageGenStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
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
  const [activeStyle, setActiveStyle] = useState("cinematic");
  const [activeRatio, setActiveRatio] = useState("1:1");
  const [cfgScale, setCfgScale] = useState(7.5);
  const [steps, setSteps] = useState(30);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Sample Style Presets
  const styles = [
    { id: "cinematic", name: "Cinematic", desc: "Photorealistic lighting & detailed depth" },
    { id: "anime", name: "Anime Digital Art", desc: "Vibrant illustrations & clean linework" },
    { id: "cyberpunk", name: "Cyberpunk Glow", desc: "Neon atmosphere & futuristic accents" },
    { id: "3d", name: "3D Render", desc: "Raytraced octane-style claymation" },
    { id: "pixel", name: "Retro Pixel Art", desc: "Chiptune-styled grid art" }
  ];

  // Aspect Ratios
  const ratios = [
    { id: "1:1", label: "1:1 Square", desc: "Profile posts" },
    { id: "16:9", label: "16:9 Wide", desc: "Desktops & Landscapes" },
    { id: "9:16", label: "9:16 Portrait", desc: "Stories & Reels" },
    { id: "4:3", label: "4:3 Standard", desc: "Classic presentation" }
  ];

  // History state
  const [history, setHistory] = useState<ImageSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_image");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setProgress(0);
    setGeneratedImage(null);

    // Simulate diffusion progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          // Set a premium beautiful abstract Unsplash image based on chosen style
          let url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
          if (activeStyle === "anime") {
            url = "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop";
          } else if (activeStyle === "cyberpunk") {
            url = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop";
          } else if (activeStyle === "3d") {
            url = "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop";
          } else if (activeStyle === "pixel") {
            url = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop";
          }
          setGeneratedImage(url);

          // Save session to history list
          const newItem: ImageSession = {
            id: Date.now().toString(),
            prompt,
            negativePrompt,
            activeStyle,
            activeRatio,
            cfgScale,
            steps,
            generatedImage: url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const nextHistory = [newItem, ...history];
          setHistory(nextHistory);
          try {
            localStorage.setItem("gothwad_history_image", JSON.stringify(nextHistory));
          } catch (e) {}
          setActiveHistoryId(newItem.id);

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSelectHistory = (item: ImageSession) => {
    setActiveHistoryId(item.id);
    setPrompt(item.prompt);
    setNegativePrompt(item.negativePrompt);
    setActiveStyle(item.activeStyle);
    setActiveRatio(item.activeRatio);
    setCfgScale(item.cfgScale);
    setSteps(item.steps);
    setGeneratedImage(item.generatedImage);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setPrompt("");
    setNegativePrompt("");
    setGeneratedImage(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_image");
    } catch (e) {}
    setActiveHistoryId(null);
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
          title="Image Generator AI"
          badge="STABLE DIFFUSION"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Prompt Form block */}
          <form onSubmit={handleGenerate} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-4 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Prompt Input</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate in detail (e.g. 'A futuristic astronaut floating in a sea of cybernetic lotus flowers')..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs rounded-xl p-3 text-zinc-100 placeholder-zinc-650 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Negative Prompt</label>
                <textarea 
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="deformed hands, ugly, low resolution, blurry..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs rounded-xl p-3 text-zinc-100 placeholder-zinc-650 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={generating || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-2 px-6 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-indigo-600/10 active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{generating ? `Rendering ${progress}%` : "Generate Image"}</span>
              </button>
            </div>
          </form>

          {/* Canvas Rendering Screen */}
          <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden min-h-[350px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center gap-3.5 z-10">
                <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" style={{ borderTopColor: accentColor }} />
                <div className="text-center">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Generating via Stable Diffusion...</span>
                  <span className="text-[11px] text-zinc-500 font-mono mt-1 block">{progress}% compiled (CFG: {cfgScale}, Steps: {steps})</span>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="h-full w-full flex flex-col items-center justify-center animate-[fadeIn_0.25s_ease-out] z-10">
                <img 
                  src={generatedImage} 
                  alt="AI Generated Art" 
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] rounded-xl object-contain shadow-2xl border border-zinc-800" 
                />
                <div className="mt-4 flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generatedImage;
                      link.download = "gothwad_art.jpg";
                      link.click();
                    }}
                    className="p-2 px-4 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HD JPG</span>
                  </button>
                  <button 
                    onClick={() => setGeneratedImage(null)}
                    className="p-2 px-4 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 z-10">
                <ImageIcon className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Diffusion Canvas Frame</h3>
                <p className="text-[11px] text-zinc-600 max-w-sm mx-auto mt-1 leading-normal">Enter a prompt in the panel above, select style parameters on the right, and start generating premium digital artwork.</p>
              </div>
            )}
            
            {/* Ambient grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
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
              styles={styles}
              activeStyle={activeStyle}
              setActiveStyle={setActiveStyle}
              ratios={ratios}
              activeRatio={activeRatio}
              setActiveRatio={setActiveRatio}
              cfgScale={cfgScale}
              setCfgScale={setCfgScale}
              steps={steps}
              setSteps={setSteps}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

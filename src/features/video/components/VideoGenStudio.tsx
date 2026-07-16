import React, { useState } from "react";
import { 
  Video, 
  Sparkles, 
  Film, 
  Compass, 
  Play, 
  Pause,
  Download,
  Trash2,
  Sliders,
  Maximize2
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface VideoGenStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

interface VideoSession {
  id: string;
  prompt: string;
  motion: string;
  duration: string;
  motionStrength: number;
  fps: string;
  videoUrl: string | null;
  timestamp: string;
}

export default function VideoGenStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: VideoGenStudioProps) {
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
  const [motion, setMotion] = useState("pan_right");
  const [duration, setDuration] = useState("4s");
  const [motionStrength, setMotionStrength] = useState(5);
  const [fps, setFps] = useState("30");

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const motions = [
    { id: "zoom_in", name: "Zoom In", desc: "Smooth forward tracking shot" },
    { id: "pan_right", name: "Pan Right", desc: "Horizontal sweeping motion" },
    { id: "tilt_up", name: "Tilt Up", desc: "Ascending vertical panning" },
    { id: "roll", name: "Camera Roll", desc: "Creative rotational camera frame" }
  ];

  // History state
  const [history, setHistory] = useState<VideoSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_video");
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
    setVideoUrl(null);
    setPlaying(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          // High-quality atmospheric video placeholder (abstract visual loop)
          const url = "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-at-night-40134-large.mp4";
          setVideoUrl(url);

          // Save session to history list
          const newItem: VideoSession = {
            id: Date.now().toString(),
            prompt,
            motion,
            duration,
            motionStrength,
            fps,
            videoUrl: url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const nextHistory = [newItem, ...history];
          setHistory(nextHistory);
          try {
            localStorage.setItem("gothwad_history_video", JSON.stringify(nextHistory));
          } catch (e) {}
          setActiveHistoryId(newItem.id);

          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleSelectHistory = (item: VideoSession) => {
    setActiveHistoryId(item.id);
    setPrompt(item.prompt);
    setMotion(item.motion);
    setDuration(item.duration);
    setMotionStrength(item.motionStrength);
    setFps(item.fps);
    setVideoUrl(item.videoUrl);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setPrompt("");
    setVideoUrl(null);
    setPlaying(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_video");
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
          title="Video Generator AI"
          badge="CINEMATIC DYNAMICS"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Prompt Entry block */}
          <form onSubmit={handleGenerate} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex gap-2 shrink-0">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the cinematic scene and path details (e.g. 'Slow motion cinematic drone flyby of a glowing temple, neon fog')..."
              className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-600 text-zinc-100 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-5 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{generating ? `Rendering ${progress}%` : "Generate Video"}</span>
            </button>
          </form>

          {/* Interactive Player Frame */}
          <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden min-h-[350px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center gap-3.5 z-10">
                <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" style={{ borderTopColor: accentColor }} />
                <div className="text-center">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Compiling motion frames...</span>
                  <span className="text-[11px] text-zinc-500 font-mono mt-1 block">{progress}% rendered ({fps}fps, motion strength: {motionStrength})</span>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="h-full w-full flex flex-col items-center justify-center animate-[fadeIn_0.25s_ease-out] z-10">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  muted
                  className="max-h-[360px] max-w-2xl w-full rounded-xl object-cover shadow-2xl border border-zinc-800" 
                />
                <div className="mt-4 flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = videoUrl;
                      link.target = "_blank";
                      link.click();
                    }}
                    className="p-2 px-4 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>
                  <button 
                    onClick={() => setVideoUrl(null)}
                    className="p-2 px-4 bg-zinc-950 hover:bg-zinc-850 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Clip</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 z-10">
                <Film className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Cinematic Video Sequencer Frame</h3>
                <p className="text-[11px] text-zinc-600 max-w-sm mx-auto mt-1 leading-normal">Type a cinematic scene description, select a panning camera path on the right, and compile dynamic HD clips.</p>
              </div>
            )}
            
            {/* Grid overlay */}
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
              motions={motions}
              motion={motion}
              setMotion={setMotion}
              duration={duration}
              setDuration={setDuration}
              motionStrength={motionStrength}
              setMotionStrength={setMotionStrength}
              fps={fps}
              setFps={setFps}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

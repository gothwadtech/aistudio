import React, { useState, useEffect, useRef } from "react";
import { 
  Music, 
  Sparkles, 
  Volume2, 
  Sliders, 
  Play, 
  Pause, 
  Download, 
  Trash2,
  ListMusic,
  Compass,
  Disc
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface AudioGenStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

interface AudioSession {
  id: string;
  prompt: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  trackUrl: string | null;
  timestamp: string;
}

export default function AudioGenStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: AudioGenStudioProps) {
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
  const [genre, setGenre] = useState("ambient_cyber");
  const [bpm, setBpm] = useState(110);
  const [musicalKey, setMusicalKey] = useState("C Minor");

  // Mixers State
  const [drumLevel, setDrumLevel] = useState(85);
  const [bassLevel, setBassLevel] = useState(70);
  const [synthLevel, setSynthLevel] = useState(90);
  const [vocalLevel, setVocalLevel] = useState(40);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackUrl, setTrackUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [spectrum, setSpectrum] = useState<number[]>(Array(24).fill(5));
  const animRef = useRef<any>(null);

  const genres = [
    { id: "ambient_cyber", name: "Ambient Cyber", desc: "Drone textures & ethereal chords" },
    { id: "synthwave", name: "Outrun Synthwave", desc: "Retro 80s basslines & neon drums" },
    { id: "lofi", name: "Lofi Beats", desc: "Chill jazzy samples & crackle vinyl" },
    { id: "industrial", name: "Industrial Tech", desc: "Heavy mechanical drums & dark syncs" }
  ];

  // History state
  const [history, setHistory] = useState<AudioSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_audio");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Frequency spectrum animation
  useEffect(() => {
    if (playing) {
      const updateSpectrum = () => {
        setSpectrum(prev => prev.map(() => Math.floor(Math.random() * 45) + 5));
        animRef.current = requestAnimationFrame(updateSpectrum);
      };
      animRef.current = requestAnimationFrame(updateSpectrum);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setSpectrum(Array(24).fill(5));
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [playing]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setProgress(0);
    setTrackUrl(null);
    setPlaying(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          // Standard mock beat audio link
          const source = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
          setTrackUrl(source);

          // Save session to history list
          const newItem: AudioSession = {
            id: Date.now().toString(),
            prompt,
            genre,
            bpm,
            musicalKey,
            trackUrl: source,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const nextHistory = [newItem, ...history];
          setHistory(nextHistory);
          try {
            localStorage.setItem("gothwad_history_audio", JSON.stringify(nextHistory));
          } catch (e) {}
          setActiveHistoryId(newItem.id);

          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  const togglePlayback = () => {
    setPlaying(!playing);
  };

  const handleSelectHistory = (item: AudioSession) => {
    setActiveHistoryId(item.id);
    setPrompt(item.prompt);
    setGenre(item.genre);
    setBpm(item.bpm);
    setMusicalKey(item.musicalKey);
    setTrackUrl(item.trackUrl);
    setPlaying(false);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setPrompt("");
    setTrackUrl(null);
    setPlaying(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_audio");
    } catch (e) {}
    setActiveHistoryId(null);
  };

  const handleDiscard = () => {
    setTrackUrl(null);
    setPlaying(false);
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
          title="Audio Generator AI"
          badge="NEURAL AUDIO SYNTHESIS"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Form objectives entry */}
          <form onSubmit={handleGenerate} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex gap-2 shrink-0">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your target musical vibe (e.g. 'Chill lo-fi study beat with warm chords')..."
              className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-650 text-zinc-100 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-5 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{generating ? `Synthesizing ${progress}%` : "Synthesize Music Track"}</span>
            </button>
          </form>

          {/* Waveform Player view container */}
          <div className="flex-1 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden min-h-[300px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center gap-3.5 z-10 animate-pulse">
                <div className="w-14 h-14 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" style={{ borderTopColor: accentColor }} />
                <div className="text-center">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Synthesizing audio buffers...</span>
                  <span className="text-[11px] text-zinc-500 font-mono mt-1 block">{progress}% rendered ({bpm} BPM, Key: {musicalKey})</span>
                </div>
              </div>
            ) : trackUrl ? (
              <div className="h-full w-full flex flex-col items-center justify-center z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 ${playing ? "animate-spin-slow" : ""}`}>
                    <Disc className="w-7 h-7 text-indigo-400" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">Gothwad Neural Track</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{bpm} BPM • Diatonic {musicalKey} • Synth Mix</p>
                  </div>
                </div>

                {/* Simulated Audio Spectrum Visualizer */}
                <div className="flex items-end justify-center gap-1 h-14 w-full max-w-xs mb-6">
                  {spectrum.map((h, index) => (
                    <div 
                      key={index} 
                      className="w-1.5 rounded-full bg-indigo-500/80 transition-all duration-75" 
                      style={{ 
                        height: `${h}%`,
                        backgroundColor: accentColor
                      }} 
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={togglePlayback}
                    className="p-2 px-4 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: accentColor }}
                  >
                    {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{playing ? "Pause Stream" : "Play Track"}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = trackUrl;
                      link.download = "gothwad_synth_mix.mp3";
                      link.click();
                    }}
                    className="p-2 px-4 rounded-xl border border-zinc-850 bg-zinc-950 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Download MP3</span>
                  </button>
                  <button 
                    onClick={handleDiscard}
                    className="p-2 px-4 rounded-xl border border-rose-950/20 bg-rose-950/5 hover:bg-rose-950/10 text-xs font-semibold text-rose-400 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Discard Mix</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 z-10 animate-fade-in">
                <ListMusic className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Audio Synthesizer Frame</h3>
                <p className="text-[11px] text-zinc-650 max-w-sm mx-auto mt-1 leading-normal">Describe your melody goals, adjust the percussion sliders on the right, and generate high-fidelity MP3 tracks.</p>
              </div>
            )}
            
            {/* Ambient grid */}
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
              genres={genres}
              genre={genre}
              setGenre={setGenre}
              drumLevel={drumLevel}
              setDrumLevel={setDrumLevel}
              bassLevel={bassLevel}
              setBassLevel={setBassLevel}
              synthLevel={synthLevel}
              setSynthLevel={setSynthLevel}
              vocalLevel={vocalLevel}
              setVocalLevel={setVocalLevel}
              bpm={bpm}
              setBpm={setBpm}
              musicalKey={musicalKey}
              setMusicalKey={setMusicalKey}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

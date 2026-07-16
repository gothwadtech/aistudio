import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Settings2, 
  Sparkles, 
  ChevronRight, 
  Globe, 
  HelpCircle,
  Play,
  Activity
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

interface VoiceStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

interface VoiceSession {
  id: string;
  timestamp: string;
  voiceModel: string;
  micGain: number;
  speechSpeed: number;
  transcripts: Array<{ role: string; text: string; time: string }>;
}

export default function VoiceStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: VoiceStudioProps) {
  const [isActive, setIsActive] = useState(false);
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
  const [voiceModel, setVoiceModel] = useState("neural_female");
  const [micGain, setMicGain] = useState(80);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  
  const [transcripts, setTranscripts] = useState<any[]>([
    { role: "assistant", text: "Hello! I am Gothwad Voice Assistant. Tap the microphone to start our dialogue.", time: "Just now" }
  ]);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(30).fill(15));
  const animationRef = useRef<any>(null);

  // History state
  const [history, setHistory] = useState<VoiceSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_voice");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Animate speech waveform bars when voice is active
  useEffect(() => {
    if (isActive) {
      const updateWaveform = () => {
        setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 45) + 5));
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      animationRef.current = requestAnimationFrame(updateWaveform);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setWaveformBars(Array(30).fill(10));
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  // Handle active session save when dialogue grows
  useEffect(() => {
    if (transcripts.length > 1) {
      const existing = history.find(h => h.id === activeHistoryId);
      if (existing) {
        // Update current session transcripts
        const updated = history.map(h => h.id === activeHistoryId ? { ...h, transcripts } : h);
        setHistory(updated);
        try {
          localStorage.setItem("gothwad_history_voice", JSON.stringify(updated));
        } catch (e) {}
      } else {
        // Create new history session
        const session: VoiceSession = {
          id: activeHistoryId || Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          voiceModel,
          micGain,
          speechSpeed,
          transcripts
        };
        setActiveHistoryId(session.id);
        const updated = [session, ...history];
        setHistory(updated);
        try {
          localStorage.setItem("gothwad_history_voice", JSON.stringify(updated));
        } catch (e) {}
      }
    }
  }, [transcripts]);

  const handleToggleMic = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      // Simulate real conversational transcripts after a few seconds
      setTimeout(() => {
        setTranscripts(prev => [
          ...prev, 
          { role: "user", text: "Can you analyze my current project workspace?", time: "1.2s ago" }
        ]);
        
        setTimeout(() => {
          setTranscripts(prev => [
            ...prev, 
            { role: "assistant", text: "Analyzing your environment... I've detected a React Vite build pipeline with 10 feature domains. It looks complete and highly optimal.", time: "0.2s ago" }
          ]);
        }, 1500);
      }, 1500);
    }
  };

  const handleSelectHistory = (item: VoiceSession) => {
    setActiveHistoryId(item.id);
    setVoiceModel(item.voiceModel);
    setMicGain(item.micGain);
    setSpeechSpeed(item.speechSpeed);
    setTranscripts(item.transcripts);
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setIsActive(false);
    setTranscripts([
      { role: "assistant", text: "Hello! I am Gothwad Voice Assistant. Tap the microphone to start our dialogue.", time: "Just now" }
    ]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_voice");
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
          title="Voice Assistant AI"
          badge="REALTIME STREAM"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Wave visualizer card */}
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[220px] shrink-0">
            {/* Glowing active circle */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl relative ${
                isActive 
                  ? "bg-red-500 text-white shadow-red-500/30 scale-105" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
              style={{ backgroundColor: isActive ? "#ef4444" : accentColor }}
            >
              {isActive ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                  <MicOff className="w-10 h-10" />
                </>
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            <span className="text-xs font-mono tracking-wider font-semibold mt-4 text-zinc-400 uppercase">
              {isActive ? "Voice Channel Connected - Listening..." : "TAP TO CONVERSE"}
            </span>

            {/* Neural Waveform visualization */}
            <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-sm mt-6">
              {waveformBars.map((h, index) => (
                <div 
                  key={index} 
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isActive ? "bg-indigo-500/80" : "bg-zinc-800"
                  }`} 
                  style={{ 
                    height: `${h}%`,
                    backgroundColor: isActive ? accentColor : undefined
                  }} 
                />
              ))}
            </div>
          </div>

          {/* Duplex transcript dialogue feed */}
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex-1 flex flex-col overflow-hidden min-h-[250px]">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>WebRTC Duplex Dialogue Log</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
              {transcripts.map((t, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    t.role === "user" 
                      ? "ml-auto bg-zinc-900 text-zinc-300 border border-zinc-850" 
                      : "bg-zinc-950 text-zinc-400 border border-zinc-900"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-[10px] text-zinc-500 font-mono">
                    <span className="font-bold uppercase tracking-wider">{t.role === "user" ? "You" : "Gothwad Voice AI"}</span>
                    <span>{t.time}</span>
                  </div>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
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
              voiceModel={voiceModel}
              setVoiceModel={setVoiceModel}
              micGain={micGain}
              setMicGain={setMicGain}
              speechSpeed={speechSpeed}
              setSpeechSpeed={setSpeechSpeed}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

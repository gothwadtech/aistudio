import React, { useRef, useState } from "react";
import { 
  Send, Cpu, Sliders, RotateCcw, LayoutGrid, Mic, PlusCircle,
  Cloud, UploadCloud, Camera, Youtube, Image, CheckCircle,
  BookOpen, Bug, FileText, X, CheckCircle2, AlertCircle, Paperclip,
  Layers, Bot, Palette
} from "lucide-react";
import { GrixFileNode } from "../types/github";

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInputBarProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  onSend: (customPrompt?: string) => void;
  selectedModel: string;
  accentColor: string;
  
  // Custom Media / Playground specific options
  customMediaActions?: boolean;
  onAttachmentTrigger?: (sourceName: string) => void;
  temperature?: number;
  maxTokens?: number;
  
  // Software companion/Mode specific options
  quickModes?: boolean;
  selectedAgent?: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  setSelectedAgent?: (val: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer") => void;
  agents?: any;
  activeFile?: GrixFileNode | null;
  popularModels?: Array<{ value: string; label: string; provider?: string }>;
  onModelChange?: (val: string) => void;
  attachedFiles?: AttachedFile[];
  setAttachedFiles?: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  keyStatus?: "custom" | "server" | "missing";
}

export default function ChatInputBar({
  input,
  setInput,
  isLoading,
  onSend,
  selectedModel,
  accentColor,
  
  customMediaActions = false,
  onAttachmentTrigger,
  temperature,
  maxTokens,
  
  quickModes = false,
  selectedAgent,
  setSelectedAgent,
  agents,
  activeFile,
  popularModels,
  onModelChange,
  attachedFiles = [],
  setAttachedFiles,
  keyStatus
}: ChatInputBarProps) {
  
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleFileAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setAttachedFiles) return;

    if (file.size > 250000) {
      alert("⚠️ File is too large. Please select a code file smaller than 250KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newFile: AttachedFile = {
        name: file.name,
        content: content || ""
      };
      setAttachedFiles((prev) => {
        if (prev.some((f) => f.name === file.name)) return prev;
        return [...prev, newFile];
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const removeAttachedFile = (name: string) => {
    if (setAttachedFiles) {
      setAttachedFiles((prev) => prev.filter((f) => f.name !== name));
    }
  };

  const handleMediaTrigger = (sourceName: string) => {
    if (onAttachmentTrigger) {
      onAttachmentTrigger(sourceName);
    }
    setShowAttachmentMenu(false);
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Quick contextual command shortcuts (Software mode) */}
      {activeFile && onSend && (
        <div className="px-3 py-1.5 bg-zinc-940 border-t border-zinc-900 flex gap-2 overflow-x-auto no-scrollbar select-none">
          <button
            disabled={isLoading}
            onClick={() => onSend(`Explain the contents of this active file: ${activeFile.name}. Give a clear, detailed breakdown.`)}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[9px] font-mono text-zinc-400 rounded border border-zinc-850 hover:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <BookOpen className="w-2.5 h-2.5 text-emerald-500" />
            <span>Explain File</span>
          </button>
          <button
            disabled={isLoading}
            onClick={() => onSend(`Audit and scan the active file: ${activeFile.name} for bugs, edge-cases, memory leaks, or logical errors. Suggest direct code fixes.`)}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[9px] font-mono text-zinc-400 rounded border border-zinc-850 hover:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Bug className="w-2.5 h-2.5 text-rose-500" />
            <span>Find Bugs</span>
          </button>
        </div>
      )}

      {/* 2. Attached files list (Software mode) */}
      {attachedFiles.length > 0 && (
        <div className="px-3 py-1.5 bg-zinc-950 border-t border-zinc-900 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
          {attachedFiles.map((file) => (
            <div 
              key={file.name}
              className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-mono px-2 py-0.5 rounded-full select-none"
            >
              <FileText className="w-2.5 h-2.5 text-indigo-400" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button 
                onClick={() => removeAttachedFile(file.name)}
                className="hover:text-red-400 transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Segmented quick agent selection panel (Software mode) */}
      {quickModes && selectedAgent && setSelectedAgent && (
        <div className="px-3 py-1.5 bg-zinc-940 border-t border-zinc-900 flex items-center justify-between gap-1">
          <span className="text-[8.5px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Quick Modes:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedAgent("planner")}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedAgent === "planner" 
                  ? "bg-blue-950/40 text-blue-400 border border-blue-800/40 font-bold scale-[1.02]" 
                  : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Planner</span>
            </button>
            <button
              onClick={() => setSelectedAgent("agentic")}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedAgent === "agentic" 
                  ? "bg-pink-950/40 text-pink-400 border border-pink-800/40 font-bold scale-[1.02]" 
                  : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <Bot className="w-2.5 h-2.5" />
              <span>Agentic</span>
            </button>
            <button
              onClick={() => setSelectedAgent("designer")}
              className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedAgent === "designer" 
                  ? "bg-teal-950/40 text-teal-400 border border-teal-800/40 font-bold scale-[1.02]" 
                  : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <Palette className="w-2.5 h-2.5" />
              <span>UI Designer</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Textarea Box container */}
      <div className="p-3 bg-zinc-955 border-t border-zinc-900 shrink-0">
        <div className="max-w-3xl mx-auto w-full border border-zinc-850 bg-zinc-900/40 focus-within:border-zinc-800 focus-within:bg-zinc-900/60 transition-all rounded-2xl p-3 flex flex-col space-y-2.5 shadow-lg relative">
          
          {/* Main prompt input */}
          <textarea
            rows={customMediaActions ? 3 : 2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              agents && selectedAgent && agents[selectedAgent]
                ? `Message ${agents[selectedAgent].name}...`
                : "Start typing a prompt..."
            }
            disabled={isLoading}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-550 text-xs font-sans focus:outline-none resize-none select-text leading-relaxed no-scrollbar"
          />

          {/* Interactive options row footer */}
          <div className="flex items-center justify-between border-t border-zinc-850/50 pt-2 shrink-0 select-none">
            
            {/* LEFT controls */}
            <div className="flex items-center gap-1.5 relative">
              {/* Reset Input */}
              <button
                onClick={() => setInput("")}
                disabled={!input}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                title="Clear Input"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Grid / Extra icons if Playground Media Actions enabled */}
              {customMediaActions && (
                <>
                  <button
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                    title="Grid visual aids"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMediaTrigger("Audio Recorder Microphone")}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                    title="Record audio prompt input"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Local Code File Attach (Software companion mode) */}
              {!customMediaActions && setAttachedFiles && (
                <>
                  <button
                    type="button"
                    onClick={handleFileAttachClick}
                    disabled={isLoading}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                    title="Attach code file from local disk"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.js,.ts,.tsx,.jsx,.html,.css,.json,.md,.xml"
                  />
                </>
              )}

              {/* Plus Circle Media Attachment dropdown */}
              {customMediaActions && (
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                    title="Insert media & workspace objects"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  {showAttachmentMenu && (
                    <div className="absolute bottom-9 left-0 bg-zinc-950 border border-zinc-850 rounded-xl p-1.5 w-44 shadow-2xl z-50 flex flex-col font-sans text-[10.5px]">
                      <button
                        onClick={() => handleMediaTrigger("Google Drive")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <Cloud className="w-3.5 h-3.5 text-blue-400" />
                        <span>Google Drive</span>
                      </button>
                      <button
                        onClick={() => handleMediaTrigger("File Upload")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Files</span>
                      </button>
                      <button
                        onClick={() => handleMediaTrigger("Audio Recorder")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5 text-rose-400" />
                        <span>Record Audio</span>
                      </button>
                      <button
                        onClick={() => handleMediaTrigger("Camera Feed")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Camera Feed</span>
                      </button>
                      <button
                        onClick={() => handleMediaTrigger("YouTube Video Link")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>YouTube Video</span>
                      </button>
                      <button
                        onClick={() => handleMediaTrigger("Sample Mock Media")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-zinc-350 hover:text-white hover:bg-zinc-900 rounded-lg text-left cursor-pointer transition-colors"
                      >
                        <Image className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sample Media</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Model Selector dropdown (inside footer) */}
              {!customMediaActions && popularModels && onModelChange && (
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-900 border border-zinc-850 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 hover:text-zinc-200 outline-none cursor-pointer max-w-[130px]"
                  title="Quick model selection"
                >
                  {popularModels.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label.replace(" (Free)", "").replace(" (Standard)", "")}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* RIGHT Send/Key Status actions */}
            <div className="flex items-center gap-1.5">
              {/* Key status badges */}
              {keyStatus === "custom" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30" title="Custom OpenRouter key active">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="hidden sm:inline">Custom Key</span>
                </span>
              )}
              {keyStatus === "server" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-blue-400 bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-900/30" title="Host environment key active">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
                  <span className="hidden sm:inline">Server Key</span>
                </span>
              )}
              {keyStatus === "missing" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30" title="Key missing">
                  <AlertCircle className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  <span className="hidden sm:inline">Key Missing</span>
                </span>
              )}

              {/* Run / Send trigger button */}
              {customMediaActions ? (
                <button
                  onClick={() => onSend()}
                  disabled={!input.trim() || isLoading}
                  className="py-1.5 px-4 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all active:scale-95 cursor-pointer shrink-0"
                  style={{
                    backgroundColor: input.trim() ? accentColor : "#18181b",
                    color: input.trim() ? "#ffffff" : "#52525b"
                  }}
                >
                  Run
                </button>
              ) : (
                <button
                  onClick={() => onSend()}
                  disabled={!input.trim() || isLoading}
                  className={`p-1.5 rounded-lg transition-all ${
                    input.trim() && !isLoading
                      ? "bg-zinc-800 text-zinc-100 hover:scale-105 active:scale-95 cursor-pointer"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  style={{ backgroundColor: input.trim() && !isLoading ? accentColor : undefined }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Outer label indicators */}
        <div className="max-w-3xl mx-auto flex justify-between items-center text-[8.5px] font-mono text-zinc-650 mt-1.5 px-1.5 select-none">
          {customMediaActions ? (
            <>
              <span>Model: {selectedModel}</span>
              {typeof temperature === "number" && typeof maxTokens === "number" && (
                <span>Temp: {temperature} • Tokens: {maxTokens}</span>
              )}
            </>
          ) : (
            <>
              <span>Shift+Enter for newline</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-zinc-600" />
                <span className="truncate max-w-[150px]">{selectedModel}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

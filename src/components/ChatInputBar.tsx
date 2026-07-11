import React, { useRef, useState } from "react";
import { 
  Send, Cpu, Sliders, RotateCcw, LayoutGrid, Mic, PlusCircle,
  Cloud, UploadCloud, Camera, Youtube, Image, CheckCircle,
  BookOpen, Bug, FileText, X, CheckCircle2, AlertCircle, Paperclip,
  Layers, Bot, Palette, Sparkles, Loader2, HelpCircle
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
  const [isFocused, setIsFocused] = useState(false);
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
    <div className="flex flex-col w-full relative z-20 px-4 pb-4 bg-transparent select-none">
      
      {/* 1. Quick contextual command shortcuts (Software mode) with glass design */}
      {activeFile && onSend && (
        <div className="max-w-3xl mx-auto w-full mb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 shrink-0">
            File Actions ({activeFile.name}):
          </span>
          <button
            disabled={isLoading}
            onClick={() => onSend(`Explain the contents of this active file: ${activeFile.name}. Give a clear, detailed breakdown.`)}
            className="px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-850/80 text-[10px] font-mono text-zinc-300 rounded-xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Explain File</span>
          </button>
          <button
            disabled={isLoading}
            onClick={() => onSend(`Audit and scan the active file: ${activeFile.name} for bugs, edge-cases, memory leaks, or logical errors. Suggest direct code fixes.`)}
            className="px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-850/80 text-[10px] font-mono text-zinc-300 rounded-xl border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-xs"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">Audit Bugs</span>
          </button>
        </div>
      )}

      {/* 2. Attached files list styled like high-end visual pills */}
      {attachedFiles.length > 0 && (
        <div className="max-w-3xl mx-auto w-full mb-2.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
          {attachedFiles.map((file) => (
            <div 
              key={file.name}
              className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 text-[10px] font-mono px-3 py-1 rounded-full shadow-sm animate-fade-in shrink-0 select-none"
            >
              <FileText className="w-3 h-3 text-indigo-400" />
              <span className="font-medium max-w-[150px] truncate">{file.name}</span>
              <button 
                onClick={() => removeAttachedFile(file.name)}
                className="p-0.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Textarea Box Console container */}
      <div className="max-w-3xl mx-auto w-full relative">
        {/* Glow backdrop based on focus or state */}
        <div 
          className="absolute -inset-1 rounded-2xl opacity-15 blur-lg transition-all duration-300"
          style={{ 
            backgroundColor: isFocused ? accentColor : "transparent",
            transform: isFocused ? "scale(1.01)" : "scale(0.98)"
          }}
        />

        {/* Console Box Outer Border & Fill */}
        <div 
          className={`relative border rounded-2xl bg-zinc-900/60 backdrop-blur-lg p-3 flex flex-col space-y-2.5 transition-all duration-300 ${
            isFocused 
              ? "border-zinc-700/85 bg-zinc-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.45)]" 
              : "border-zinc-850/80 bg-zinc-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          }`}
          style={{
            borderColor: isFocused ? `${accentColor}55` : undefined,
            boxShadow: isFocused ? `0 0 25px ${accentColor}10` : undefined
          }}
        >
          {/* Main prompt input */}
          <textarea
            rows={1.8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              agents && selectedAgent && agents[selectedAgent]
                ? `Ask ${agents[selectedAgent].name} anything...`
                : "Type a detailed prompt or use '/' for controls..."
            }
            disabled={isLoading}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-xs sm:text-[12.5px] font-sans focus:outline-none resize-none select-text leading-relaxed no-scrollbar"
            style={{ minHeight: "38px" }}
          />

          {/* Dynamic Footer Controls Row */}
          <div className="flex items-center justify-between border-t border-zinc-850/40 pt-2 shrink-0 select-none">
            
            {/* Left Controls Bar */}
            <div className="flex items-center gap-1.5 relative">
              
              {/* Reset Input Action */}
              <button
                onClick={() => setInput("")}
                disabled={!input}
                className="p-2 bg-zinc-950/80 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-850/80 rounded-xl disabled:opacity-20 disabled:hover:bg-zinc-950/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                title="Clear current input"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Extra visual indicators if custom media active */}
              {customMediaActions && (
                <>
                  <button
                    className="p-2 bg-zinc-950/80 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-850/80 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Grid Overlay Layout"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMediaTrigger("Audio Recorder Microphone")}
                    className="p-2 bg-zinc-950/80 hover:bg-zinc-850/80 text-zinc-400 hover:text-zinc-200 border border-zinc-850/80 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Record voice instruction"
                  >
                    <Mic className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </>
              )}

              {/* File Attachment logic for Software companion Mode */}
              {!customMediaActions && setAttachedFiles && (
                <>
                  <button
                    type="button"
                    onClick={handleFileAttachClick}
                    disabled={isLoading}
                    className="p-2 bg-zinc-950/80 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-850/80 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Attach local file (up to 250KB)"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
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

              {/* Media Hub Plus circle launcher */}
              {customMediaActions && (
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className={`p-2 border rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 ${
                      showAttachmentMenu 
                        ? "bg-zinc-800/90 text-white border-zinc-700" 
                        : "bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border-zinc-850/80"
                    }`}
                    title="Media Attachment Hub"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>

                  {showAttachmentMenu && (
                    <>
                      {/* overlay to close dropdown */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAttachmentMenu(false)}
                      />
                      <div className="absolute bottom-11 left-0 bg-zinc-950 border border-zinc-800/95 rounded-2xl p-1.5 w-48 shadow-2xl z-50 flex flex-col font-sans text-[11px] animate-[slideInUp_0.15s_ease-out]">
                        <div className="px-2.5 py-1 text-[8px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 border-b border-zinc-900 mb-1">
                          Workspace Tools
                        </div>
                        <button
                          onClick={() => handleMediaTrigger("Google Drive")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-medium">Google Drive Sync</span>
                        </button>
                        <button
                          onClick={() => handleMediaTrigger("File Upload")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium">Direct File Upload</span>
                        </button>
                        <button
                          onClick={() => handleMediaTrigger("Audio Recorder")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="font-medium">Record Audio Memo</span>
                        </button>
                        <button
                          onClick={() => handleMediaTrigger("Camera Feed")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-medium">Live Camera Feed</span>
                        </button>
                        <button
                          onClick={() => handleMediaTrigger("YouTube Video Link")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="font-medium">Import YouTube Notes</span>
                        </button>
                        <button
                          onClick={() => handleMediaTrigger("Sample Mock Media")}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl text-left cursor-pointer transition-colors"
                        >
                          <Image className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium">Preload Demo Assets</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Dropdown Quick Selector for active file engine */}
              {!customMediaActions && popularModels && onModelChange && (
                <div className="relative flex gap-1.5">
                  <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    disabled={isLoading}
                    className="bg-zinc-950/85 border border-zinc-850/80 rounded-xl px-2.5 py-1.5 text-[9.5px] font-mono text-zinc-400 hover:text-zinc-200 outline-none cursor-pointer max-w-[140px] select-none shadow-sm transition-all focus:border-zinc-700"
                    title="Choose runtime engine"
                  >
                    {popularModels.map((m) => (
                      <option key={m.value} value={m.value} className="bg-zinc-950">
                        {m.label.replace(" (Free)", "").replace(" (Standard)", "")}
                      </option>
                    ))}
                  </select>

                  {agents && selectedAgent && setSelectedAgent && (
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value as any)}
                      disabled={isLoading}
                      className="bg-zinc-950/85 border border-zinc-850/80 rounded-xl px-2.5 py-1.5 text-[9.5px] font-mono text-zinc-400 hover:text-zinc-200 outline-none cursor-pointer max-w-[130px] select-none shadow-sm transition-all focus:border-zinc-700"
                      title="Choose expert agent focus"
                    >
                      {Object.keys(agents).map((key) => (
                        <option key={key} value={key} className="bg-zinc-950 text-zinc-300">
                          {agents[key].name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Right Controls Bar & Trigger actions */}
            <div className="flex items-center gap-2 select-none">
              
              {/* API and server authentication indicators */}
              {keyStatus === "custom" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded-lg border border-emerald-900/30 shadow-xs" title="Custom secure access key activated">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">CUSTOM KEY</span>
                </span>
              )}
              {keyStatus === "server" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-blue-400 bg-blue-950/20 px-2 py-1 rounded-lg border border-blue-900/30 shadow-xs" title="Dedicated sandbox runtime key active">
                  <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                  <span className="hidden sm:inline">SANDBOX SECURE</span>
                </span>
              )}
              {keyStatus === "missing" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-red-400 bg-red-950/25 px-2 py-1 rounded-lg border border-red-900/30 animate-pulse" title="Please configure access keys in settings or workspace rules">
                  <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                  <span className="hidden sm:inline">ACCESS KEY MISSING</span>
                </span>
              )}

              {/* Main execution send capsule trigger */}
              {isLoading ? (
                <div 
                  className="px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-400 border border-zinc-750 font-mono text-[9.5px] font-bold"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accentColor }} />
                  <span className="hidden xs:inline">Thinking</span>
                </div>
              ) : customMediaActions ? (
                <button
                  onClick={() => onSend()}
                  disabled={!input.trim()}
                  className="py-1.5 px-4.5 rounded-xl text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shrink-0 shadow-lg flex items-center gap-1"
                  style={{
                    backgroundColor: input.trim() ? accentColor : "#18181b",
                    color: input.trim() ? "#ffffff" : "#52525b",
                    opacity: input.trim() ? 1 : 0.5,
                    boxShadow: input.trim() ? `0 4px 15px ${accentColor}30` : undefined
                  }}
                >
                  <span>Run</span>
                  <Send className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => onSend()}
                  disabled={!input.trim()}
                  className="p-2 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 border"
                  style={{ 
                    backgroundColor: input.trim() ? accentColor : "transparent",
                    borderColor: input.trim() ? "transparent" : "#27272a",
                    color: input.trim() ? "#ffffff" : "#3f3f46",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    boxShadow: input.trim() ? `0 4px 15px ${accentColor}25` : undefined
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

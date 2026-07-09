import React, { useRef } from "react";
import { 
  Send, 
  Cpu, 
  BookOpen, 
  Bug, 
  Sparkles, 
  Layers, 
  Bot, 
  Palette, 
  Paperclip, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { GrixFileNode } from "../../../types/github";

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  handleSend: (customPrompt?: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  setSelectedAgent: (val: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer") => void;
  agents: any;
  activeFile: GrixFileNode | null;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  apiProvider: string;
  accentColor: string;
  popularModels: Array<{ value: string; label: string; provider: string }>;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  keyStatus: "custom" | "server" | "missing";
}

export default function ChatInput({
  input,
  setInput,
  isLoading,
  handleSend,
  handleKeyPress,
  selectedAgent,
  setSelectedAgent,
  agents,
  activeFile,
  selectedModel,
  setSelectedModel,
  apiProvider,
  accentColor,
  popularModels,
  attachedFiles,
  setAttachedFiles,
  keyStatus
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject extremely large files to prevent crashing the client context
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
        // Prevent duplicate attachments of the same name
        if (prev.some((f) => f.name === file.name)) return prev;
        return [...prev, newFile];
      });
    };
    reader.readAsText(file);
    
    // Reset file input value
    e.target.value = "";
  };

  const removeAttachedFile = (name: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  return (
    <>
      {/* Quick contextual commands panel */}
      {activeFile && (
        <div className="px-3 py-1.5 bg-zinc-940 border-t border-zinc-900 flex gap-2 overflow-x-auto no-scrollbar select-none">
          <button
            disabled={isLoading}
            onClick={() => handleSend(`Explain the contents of this active file: ${activeFile.name}. Give a clear, detailed breakdown.`)}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[9px] font-mono text-zinc-400 rounded border border-zinc-850 hover:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <BookOpen className="w-2.5 h-2.5 text-emerald-500" />
            <span>Explain File</span>
          </button>
          <button
            disabled={isLoading}
            onClick={() => handleSend(`Audit and scan the active file: ${activeFile.name} for bugs, edge-cases, memory leaks, or logical errors. Suggest direct code fixes.`)}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[9px] font-mono text-zinc-400 rounded border border-zinc-850 hover:border-zinc-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Bug className="w-2.5 h-2.5 text-rose-500" />
            <span>Find Bugs</span>
          </button>
        </div>
      )}

      {/* 2. Attached Files Banner */}
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

      {/* 3. Segmented Agent Selection near Typing Area (Planning AI, Agentic, UI Designer) */}
      <div className="px-3 py-1.5 bg-zinc-940 border-t border-zinc-900 flex items-center justify-between gap-1">
        <span className="text-[8.5px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Quick Modes:</span>
        <div className="flex items-center gap-1">
          {/* Planning AI Pill */}
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

          {/* Agentic Mode Pill */}
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

          {/* UI Designer Pill */}
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

      {/* Message Input Form */}
      <div className="p-3 bg-zinc-940 border-t border-zinc-900 shrink-0">
        <div className="relative bg-zinc-950 rounded-xl border border-zinc-900 focus-within:border-zinc-750 transition-all flex flex-col">
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Message ${agents[selectedAgent]?.name || "Assistant"}...`}
            className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 text-xs py-3 pl-3 pr-10 outline-none resize-none h-18 select-text"
            disabled={isLoading}
          />

          {/* Bottom Toolbar inside textarea box for professional Look */}
          <div className="h-9 px-2 pb-1.5 flex items-center justify-between border-t border-zinc-900/40">
            <div className="flex items-center gap-2">
              {/* 1. Attachment Button */}
              <button
                type="button"
                onClick={handleFileAttachClick}
                disabled={isLoading}
                className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
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

              {/* 2. Mini Model Quick Switcher Dropdown */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading}
                className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 hover:text-zinc-200 outline-none cursor-pointer max-w-[130px]"
                title="Quick model selection"
              >
                {popularModels.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label.replace(" (Free)", "").replace(" (Standard)", "")}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Status Indicator */}
            <div className="flex items-center gap-1.5">
              {keyStatus === "custom" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30" title="Custom OpenRouter key is active (unlimited queries)">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  <span>Custom API Key</span>
                </span>
              )}
              {keyStatus === "server" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-blue-400 bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-900/30" title="Host environment key is active">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
                  <span>Server API Key</span>
                </span>
              )}
              {keyStatus === "missing" && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30" title="No OpenRouter key found. Please insert one in AI settings panel.">
                  <AlertCircle className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  <span>Key Missing</span>
                </span>
              )}

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`p-1.5 rounded-lg transition-all ${
                  input.trim() && !isLoading
                    ? "bg-zinc-800 text-zinc-100 hover:scale-105 active:scale-95"
                    : "text-zinc-700 cursor-not-allowed"
                }`}
                style={{ backgroundColor: input.trim() && !isLoading ? accentColor : undefined }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-1 flex items-center justify-between text-[8px] text-zinc-650 font-mono select-none px-0.5">
          <span>Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5 text-zinc-600" />
            <span className="truncate max-w-[150px]">{selectedModel}</span>
          </span>
        </div>
      </div>
    </>
  );
}

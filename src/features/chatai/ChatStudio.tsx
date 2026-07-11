import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Trash2, Cpu, Sliders, Play, Terminal, HelpCircle, 
  MessageSquare, Sparkles, Copy, Check, Eye, EyeOff, Key,
  Settings, Plus, History, Menu, ChevronLeft, ChevronRight, ChevronDown,
  Mic, PlusCircle, LayoutGrid, RotateCcw, Cloud, UploadCloud,
  Camera, Youtube, Image, CheckCircle, SlidersHorizontal
} from "lucide-react";
import { Message } from "../ai/types";
import { safeStorage } from "../../utils/safeStorage";
import ChatMessageBubble from "../../components/ChatMessageBubble";
import ChatInputBar from "../../components/ChatInputBar";

interface ChatStudioProps {
  accentColor: string;
  isMobile: boolean;
  onOpenMenu?: () => void;
  sessions: any[];
  activeSessionId: string;
  onSetActiveSessionId: (id: string) => void;
  onUpdateSessions: (sessions: any[]) => void;
  customApiKey: string;
  onSetCustomApiKey: (key: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  selectedModel: string;
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
}

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast, multi-modal, great for general tasks." },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence." },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers." },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking." },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax." },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring." }
];

export default function ChatStudio({ 
  accentColor, 
  isMobile, 
  onOpenMenu,
  sessions,
  activeSessionId,
  onSetActiveSessionId,
  onUpdateSessions,
  customApiKey,
  onSetCustomApiKey
}: ChatStudioProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // File Attachment custom menu UI state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentStatus, setAttachmentStatus] = useState<string | null>(null);

  // UI states
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [showParametersPanel, setShowParametersPanel] = useState(true);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [leftTab, setLeftTab] = useState<"history" | "parameters">("history");
  const [showHeaderModelMenu, setShowHeaderModelMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Find active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Destructured values driven completely by active session (Single Source of Truth)
  const messages = activeSession?.messages || [];
  const selectedModel = activeSession?.selectedModel || "google/gemini-2.5-flash";
  const systemInstruction = activeSession?.systemInstruction || "";
  const temperature = activeSession?.temperature ?? 0.7;
  const maxTokens = activeSession?.maxTokens ?? 2048;

  const updateActiveSession = (updates: Partial<ChatSession>) => {
    const updated = sessions.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, ...updates };
      }
      return s;
    });
    onUpdateSessions(updated);
  };

  // Setters wrap updateActiveSession
  const setMessages = (msgs: Message[]) => updateActiveSession({ messages: msgs });
  const setSelectedModel = (model: string) => updateActiveSession({ selectedModel: model });
  const setSystemInstruction = (inst: string) => updateActiveSession({ systemInstruction: inst });
  const setTemperature = (temp: number) => updateActiveSession({ temperature: temp });
  const setMaxTokens = (tokens: number) => updateActiveSession({ maxTokens: tokens });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewSession = () => {
    const newId = Date.now().toString();
    const newSess: ChatSession = {
      id: newId,
      title: `Session ${sessions.length + 1}`,
      messages: [
        {
          id: "welcome-" + newId,
          role: "assistant",
          content: "Welcome to a fresh conversation thread! Choose your model and system parameters on the left to begin your workflow.",
          timestamp: new Date()
        }
      ],
      timestamp: Date.now(),
      selectedModel: "google/gemini-2.5-flash",
      systemInstruction: "You are an elite AI assistant trained by Google. Respond with precise, high-fidelity details, formatting code elegantly using Markdown.",
      temperature: 0.7,
      maxTokens: 2048
    };
    const updated = [newSess, ...sessions];
    onUpdateSessions(updated);
    onSetActiveSessionId(newId);
  };

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sessions.length <= 1) {
      alert("You must keep at least one active chat session.");
      return;
    }
    if (confirm("Are you sure you want to delete this session?")) {
      const updated = sessions.filter(s => s.id !== sessionId);
      onUpdateSessions(updated);
      if (activeSessionId === sessionId) {
        onSetActiveSessionId(updated[0].id);
      }
    }
  };

  const triggerAttachmentAction = (sourceName: string) => {
    setAttachmentStatus(`Successfully linked source: ${sourceName}`);
    setShowAttachmentMenu(false);
    setTimeout(() => {
      setAttachmentStatus(null);
    }, 3500);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    const newMsgs = [...messages, userMsg];
    
    // Auto rename title if generic
    let newTitle = activeSession.title;
    if (messages.length <= 1 || activeSession.title.startsWith("Welcome") || activeSession.title.startsWith("Session ")) {
      newTitle = input.trim().substring(0, 24) + (input.trim().length > 24 ? "..." : "");
    }

    const updated = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: newTitle,
          messages: newMsgs,
          timestamp: Date.now()
        };
      }
      return s;
    });
    onUpdateSessions(updated);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          selectedAgent: "custom",
          apiProvider: "openrouter",
          selectedModel,
          customApiKey: customApiKey || undefined,
          systemInstructionOverride: systemInstruction
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const resData = await response.json();
      const responseText = resData.text || "No response received.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        keyStatus: resData.usedCustomKey ? "custom" : resData.usedServerKey ? "server" : "missing"
      };

      const finalMsgs = [...newMsgs, assistantMsg];
      const updatedWithResponse = sessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: finalMsgs };
        }
        return s;
      });
      onUpdateSessions(updatedWithResponse);
    } catch (err: any) {
      console.error(err);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Inference Request Failed**\n\nCould not query model **${selectedModel}**.\n\n**Reason:** ${err.message || "Unknown proxy exception"}\n\n*Verify your API key setup in the parameter panel or environment config.*`,
        timestamp: new Date()
      };
      
      const finalMsgs = [...newMsgs, assistantMsg];
      const updatedWithResponse = sessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: finalMsgs };
        }
        return s;
      });
      onUpdateSessions(updatedWithResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear this thread's messages?")) {
      const clearedMsgs = [
        {
          id: "welcome-" + activeSessionId,
          role: "assistant" as const,
          content: "Conversation cleared. Ready for a new pipeline. Adjust parameters and begin!",
          timestamp: new Date()
        }
      ];
      setMessages(clearedMsgs);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApiKeyChange = (val: string) => {
    onSetCustomApiKey(val);
    safeStorage.setItem("gothwad_ai_key", val);
  };

  const renderLeftPanelContent = () => (
    <>
      {/* Dynamic Tab Switchers */}
      <div className="h-11 border-b border-zinc-850 flex items-center justify-around bg-zinc-950/20 shrink-0">
        <button
          onClick={() => setLeftTab("history")}
          className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            leftTab === "history" 
              ? "text-zinc-100 border-[#375a7f]" 
              : "text-zinc-500 border-transparent hover:text-zinc-300"
          }`}
          style={leftTab === "history" ? { borderColor: accentColor } : {}}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
        <button
          onClick={() => setLeftTab("parameters")}
          className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
            leftTab === "parameters" 
              ? "text-zinc-100 border-[#375a7f]" 
              : "text-zinc-500 border-transparent hover:text-zinc-300"
          }`}
          style={leftTab === "parameters" ? { borderColor: accentColor } : {}}
        >
          <Sliders className="w-3.5 h-3.5" />
          Parameters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
        {leftTab === "history" && (
          <div className="flex flex-col h-full space-y-3">
            {/* Start New Chat Button */}
            <button
              onClick={handleNewSession}
              className="w-full py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
            >
              <Plus className="w-4 h-4" style={{ color: accentColor }} />
              Start New Chat
            </button>

            {/* Conversation sessions list */}
            <div className="flex-1 space-y-1 py-1 overflow-y-auto no-scrollbar">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSetActiveSessionId(s.id);
                      if (isMobile) {
                        setShowConfigDrawer(false);
                      }
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isActive 
                        ? "bg-zinc-850/50 border-zinc-750/50 text-zinc-100" 
                        : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-[11px] font-sans font-medium truncate">{s.title}</span>
                        <span className="text-[8.5px] text-zinc-555 font-mono uppercase mt-0.5 truncate">
                          {MODELS.find(m => m.value === s.selectedModel)?.label.split(" (")[0] || s.selectedModel}
                        </span>
                      </div>
                    </div>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-zinc-800/40 shrink-0"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leftTab === "parameters" && (
          <div className="space-y-4">
            {/* Model Target selection */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Model Target</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all cursor-pointer font-sans text-xs"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-normal">
                {MODELS.find(m => m.value === selectedModel)?.desc}
              </p>
            </div>

            {/* System Instruction */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">System Instructions</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:outline-none transition-all font-sans text-xs resize-none"
                placeholder="Instruct the model how to act..."
              />
            </div>

            {/* Temperature range */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Temperature</label>
                <span className="text-emerald-400 font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#375a7f] h-1 bg-zinc-800 rounded-lg cursor-pointer"
                style={{ accentColor }}
              />
            </div>

            {/* Max Output Tokens ceiling */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Max Output Tokens</label>
                <span className="text-zinc-400 font-bold">{maxTokens}</span>
              </div>
              <input
                type="number"
                min="100"
                max="8192"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all"
              />
            </div>

            {/* OpenRouter overrides */}
            <div className="space-y-2 border-t border-zinc-850 pt-4">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Key className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-bold uppercase tracking-wider text-[9px]">OpenRouter API Key</span>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={customApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-2.5 pr-8 text-zinc-300 focus:outline-none font-mono text-[10px]"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[9px] text-zinc-600 font-sans leading-normal">
                Leave empty to fallback to Gothwad Ai Studio's host system key. Input custom key for unlimited personal usage limits.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderHistoryPanelContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-900/50">
      {/* Header */}
      <div className="h-13 border-b border-zinc-850 flex items-center gap-2 px-3.5 bg-zinc-950/20 shrink-0">
        <History className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
          Chat History
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
        <div className="flex flex-col h-full space-y-3">
          {/* Start New Chat Button */}
          <button
            onClick={handleNewSession}
            className="w-full py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
          >
            <Plus className="w-4 h-4" style={{ color: accentColor }} />
            Start New Chat
          </button>

          {/* Conversation sessions list */}
          <div className="flex-1 space-y-1 py-1 overflow-y-auto no-scrollbar">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSetActiveSessionId(s.id);
                    if (isMobile) {
                      setShowConfigDrawer(false);
                    }
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                    isActive 
                      ? "bg-zinc-850/50 border-zinc-750/50 text-zinc-100" 
                      : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-[11px] font-sans font-medium truncate">{s.title}</span>
                      <span className="text-[8.5px] text-zinc-555 font-mono uppercase mt-0.5 truncate">
                        {MODELS.find(m => m.value === s.selectedModel)?.label.split(" (")[0] || s.selectedModel}
                      </span>
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-zinc-800/40 shrink-0"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderParametersPanelContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-900/50">
      {/* Header */}
      <div className="h-13 border-b border-zinc-850 flex items-center gap-2 px-3.5 bg-zinc-950/20 shrink-0">
        <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
          System Parameters
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
        <div className="space-y-4">
          {/* Model Target selection */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Model Target</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all cursor-pointer font-sans text-xs"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-normal">
              {MODELS.find(m => m.value === selectedModel)?.desc}
            </p>
          </div>

          {/* System Instruction */}
          <div className="space-y-1.5">
            <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">System Instructions</label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:outline-none transition-all font-sans text-xs resize-none"
              placeholder="Instruct the model how to act..."
            />
          </div>

          {/* Temperature range */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Temperature</label>
              <span className="text-emerald-400 font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#375a7f] h-1 bg-zinc-800 rounded-lg cursor-pointer"
              style={{ accentColor }}
            />
          </div>

          {/* Max Output Tokens ceiling */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Max Output Tokens</label>
              <span className="text-zinc-400 font-bold">{maxTokens}</span>
            </div>
            <input
              type="number"
              min="100"
              max="8192"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all"
            />
          </div>

          {/* OpenRouter overrides */}
          <div className="space-y-2 border-t border-zinc-850 pt-4">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-bold uppercase tracking-wider text-[9px]">OpenRouter API Key</span>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={customApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-2.5 pr-8 text-zinc-300 focus:outline-none font-mono text-[10px]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[9px] text-zinc-600 font-sans leading-normal">
              Leave empty to fallback to Gothwad Ai Studio's host system key. Input custom key for unlimited personal usage limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 text-zinc-300 font-sans relative">
      
      {/* 1. Left Side Chat History Panel (Desktop view only, collapsible) */}
      {!isMobile && showHistoryPanel && (
        <div className="w-[280px] bg-zinc-900 border-r border-zinc-850 flex flex-col shrink-0 overflow-hidden select-none">
          {renderHistoryPanelContent()}
        </div>
      )}

      {/* 2. Main Chat Conversation Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {/* Chat Studio Unified Header - aligned perfectly with primary sidebar header style */}
        <div className="h-13 border-b border-zinc-850 bg-zinc-900/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger for mobile menu drawer */}
            {isMobile && onOpenMenu && (
              <button 
                onClick={onOpenMenu}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-[11.5px] font-mono font-bold tracking-tight text-zinc-100 uppercase">AI Chat Playground</h2>
                <div className="relative mt-0.5">
                  <button 
                    onClick={() => setShowHeaderModelMenu(!showHeaderModelMenu)}
                    className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider select-none transition-all duration-150 cursor-pointer"
                  >
                    <span>{MODELS.find(m => m.value === selectedModel)?.label || selectedModel}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-zinc-500 shrink-0 ml-0.5" />
                  </button>

                  {showHeaderModelMenu && (
                    <>
                      {/* overlay layer */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowHeaderModelMenu(false)} 
                      />
                      <div className="absolute left-0 mt-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 w-60 shadow-2xl z-50 flex flex-col font-sans">
                        <div className="px-2 py-1 border-b border-zinc-900 mb-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          Select LLM Engine
                        </div>
                        {MODELS.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => {
                              setSelectedModel(m.value);
                              setShowHeaderModelMenu(false);
                            }}
                            className={`w-full flex flex-col items-start gap-0.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedModel === m.value 
                                ? "bg-zinc-900 text-white font-bold" 
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                            }`}
                          >
                            <span className="font-semibold text-[10px]">{m.label}</span>
                            <span className="text-[8.5px] text-zinc-500 line-clamp-1 leading-normal">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Create New Session Thread Button */}
            <button
              onClick={handleNewSession}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer"
              title="Create New Conversation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Clear thread message history */}
            <button
              onClick={handleClear}
              className="p-1.5 bg-zinc-950 hover:bg-rose-950/15 text-zinc-400 hover:text-rose-500 border border-zinc-800 hover:border-rose-900/30 rounded-lg transition-all cursor-pointer"
              title="Reset Thread Messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Toggle History Panel Button */}
            <button
              onClick={() => {
                if (isMobile) {
                  setLeftTab("history");
                  setShowConfigDrawer(true);
                } else {
                  setShowHistoryPanel(!showHistoryPanel);
                }
              }}
              className={`p-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-all cursor-pointer ${
                !isMobile && showHistoryPanel ? "text-white border-zinc-700 bg-zinc-900" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Toggle History Sidebar"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Parameters Panel Button */}
            <button
              onClick={() => {
                if (isMobile) {
                  setLeftTab("parameters");
                  setShowConfigDrawer(true);
                } else {
                  setShowParametersPanel(!showParametersPanel);
                }
              }}
              className={`p-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-all cursor-pointer ${
                !isMobile && showParametersPanel ? "text-white border-zinc-700 bg-zinc-900" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Toggle Parameters Sidebar"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-zinc-950">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              accentColor={accentColor}
              copiedId={copiedId}
              onCopyText={handleCopy}
              isMobile={isMobile}
            />
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-lg items-start">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center justify-center shrink-0 animate-spin">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl rounded-tl-none p-4 text-xs font-mono text-zinc-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Compiling inference sequence...</span>
                  </div>
                  <div className="h-1 bg-zinc-850 rounded-full overflow-hidden w-40">
                    <div className="h-full bg-zinc-750 animate-[loading_1.5s_infinite] rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Media Attachment Notification Banner */}
        {attachmentStatus && (
          <div className="px-4 shrink-0">
            <div 
              className="max-w-3xl mx-auto mb-2 flex items-center gap-2 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 p-2.5 rounded-xl text-[10px] font-mono animate-fade-in"
              style={{ color: accentColor, borderColor: `${accentColor}25`, backgroundColor: `${accentColor}08` }}
            >
              <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" style={{ color: accentColor }} />
              <span className="font-bold">{attachmentStatus}</span>
            </div>
          </div>
        )}

        {/* Unified bottom typing bar */}
        <ChatInputBar
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          selectedModel={selectedModel}
          accentColor={accentColor}
          customMediaActions={true}
          onAttachmentTrigger={triggerAttachmentAction}
          temperature={temperature}
          maxTokens={maxTokens}
        />
      </div>

      {/* 3. Right Side Config Parameter Panel (Desktop view only, collapsible) */}
      {!isMobile && showParametersPanel && (
        <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 overflow-hidden select-none">
          {renderParametersPanelContent()}
        </div>
      )}

      {/* 4. Responsive Configuration & History Drawer (Mobile view only) */}
      {isMobile && showConfigDrawer && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in flex"
          onClick={() => setShowConfigDrawer(false)}
        >
          <div 
            className="w-[285px] max-w-[85vw] h-full bg-zinc-900 flex flex-col shadow-2xl animate-[slideInRight_0.2s_ease-out] border-l border-zinc-850 ml-auto select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide text-xs font-mono">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                Parameters & History
              </span>
              <button 
                onClick={() => setShowConfigDrawer(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-all hover:bg-zinc-800 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {renderLeftPanelContent()}
            </div>

            <div className="p-4 border-t border-zinc-850 bg-zinc-930/40">
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="w-full py-2 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white font-bold rounded-lg tracking-wide uppercase text-[10px] font-mono cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

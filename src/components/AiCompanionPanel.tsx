import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Bot, Send, Trash2, Copy, Check, Terminal, Bug, BookOpen, Layers, 
  ChevronRight, ChevronLeft, Cpu, RefreshCw, FileText, Play, Info,
  Settings, Lock, Unlock, Sliders, Eye, EyeOff, ListChecks, Palette,
  History, MessageSquare, Plus, Key, SlidersHorizontal
} from "lucide-react";
import { GrixFileNode } from "../types/github";
import { safeStorage } from "../utils/safeStorage";

// Modular Imports
import { Message } from "../features/common/ai/types";
import { parseMarkdown } from "./ui/MarkdownText";
import { getFlatFilePaths } from "../features/common/ai/utils/promptBuilder";
import ChatHeader from "../features/common/ai/components/ChatHeader";
import ChatMessageList from "../features/common/ai/components/ChatMessageList";
import ChatInputBar from "./ChatInputBar";
import { callAiChat } from "../utils/aiClient";

interface AiCompanionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFile: GrixFileNode | null;
  fileSystemTree: GrixFileNode[];
  onApplyCode: (code: string) => void;
  accentColor: string;
  appModels?: any[];
  customApiKey?: string;
  groqApiKey?: string;
  isMobile?: boolean;
  onOpenMenu?: () => void;
}

const POPULAR_MODELS = [
  { value: "groq/llama-3.3-70b-versatile", label: "Groq Llama 3.3 70B (Fast)", provider: "groq" },
  { value: "groq/deepseek-r1-distill-llama-70b", label: "Groq DeepSeek R1 70B (Reasoning)", provider: "groq" },
  { value: "groq/llama-3.1-8b-instant", label: "Groq Llama 3.1 8B (Instant)", provider: "groq" },
  { value: "groq/gemma2-9b-it", label: "Groq Gemma 2 9B (Fast)", provider: "groq" },
  { value: "groq/mixtral-8x7b-32768", label: "Groq Mixtral 8x7B (Fast)", provider: "groq" },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nvidia Nemotron 550B (Free)", provider: "openrouter" },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", provider: "openrouter" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "openrouter" },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder 32B (Free)", provider: "openrouter" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", provider: "openrouter" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3 (Cheap Paid)", provider: "openrouter" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Standard)", provider: "openrouter" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (Standard)", provider: "openrouter" }
];

interface CompanionSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  selectedModel: string;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  systemInstruction: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_SYSTEM_INSTRUCTION = "You are Gothwad AI, an elite, ultra-responsive coding companion integrated directly into Gothwad Ai Studio. You are styled like Cursor, Windsurf, and Google AI Studio to give the ultimate developer workspace experience.";

const createNewSessionTemplate = (id: string, index: number): CompanionSession => ({
  id,
  title: `Chat Session ${index}`,
  messages: [
    {
      id: `welcome-${id}`,
      role: "assistant",
      content: "Hello! I am **Gothwad AI Companion**. I am fully integrated into your workspace environment.\n\nI can analyze any open file, debug build outputs, refactor directories, and inject code solutions directly into your editor view with a single click!\n\nOpen a file in your workspace, select an expert agent focus from the chat input bar below, and ask me to help build your next masterpiece!",
      timestamp: new Date()
    }
  ],
  timestamp: Date.now(),
  selectedModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  selectedAgent: "engineer",
  systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
  temperature: 0.2,
  maxTokens: 1500
});

export default function AiCompanionPanel({
  isOpen,
  onToggle,
  activeFile,
  fileSystemTree,
  onApplyCode,
  accentColor,
  appModels = [],
  customApiKey,
  groqApiKey,
  isMobile = false,
  onOpenMenu
}: AiCompanionPanelProps) {
  const companionModels = appModels.length > 0
    ? appModels.filter(m => m.categories?.includes("software"))
    : POPULAR_MODELS;

  const [sessions, setSessions] = useState<CompanionSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [leftTab, setLeftTab] = useState<"history" | "parameters">("history");

  const [customApiKeyLocal, setCustomApiKeyLocal] = useState("");
  const activeCustomApiKey = customApiKey !== undefined && customApiKey !== "" ? customApiKey : customApiKeyLocal;

  const [groqApiKeyLocal, setGroqApiKeyLocal] = useState("");
  const activeGroqApiKey = groqApiKey !== undefined && groqApiKey !== "" ? groqApiKey : groqApiKeyLocal;

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [groqKeyVisible, setGroqKeyVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [applyTooltip, setApplyTooltip] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; content: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    const savedSessions = safeStorage.getItem("gothwad_ai_companion_sessions_v1");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((s: any) => ({
            ...s,
            messages: s.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          }));
          setSessions(formatted);
          const lastActiveId = safeStorage.getItem("gothwad_ai_companion_active_id_v1");
          if (lastActiveId && formatted.some((s: any) => s.id === lastActiveId)) {
            setActiveSessionId(lastActiveId);
          } else {
            setActiveSessionId(formatted[0].id);
          }
        } else {
          const defaultId = Date.now().toString();
          const first = createNewSessionTemplate(defaultId, 1);
          setSessions([first]);
          setActiveSessionId(defaultId);
        }
      } catch (e) {
        console.error("Failed to parse saved companion sessions", e);
        const defaultId = Date.now().toString();
        const first = createNewSessionTemplate(defaultId, 1);
        setSessions([first]);
        setActiveSessionId(defaultId);
      }
    } else {
      const defaultId = Date.now().toString();
      const first = createNewSessionTemplate(defaultId, 1);
      setSessions([first]);
      setActiveSessionId(defaultId);
    }

    const savedKey = safeStorage.getItem("gothwad_ai_key") || "";
    setCustomApiKeyLocal(savedKey);

    const savedGroqKey = safeStorage.getItem("gothwad_groq_key");
    if (savedGroqKey) setGroqApiKeyLocal(savedGroqKey);

    setHasServerKey(!!(import.meta as any).env?.VITE_OPENROUTER_API_KEY);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      safeStorage.setItem("gothwad_ai_companion_sessions_v1", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      safeStorage.setItem("gothwad_ai_companion_active_id_v1", activeSessionId);
    }
  }, [activeSessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading, showSettings]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const updateActiveSessionField = (field: keyof CompanionSession, val: any) => {
    setSessions((prev) => 
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, [field]: val };
        }
        return s;
      })
    );
  };

  const triggerBannerNotification = (text: string) => {
    setApplyTooltip(text);
    setTimeout(() => setApplyTooltip(null), 3000);
  };

  const handleNewSession = () => {
    const nextIndex = sessions.length + 1;
    const newId = Date.now().toString();
    const newSession = createNewSessionTemplate(newId, nextIndex);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowSettings(false);
    triggerBannerNotification("Started a new companion chat session!");
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    
    const remaining = sessions.filter(s => s.id !== idToDelete);
    setSessions(remaining);
    
    if (activeSessionId === idToDelete) {
      setActiveSessionId(remaining[0].id);
    }
    triggerBannerNotification("Deleted session successfully.");
  };

  const clearChat = () => {
    if (!activeSession) return;
    const clearedMsgs: Message[] = [
      {
        id: "welcome-cleared-" + activeSession.id,
        role: "assistant",
        content: "Chat logs cleared. Gothwad pipeline is ready for a new session. Ask me any code question!",
        timestamp: new Date()
      }
    ];
    updateActiveSessionField("messages", clearedMsgs);
    triggerBannerNotification("Cleared chat history for this thread.");
  };

  const copyToClipboard = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyToEditor = (code: string, blockId: string) => {
    if (!activeFile) {
      triggerBannerNotification("⚠️ No active file is currently open in Gothwad Editor.");
      return;
    }
    onApplyCode(code);
    triggerBannerNotification(`Applied code to ${activeFile.name} successfully!`);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading || !activeSession) return;

    let promptContentWithFiles = textToSend;
    if (attachedFiles.length > 0) {
      promptContentWithFiles += "\n\n=== ATTACHED DISK CODE FILES ===";
      attachedFiles.forEach(f => {
        promptContentWithFiles += `\n\nFile Name: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``;
      });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptContentWithFiles,
      timestamp: new Date()
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    
    let newTitle = activeSession.title;
    if (activeSession.title.startsWith("Chat Session")) {
      const truncateLength = 28;
      const cleanPrompt = textToSend.replace(/[\n\r]/g, " ").trim();
      newTitle = cleanPrompt.length > truncateLength 
        ? cleanPrompt.slice(0, truncateLength) + "..." 
        : cleanPrompt;
    }

    setSessions((prev) => 
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages: updatedMessages, title: newTitle };
        }
        return s;
      })
    );

    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const filePaths = getFlatFilePaths(fileSystemTree);
      
      const resData = await callAiChat({
        messages: updatedMessages,
        activeFile,
        workspaceFiles: filePaths,
        selectedAgent: activeSession.selectedAgent,
        selectedModel: activeSession.selectedModel,
        customApiKey: activeCustomApiKey || undefined,
        groqApiKey: activeGroqApiKey || undefined,
        systemInstructionOverride: activeSession.systemInstruction !== DEFAULT_SYSTEM_INSTRUCTION ? activeSession.systemInstruction : undefined,
        temperature: activeSession.temperature,
        maxTokens: activeSession.maxTokens
      });

      const responseText = resData.text || "No response received from the OpenRouter model.";
      const keyStatusVal = resData.usedCustomKey ? "custom" : resData.usedServerKey ? "server" : "missing";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        agent: activeSession.selectedAgent,
        keyStatus: keyStatusVal
      };

      setSessions((prev) => 
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return { ...s, messages: [...updatedMessages, assistantMsg] };
          }
          return s;
        })
      );
    } catch (error: any) {
      console.error("[Client AI] Gothwad AI API Error caught:", error);
      const diagnosticError = `${error.name || "Error"}: ${error.message || error}`;
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Gothwad AI Client Exception Caught**\n\nFailed to complete the chat pipeline for model **${activeSession.selectedModel}**.\n\n### 🔍 Diagnostic Details\n\`\`\`\n${diagnosticError}\n\`\`\`\n\n### ⚙️ Action Items & Troubleshooting\n1. **Verify your API Keys**: Go to the **AI Settings Control Panel** (the slider icon above) and ensure your OpenRouter API Key is entered correctly (if using a custom key).\n2. **Check Server Key**: If relying on the server-level key, confirm that \`OPENROUTER_API_KEY\` is configured in your environments.\n3. **Model Availability**: Ensure that the selected model is online on OpenRouter and your account has sufficient credits.`,
        timestamp: new Date(),
        agent: activeSession.selectedAgent,
        keyStatus: activeCustomApiKey && activeCustomApiKey.trim() !== "" ? "custom" : hasServerKey ? "server" : "missing"
      };
      
      setSessions((prev) => 
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return { ...s, messages: [...updatedMessages, assistantMsg] };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const agents = {
    engineer: {
      name: "Elite Engineer",
      icon: Sparkles,
      color: "#f59e0b",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      desc: "Writes robust components, algorithms, types, and complete application features."
    },
    explainer: {
      name: "Auditor",
      icon: BookOpen,
      color: "#10b981",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      desc: "Explains complex design patterns and reviews software architectures."
    },
    bug_hunter: {
      name: "Bug Hunter",
      icon: Bug,
      color: "#f43f5e",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      desc: "Finds bugs, analyzes stack traces, and produces clean bug-fixes."
    },
    architect: {
      name: "Architect",
      icon: Layers,
      color: "#a855f7",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      desc: "Designs directory structure, components and modular paths."
    },
    planner: {
      name: "Planning AI",
      icon: ListChecks,
      color: "#3b82f6",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      desc: "Creates step-by-step project plans, implementation specifications, and checklists."
    },
    agentic: {
      name: "Agentic Mode",
      icon: Bot,
      color: "#ec4899",
      badge: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      desc: "Autonomously reasons about file trees, types, dependencies, and produces complete solutions with self-correction."
    },
    designer: {
      name: "UI Designer AI",
      icon: Palette,
      color: "#14b8a6",
      badge: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      desc: "Generates high-fidelity visual layouts, modern dark/light styling, and responsive user interfaces using Tailwind."
    }
  };

  const handleAttachmentTrigger = (type: string) => {
    triggerBannerNotification(`Triggered ${type} attachment successfully!`);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-open-ai-companion"
        onClick={onToggle}
        className="fixed right-4 bottom-14 z-40 p-3.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-2xl transition-all hover:scale-105 duration-200 group flex items-center gap-2 text-zinc-200 active:scale-95 cursor-pointer"
        title="Open AI Companion"
        style={{ boxShadow: `0 0 20px ${accentColor}25` }}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-zinc-300 group-hover:text-amber-400 animate-pulse" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-2 ring-zinc-900" />
        </div>
        <span className="text-xs font-medium tracking-tight pr-1">Gothwad AI</span>
      </button>
    );
  }

  return (
    <div 
      id="ai-companion-panel"
      className="w-full min-w-0 md:w-96 md:min-w-[380px] h-full bg-zinc-950 border-l border-zinc-900 flex flex-col overflow-hidden relative shrink-0"
      style={{ borderLeftColor: `${accentColor}20` }}
    >
      <ChatHeader
        onToggle={onToggle}
        clearChat={clearChat}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        selectedAgent={activeSession?.selectedAgent || "engineer"}
        setSelectedAgent={(val) => updateActiveSessionField("selectedAgent", val)}
        agents={agents}
        activeFile={activeFile}
        fileSystemTree={fileSystemTree}
        getFlatFilePaths={getFlatFilePaths}
        accentColor={accentColor}
        selectedModel={activeSession?.selectedModel || "nvidia/nemotron-3-ultra-550b-a55b:free"}
        popularModels={POPULAR_MODELS}
        onModelChange={(val) => updateActiveSessionField("selectedModel", val)}
        onNewSession={handleNewSession}
        isMobile={isMobile}
        onOpenMenu={onOpenMenu}
      />

      {/* Settings control vs messages view switcher */}
      {showSettings ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 font-sans">
          {/* Tabs header */}
          <div className="h-11 border-b border-zinc-850 flex items-center justify-around bg-zinc-950/20 shrink-0 select-none">
            <button
              onClick={() => setLeftTab("history")}
              className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
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

          {/* Tab content panel */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4">
            {leftTab === "history" ? (
              <div className="flex flex-col h-full space-y-3">
                {/* Start New Chat Button */}
                <button
                  onClick={handleNewSession}
                  className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
                >
                  <Plus className="w-4 h-4" style={{ color: accentColor }} />
                  Start New Chat
                </button>

                {/* Conversation sessions list */}
                <div className="flex-1 space-y-1.5 py-1 overflow-y-auto no-scrollbar">
                  {sessions.map((s) => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setShowSettings(false);
                        }}
                        className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                          isActive 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
                            : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                          <div className="flex flex-col min-w-0 leading-tight text-left">
                            <span className="text-[11px] font-sans font-medium truncate">{s.title}</span>
                            <span className="text-[8.5px] text-zinc-550 font-mono uppercase mt-0.5 truncate">
                              {POPULAR_MODELS.find(m => m.value === s.selectedModel)?.label.split(" (")[0] || s.selectedModel}
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
            ) : (
              <div className="space-y-4 text-left font-sans">
                {/* Active model */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Active Model</label>
                  <select
                    value={activeSession?.selectedModel}
                    onChange={(e) => updateActiveSessionField("selectedModel", e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all cursor-pointer text-xs"
                  >
                    {POPULAR_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* System instructions override */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">System Instructions</label>
                  <textarea
                    value={activeSession?.systemInstruction}
                    onChange={(e) => updateActiveSessionField("systemInstruction", e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-zinc-300 focus:outline-none transition-all text-xs resize-none font-sans"
                    placeholder="Override standard companion guidelines..."
                  />
                </div>

                {/* Temperature range */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Temperature</label>
                    <span className="text-emerald-400 font-bold font-mono">{(activeSession?.temperature || 0.2).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={activeSession?.temperature || 0.2}
                    onChange={(e) => updateActiveSessionField("temperature", parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    style={{ accentColor }}
                  />
                </div>

                {/* Max Output Tokens ceiling */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Max Output Tokens</label>
                    <span className="text-zinc-400 font-bold font-mono">{activeSession?.maxTokens || 1500}</span>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="8192"
                    step="100"
                    value={activeSession?.maxTokens || 1500}
                    onChange={(e) => updateActiveSessionField("maxTokens", parseInt(e.target.value) || 1500)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all text-xs"
                  />
                </div>

                {/* API Provider Status & Info */}
                <div className="space-y-2 border-t border-zinc-850 pt-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Key className="w-3.5 h-3.5" />
                    <span className="font-bold font-mono uppercase tracking-wider text-[9px]">OpenRouter API Key</span>
                  </div>
                  <div className="relative">
                    <input
                      type={apiKeyVisible ? "text" : "password"}
                      value={customApiKeyLocal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomApiKeyLocal(val);
                        if (val.trim()) {
                          safeStorage.setItem("gothwad_ai_key", val);
                        } else {
                          safeStorage.removeItem("gothwad_ai_key");
                        }
                      }}
                      placeholder={
                        hasServerKey
                          ? "Server Key is in Use (Active)"
                          : "sk-or-v1-..."
                      }
                      className={`w-full bg-zinc-950 border rounded-lg py-1.5 pl-2.5 pr-8 focus:outline-none font-mono text-[10px] ${
                        customApiKeyLocal
                          ? "border-zinc-900 text-zinc-300"
                          : hasServerKey
                          ? "border-emerald-950/40 text-emerald-400 placeholder-emerald-600/75"
                          : "border-zinc-900 text-zinc-300"
                      }`}
                    />
                    {customApiKeyLocal && (
                      <button
                        type="button"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {apiKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg text-[9.5px] text-zinc-500 font-mono leading-relaxed mt-1">
                    {customApiKeyLocal.trim() !== "" ? (
                      <span className="text-amber-400">🟢 Custom key is configured and active.</span>
                    ) : hasServerKey ? (
                      <span className="text-emerald-400">🟢 Server key is in use (Active in workspace).</span>
                    ) : (
                      <span className="text-red-400">⚠️ No keys detected. Insert your OpenRouter Key or set server variable.</span>
                    )}
                  </div>
                </div>

                {/* Groq API Provider Status & Info */}
                <div className="space-y-2 border-t border-zinc-850 pt-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Key className="w-3.5 h-3.5" />
                    <span className="font-bold font-mono uppercase tracking-wider text-[9px]">Groq API Key</span>
                  </div>
                  <div className="relative">
                    <input
                      type={groqKeyVisible ? "text" : "password"}
                      value={groqApiKeyLocal}
                      onChange={(e) => {
                        setGroqApiKeyLocal(e.target.value);
                        safeStorage.setItem("gothwad_groq_key", e.target.value);
                      }}
                      placeholder="gsk_..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 pl-2.5 pr-8 text-zinc-300 focus:outline-none font-mono text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => setGroqKeyVisible(!groqKeyVisible)}
                      className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {groqKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg text-[9.5px] text-zinc-500 font-mono leading-relaxed mt-1">
                    {groqApiKeyLocal.trim() !== "" ? (
                      <span className="text-emerald-400">🟢 Custom Groq key is active. Fast inference enabled.</span>
                    ) : (
                      <span className="text-zinc-500">⚪ No Groq custom key configured. Falls back to host cache.</span>
                    )}
                  </div>
                </div>

                {/* Close Settings Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center"
                >
                  Close Settings View
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList
            messages={activeSession?.messages || []}
            agents={agents}
            isLoading={isLoading}
            selectedAgent={activeSession?.selectedAgent || "engineer"}
            copiedId={copiedId}
            copyToClipboard={copyToClipboard}
            handleApplyToEditor={handleApplyToEditor}
            messagesEndRef={messagesEndRef}
          />

          <ChatInputBar
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={handleSend}
            selectedModel={activeSession?.selectedModel || "nvidia/nemotron-3-ultra-550b-a55b:free"}
            accentColor={accentColor}
            customMediaActions={true}
            onAttachmentTrigger={handleAttachmentTrigger}
            temperature={activeSession?.temperature || 0.2}
            maxTokens={activeSession?.maxTokens || 1500}
            selectedAgent={activeSession?.selectedAgent || "engineer"}
            setSelectedAgent={(val) => updateActiveSessionField("selectedAgent", val)}
            agents={agents}
            activeFile={activeFile}
            popularModels={POPULAR_MODELS}
            onModelChange={(val) => updateActiveSessionField("selectedModel", val)}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            keyStatus={activeCustomApiKey && activeCustomApiKey.trim() !== "" ? "custom" : hasServerKey ? "server" : "missing"}
          />
        </>
      )}

      {/* Action Notification Banners */}
      {applyTooltip && (
        <div className="absolute bottom-36 left-4 right-4 z-20 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-850 text-xs text-zinc-200 flex items-center gap-2 shadow-2xl animate-fade-in animate-pulse text-left">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{applyTooltip}</span>
        </div>
      )}
    </div>
  );
}

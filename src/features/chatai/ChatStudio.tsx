import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Trash2, Cpu, Sliders, Play, Terminal, HelpCircle, 
  MessageSquare, Sparkles, Copy, Check, Eye, EyeOff, Key,
  Settings, Plus, History, Menu, ChevronLeft, ChevronRight, ChevronDown, X,
  Mic, PlusCircle, LayoutGrid, RotateCcw, Cloud, UploadCloud,
  Camera, Youtube, Image, CheckCircle, SlidersHorizontal
} from "lucide-react";
import { Message } from "../ai/types";
import { safeStorage } from "../../utils/safeStorage";
import ChatMessageBubble from "../../components/ChatMessageBubble";
import ChatInputBar from "../../components/ChatInputBar";
import { callAiChat } from "../../utils/aiClient";

interface ChatStudioProps {
  accentColor: string;
  isMobile: boolean;
  onOpenMenu?: () => void;
  onToggleSidebar?: () => void;
  sessions: any[];
  activeSessionId: string;
  onSetActiveSessionId: (id: string) => void;
  onUpdateSessions: (sessions: any[]) => void;
  customApiKey: string;
  onSetCustomApiKey: (key: string) => void;
  appModels?: any[];
  onUpdateAppModels?: (models: any[]) => void;
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

const DEFAULT_CHATS_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast, multi-modal, great for general tasks." },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence." },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers." },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking." },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax." },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring." }
];

function ThinkingBubble({ modelKey, label, startTime }: { modelKey: string; label: string; startTime: number; key?: any }) {
  const [elapsed, setElapsed] = useState("0.0");

  useEffect(() => {
    const timer = setInterval(() => {
      const sec = ((Date.now() - startTime) / 1000).toFixed(1);
      setElapsed(sec);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="flex flex-col w-full space-y-3 pb-8 border-b-2 border-zinc-800/80 animate-[fadeIn_0.15s_ease-out]">
      {/* Header Avatar and Label Row */}
      <div className="flex items-center gap-1.5 px-1 select-none flex-row">
        <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm bg-transparent">
          <img 
            src="/icon-512.png" 
            alt="Thinking" 
            className="w-full h-full object-cover animate-spin filter brightness-110" 
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
          {label}
        </span>
        <span className="ml-2 text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
          WORKING FOR {elapsed} SECONDS...
        </span>
      </div>

      {/* Message Body Bubble */}
      <div className="w-full pl-1">
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-40">
          <div className="h-full bg-zinc-700 animate-[loading_1.5s_infinite] rounded-full" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatStudio({ 
  accentColor, 
  isMobile, 
  onOpenMenu,
  onToggleSidebar,
  sessions,
  activeSessionId,
  onSetActiveSessionId,
  onUpdateSessions,
  customApiKey,
  onSetCustomApiKey,
  appModels = [],
  onUpdateAppModels
}: ChatStudioProps) {
  const chatModels = appModels.length > 0 
    ? appModels.filter(m => m.categories?.includes("chats"))
    : DEFAULT_CHATS_MODELS;

  const [input, setInput] = useState("");
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [modelStartTimes, setModelStartTimes] = useState<Record<string, number>>({});
  const isLoading = loadingModels.length > 0;
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

  // Custom Model registration states
  const [customModelId, setCustomModelId] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [customModelDesc, setCustomModelDesc] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const handleAddCustomModel = () => {
    if (!customModelId.trim()) {
      setCustomError("Model ID is required.");
      return;
    }
    if (!customModelName.trim()) {
      setCustomError("Display label is required.");
      return;
    }

    // Check if duplicate value
    if (chatModels.some(m => m.value === customModelId.trim())) {
      setCustomError("A model with this ID is already registered.");
      return;
    }

    const newModelItem = {
      value: customModelId.trim(),
      label: customModelName.trim(),
      desc: customModelDesc.trim() || "User registered custom AI engine.",
      categories: ["chats", "software"] as ("chats" | "software")[]
    };

    if (onUpdateAppModels) {
      const updatedModels = [...appModels, newModelItem];
      onUpdateAppModels(updatedModels);
      
      // Auto select this new model
      handleToggleModel(newModelItem.value);
      
      // Clear fields
      setCustomModelId("");
      setCustomModelName("");
      setCustomModelDesc("");
      setCustomError(null);
    } else {
      setCustomError("Model configuration update callback is unavailable.");
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Find active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Destructured values driven completely by active session (Single Source of Truth)
  const messages = activeSession?.messages || [];
  const selectedModel = activeSession?.selectedModel || "google/gemini-2.5-flash";
  const systemInstruction = activeSession?.systemInstruction || "";
  const temperature = activeSession?.temperature ?? 0.7;
  const maxTokens = activeSession?.maxTokens ?? 2048;

  const selectedModelsArray = selectedModel ? selectedModel.split(",") : ["google/gemini-2.5-flash"];

  const handleToggleModel = (modelValue: string) => {
    let updatedArray: string[];
    if (selectedModelsArray.includes(modelValue)) {
      if (selectedModelsArray.length <= 1) {
        return; // Keep at least one selected
      }
      updatedArray = selectedModelsArray.filter(m => m !== modelValue);
    } else {
      updatedArray = [...selectedModelsArray, modelValue];
    }
    updateActiveSession({ selectedModel: updatedArray.join(",") });
  };

  const selectedModelsLabel = (() => {
    if (selectedModelsArray.length === 0) return "Select Models";
    if (selectedModelsArray.length === 1) {
      return chatModels.find(m => m.value === selectedModelsArray[0])?.label || selectedModelsArray[0];
    }
    const firstLabel = chatModels.find(m => m.value === selectedModelsArray[0])?.label || selectedModelsArray[0];
    return `${firstLabel.split(" (")[0]} (+${selectedModelsArray.length - 1})`;
  })();

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

    let currentMsgs = [...messages, userMsg];
    
    // Auto rename title if generic
    let newTitle = activeSession.title;
    if (messages.length <= 1 || activeSession.title.startsWith("Welcome") || activeSession.title.startsWith("Session ")) {
      newTitle = input.trim().substring(0, 24) + (input.trim().length > 24 ? "..." : "");
    }

    let localSessions = [...sessions];
    localSessions = localSessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: newTitle,
          messages: currentMsgs,
          timestamp: Date.now()
        };
      }
      return s;
    });
    onUpdateSessions(localSessions);
    setInput("");

    const modelsToQuery = [...selectedModelsArray];
    setLoadingModels(modelsToQuery);

    for (const modelVal of modelsToQuery) {
      const modelLabel = chatModels.find(m => m.value === modelVal)?.label || modelVal;
      const startTime = Date.now();
      setModelStartTimes(prev => ({ ...prev, [modelVal]: startTime }));
      
      try {
        const resData = await callAiChat({
          messages: currentMsgs,
          selectedAgent: "custom",
          selectedModel: modelVal,
          customApiKey: customApiKey || undefined,
          systemInstructionOverride: systemInstruction,
          temperature,
          maxTokens
        });

        const responseText = resData.text || "No response received.";
        const durationSec = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));

        const assistantMsg: Message = {
          id: (Date.now() + Math.random()).toString(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
          agent: modelVal,
          durationSec,
          keyStatus: resData.usedCustomKey ? "custom" : resData.usedServerKey ? "server" : "missing"
        };

        currentMsgs = [...currentMsgs, assistantMsg];
        
        localSessions = localSessions.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: currentMsgs };
          }
          return s;
        });
        onUpdateSessions(localSessions);
      } catch (err: any) {
        console.error(err);
        const durationSec = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
        const assistantMsg: Message = {
          id: (Date.now() + Math.random()).toString(),
          role: "assistant",
          content: `⚠️ **Inference Request Failed**\n\nCould not query model **${modelLabel}**.\n\n**Reason:** ${err.message || "Unknown proxy exception"}\n\n*Verify your API key setup in the parameter panel or environment config.*`,
          timestamp: new Date(),
          agent: modelVal,
          durationSec
        };

        currentMsgs = [...currentMsgs, assistantMsg];
        
        localSessions = localSessions.map(s => {
          if (s.id === activeSessionId) {
            return { ...s, messages: currentMsgs };
          }
          return s;
        });
        onUpdateSessions(localSessions);
      } finally {
        setLoadingModels(prev => prev.filter(m => m !== modelVal));
      }
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
                          {chatModels.find(m => m.value === s.selectedModel)?.label.split(" (")[0] || s.selectedModel}
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
                {chatModels.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-normal">
                {chatModels.find(m => m.value === selectedModel)?.desc}
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
                        {s.selectedModel ? s.selectedModel.split(",").map((mKey: string) => {
                          const found = chatModels.find(m => m.value === mKey);
                          return found ? found.label.split(" (")[0] : mKey;
                        }).join(" + ") : "No model"}
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
          <div className="space-y-2">
            <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Active LLM Engines (Multi-Select)</label>
            <div className="border border-zinc-850 rounded-xl bg-zinc-950 p-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
              {chatModels.map((m) => {
                const isChecked = selectedModelsArray.includes(m.value);
                return (
                  <label 
                    key={m.value}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-zinc-900/60 text-zinc-200" : "text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-300"
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleModel(m.value)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-[#375a7f] focus:ring-0 cursor-pointer"
                      style={{ accentColor }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[10px] leading-tight font-sans">{m.label}</span>
                      <span className="text-[8.5px] text-zinc-500 leading-normal font-sans line-clamp-1 mt-0.5">{m.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-[9px] text-zinc-500 font-sans leading-normal">
              Toggle multiple models to compare their responses side-by-side in real-time.
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 text-zinc-300 font-sans relative">
      
      {/* 0. Sliding Left Model Selector Drawer */}
      {showHeaderModelMenu && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-opacity duration-150 animate-fade-in" 
            onClick={() => setShowHeaderModelMenu(false)} 
          />
          
          {/* Left sliding container - Perfectly cloned width, bg, border and z-index to match primary sidebar */}
          <div 
            className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-zinc-900 border-r border-zinc-850 z-[101] shadow-2xl flex flex-col h-full animate-slide-in-left select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header - Matching primary sidebar height, padding, borders and bg */}
            <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/60 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Cpu className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                  Select Model
                </span>
              </div>
              <button 
                onClick={() => setShowHeaderModelMenu(false)}
                className="p-1 text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800/40 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Model List & Custom Add Form - Cloned padding, font scale and layouts */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
              
              {/* Models List */}
              <div className="space-y-2">
                <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-500">Available AI Models</div>
                <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 no-scrollbar border border-zinc-850/50 rounded-xl p-2 bg-zinc-950/20">
                  {chatModels.map((m) => {
                    const isChecked = selectedModelsArray.includes(m.value);
                    return (
                      <div
                        key={m.value}
                        onClick={() => handleToggleModel(m.value)}
                        className={`group flex flex-col p-2 rounded-lg cursor-pointer transition-all border ${
                          isChecked 
                            ? "bg-zinc-850/50 border-zinc-750/50 text-zinc-100" 
                            : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-sans font-medium truncate">{m.label}</span>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-[#375a7f] focus:ring-0 cursor-pointer"
                            style={{ accentColor }}
                          />
                        </div>
                        <p className="text-[9px] text-zinc-500 font-sans mt-0.5 leading-normal line-clamp-2">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Model Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-t border-zinc-850 pt-4 mb-1">
                  <PlusCircle className="w-3.5 h-3.5 text-zinc-500" style={{ color: accentColor }} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-200">
                    Register Custom Model
                  </span>
                </div>

                {/* Example card block - scaled down nicely for w-280px */}
                <div className="bg-zinc-950/40 border border-zinc-850/60 rounded-xl p-2.5 space-y-1 text-[9.5px]">
                  <div className="text-zinc-500 font-extrabold uppercase tracking-widest text-[8px] font-mono">Example Model Format</div>
                  <div className="grid grid-cols-[70px_1fr] gap-x-1">
                    <span className="text-zinc-500 uppercase">Model ID:</span>
                    <span className="text-zinc-300 font-mono bg-zinc-950/60 px-1 rounded truncate">google/gemini-1.5-pro</span>
                  </div>
                  <div className="grid grid-cols-[70px_1fr] gap-x-1">
                    <span className="text-zinc-500 uppercase">Name:</span>
                    <span className="text-zinc-300 font-sans font-medium">Gemini 1.5 Pro</span>
                  </div>
                </div>

                {/* Custom Model Form */}
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Model ID / Value</label>
                    <input 
                      type="text"
                      placeholder="e.g. meta-llama/llama-3-8b"
                      value={customModelId}
                      onChange={(e) => {
                        setCustomModelId(e.target.value);
                        setCustomError(null);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none font-mono text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Display Label</label>
                    <input 
                      type="text"
                      placeholder="e.g. Llama 3 8B"
                      value={customModelName}
                      onChange={(e) => {
                        setCustomModelName(e.target.value);
                        setCustomError(null);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none font-mono text-[10px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px]">Short Description</label>
                    <input 
                      type="text"
                      placeholder="e.g. Fast open source reasoning model"
                      value={customModelDesc}
                      onChange={(e) => setCustomModelDesc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-zinc-300 focus:outline-none font-mono text-[10px]"
                    />
                  </div>

                  {customError && (
                    <div className="text-rose-400 font-bold text-[9px] leading-tight">
                      ✕ {customError}
                    </div>
                  )}

                  <button
                    onClick={handleAddCustomModel}
                    className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
                  >
                    <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    Register Custom Model
                  </button>
                </div>

              </div>

            </div>

            {/* Apply & Close Button Footer */}
            <div className="p-3.5 border-t border-zinc-850 bg-zinc-930/30 shrink-0">
              <button
                onClick={() => setShowHeaderModelMenu(false)}
                className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-mono font-bold rounded-lg tracking-wider uppercase text-[10px] cursor-pointer transition-all flex items-center justify-center border border-zinc-750 hover:border-zinc-700 active:scale-98"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </>
      )}
      
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
            {/* Hamburger trigger for mobile menu drawer OR desktop sidebar toggle */}
            {isMobile && onOpenMenu ? (
              <button 
                onClick={onOpenMenu}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : !isMobile && onToggleSidebar ? (
              <button 
                onClick={onToggleSidebar}
                className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg cursor-pointer shrink-0 transition-all active:scale-95 flex items-center justify-center mr-1"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : null}
            
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-[11.5px] font-mono font-bold tracking-tight text-zinc-100 uppercase">AI Chat Playground</h2>
                <div className="relative mt-0.5">
                  <button 
                    onClick={() => setShowHeaderModelMenu(!showHeaderModelMenu)}
                    className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider select-none transition-all duration-150 cursor-pointer"
                  >
                    <span>{selectedModelsLabel}</span>
                    <ChevronDown className="w-2.5 h-2.5 text-zinc-500 shrink-0 ml-0.5" />
                  </button>
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
              className={`p-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 ${
                !isMobile && showParametersPanel ? "text-white border-zinc-700 bg-zinc-900" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Toggle Parameters Sidebar"
            >
              <SlidersHorizontal className="w-5 h-5" />
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

          {loadingModels.map((modelKey) => {
            const label = chatModels.find(m => m.value === modelKey)?.label || modelKey;
            const sTime = modelStartTimes[modelKey] || Date.now();
            return (
              <ThinkingBubble 
                key={modelKey}
                modelKey={modelKey}
                label={label}
                startTime={sTime}
              />
            );
          })}

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

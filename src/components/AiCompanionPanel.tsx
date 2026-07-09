import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Bot, Send, Trash2, Copy, Check, Terminal, Bug, BookOpen, Layers, 
  ChevronRight, ChevronLeft, Cpu, RefreshCw, FileText, Play, Info,
  Settings, Lock, Unlock, Sliders, Eye, EyeOff, ListChecks, Palette
} from "lucide-react";
import { GrixFileNode } from "../types/github";
import { safeStorage } from "../utils/safeStorage";

// Modular Imports
import { Message } from "../features/ai/types";
import { parseMarkdown } from "./ui/MarkdownText";
import { getFlatFilePaths } from "../features/ai/utils/promptBuilder";
import ChatHeader from "../features/ai/components/ChatHeader";
import ChatMessageList from "../features/ai/components/ChatMessageList";
import ChatInput from "../features/ai/components/ChatInput";

interface AiCompanionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFile: GrixFileNode | null;
  fileSystemTree: GrixFileNode[];
  onApplyCode: (code: string) => void;
  accentColor: string;
}

const POPULAR_MODELS = [
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nvidia Nemotron 550B (Free)", provider: "openrouter" },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", provider: "openrouter" },
  { value: "google/gemini-2.5-flash:free", label: "Gemini 2.5 Flash (Free)", provider: "openrouter" },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder 32B (Free)", provider: "openrouter" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", provider: "openrouter" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3 (Cheap Paid)", provider: "openrouter" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Standard)", provider: "openrouter" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet (Standard)", provider: "openrouter" }
];

export default function AiCompanionPanel({
  isOpen,
  onToggle,
  activeFile,
  fileSystemTree,
  onApplyCode,
  accentColor
}: AiCompanionPanelProps) {
  
  // Persistent Storage Settings
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedAgent, setSelectedAgent] = useState<"engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer">("engineer");
  const [showSettings, setShowSettings] = useState(false);

  // Dynamic Provider Model state values
  const [apiProvider, setApiProvider] = useState<"openrouter">("openrouter");
  const [selectedModel, setSelectedModel] = useState("nvidia/nemotron-3-ultra-550b-a55b:free");
  const [customApiKey, setCustomApiKey] = useState("");

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [applyTooltip, setApplyTooltip] = useState<string | null>(null);

  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; content: string }>>([]);
  const [hasServerKey, setHasServerKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize and load saved conversation / config settings
  useEffect(() => {
    const savedMessages = safeStorage.getItem("gothwad_ai_chats_v3");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error("Failed to parse saved chats", e);
      }
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am **Gothwad AI Companion**. I am fully integrated into your workspace environment.\n\nI can analyze any open file, debug build outputs, refactor directories, and inject code solutions directly into your editor view with a single click!\n\nOpen a file in your workspace, select an expert agent above, and ask me to help build your next masterpiece!",
          timestamp: new Date()
        }
      ]);
    }

    const savedModelVal = safeStorage.getItem("gothwad_ai_model");
    const savedKey = safeStorage.getItem("gothwad_ai_key");

    setApiProvider("openrouter");
    if (savedModelVal && POPULAR_MODELS.some(m => m.value === savedModelVal)) {
      setSelectedModel(savedModelVal);
    } else {
      setSelectedModel("nvidia/nemotron-3-ultra-550b-a55b:free");
    }
    if (savedKey) setCustomApiKey(savedKey);

    // Fetch OpenRouter API configuration status from backend
    fetch("/api/ai/config")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.hasServerKey === "boolean") {
          setHasServerKey(data.hasServerKey);
        }
      })
      .catch(err => console.error("Failed to check server AI config:", err));
  }, []);

  // Save chat state to local storage on update
  useEffect(() => {
    if (messages.length > 0) {
      safeStorage.setItem("gothwad_ai_chats_v3", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when loading or new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showSettings]);

  const handleSaveSettings = (provider: any, model: string, key: string) => {
    setApiProvider("openrouter");
    setSelectedModel(model);
    setCustomApiKey(key);

    safeStorage.setItem("gothwad_ai_provider", "openrouter");
    safeStorage.setItem("gothwad_ai_model", model);
    safeStorage.setItem("gothwad_ai_key", key);

    setShowSettings(false);
    triggerBannerNotification("Configuration settings updated successfully!");
  };

  const triggerBannerNotification = (text: string) => {
    setApplyTooltip(text);
    setTimeout(() => setApplyTooltip(null), 3000);
  };

  const clearChat = () => {
    const fresh = [
      {
        id: "welcome-cleared",
        role: "assistant",
        content: "Chat logs cleared. Gothwad pipeline is ready for a new session. Ask me any code question!",
        timestamp: new Date()
      }
    ];
    setMessages(fresh);
    safeStorage.setItem("gothwad_ai_chats_v3", JSON.stringify(fresh));
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
    triggerBannerNotification(`❇️ Applied code to ${activeFile.name} successfully!`);
  };

  // Build high-context prompt
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    // Attach any loaded workspace files context into the message payload
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

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]); // Clear attached files upon send dispatch
    setIsLoading(true);

    try {
      const filePaths = getFlatFilePaths(fileSystemTree);
      console.log("[Client AI] Sending chat request with model:", selectedModel, "Active file:", activeFile?.name);

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg),
          activeFile,
          workspaceFiles: filePaths,
          selectedAgent,
          apiProvider: "openrouter",
          selectedModel,
          customApiKey: customApiKey || undefined
        })
      });

      console.log("[Client AI] Received response. Status:", response.status, "OK:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[Client AI] Error response body parsed:", errorData);
        throw new Error(errorData.error || `Server returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      console.log("[Client AI] Response JSON parsed successfully. Keys:", Object.keys(resData));
      
      const responseText = resData.text || "No response received from the OpenRouter model.";
      const keyStatusVal = resData.usedCustomKey ? "custom" : resData.usedServerKey ? "server" : "missing";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        agent: selectedAgent,
        keyStatus: keyStatusVal
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("[Client AI] Gothwad AI API Error caught:", error);
      const diagnosticError = `${error.name || "Error"}: ${error.message || error}\n${error.stack ? error.stack.split("\n").slice(0, 3).join("\n") : ""}`;
      const assistantMsg: ErrorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Gothwad AI Client Exception Caught**\n\nFailed to complete the chat pipeline for model **${selectedModel}**.\n\n### 🔍 Diagnostic Details\n\`\`\`\n${diagnosticError}\n\`\`\`\n\n### ⚙️ Action Items & Troubleshooting\n1. **Verify your API Keys**: Go to the **AI Settings Control Panel** (the slider icon above) and ensure your OpenRouter API Key is entered correctly (if using a custom key).\n2. **Check Server Key**: If relying on the server-level key, confirm that \`OPENROUTER_API_KEY\` is configured in your environments.\n3. **Model Availability**: Ensure that the selected model is online on OpenRouter and your account has sufficient credits.`,
        timestamp: new Date(),
        agent: selectedAgent,
        keyStatus: customApiKey && customApiKey.trim() !== "" ? "custom" : hasServerKey ? "server" : "missing"
      };
      setMessages((prev) => [...prev, assistantMsg]);
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

  const CurrentAgentIcon = agents[selectedAgent]?.icon;

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
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        agents={agents}
        activeFile={activeFile}
        fileSystemTree={fileSystemTree}
        getFlatFilePaths={getFlatFilePaths}
        accentColor={accentColor}
      />

      {/* Settings control vs messages view switcher */}
      {showSettings ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-zinc-950 font-sans">
          <div className="flex items-center gap-2 text-zinc-300 pb-2 border-b border-zinc-900">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold tracking-wide">AI Settings Control Panel</h4>
          </div>

          {/* Provider Option selection info */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">API Provider & Status</label>
            <div className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-200 font-mono text-[10.5px] font-bold">OpenRouter AI Gateway</span>
                {hasServerKey ? (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                    ● Server Env Key Configured
                  </span>
                ) : (
                  <span className="text-[9px] bg-zinc-800 text-zinc-500 border border-zinc-750 px-1.5 py-0.5 rounded font-mono">
                    ● Server Env Key Missing
                  </span>
                )}
              </div>
              <p className="text-[9.5px] text-zinc-500 font-mono leading-relaxed">
                Gothwad Ai Studio operates exclusively via OpenRouter. This gives you instant, unified access to 100+ premium and free AI models from Google, Anthropic, Meta, and DeepSeek.
              </p>
              
              {/* Active Key Status Detail */}
              <div className="mt-1.5 pt-1.5 border-t border-zinc-850/40 text-[9.5px] font-mono leading-relaxed text-zinc-400">
                {customApiKey && customApiKey.trim() !== "" ? (
                  <span className="text-emerald-400">🟢 **Active Key**: Using your custom OpenRouter key (provided below) - Unlimited usage unlocked.</span>
                ) : hasServerKey ? (
                  <span className="text-blue-400">������ **Active Key**: Using Gothwad Ai Studio's host-level `.env` OpenRouter Key.</span>
                ) : (
                  <span className="text-red-400">⚠️ **Active Key**: No key detected. Please input your OpenRouter Key below or in host `.env`!</span>
                )}
              </div>
            </div>
          </div>

          {/* API Key configuration input field */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold flex items-center gap-1">
                {customApiKey ? <Lock className="w-2.5 h-2.5 text-green-500" /> : <Unlock className="w-2.5 h-2.5 text-zinc-650" />}
                OpenRouter API Key
              </label>
              <button
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="text-zinc-600 hover:text-zinc-300 text-[10px] font-mono cursor-pointer"
              >
                {apiKeyVisible ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <input
                type={apiKeyVisible ? "text" : "password"}
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Optional (falls back to system OPENROUTER_API_KEY)"
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-850 text-xs px-3 py-2 rounded-lg text-zinc-200 outline-none placeholder-zinc-700 select-text font-mono"
              />
            </div>
            <p className="text-[9px] text-zinc-500 font-mono">
              💡 Leave this empty to use Gothwad Ai Studio's host-level OpenRouter environment variables.
            </p>
          </div>

          {/* Dynamic Model Dropdown selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Select Active Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 text-xs px-2.5 py-2 rounded-lg text-zinc-300 outline-none cursor-pointer font-mono"
            >
              {POPULAR_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
              <option value="custom">-- Custom OpenRouter Model ID --</option>
            </select>
          </div>

          {/* If Custom model is toggle-selected */}
          {selectedModel === "custom" && (
            <div className="space-y-1.5 animate-slide-in text-left">
              <label className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Custom Model ID String</label>
              <input
                type="text"
                placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-800 text-xs px-3 py-2 rounded-lg text-zinc-300 outline-none select-text font-mono"
              />
            </div>
          )}

          {/* Settings Control Panel Actions footer buttons */}
          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => handleSaveSettings("openrouter", selectedModel, customApiKey)}
              className="flex-1 py-2 rounded-lg text-xs font-mono font-bold text-zinc-950 hover:scale-[1.01] active:scale-[0.99] transition-all text-center cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              Save Configuration
            </button>
            <button
              onClick={() => {
                handleSaveSettings("openrouter", "meta-llama/llama-3.3-70b-instruct:free", "");
              }}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            agents={agents}
            isLoading={isLoading}
            selectedAgent={selectedAgent}
            copiedId={copiedId}
            copyToClipboard={copyToClipboard}
            handleApplyToEditor={handleApplyToEditor}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            handleSend={handleSend}
            handleKeyPress={handleKeyPress}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            agents={agents}
            activeFile={activeFile}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            apiProvider={apiProvider}
            accentColor={accentColor}
            popularModels={POPULAR_MODELS}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            keyStatus={customApiKey && customApiKey.trim() !== "" ? "custom" : hasServerKey ? "server" : "missing"}
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

// Private interface for local compilation fallback state error
interface ErrorMessage {
  id: string;
  role: "assistant";
  content: string;
  timestamp: Date;
  agent?: string;
  keyStatus?: "custom" | "server" | "missing";
}

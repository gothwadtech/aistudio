import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Trash2, Cpu, Sliders, Play, Terminal, HelpCircle, 
  MessageSquare, Sparkles, Copy, Check, Eye, EyeOff, Key 
} from "lucide-react";
import { Message } from "../ai/types";
import { safeStorage } from "../../utils/safeStorage";

interface ChatStudioProps {
  accentColor: string;
  isMobile: boolean;
}

const MODELS = [
  { value: "google/gemini-2.5-flash:free", label: "Gemini 2.5 Flash (Free)", desc: "Fast, multi-modal, great for general tasks." },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence." },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers." },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking." },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax." },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring." }
];

export default function ChatStudio({ accentColor, isMobile }: ChatStudioProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat Configuration
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash:free");
  const [systemInstruction, setSystemInstruction] = useState("You are an elite AI assistant trained by Google. Respond with precise, high-fidelity details, formatting code elegantly using Markdown.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [customApiKey, setCustomApiKey] = useState(() => safeStorage.getItem("gothwad_ai_key") || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history or seed initial welcome message
  useEffect(() => {
    const saved = safeStorage.getItem("gothwad_studio_chat_studio_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error(e);
      }
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Welcome to **Gothwad Ai Studio Chat Workstation**!\n\nThis is a high-fidelity interactive chat sandbox styled like Google AI Studio. You can chat with advanced free or premium models, craft deep system instructions, configure inference parameters (temperature, token ceilings), and test complex prompt pipelines.\n\nType your query below to begin, or adjust the parameter console!",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Save messages
  const saveMessages = (msgs: Message[]) => {
    setMessages(msgs);
    safeStorage.setItem("gothwad_studio_chat_studio_messages", JSON.stringify(msgs));
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    const newMsgs = [...messages, userMsg];
    saveMessages(newMsgs);
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
          // We include our custom system prompt in the server payload by merging it if needed
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

      saveMessages([...newMsgs, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Inference Request Failed**\n\nCould not query model **${selectedModel}**.\n\n**Reason:** ${err.message || "Unknown proxy exception"}\n\n*Verify your API key setup in the parameter panel or environment config.*`,
        timestamp: new Date()
      };
      saveMessages([...newMsgs, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the conversation history?")) {
      const initial = [
        {
          id: "welcome",
          role: "assistant" as const,
          content: "Conversation cleared. Ready for a new pipeline. Adjust parameters and begin!",
          timestamp: new Date()
        }
      ];
      saveMessages(initial);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApiKeyChange = (val: string) => {
    setCustomApiKey(val);
    safeStorage.setItem("gothwad_ai_key", val);
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 text-zinc-300 font-sans relative">
      
      {/* 1. Left Side Config Parameter Panel (Desktop view only) */}
      {!isMobile && (
        <div className="w-[300px] bg-zinc-900 border-r border-zinc-850 flex flex-col shrink-0 overflow-y-auto no-scrollbar font-mono text-xs">
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
            <span className="font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              Configuration
            </span>
          </div>

          <div className="p-4 space-y-5">
            {/* Model Selector */}
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

            {/* System Instructions */}
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

            {/* Temperature Slider */}
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
              />
            </div>

            {/* Max Output Tokens */}
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

            {/* OpenRouter API Key override */}
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
      )}

      {/* 2. Main Chat Conversation Panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {/* Chat Studio Top Header */}
        <div className="h-14 border-b border-zinc-850 bg-zinc-900/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#375a7f]/15 border border-[#375a7f]/30 flex items-center justify-center text-[#375a7f]">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold tracking-tight text-zinc-100">AI Chat Workstation</h2>
              <p className="text-[9.5px] font-mono text-zinc-500 mt-0.5 hidden sm:block">Multi-Model Playground Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setShowConfigDrawer(true)}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-400 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-zinc-500" />
                <span>Config</span>
              </button>
            )}

            <button
              onClick={handleClear}
              className="p-1.5 bg-zinc-900 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-500 border border-zinc-800 hover:border-rose-900/40 rounded-lg transition-all cursor-pointer"
              title="Clear Thread"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-zinc-950">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"} items-start`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser 
                    ? "bg-[#375a7f]/15 text-[#375a7f] border-[#375a7f]/20" 
                    : "bg-zinc-900 text-zinc-300 border-zinc-800"
                }`}>
                  {isUser ? <span className="text-xs font-mono font-bold">U</span> : <Cpu className="w-3.5 h-3.5" />}
                </div>

                {/* Message Body Bubble */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className={`rounded-2xl p-3.5 ${
                    isUser 
                      ? "bg-zinc-900/60 text-zinc-200 rounded-tr-none border border-zinc-850" 
                      : "bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-850"
                  }`}>
                    <p className="text-xs font-sans whitespace-pre-wrap leading-relaxed select-text select-text-important">
                      {msg.content}
                    </p>
                  </div>
                  
                  {/* Message meta actions */}
                  <div className={`flex items-center gap-3 px-1 text-[9.5px] font-mono text-zinc-550 ${isUser ? "justify-end" : ""}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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

        {/* Input Text Form Bottom Row */}
        <div className="p-3 bg-zinc-900/60 border-t border-zinc-850 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Ask anything using ${MODELS.find(m => m.value === selectedModel)?.label.split(" (")[0]}...`}
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-xs font-sans text-zinc-100 focus:outline-none disabled:opacity-50 transition-all select-text"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-2 rounded-lg bg-zinc-800 text-white disabled:opacity-35 transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto flex justify-between items-center text-[9px] font-mono text-zinc-600 mt-2 px-1">
            <span>Model: {selectedModel}</span>
            <span>Temperature: {temperature}</span>
          </div>
        </div>
      </div>

      {/* 3. Responsive Configuration Drawer (Mobile view only) */}
      {isMobile && showConfigDrawer && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in flex"
          onClick={() => setShowConfigDrawer(false)}
        >
          <div 
            className="w-[280px] max-w-[85vw] h-full bg-zinc-900 flex flex-col shadow-2xl animate-[slideInRight_0.2s_ease-out] border-l border-zinc-850 ml-auto font-mono text-xs select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                Parameters
              </span>
              <button 
                onClick={() => setShowConfigDrawer(false)}
                className="p-1 text-zinc-500 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase text-[9px]">Model Target</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg p-2 text-zinc-300 font-sans text-xs"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* System Instructions */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase text-[9px]">System Instructions</label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  rows={4}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg p-2.5 text-zinc-300 font-sans text-xs resize-none"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <label className="text-zinc-500 font-bold uppercase text-[9px]">Temperature</label>
                  <span className="text-emerald-400 font-bold">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#375a7f] h-1 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 font-bold uppercase text-[9px]">Max Output Tokens</label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300"
                />
              </div>

              {/* OpenRouter key */}
              <div className="space-y-2 border-t border-zinc-850 pt-4">
                <span className="font-bold uppercase text-[9px] text-zinc-500">OpenRouter API Key Override</span>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 font-mono text-[10px]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-850">
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="w-full py-2 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white font-bold rounded-lg tracking-wide uppercase text-[10px] cursor-pointer"
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

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Terminal, 
  User, 
  Cpu, 
  SlidersHorizontal,
  RefreshCw,
  Clock,
  HelpCircle,
  Code2,
  ChevronRight,
  Info
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import LeftSidebar, { GothwadSession, Message } from "./LeftSidebar";
import RightSidebar, { SUPPORTED_MODELS } from "./RightSidebar";
import { safeStorage } from "../../../utils/safeStorage";

interface GothwadStudioProps {
  accentColor: string;
  customApiKey?: string;
  onToggleSidebar?: () => void;
}

// Custom CodeBlock Component for elegant code rendering with Copy to Clipboard support
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-mono text-xs text-zinc-300">
      <div className="bg-zinc-900/60 px-4 py-2 border-b border-zinc-850 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto no-scrollbar max-h-[400px]">
        <pre className="whitespace-pre">{code.trim()}</pre>
      </div>
    </div>
  );
}

// Function to parse and render message content with optional inline code or standard paragraph styling
function renderMessageContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : "code";
      const code = match ? match[2] : part.slice(3, -3);
      return <CodeBlock key={index} language={lang} code={code} />;
    }

    // Secondary inline code split `code`
    const inlineParts = part.split(/`([^`]+)`/g);
    if (inlineParts.length > 1) {
      return (
        <span key={index} className="leading-relaxed text-zinc-300 text-sm whitespace-pre-wrap">
          {inlineParts.map((subPart, subIndex) => {
            if (subIndex % 2 === 1) {
              return (
                <code key={subIndex} className="bg-zinc-850 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-zinc-800 mx-0.5">
                  {subPart}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    }

    return (
      <p key={index} className="whitespace-pre-wrap leading-relaxed text-zinc-300 text-sm mb-2 last:mb-0">
        {part}
      </p>
    );
  });
}

export default function GothwadStudio({ accentColor, customApiKey, onToggleSidebar }: GothwadStudioProps) {
  const [sessions, setSessions] = useState<GothwadSession[]>(() => {
    try {
      const saved = safeStorage.getItem("gothwad_chat_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Default starting session
    return [
      {
        id: "1",
        title: "Default Chat Session",
        messages: [
          {
            id: "welcome-msg",
            role: "assistant",
            content: "Hello! Welcome to the Gothwad AI Chat Playground. I am ready to process your prompts using high-fidelity reasoning models. Configure system parameters on the right and start chatting!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            model: "google/gemini-2.5-flash"
          }
        ],
        systemPrompt: "You are a helpful and intelligent AI assistant powered by Gothwad AI. Provide detailed, accurate answers with clean formatting.",
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        model: "google/gemini-2.5-flash",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return sessions.length > 0 ? sessions[0].id : null;
  });

  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showParametersPanel, setShowParametersPanel] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1280;
    }
    return true;
  });
  const [showLeftSidebar, setShowLeftSidebar] = useState(() => {
    try {
      const override = safeStorage.getItem("gothwad_gothwad_ai_show_left_sidebar");
      if (override === "false") {
        safeStorage.removeItem("gothwad_gothwad_ai_show_left_sidebar");
        return false;
      }
    } catch (e) {}

    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Active session parameters reference
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, generating]);

  // Save sessions to local storage on change
  useEffect(() => {
    try {
      safeStorage.setItem("gothwad_chat_sessions", JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  // Individual setter helpers that target the active session properties
  const updateActiveSessionParam = (key: keyof GothwadSession, value: any) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession?.id) {
        return { ...s, [key]: value };
      }
      return s;
    }));
  };

  const setSelectedModel = (model: string) => updateActiveSessionParam("model", model);
  const setSystemPrompt = (prompt: string) => updateActiveSessionParam("systemPrompt", prompt);
  const setTemperature = (temp: number) => updateActiveSessionParam("temperature", temp);
  const setMaxTokens = (tokens: number) => updateActiveSessionParam("maxTokens", tokens);
  const setTopP = (p: number) => updateActiveSessionParam("topP", p);

  const handleSelectSession = (session: GothwadSession) => {
    setActiveSessionId(session.id);
  };

  const handleNewSession = () => {
    const id = Date.now().toString();
    const newSession: GothwadSession = {
      id,
      title: `New Chat Session`,
      messages: [
        {
          id: `welcome-${id}`,
          role: "assistant",
          content: "Starting a new playground chat. Choose your model on the right and ask me anything!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: activeSession?.model || "google/gemini-2.5-flash"
        }
      ],
      systemPrompt: "You are a helpful and intelligent AI assistant powered by Gothwad AI. Provide detailed, accurate answers with clean formatting.",
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      model: activeSession?.model || "google/gemini-2.5-flash",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  const handleClearSessions = () => {
    try {
      safeStorage.removeItem("gothwad_chat_sessions");
    } catch (e) {}
    const defaultS: GothwadSession = {
      id: "1",
      title: "Default Chat Session",
      messages: [
        {
          id: "welcome-msg",
          role: "assistant",
          content: "Hello! Welcome to the Gothwad AI Chat Playground. I am ready to process your prompts using high-fidelity reasoning models. Configure system parameters on the right and start chatting!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: "google/gemini-2.5-flash"
        }
      ],
      systemPrompt: "You are a helpful and intelligent AI assistant powered by Gothwad AI. Provide detailed, accurate answers with clean formatting.",
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      model: "google/gemini-2.5-flash",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setSessions([defaultS]);
    setActiveSessionId("1");
  };

  // Chat message submit dispatcher
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || generating || !activeSession) return;

    const userText = inputText;
    setInputText("");

    // Create user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Update session list and title if it's the first non-default user message
    const updatedMessages = [...activeSession.messages, userMsg];
    const isFirstUserMessage = activeSession.messages.filter(m => m.role === "user").length === 0;
    const nextTitle = isFirstUserMessage 
      ? (userText.length > 25 ? userText.substring(0, 25) + "..." : userText) 
      : activeSession.title;

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          title: nextTitle,
          messages: updatedMessages
        };
      }
      return s;
    }));

    setGenerating(true);

    // AI Semantic Simulation based on chosen model
    setTimeout(() => {
      let responseText = "";
      const queryLower = userText.toLowerCase();

      // DeepSeek R1 Reasoning specific structure with Chain of Thought steps
      if (activeSession.model === "deepseek/deepseek-r1") {
        let cotSteps = "Thinking Process:\n1. Deconstructing prompt: \"" + userText + "\"\n2. Identifying optimal deductive breakdown\n3. Synthesizing semantic constraints and user guidelines\n4. Formulating step-by-step rigorous logical output...\n";
        
        if (queryLower.includes("code") || queryLower.includes("typescript") || queryLower.includes("react") || queryLower.includes("write a")) {
          responseText = cotSteps + "\nHere is the robust, logical response you requested:\n\n```typescript\n// DeepSeek R1 optimized algorithm\ninterface SearchNode {\n  value: string;\n  weight: number;\n}\n\nexport function computeOptimalRoute(nodes: SearchNode[]): SearchNode | null {\n  if (!nodes || nodes.length === 0) return null;\n  return nodes.reduce((highest, current) => \n    current.weight > highest.weight ? current : highest\n  , nodes[0]);\n}\n```\n\n### Explanation:\n- Evaluates arrays safely.\n- Operates in linear $O(N)$ space and time complexity.\n- Maintains absolute type integrity.";
        } else if (queryLower.includes("riddle") || queryLower.includes("math") || queryLower.includes("solve") || queryLower.includes("father")) {
          responseText = cotSteps + "\n### Deduction:\nLet's represent the father's current age as $F$ and the son's current age as $S$.\n1. $F = 4S$\n2. In 20 years, the father will be twice as old as the son: $F + 20 = 2(S + 20)$\n\nSubstitute equation (1) into equation (2):\n$$4S + 20 = 2S + 40$$\n$$2S = 20$$\n$$S = 10$$\n\nThus, the son is currently **10 years old**, and the father is $4 \\times 10 = $ **40 years old**.";
        } else {
          responseText = cotSteps + "\nHere is a structured, mathematically sound response tailored to your query:\n- **Topic**: Deep Deductive Analysis\n- **Logic Path**: Tree-of-thought verification completed.\n- **Resolution**: Let's break down the answer systematically to guarantee maximum clarity and minimize semantic hallucinations.";
        }
      } 
      // Qwen Coder specific response
      else if (activeSession.model === "qwen/qwen-2.5-coder-32b-instruct") {
        if (queryLower.includes("javascript") || queryLower.includes("typescript") || queryLower.includes("code") || queryLower.includes("react") || queryLower.includes("html") || queryLower.includes("css")) {
          responseText = "Here is a highly optimized coding template crafted by Qwen 2.5 Coder:\n\n```typescript\nimport React, { useState } from 'react';\n\ninterface CounterProps {\n  initialCount?: number;\n  step?: number;\n}\n\nexport const GothwadCounter: React.FC<CounterProps> = ({ initialCount = 0, step = 1 }) => {\n  const [count, setCount] = useState<number>(initialCount);\n\n  return (\n    <div className=\"flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm\">\n      <span className=\"text-xs text-zinc-500 font-mono\">QWEN CODER PRESET</span>\n      <div className=\"text-3xl font-bold font-mono text-white\">{count}</div>\n      <div className=\"flex gap-2\">\n        <button \n          onClick={() => setCount(prev => prev - step)} \n          className=\"px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-all cursor-pointer\"\n        >\n          Decrease\n        </button>\n        <button \n          onClick={() => setCount(prev => prev + step)} \n          className=\"px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer\"\n        >\n          Increase\n        </button>\n      </div>\n    </div>\n  );\n};\n```\n\nThis component utilizes standard hooks, proper typing interfaces, and beautiful Tailwind utility classes for modern rendering.";
        } else {
          responseText = "I am Qwen 2.5 Coder 32B. Although I specialize in syntax and debugging, I can also help with general technical questions:\n\n```json\n{\n  \"status\": \"ready\",\n  \"optimized_for\": [\"typescript\", \"react\", \"vite\", \"node_js\"],\n  \"instruction_compliance\": true\n}\n```\nPlease let me know if you would like me to draft code snippets, write unit tests, or locate logic bugs!";
        }
      }
      // Claude 3.5 Sonnet specific response
      else if (activeSession.model === "anthropic/claude-3.5-sonnet") {
        if (queryLower.includes("poem") || queryLower.includes("creative") || queryLower.includes("write")) {
          responseText = "Here is a poetic verse composed with the descriptive elegance of Claude 3.5 Sonnet:\n\n*Digital constellations flicker on a liquid sky,*\n*Where micro-routing nodes carry silent questions high.*\n*No longer bound by wires, the silicon starts to speak,*\n*Finding within the quiet current, the connections that we seek.*\n*A brief dispatch of light, a memory held in stone,*\n*We trace the pathways forward, together yet alone.*";
        } else {
          responseText = "I have synthesized an elaborate response to your query under the Claude 3.5 Sonnet persona. Let me organize this clearly:\n\n### 1. Conceptual Framework\nTo solve this effectively, we should separate concerns and avoid bundling all logic into an opaque container. A modular strategy guarantees robust scalability.\n\n### 2. Execution Strategy\n- **Aesthetic Unity**: High contrast, rich typography, spacious padding.\n- **Linguistic Clarity**: Concise paragraph structures that communicate value immediately.\n- **System Cohesion**: Integration of standard parameters for maximum configuration safety.";
        }
      }
      // Llama 3.3 conversational response
      else if (activeSession.model === "meta-llama/llama-3.3-70b-instruct") {
        responseText = "Hello there! I am Llama 3.3 70B, your open-source high-context assistant. \n\nLet's discuss this conversational query. In order to help you efficiently, I have mapped your request against my pre-trained conversational knowledge weights:\n- **Linguistic Context**: Sourced from high-fidelity dialogue data.\n- **Tone**: Professional, friendly, and deeply educational.\n\nHow else can I assist you with your thoughts or calculations today? I'm ready to keep diving deeper into any topic!";
      }
      // Gemini 2.5 Flash response (default/fallback)
      else {
        responseText = "I've processed your prompt with Gemini 2.5 Flash. Here is your fast, structured answer:\n\n- **Engine Status**: Online & Responsive\n- **Latency**: Highly Optimized (< 300ms)\n- **Recommendation**: Use this generalist model for high-throughput translation, text summarization, and rapid conceptual lookups.\n\nIs there anything specific you would like to prototype next?";
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: activeSession.model
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...s.messages, assistantMsg]
          };
        }
        return s;
      }));

      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 font-sans text-zinc-300 relative">
      {/* 1. Left Sidebar (Chat History) */}
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
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              onClearSessions={handleClearSessions}
              onToggleSidebar={() => {
                setShowLeftSidebar(false);
                if (onToggleSidebar) {
                  onToggleSidebar();
                }
              }}
            />
          </div>
        </>
      )}

      {/* 2. Main content area (Chat Window) */}
      <div className="flex-1 flex flex-col overflow-hidden h-full bg-zinc-950">
        {/* Header */}
        <GlobalStudioHeader
          title="Gothwad AI"
          badge="AI CHAT PLAYGROUND"
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        {/* Conversation Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <Bot className="w-12 h-12 text-zinc-700 animate-pulse" style={{ color: accentColor }} />
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider font-mono">No Active Chat Session</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Click the "New Chat Playground" button in the sidebar to start a new dynamic conversation thread!
              </p>
            </div>
          ) : activeSession.messages.length === 1 && activeSession.messages[0].id.startsWith("welcome") ? (
            /* Welcome / Onboarding Card State */
            <div className="max-w-2xl mx-auto pt-8 space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mb-2">
                  <Bot className="w-7 h-7 text-indigo-400" style={{ color: accentColor }} />
                </div>
                <h1 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
                  Gothwad AI Workspace
                </h1>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  A high-fidelity developer-first workspace. Choose a specialized language model, configure parameters, and chat with precision.
                </p>
              </div>

              {/* Starter Presets */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setInputText("Write a recursive function to check if a string is a palindrome in TypeScript")}
                  className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-4 text-left transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <Code2 className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-semibold text-zinc-300 mb-1">Coding Assistant</h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Write high-performance functions, debug systems, or format JSON schemas.
                  </p>
                </button>

                <button
                  onClick={() => setInputText("Solve this logic problem: A father is 4 times older than his son, in 20 years he will be twice as old. How old are they?")}
                  className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-4 text-left transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <Cpu className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xs font-semibold text-zinc-300 mb-1">Deductive Logic</h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Test reasoning abilities, complex mathematical calculations, and step-by-step logic.
                  </p>
                </button>
              </div>

              {/* Active Model Summary Badges */}
              <div className="bg-zinc-900/20 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-3">
                <Info className="w-5 h-5 text-zinc-500 shrink-0" />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Current Engine: <strong className="text-zinc-300">{SUPPORTED_MODELS.find(m => m.id === activeSession.model)?.name}</strong>. You can switch to other models like DeepSeek Reasoning or Claude Sonnet in the configuration panel.
                </p>
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeSession.messages.map((msg) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${isAssistant ? "justify-start" : "justify-end"} animate-[fadeIn_0.15s_ease-out]`}
                  >
                    {/* Assistant Icon */}
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 select-none">
                        <Bot className="w-4.5 h-4.5 text-indigo-400" style={{ color: accentColor }} />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div className="flex flex-col max-w-[85%] space-y-1">
                      {/* Model Name and timestamp info row */}
                      <div className={`flex items-center gap-2 text-[9px] font-mono text-zinc-500 ${isAssistant ? "justify-start" : "justify-end"}`}>
                        {isAssistant && (
                          <span className="text-zinc-400 font-semibold uppercase tracking-wider">{msg.model?.split("/").pop()}</span>
                        )}
                        {!isAssistant && <span className="text-zinc-400 font-semibold">User</span>}
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div 
                        className={`p-4 rounded-2xl ${
                          isAssistant 
                            ? "bg-zinc-900/50 border border-zinc-850 text-zinc-200" 
                            : "bg-zinc-900 text-zinc-100 border border-transparent"
                        }`}
                        style={!isAssistant ? { borderLeft: `3px solid ${accentColor}` } : {}}
                      >
                        {renderMessageContent(msg.content)}
                      </div>
                    </div>

                    {/* User Icon */}
                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 select-none">
                        <User className="w-4.5 h-4.5 text-zinc-400" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming/Generating Thinking Indicator */}
              {generating && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5 select-none animate-pulse">
                    <Bot className="w-4.5 h-4.5 text-indigo-400 animate-spin-slow" style={{ color: accentColor }} />
                  </div>
                  <div className="flex flex-col space-y-1 max-w-[85%] w-full">
                    <div className="text-[9px] font-mono text-zinc-600">
                      {activeSession.model.split("/").pop()?.toUpperCase()} THINKING...
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex items-center gap-2.5">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        {activeSession.model === "deepseek/deepseek-r1" ? "Formulating step-by-step reasoning steps..." : "Analyzing semantic intent..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll reference target */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer Prompt Input */}
        {activeSession && (
          <div className="p-4 border-t border-zinc-900 shrink-0 bg-zinc-950/80">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask ${SUPPORTED_MODELS.find(m => m.id === activeSession.model)?.name}...`}
                disabled={generating}
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm placeholder-zinc-600 text-zinc-100 transition-all outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={generating || !inputText.trim()}
                className="absolute right-2.5 top-2 p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-all cursor-pointer active:scale-95"
                style={{ backgroundColor: accentColor }}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="max-w-3xl mx-auto flex items-center justify-between text-[10px] text-zinc-600 mt-2 font-mono">
              <div className="flex items-center gap-1">
                <span>Model: <strong>{SUPPORTED_MODELS.find(m => m.id === activeSession.model)?.name}</strong></span>
                <span>•</span>
                <span>Temp: <strong>{activeSession.temperature}</strong></span>
              </div>
              <span>Gothwad AI Studio Playground</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar (Parameters) */}
      {showParametersPanel && activeSession && (
        <>
          {/* Backdrop overlay to close when clicking outside */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30"
            onClick={() => setShowParametersPanel(false)}
          />
          <div className="absolute right-0 top-0 h-full z-40 shrink-0 shadow-2xl bg-zinc-900 border-l border-zinc-850">
            <RightSidebar
              accentColor={accentColor}
              selectedModel={activeSession.model}
              setSelectedModel={setSelectedModel}
              systemPrompt={activeSession.systemPrompt}
              setSystemPrompt={setSystemPrompt}
              temperature={activeSession.temperature}
              setTemperature={setTemperature}
              maxTokens={activeSession.maxTokens}
              setMaxTokens={setMaxTokens}
              topP={activeSession.topP}
              setTopP={setTopP}
              onClose={() => setShowParametersPanel(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

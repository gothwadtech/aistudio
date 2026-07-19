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
  ChevronDown,
  Info
} from "lucide-react";
import GothwadChatHeader from "./GothwadChatHeader";
import LeftSidebar, { GothwadSession, Message } from "./LeftSidebar";
import RightSidebar, { SUPPORTED_MODELS } from "./RightSidebar";
import GothwadChatInput from "./GothwadChatInput";
import GothwadChatScreen from "./GothwadChatScreen";
import GothwadModel from "./GothwadModel";
import { safeStorage } from "../../../utils/safeStorage";
import { callAiChat } from "../../../utils/aiClient";

interface GothwadStudioProps {
  accentColor: string;
  customApiKey?: string;
  onToggleSidebar?: () => void;
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
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  
  const handleUpdateInputText = (val: string) => {
    setInputText(val);
    if (activeSessionId) {
      setDrafts(prev => ({
        ...prev,
        [activeSessionId]: val
      }));
    }
  };

  // Load draft text when switching active session
  useEffect(() => {
    if (activeSessionId) {
      setInputText(drafts[activeSessionId] || "");
    } else {
      setInputText("");
    }
  }, [activeSessionId]);

  const [generating, setGenerating] = useState(false);
  const [showHeaderModelMenu, setShowHeaderModelMenu] = useState(false);
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
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || generating || !activeSession) return;

    const userText = inputText;
    setInputText("");
    if (activeSessionId) {
      setDrafts(prev => ({ ...prev, [activeSessionId]: "" }));
    }

    // Create user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Update session list and title if it's the first non-default user message
    const isFirstUserMessage = activeSession.messages.filter(m => m.role === "user").length === 0;
    const nextTitle = isFirstUserMessage 
      ? (userText.length > 25 ? userText.substring(0, 25) + "..." : userText) 
      : activeSession.title;

    const updatedMessages = [...activeSession.messages, userMsg];

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

    try {
      // Map models to their OpenRouter free tier counterpart if applicable
      let modelToUse = activeSession.model;
      if (modelToUse === "deepseek/deepseek-r1") {
        modelToUse = "deepseek/deepseek-r1:free";
      } else if (modelToUse === "meta-llama/llama-3.3-70b-instruct") {
        modelToUse = "meta-llama/llama-3.3-70b-instruct:free";
      } else if (modelToUse === "qwen/qwen-2.5-coder-32b-instruct") {
        modelToUse = "qwen/qwen-2.5-coder-32b-instruct:free";
      }

      // Convert Gothwad Session messages format to aiClient ChatMessage format
      const clientMessages = updatedMessages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const resData = await callAiChat({
        messages: clientMessages,
        selectedAgent: "custom",
        selectedModel: modelToUse,
        customApiKey: customApiKey || undefined,
        systemInstructionOverride: activeSession.systemPrompt,
        temperature: activeSession.temperature,
        maxTokens: activeSession.maxTokens
      });

      const responseText = resData.text;

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
            messages: [...updatedMessages, assistantMsg]
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error("[Gothwad AI Error]", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Gothwad AI Connection Error:** ${err?.message || "Failed to retrieve response from OpenRouter."}\n\nPlease check if your OpenRouter API Key is set correctly in settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: activeSession.model
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...updatedMessages, errorMsg]
          };
        }
        return s;
      }));
    } finally {
      setGenerating(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    if (generating || !activeSession) return;
    
    // Find the message index
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    let updatedMessages = [...activeSession.messages];
    let userMsgIndex = -1;
    
    if (activeSession.messages[msgIndex].role === "assistant") {
      // Find the user message before this assistant message
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (activeSession.messages[i].role === "user") {
          userMsgIndex = i;
          break;
        }
      }
      if (userMsgIndex !== -1) {
        // Trim messages up to the user message
        updatedMessages = activeSession.messages.slice(0, userMsgIndex + 1);
      }
    } else {
      userMsgIndex = msgIndex;
      updatedMessages = activeSession.messages.slice(0, userMsgIndex + 1);
    }

    if (userMsgIndex === -1) return;

    // Set sessions with trimmed messages
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          messages: updatedMessages
        };
      }
      return s;
    }));

    setGenerating(true);

    try {
      let modelToUse = activeSession.model;
      if (modelToUse === "deepseek/deepseek-r1") {
        modelToUse = "deepseek/deepseek-r1:free";
      } else if (modelToUse === "meta-llama/llama-3.3-70b-instruct") {
        modelToUse = "meta-llama/llama-3.3-70b-instruct:free";
      } else if (modelToUse === "qwen/qwen-2.5-coder-32b-instruct") {
        modelToUse = "qwen/qwen-2.5-coder-32b-instruct:free";
      }

      const clientMessages = updatedMessages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const resData = await callAiChat({
        messages: clientMessages,
        selectedAgent: "custom",
        selectedModel: modelToUse,
        customApiKey: customApiKey || undefined,
        systemInstructionOverride: activeSession.systemPrompt,
        temperature: activeSession.temperature,
        maxTokens: activeSession.maxTokens
      });

      const responseText = resData.text;

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
            messages: [...updatedMessages, assistantMsg]
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error("[Gothwad AI Error]", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Gothwad AI Connection Error:** ${err?.message || "Failed to retrieve response from OpenRouter."}\n\nPlease check if your OpenRouter API Key is set correctly in settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: activeSession.model
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...updatedMessages, errorMsg]
          };
        }
        return s;
      }));
    } finally {
      setGenerating(false);
    }
  };

  // Resolve active model label dynamically
  const activeModelLabel = (() => {
    if (!activeSession) return "Select Model";
    const baseModel = SUPPORTED_MODELS.find(m => m.id === activeSession.model);
    if (baseModel) return baseModel.name;

    // Check custom models in local storage
    try {
      const saved = safeStorage.getItem("gothwad_custom_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        const customModel = parsed.find((m: any) => m.id === activeSession.model);
        if (customModel) return customModel.name;
      }
    } catch (e) {}

    // Fallback: split or use ID
    return activeSession.model?.split("/").pop() || activeSession.model || "Select Model";
  })();

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 font-sans text-zinc-300 relative">
      {/* 0. Sliding Left Model Selector Drawer */}
      <GothwadModel
        accentColor={accentColor}
        selectedModel={activeSession?.model || "google/gemini-2.5-flash"}
        onSelectModel={(modelId) => setSelectedModel(modelId)}
        onClose={() => setShowHeaderModelMenu(false)}
        isOpen={showHeaderModelMenu}
      />

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
        <GothwadChatHeader
          activeModelLabel={activeModelLabel}
          setShowHeaderModelMenu={setShowHeaderModelMenu}
          showLeftSidebar={showLeftSidebar}
          setShowLeftSidebar={setShowLeftSidebar}
          showParametersPanel={showParametersPanel}
          setShowParametersPanel={setShowParametersPanel}
          onNewSession={handleNewSession}
          accentColor={accentColor}
        />

        {/* Conversation Pane */}
        <GothwadChatScreen
          activeSession={activeSession}
          accentColor={accentColor}
          generating={generating}
          setInputText={handleUpdateInputText}
          onRetryMessage={handleRetryMessage}
        />

        {/* Footer Prompt Input */}
        {activeSession && (
          <GothwadChatInput
            inputText={inputText}
            setInputText={handleUpdateInputText}
            onSubmit={handleSendMessage}
            generating={generating}
            accentColor={accentColor}
            activeModelName={activeModelLabel}
            temperature={activeSession.temperature}
          />
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

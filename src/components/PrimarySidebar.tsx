import React, { useState, useEffect } from "react";
import { 
  Sparkles,
  MessageSquare,
  FileCode2,
  GitBranch,
  Settings,
  LogIn,
  FolderTree,
  UploadCloud,
  Database,
  ChevronRight,
  ChevronLeft,
  Github,
  Plus,
  Trash2,
  History,
  Sliders,
  Key,
  Eye,
  EyeOff,
  Cpu,
  X,
  Image,
  Video,
  Music,
  Mic,
  Globe,
  AppWindow,
  Presentation
} from "lucide-react";

import IntegrationsPanel from "./IntegrationsPanel";
import SettingsPanel from "./sidebar/SettingsPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";
import { safeStorage } from "../utils/safeStorage";

const MODELS = [
  { value: "openrouter/auto", label: "Gothwad AI Auto Router", desc: "India's First LLM AI - automatically routes queries to optimal AI models." },
  { value: "groq/llama-3.3-70b-versatile", label: "Groq Llama 3.3 70B (Fast)", desc: "Super-fast Llama 3.3 model hosted on Groq hardware." },
  { value: "groq/deepseek-r1-distill-llama-70b", label: "Groq DeepSeek R1 70B (Reasoning)", desc: "DeepSeek R1 reasoning model distilled onto Llama 70B with ultra-fast inference." },
  { value: "groq/llama-3.1-8b-instant", label: "Groq Llama 3.1 8B (Instant)", desc: "Lightweight and instant response Llama model." },
  { value: "groq/gemma2-9b-it", label: "Groq Gemma 2 9B (Fast)", desc: "Google's Gemma 2 9B model running fast on Groq." },
  { value: "groq/mixtral-8x7b-32768", label: "Groq Mixtral 8x7B (Fast)", desc: "MoE Mixtral model optimized for speed and logic." },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast, multi-modal, great for general tasks." },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence." },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers." },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking." },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax." },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring." }
];

interface PrimarySidebarProps {
  token: string | null;
  activeSection: "explorer" | "source_control" | "unpacker" | "settings" | "github" | "deployment" | "cloud";
  user: any;
  repos: any[];
  selectedRepo: any;
  branches: any[];
  selectedBranch: string;
  fileSystemTree: any[];
  activeFile: any;
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  onSelectRepo: (repo: any) => void;
  onSelectBranch: (branch: string) => void;
  onToggleDir: (path: string) => void;
  onSelectFile: (node: any) => void;
  setActiveFile: (node: any) => void;
  loadDirectory: (path: string) => Promise<any>;
  syncZipFiles: (files: { path: string; content: string }[]) => Promise<void>;
  refreshRepos: () => Promise<void>;
  onLogout: () => void;
  authConfig: any;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  themeMode: "system" | "dark" | "light";
  onThemeModeChange: (mode: "system" | "dark" | "light") => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  onSelectSection?: (section: any) => void;
  isMobile?: boolean;
  desktopMode?: boolean;
  onDesktopModeChange?: (enabled: boolean) => void;
  activeStudio?: "chat" | "software";
  handleSetActiveStudio?: (studio: "chat" | "software") => void;
  setMobileActiveTab?: (tab: "explorer" | "editor" | "git" | "preview" | "ai" | "settings") => void;
  chatSessions?: any[];
  activeChatSessionId?: string;
  onSetActiveChatSessionId?: (id: string) => void;
  onUpdateChatSessions?: (sessions: any[]) => void;
  customApiKey?: string;
  onSetCustomApiKey?: (key: string) => void;
  onToggleSidebar?: () => void;
  activeMainOption?: string;
  setActiveMainOption?: (val: string | ((prev: string) => string)) => void;
}

const STUDIO_COLORS: Record<string, {
  accent: string;
  bgActive: string;
  bgHover: string;
  gradient: string;
  textGlow: string;
}> = {
  gothwad_ai: {
    accent: "#a855f7", // Purple
    bgActive: "rgba(168, 85, 247, 0.08)",
    bgHover: "rgba(168, 85, 247, 0.03)",
    gradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)",
    textGlow: "0px 0px 10px rgba(168, 85, 247, 0.4)"
  },
  image_gen: {
    accent: "#f43f5e", // Rose
    bgActive: "rgba(244, 63, 94, 0.08)",
    bgHover: "rgba(244, 63, 94, 0.03)",
    gradient: "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #be123c 100%)",
    textGlow: "0px 0px 10px rgba(244, 63, 94, 0.4)"
  },
  video_gen: {
    accent: "#06b6d4", // Cyan
    bgActive: "rgba(6, 182, 212, 0.08)",
    bgHover: "rgba(6, 182, 212, 0.03)",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)",
    textGlow: "0px 0px 10px rgba(6, 182, 212, 0.4)"
  },
  audio_gen: {
    accent: "#10b981", // Emerald
    bgActive: "rgba(16, 185, 129, 0.08)",
    bgHover: "rgba(16, 185, 129, 0.03)",
    gradient: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #047857 100%)",
    textGlow: "0px 0px 10px rgba(16, 185, 129, 0.4)"
  },
  presentation_ai: {
    accent: "#14b8a6", // Teal
    bgActive: "rgba(20, 184, 166, 0.08)",
    bgHover: "rgba(20, 184, 166, 0.03)",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #0f766e 100%)",
    textGlow: "0px 0px 10px rgba(20, 184, 166, 0.4)"
  },
  website_builder_ai: {
    accent: "#eab308", // Gold/Yellow
    bgActive: "rgba(234, 179, 8, 0.08)",
    bgHover: "rgba(234, 179, 8, 0.03)",
    gradient: "linear-gradient(135deg, #fde047 0%, #eab308 50%, #ca8a04 100%)",
    textGlow: "0px 0px 10px rgba(234, 179, 8, 0.4)"
  },
  web_app_builder_ai: {
    accent: "#d946ef", // Fuchsia/Pink
    bgActive: "rgba(217, 70, 239, 0.08)",
    bgHover: "rgba(217, 70, 239, 0.03)",
    gradient: "linear-gradient(135deg, #f0abfc 0%, #d946ef 50%, #c084fc 100%)",
    textGlow: "0px 0px 10px rgba(217, 70, 239, 0.4)"
  },
  voice_assistant: {
    accent: "#f97316", // Orange
    bgActive: "rgba(249, 115, 22, 0.08)",
    bgHover: "rgba(249, 115, 22, 0.03)",
    gradient: "linear-gradient(135deg, #ff9d43 0%, #f97316 50%, #c2410c 100%)",
    textGlow: "0px 0px 10px rgba(249, 115, 22, 0.4)"
  },
  chat: {
    accent: "#3b82f6", // Blue
    bgActive: "rgba(59, 130, 246, 0.08)",
    bgHover: "rgba(59, 130, 246, 0.03)",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
    textGlow: "0px 0px 10px rgba(59, 130, 246, 0.4)"
  },
  software: {
    accent: "#6366f1", // Indigo
    bgActive: "rgba(99, 102, 241, 0.08)",
    bgHover: "rgba(99, 102, 241, 0.03)",
    gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4338ca 100%)",
    textGlow: "0px 0px 10px rgba(99, 102, 241, 0.4)"
  }
};

export default function PrimarySidebar({
  token,
  activeSection,
  user,
  repos = [],
  selectedRepo,
  branches = [],
  selectedBranch,
  fileSystemTree,
  activeFile,
  isLoading,
  error,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  onSelectRepo,
  onSelectBranch,
  onToggleDir,
  onSelectFile,
  setActiveFile,
  loadDirectory,
  syncZipFiles,
  refreshRepos,
  onLogout,
  authConfig,
  uiScale,
  onUiScaleChange,
  themeMode,
  onThemeModeChange,
  accentColor,
  onAccentColorChange,
  fontFamily,
  onFontFamilyChange,
  onSelectSection,
  isMobile = false,
  desktopMode = false,
  onDesktopModeChange,
  activeStudio = "chat",
  handleSetActiveStudio,
  setMobileActiveTab,
  chatSessions = [],
  activeChatSessionId = "",
  onSetActiveChatSessionId,
  onUpdateChatSessions,
  customApiKey = "",
  onSetCustomApiKey,
  onToggleSidebar,
  activeMainOption: activeMainOptionProp,
  setActiveMainOption: setActiveMainOptionProp
}: PrimarySidebarProps) {
  // Synchronized active studio selection / lower panel option
  const [selectedChatOption, setSelectedChatOption] = useState<"chat" | "software" | "github" | "settings">("chat");
  const [activeMainOptionLocal, setActiveMainOptionLocal] = useState<string>(() => {
    return safeStorage.getItem("gothwad_active_main_option") || "gothwad_ai";
  });

  const activeMainOption = activeMainOptionProp !== undefined ? activeMainOptionProp : activeMainOptionLocal;

  const [sidebarPage, setSidebarPage] = useState<"home" | "software" | "github" | "settings" | "chat_playground">(() => {
    if (activeStudio === "chat") {
      return activeMainOption === "chat" ? "chat_playground" : "home";
    } else if (activeStudio === "software") {
      return "software";
    }
    return "home";
  });
  const setActiveMainOption = (val: string | ((prev: string) => string)) => {
    if (setActiveMainOptionProp) {
      setActiveMainOptionProp(val);
    } else {
      setActiveMainOptionLocal(prev => {
        const nextVal = typeof val === "function" ? val(prev) : val;
        safeStorage.setItem("gothwad_active_main_option", nextVal);
        return nextVal;
      });
    }
  };



  // Local collapsible section expansion states for Software Builder (file tree style)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    explorer: true,
    source_control: false,
    deployment: false,
    cloud: false,
    settings: false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    if (onSelectSection) {
      onSelectSection(sectionId as any);
    }
  };

  useEffect(() => {
    if (activeStudio) {
      setSelectedChatOption(activeStudio);
    }
  }, [activeStudio]);

  // Sync internal sidebar page with activeStudio and activeMainOption to stay in perfect sync
  useEffect(() => {
    if (activeStudio === "chat") {
      setSidebarPage("home");
    } else if (activeStudio === "software") {
      setSidebarPage("software");
    }
  }, [activeStudio, activeMainOption]);

  const [chatTab, setChatTab] = useState<"history" | "parameters">("history");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (activeSection) {
      const activeBase = activeSection === "unpacker" ? "source_control" : activeSection;
      
      setExpandedSections(prev => ({
        ...prev,
        [activeBase]: true
      }));
    }
  }, [activeSection]);

  return (
    <div className="w-full min-w-0 md:w-[280px] md:min-w-[280px] h-full bg-zinc-950 border-r border-zinc-900 flex flex-col justify-start overflow-hidden select-none z-40">
      
      {/* 1. SIDEBAR BRANDED HEADER WITH GOTHWAD AI STUDIO */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-900 select-none bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {sidebarPage === "home" ? (
            <div 
              className="w-7 h-7 rounded-lg bg-[#0494f4] flex items-center justify-center text-white shadow-md shrink-0 overflow-hidden" 
              style={{
                paddingLeft: "4px",
                paddingRight: "4px",
                paddingTop: "3px",
                marginLeft: "0px",
                marginTop: "-4px"
              }}
            >
              <img src="/icon-512-maskable.png" alt="Gothwad Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button
              onClick={() => {
                setSidebarPage("home");
                if (sidebarPage === "software") {
                  handleSetActiveStudio?.("chat");
                }
              }}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title="Back to Menu"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[11.5px] font-mono font-bold text-zinc-100 tracking-tight leading-none uppercase truncate">
              {sidebarPage === "home" && "Gothwad Ai Studio"}
              {sidebarPage === "software" && "Software Builder"}
              {sidebarPage === "chat_playground" && "AI Chat Studio"}
            </span>
            <span className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wider truncate font-semibold mt-1">
              {sidebarPage === "home" && "AI Work Console"}
              {sidebarPage === "software" && "Workspace IDE"}
              {sidebarPage === "chat_playground" && "Chat Sandbox"}
            </span>
          </div>
        </div>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer ml-2 shrink-0 active:scale-95 flex items-center justify-center"
            title="Collapse Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. LOGIN & CONNECT STUDIO BANNER */}
      <div 
        onClick={() => {
          if (handleSetActiveStudio) handleSetActiveStudio("software");
          if (onSelectSection) onSelectSection("github");
        }}
        className="mx-3.5 my-2 p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 shrink-0 select-none group shadow-inner"
        title="Manage GitHub & Supabase Connections"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {token && user ? (
            <img 
              src={user.avatar_url} 
              alt="avatar" 
              className="w-8 h-8 rounded-lg border border-emerald-500/20 shadow-md shrink-0 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-750 transition-colors shrink-0">
              <Github className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-mono font-bold text-zinc-200 tracking-tight leading-none uppercase group-hover:text-white transition-colors truncate">
              {token && user ? user.name || user.login : "Login & Connect studio"}
            </span>
            <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider mt-1 truncate leading-none">
              {token && user ? "Connected to Github" : "Manage Studio With Github"}
            </span>
          </div>
        </div>
        
        {token ? (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mr-1" title="Active Connection" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
        )}
      </div>

      {/* Page 1: Home/Main Menu of workspaces */}
      {sidebarPage === "home" && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950/15">
          {/* Main Top Actions */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-zinc-850/45">
            {[
              { 
                id: "gothwad_ai", 
                label: "Gothwad AI", 
                icon: Sparkles, 
                desc: "India's First LLM AI", 
                action: () => {
                  setActiveMainOption("gothwad_ai");
                  safeStorage.setItem("gothwad_active_main_option", "gothwad_ai");
                  handleSetActiveStudio?.("chat");
                  if (chatSessions && activeChatSessionId && onUpdateChatSessions) {
                    const updated = chatSessions.map(s => {
                      if (s.id === activeChatSessionId) {
                        return { ...s, selectedModel: "openrouter/auto" };
                      }
                      return s;
                    });
                    onUpdateChatSessions(updated);
                  }
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "chat", 
                label: "AI Chat Playground", 
                icon: MessageSquare, 
                desc: "Multi-model AI sandbox", 
                action: () => {
                  setActiveMainOption("chat");
                  safeStorage.setItem("gothwad_active_main_option", "chat");
                  handleSetActiveStudio?.("chat");
                  if (chatSessions && activeChatSessionId && onUpdateChatSessions) {
                    const activeSess = chatSessions.find(s => s.id === activeChatSessionId);
                    if (activeSess?.selectedModel === "openrouter/auto") {
                      const updated = chatSessions.map(s => {
                        if (s.id === activeChatSessionId) {
                          return { ...s, selectedModel: "google/gemini-2.5-flash" };
                        }
                        return s;
                      });
                      onUpdateChatSessions(updated);
                    }
                  }
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "voice_assistant", 
                label: "Voice Assistant AI", 
                icon: Mic, 
                desc: "Real-time Voice & Speech", 
                action: () => {
                  setActiveMainOption("voice_assistant");
                  safeStorage.setItem("gothwad_active_main_option", "voice_assistant");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "image_gen", 
                label: "Image Generator AI", 
                icon: Image, 
                desc: "AI Art & Creative Diffusion", 
                action: () => {
                  setActiveMainOption("image_gen");
                  safeStorage.setItem("gothwad_active_main_option", "image_gen");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "video_gen", 
                label: "Video Generator AI", 
                icon: Video, 
                desc: "Cinematic AI text-to-video", 
                action: () => {
                  setActiveMainOption("video_gen");
                  safeStorage.setItem("gothwad_active_main_option", "video_gen");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "audio_gen", 
                label: "Audio Generator AI", 
                icon: Music, 
                desc: "AI Music & Sound synthesis", 
                action: () => {
                  setActiveMainOption("audio_gen");
                  safeStorage.setItem("gothwad_active_main_option", "audio_gen");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "presentation_ai", 
                label: "Presentation AI", 
                icon: Presentation, 
                desc: "Generate professional decks & slides", 
                action: () => {
                  setActiveMainOption("presentation_ai");
                  safeStorage.setItem("gothwad_active_main_option", "presentation_ai");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "website_builder_ai", 
                label: "Website Builder AI", 
                icon: Globe, 
                desc: "Design & build custom websites", 
                action: () => {
                  setActiveMainOption("website_builder_ai");
                  safeStorage.setItem("gothwad_active_main_option", "website_builder_ai");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "web_app_builder_ai", 
                label: "Web App Builder AI", 
                icon: AppWindow, 
                desc: "Create interactive web applications", 
                action: () => {
                  setActiveMainOption("web_app_builder_ai");
                  safeStorage.setItem("gothwad_active_main_option", "web_app_builder_ai");
                  handleSetActiveStudio?.("chat");
                  if (isMobile) onToggleSidebar?.();
                } 
              },
              { 
                id: "software", 
                label: "Software Builder AI", 
                icon: FileCode2, 
                desc: "Workspace IDE & Git control", 
                action: () => {
                  setActiveMainOption("software");
                  safeStorage.setItem("gothwad_active_main_option", "software");
                  handleSetActiveStudio?.("software");
                  setMobileActiveTab?.("ai");
                  setSidebarPage("software");
                  if (isMobile) onToggleSidebar?.();
                } 
              }
            ].map((std) => {
              const Icon = std.icon;
              const isCurrent = activeMainOption === std.id;
              const colorInfo = STUDIO_COLORS[std.id] || {
                accent: accentColor,
                bgActive: "rgba(39, 39, 42, 0.08)",
                bgHover: "rgba(39, 39, 42, 0.03)",
                gradient: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)`,
                textGlow: "none"
              };

              return (
                <button
                  key={std.id}
                  onClick={std.action}
                  className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 text-left border-b border-zinc-850/40 select-none cursor-pointer group relative overflow-hidden"
                  style={{
                    backgroundColor: isCurrent ? colorInfo.bgActive : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = colorInfo.bgHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {isCurrent && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ backgroundColor: colorInfo.accent }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-300" 
                      style={{ 
                        background: colorInfo.gradient,
                        boxShadow: isCurrent ? colorInfo.textGlow : "none",
                        transform: isCurrent ? "scale(1.05)" : "scale(1)"
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span 
                        className="text-[11px] font-mono font-bold uppercase tracking-tight leading-none truncate transition-colors duration-300"
                        style={{
                          color: isCurrent ? colorInfo.accent : "#f4f4f5",
                          textShadow: isCurrent ? `0 0 10px ${colorInfo.accent}25` : "none"
                        }}
                      >
                        {std.label}
                      </span>
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                        {std.desc}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="shrink-0 ml-2 transition-all duration-300"
                    style={{
                      color: isCurrent ? colorInfo.accent : "#555"
                    }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Connected Bottom settings actions */}
          <div className="border-t border-zinc-900 bg-zinc-950 divide-y divide-zinc-900/60 shrink-0">
            {[
              { id: "settings" as const, label: "Studio Settings", icon: Settings, desc: "Theme options & configurations", action: () => {
                handleSetActiveStudio?.("software");
                if (onSelectSection) onSelectSection("settings");
                setSidebarPage("software");
              } }
            ].map((std) => {
              const Icon = std.icon;
              return (
                <button
                  key={std.id}
                  onClick={std.action}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-all text-left select-none cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-7 h-7 rounded-lg bg-[#0494f4] flex items-center justify-center text-white shadow-md shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300" 
                    >
                      <img src="/icon-512-maskable.png" alt="Gothwad Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                        {std.label}
                      </span>
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                        {std.desc}
                      </span>
                    </div>
                  </div>
                  <div className="text-zinc-400 shrink-0 ml-2 group-hover:text-white transition-all p-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Page 2: Software Builder sub-sections */}
      {sidebarPage === "software" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/15">

          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-zinc-850/45">
            {/* SECTION 1: WORKSPACE EXPLORER */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("explorer");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "explorer" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "explorer"
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Workspace Explorer
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      File tree & Git stages
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 2: GIT SOURCE CONTROL */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("source_control");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "source_control" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "source_control" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Git Source Control
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      Commits, unpacker & history
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 3: DEPLOYMENT & PREVIEW */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("deployment");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "deployment" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "deployment" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Deployment & Preview
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      Deploy builds & hosting
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 4: CLOUD & DB SERVICES */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("cloud");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "cloud" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "cloud" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Cloud Services & DB
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      Firestore, Supabase & DBs
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 5: CONNECT GITHUB */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("github");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "github" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "github" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <Github className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Connect GitHub
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      OAuth & personal keys
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 6: STUDIO SETTINGS */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("settings");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "settings" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "settings" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Studio Settings
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      Theme options & configurations
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

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
  X
} from "lucide-react";

import IntegrationsPanel from "./IntegrationsPanel";
import SettingsPanel from "./sidebar/SettingsPanel";
import GothwadAuthPanel from "./sidebar/GothwadAuthPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";
import { safeStorage } from "../utils/safeStorage";

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast, multi-modal, great for general tasks." },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence." },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers." },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking." },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax." },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring." }
];

interface PrimarySidebarProps {
  token: string | null;
  activeSection: "explorer" | "source_control" | "unpacker" | "settings" | "github" | "deployment" | "cloud" | "login";
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
}

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
  onToggleSidebar
}: PrimarySidebarProps) {
  // Synchronized active studio selection / lower panel option
  const [selectedChatOption, setSelectedChatOption] = useState<"chat" | "software" | "github" | "settings" | "login">("chat");
  const [sidebarPage, setSidebarPage] = useState<"home" | "software" | "github" | "settings" | "login" | "chat_playground">("home");

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

  // Sync internal sidebar page with activeStudio to stay in perfect sync
  useEffect(() => {
    if (activeStudio === "chat") {
      setSidebarPage("chat_playground");
    } else if (activeStudio === "software") {
      setSidebarPage("software");
    }
  }, [activeStudio]);

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
    <div className="w-full min-w-0 md:w-[280px] md:min-w-[280px] h-full bg-zinc-900 border-r border-zinc-850 flex flex-col justify-start overflow-hidden select-none z-40">
      
      {/* 1. SIDEBAR BRANDED HEADER WITH GOTHWAD AI STUDIO */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-850 select-none bg-zinc-930/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11.5px] font-mono font-bold text-zinc-100 tracking-tight leading-none uppercase truncate">
              Gothwad Ai Studio
            </span>
            <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-wider truncate font-semibold mt-1">
              AI Work Console
            </span>
          </div>
        </div>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            title="Collapse Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Page 1: Home/Main Menu of workspaces */}
      {sidebarPage === "home" && (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950/15 divide-y divide-zinc-850/45">
          {[
            { id: "chat" as const, label: "AI Chat Playground", icon: MessageSquare, desc: "Multi-model sandbox & active prompts", action: () => {
              handleSetActiveStudio?.("chat");
            } },
            { id: "software" as const, label: "Software Builder AI", icon: FileCode2, desc: "Workspace IDE & Git control", action: () => {
              handleSetActiveStudio?.("software");
              setMobileActiveTab?.("ai");
              setSidebarPage("software");
            } },
            { id: "github" as const, label: "Connect GitHub", icon: GitBranch, desc: "OAuth & personal developer tokens", action: () => {
              handleSetActiveStudio?.("software");
              if (onSelectSection) onSelectSection("github");
              setSidebarPage("software");
            } },
            { id: "login" as const, label: "Login Account", icon: LogIn, desc: "Supabase account connection", action: () => {
              handleSetActiveStudio?.("software");
              if (onSelectSection) onSelectSection("login");
              setSidebarPage("software");
            } },
            { id: "settings" as const, label: "Studio Settings", icon: Settings, desc: "Configure layout & themes", action: () => {
              handleSetActiveStudio?.("software");
              if (onSelectSection) onSelectSection("settings");
              setSidebarPage("software");
            } }
          ].map((std) => {
            const Icon = std.icon;
            const isCurrent = std.id === "chat" 
              ? activeStudio === "chat"
              : activeStudio === "software" && (
                  (std.id === "software" && activeSection === "explorer") ||
                  (std.id === "github" && activeSection === "github") ||
                  (std.id === "settings" && activeSection === "settings") ||
                  (std.id === "login" && activeSection === "login")
                );

            return (
              <button
                key={std.id}
                onClick={std.action}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  isCurrent ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: isCurrent
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
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
                <div className="text-zinc-555 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Page 2: Software Builder sub-sections */}
      {sidebarPage === "software" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/15">
          {/* Back button header row */}
          <div className="h-12 border-b border-zinc-850/45 flex items-center px-2 shrink-0 bg-zinc-950/20">
            <button
              onClick={() => {
                setSidebarPage("home");
                handleSetActiveStudio?.("chat");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850/40 rounded-xl transition-all cursor-pointer font-mono text-[9px] font-bold uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
              <span>Back to Menu</span>
            </button>
          </div>

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

            {/* SECTION 6: LOGIN ACCOUNT */}
            <div className="flex flex-col bg-zinc-900/40">
              <button
                onClick={() => {
                  if (onSelectSection) onSelectSection("login");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer group ${
                  activeSection === "login" ? "bg-zinc-850/20" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-all" 
                    style={{ 
                      background: activeSection === "login" 
                        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                        : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                    }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">
                      Login Account
                    </span>
                    <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                      Supabase connection status
                    </span>
                  </div>
                </div>
                <div className="text-zinc-550 shrink-0 ml-2 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* SECTION 7: STUDIO SETTINGS */}
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

      {sidebarPage === "chat_playground" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/15">
          {/* Back button header row */}
          <div className="h-12 border-b border-zinc-850/45 flex items-center px-2 shrink-0 bg-zinc-950/20">
            <button
              onClick={() => {
                setSidebarPage("home");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850/40 rounded-xl transition-all cursor-pointer font-mono text-[9px] font-bold uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
              <span>Back to Menu</span>
            </button>
          </div>

          {/* Dynamic Tab Switchers */}
          <div className="h-11 border-b border-zinc-850 flex items-center justify-around bg-zinc-950/20 shrink-0">
            <button
              onClick={() => setChatTab("history")}
              className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                chatTab === "history" 
                  ? "text-zinc-100 border-[#375a7f]" 
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
              style={chatTab === "history" ? { borderBottomColor: accentColor } : {}}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={() => setChatTab("parameters")}
              className={`flex-1 h-full text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                chatTab === "parameters" 
                  ? "text-zinc-100 border-[#375a7f]" 
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
              style={chatTab === "parameters" ? { borderBottomColor: accentColor } : {}}
            >
              <Sliders className="w-3.5 h-3.5" />
              Parameters
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-4 font-mono text-xs">
            {chatTab === "history" && (
              <div className="flex flex-col h-full space-y-3">
                {/* Start New Chat Button */}
                <button
                  onClick={() => {
                    if (!onUpdateChatSessions || !onSetActiveChatSessionId) return;
                    const newId = Date.now().toString();
                    const newSess = {
                      id: newId,
                      title: `Session ${chatSessions.length + 1}`,
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
                    const updated = [newSess, ...chatSessions];
                    onUpdateChatSessions(updated);
                    onSetActiveChatSessionId(newId);
                  }}
                  className="w-full py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-750 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all cursor-pointer text-[10px]"
                >
                  <Plus className="w-4 h-4" style={{ color: accentColor }} />
                  Start New Chat
                </button>

                {/* Conversation sessions list */}
                <div className="flex-1 space-y-1 py-1 overflow-y-auto no-scrollbar">
                  {chatSessions.map((s) => {
                    const isActive = s.id === activeChatSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (onSetActiveChatSessionId) onSetActiveChatSessionId(s.id);
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
                            <span className="text-[8.5px] text-zinc-550 font-mono uppercase mt-0.5 truncate">
                              {MODELS.find(m => m.value === s.selectedModel)?.label.split(" (")[0] || s.selectedModel}
                            </span>
                          </div>
                        </div>
                        {chatSessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!onUpdateChatSessions || !onSetActiveChatSessionId) return;
                              if (confirm("Are you sure you want to delete this session?")) {
                                const updated = chatSessions.filter(item => item.id !== s.id);
                                onUpdateChatSessions(updated);
                                if (activeChatSessionId === s.id) {
                                  onSetActiveChatSessionId(updated[0].id);
                                }
                              }
                            }}
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

            {chatTab === "parameters" && (
              <div className="space-y-4">
                {/* Model Target selection */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Model Target</label>
                  <select
                    value={chatSessions.find(s => s.id === activeChatSessionId)?.selectedModel || "google/gemini-2.5-flash"}
                    onChange={(e) => {
                      if (!onUpdateChatSessions) return;
                      const updated = chatSessions.map(s => {
                        if (s.id === activeChatSessionId) {
                          return { ...s, selectedModel: e.target.value };
                        }
                        return s;
                      });
                      onUpdateChatSessions(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:outline-none transition-all cursor-pointer font-sans text-xs"
                  >
                    {MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-555 font-sans mt-1 leading-normal">
                    {MODELS.find(m => m.value === (chatSessions.find(s => s.id === activeChatSessionId)?.selectedModel || "google/gemini-2.5-flash"))?.desc}
                  </p>
                </div>

                {/* System Instruction */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">System Instructions</label>
                  <textarea
                    value={chatSessions.find(s => s.id === activeChatSessionId)?.systemInstruction || ""}
                    onChange={(e) => {
                      if (!onUpdateChatSessions) return;
                      const updated = chatSessions.map(s => {
                        if (s.id === activeChatSessionId) {
                          return { ...s, systemInstruction: e.target.value };
                        }
                        return s;
                      });
                      onUpdateChatSessions(updated);
                    }}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-300 focus:outline-none transition-all font-sans text-xs resize-none"
                    placeholder="Instruct the model how to act..."
                  />
                </div>

                {/* Temperature range */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Temperature</label>
                    <span className="text-emerald-400 font-bold">{(chatSessions.find(s => s.id === activeChatSessionId)?.temperature ?? 0.7).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={chatSessions.find(s => s.id === activeChatSessionId)?.temperature ?? 0.7}
                    onChange={(e) => {
                      if (!onUpdateChatSessions) return;
                      const updated = chatSessions.map(s => {
                        if (s.id === activeChatSessionId) {
                          return { ...s, temperature: parseFloat(e.target.value) };
                        }
                        return s;
                      });
                      onUpdateChatSessions(updated);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    style={{ accentColor }}
                  />
                </div>

                {/* Max Output Tokens ceiling */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Max Output Tokens</label>
                    <span className="text-zinc-400 font-bold">{chatSessions.find(s => s.id === activeChatSessionId)?.maxTokens ?? 2048}</span>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="8192"
                    step="100"
                    value={chatSessions.find(s => s.id === activeChatSessionId)?.maxTokens ?? 2048}
                    onChange={(e) => {
                      if (!onUpdateChatSessions) return;
                      const updated = chatSessions.map(s => {
                        if (s.id === activeChatSessionId) {
                          return { ...s, maxTokens: parseInt(e.target.value) || 2048 };
                        }
                        return s;
                      });
                      onUpdateChatSessions(updated);
                    }}
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
                      onChange={(e) => {
                        if (onSetCustomApiKey) {
                          onSetCustomApiKey(e.target.value);
                          safeStorage.setItem("gothwad_ai_key", e.target.value);
                        }
                      }}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-2.5 pr-8 text-zinc-300 focus:outline-none font-mono text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-650 font-sans leading-normal">
                    Leave empty to fallback to Gothwad Ai Studio's host system key. Input custom key for unlimited personal usage limits.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

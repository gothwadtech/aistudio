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
  ChevronDown,
  ChevronRight
} from "lucide-react";

import IntegrationsPanel from "./IntegrationsPanel";
import SettingsPanel from "./sidebar/SettingsPanel";
import GothwadAuthPanel from "./sidebar/GothwadAuthPanel";
import ExplorerPanel from "./sidebar/ExplorerPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";

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
  handleSetActiveStudio
}: PrimarySidebarProps) {
  // Synchronized active studio selection / lower panel option
  const [selectedChatOption, setSelectedChatOption] = useState<"chat" | "software" | "github" | "settings" | "login">("chat");

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

  useEffect(() => {
    if (activeSection) {
      const activeBase = (activeSection === "unpacker" || activeSection === "github") 
        ? (activeSection === "github" ? "explorer" : "source_control")
        : activeSection;
      
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
      </div>

      {/* Active Studio Selector - ALWAYS VISIBLE list view arrangement */}
      <div className="p-3.5 border-b border-zinc-850/45 shrink-0 space-y-1.5 bg-zinc-950/15">
        <span className="text-zinc-555 font-mono text-[9px] font-bold uppercase tracking-wider">Active Studio Workspaces</span>
        <div className="space-y-1.5">
          {[
            { id: "chat" as const, label: "AI Chat Playground", icon: MessageSquare, desc: "Multi-model sandbox" },
            { id: "software" as const, label: "Software Builder AI", icon: FileCode2, desc: "Workspace IDE & Git Control" },
            { id: "github" as const, label: "Connect GitHub", icon: GitBranch, desc: "Setup OAuth & Developer Keys" },
            { id: "settings" as const, label: "Studio Settings", icon: Settings, desc: "Configure layout & themes" },
            { id: "login" as const, label: "Login Gothwad AI Studio", icon: LogIn, desc: "Supabase account connection" }
          ].map((std) => {
            const Icon = std.icon;
            const isCurrent = selectedChatOption === std.id;
            
            return (
              <button
                key={std.id}
                onClick={() => {
                  setSelectedChatOption(std.id);
                  if (std.id === "chat") {
                    handleSetActiveStudio?.("chat");
                  } else if (std.id === "software") {
                    handleSetActiveStudio?.("software");
                    if (onSelectSection) onSelectSection("explorer");
                  }
                }}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left transition-all duration-150 border cursor-pointer ${
                  isCurrent
                    ? "bg-zinc-850/80 text-white font-semibold border-zinc-800"
                    : "bg-zinc-950/20 text-zinc-400 hover:bg-zinc-850/35 hover:text-zinc-200 border-transparent"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isCurrent ? "bg-zinc-800" : "bg-zinc-900"}`}>
                  <Icon className="w-4 h-4" style={isCurrent ? { color: accentColor } : {}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold tracking-tight">{std.label}</div>
                  <div className="text-[9px] text-zinc-550 mt-0.5 leading-normal truncate">{std.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedChatOption !== "software" ? (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-3.5 space-y-4">

          {/* ================== CONNECT GITHUB WIDGET ================== */}
          {selectedChatOption === "github" && (
            <div className="space-y-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 animate-[fadeIn_0.15s_ease-out]">
              <span className="text-[#375a7f] font-mono font-bold uppercase tracking-wider text-[9px] block" style={{ color: accentColor }}>GitHub Connection</span>
              <p className="text-zinc-555 text-[9px] leading-relaxed">
                Connect via GitHub token or OAuth to access cloud code staging, branch logs, and packaging toolkits.
              </p>
              <div className="pt-1.5">
                <IntegrationsPanel
                  mode="github"
                  token={token}
                  user={user}
                  onLogout={onLogout}
                  patInput={patInput}
                  onPatInputChange={onPatInputChange}
                  onPatSubmit={onPatSubmit}
                  onTriggerOAuth={onTriggerOAuth}
                  authConfig={authConfig}
                  accentColor={accentColor}
                />
              </div>
            </div>
          )}

          {/* ================== STUDIO SETTINGS WIDGET ================== */}
          {selectedChatOption === "settings" && (
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={onThemeModeChange}
              accentColor={accentColor}
              onAccentColorChange={onAccentColorChange}
              fontFamily={fontFamily}
              onFontFamilyChange={onFontFamilyChange}
              uiScale={uiScale}
              onUiScaleChange={onUiScaleChange}
              desktopMode={desktopMode}
              onDesktopModeChange={onDesktopModeChange}
              token={token}
              onLogout={onLogout}
              user={user}
              showCompactTitle={true}
            />
          )}

          {/* ================== GOTHWAD LOGIN ENGINE ================== */}
          {selectedChatOption === "login" && (
            <GothwadAuthPanel accentColor={accentColor} />
          )}

        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950/15 divide-y divide-zinc-850/45">
          {/* SECTION 1: WORKSPACE EXPLORER */}
          <div className="flex flex-col bg-zinc-900/40">
            <button
              onClick={() => toggleSection("explorer")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-550 shrink-0">
                  {expandedSections.explorer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
                  style={{ 
                    background: expandedSections.explorer 
                      ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                      : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                  }}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate">
                    Workspace Explorer
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                    File tree & Git stages
                  </span>
                </div>
              </div>
            </button>
            {expandedSections.explorer && (
              <div className="w-full flex flex-col bg-zinc-950/5 overflow-hidden">
                {(activeSection === "github" || !token) ? (
                  <div className="p-3">
                    <IntegrationsPanel
                      mode="github"
                      token={token}
                      user={user}
                      onLogout={onLogout}
                      patInput={patInput}
                      onPatInputChange={onPatInputChange}
                      onPatSubmit={onPatSubmit}
                      onTriggerOAuth={onTriggerOAuth}
                      authConfig={authConfig}
                      accentColor={accentColor}
                    />
                  </div>
                ) : (
                  <ExplorerPanel
                    token={token}
                    repos={repos}
                    selectedRepo={selectedRepo}
                    branches={branches}
                    selectedBranch={selectedBranch}
                    fileSystemTree={fileSystemTree}
                    activeFile={activeFile}
                    isLoading={isLoading}
                    accentColor={accentColor}
                    onSelectRepo={onSelectRepo}
                    onSelectBranch={onSelectBranch}
                    onToggleDir={onToggleDir}
                    onSelectFile={onSelectFile}
                    setActiveFile={setActiveFile}
                    loadDirectory={loadDirectory}
                    refreshRepos={refreshRepos}
                    onSelectSection={onSelectSection}
                  />
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: GIT SOURCE CONTROL */}
          <div className="flex flex-col bg-zinc-900/40">
            <button
              onClick={() => toggleSection("source_control")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-550 shrink-0">
                  {expandedSections.source_control ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
                  style={{ 
                    background: expandedSections.source_control 
                      ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                      : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                  }}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate">
                    Git Source Control
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                    Commits, unpacker & history
                  </span>
                </div>
              </div>
            </button>
            {expandedSections.source_control && (
              <div className="w-full flex flex-col bg-zinc-950/5">
                <SourceControlPanel
                  token={token}
                  user={user}
                  onLogout={onLogout}
                  patInput={patInput}
                  onPatInputChange={onPatInputChange}
                  onPatSubmit={onPatSubmit}
                  onTriggerOAuth={onTriggerOAuth}
                  authConfig={authConfig}
                  accentColor={accentColor}
                  selectedRepo={selectedRepo}
                  selectedBranch={selectedBranch}
                  activeFile={activeFile}
                  syncZipFiles={syncZipFiles}
                  isLoading={isLoading}
                  loadDirectory={loadDirectory}
                  setActiveFile={setActiveFile}
                />
              </div>
            )}
          </div>

          {/* SECTION 3: DEPLOYMENT & PREVIEW */}
          <div className="flex flex-col bg-zinc-900/40">
            <button
              onClick={() => toggleSection("deployment")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-550 shrink-0">
                  {expandedSections.deployment ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
                  style={{ 
                    background: expandedSections.deployment 
                      ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                      : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                  }}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate">
                    Deployment & Preview
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                    Deploy builds & hosting
                  </span>
                </div>
              </div>
            </button>
            {expandedSections.deployment && (
              <div className="w-full flex flex-col bg-zinc-950/5">
                <IntegrationsPanel
                  mode="deployment"
                  token={token}
                  user={user}
                  onLogout={onLogout}
                  patInput={patInput}
                  onPatInputChange={onPatInputChange}
                  onPatSubmit={onPatSubmit}
                  onTriggerOAuth={onTriggerOAuth}
                  authConfig={authConfig}
                  accentColor={accentColor}
                />
              </div>
            )}
          </div>

          {/* SECTION 4: CLOUD & DB SERVICES */}
          <div className="flex flex-col bg-zinc-900/40">
            <button
              onClick={() => toggleSection("cloud")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-550 shrink-0">
                  {expandedSections.cloud ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
                  style={{ 
                    background: expandedSections.cloud 
                      ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                      : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                  }}
                >
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate">
                    Cloud Services & DB
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                    Firestore, Supabase & DBs
                  </span>
                </div>
              </div>
            </button>
            {expandedSections.cloud && (
              <div className="w-full flex flex-col bg-zinc-950/5">
                <IntegrationsPanel
                  mode="cloud"
                  token={token}
                  user={user}
                  onLogout={onLogout}
                  patInput={patInput}
                  onPatInputChange={onPatInputChange}
                  onPatSubmit={onPatSubmit}
                  onTriggerOAuth={onTriggerOAuth}
                  authConfig={authConfig}
                  accentColor={accentColor}
                />
              </div>
            )}
          </div>

          {/* SECTION 5: STUDIO SETTINGS */}
          <div className="flex flex-col bg-zinc-900/40">
            <button
              onClick={() => toggleSection("settings")}
              className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-zinc-850/45 transition-all text-left border-b border-zinc-850/45 select-none cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-550 shrink-0">
                  {expandedSections.settings ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0" 
                  style={{ 
                    background: expandedSections.settings 
                      ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` 
                      : "linear-gradient(135deg, #27272a 0%, #18181b 100%)" 
                  }}
                >
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono font-bold text-zinc-100 uppercase tracking-tight leading-none truncate">
                    Studio Settings
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider truncate font-semibold mt-1">
                    Theme options & configurations
                  </span>
                </div>
              </div>
            </button>
            {expandedSections.settings && (
              <div className="w-full flex flex-col bg-zinc-950/5 p-3.5">
                <SettingsPanel
                  themeMode={themeMode}
                  onThemeModeChange={onThemeModeChange}
                  accentColor={accentColor}
                  onAccentColorChange={onAccentColorChange}
                  fontFamily={fontFamily}
                  onFontFamilyChange={onFontFamilyChange}
                  uiScale={uiScale}
                  onUiScaleChange={onUiScaleChange}
                  desktopMode={desktopMode}
                  onDesktopModeChange={onDesktopModeChange}
                  token={token}
                  onLogout={onLogout}
                  user={user}
                />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

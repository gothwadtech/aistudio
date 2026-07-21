import React from "react";
import { GrixFileNode } from "../types/github";
import PrimarySidebar from "./PrimarySidebar";
import StatusBar from "./StatusBar";
import { Eye, X, Sparkles, MessageSquare, FileCode2, Menu, GitBranch, UploadCloud, Database, Settings, LogIn } from "lucide-react";
import SettingsPanel from "./sidebar/SettingsPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";

const CodeEditor = React.lazy(() => import("./CodeEditor"));
const AppPreviewPanel = React.lazy(() => import("./AppPreviewPanel"));
const WelcomeScreen = React.lazy(() => import("./WelcomeScreen"));
const AiCompanionPanel = React.lazy(() => import("./AiCompanionPanel"));
const ChatStudio = React.lazy(() => import("../features/chat/ChatStudio"));
const IntegrationsPanel = React.lazy(() => import("./IntegrationsPanel"));

const GothwadStudio = React.lazy(() => import("../features/gothwad/components/GothwadStudio"));
const ChatPlaygroundStudio = React.lazy(() => import("../features/chat/components/ChatPlaygroundStudio"));
const VoiceStudio = React.lazy(() => import("../features/voice/components/VoiceStudio"));
const ImageGenStudio = React.lazy(() => import("../features/image/components/ImageGenStudio"));
const VideoGenStudio = React.lazy(() => import("../features/video/components/VideoGenStudio"));
const AudioGenStudio = React.lazy(() => import("../features/audio/components/AudioGenStudio"));
const PresentationStudio = React.lazy(() => import("../features/presentation/components/PresentationStudio"));
const WebsiteStudio = React.lazy(() => import("../features/website/components/WebsiteStudio"));
const WebAppStudio = React.lazy(() => import("../features/webapp/components/WebAppStudio"));
import { safeStorage } from "../utils/safeStorage";

interface DesktopLayoutProps {
  accentColor: string;
  activeStudio: "chat" | "software";
  handleSetActiveStudio: (studio: "chat" | "software") => void;
  user: any;
  isMobile: boolean;
  activeSection: "explorer" | "source_control" | "unpacker" | "settings" | "github" | "deployment" | "cloud";
  setActiveSection: (section: any) => void;
  selectedRepo: any;
  selectedBranch: string;
  fileSystemTree: GrixFileNode[];
  activeFile: GrixFileNode | null;
  logout: any;
  token: string | null;
  repos: any[];
  branches: any[];
  isLoading: boolean;
  error: any;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  onSelectRepo: (repo: any) => void;
  onSelectBranch: (branch: string) => void;
  onToggleDir: (path: string) => void;
  onSelectFile: (node: GrixFileNode) => void;
  setActiveFile: (node: GrixFileNode | null) => void;
  loadDirectory: (path: string) => Promise<any>;
  syncZipFiles: any;
  refreshRepos: any;
  authConfig: any;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  themeMode: "system" | "dark" | "light";
  onThemeModeChange: (mode: "system" | "dark" | "light") => void;
  onAccentColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  desktopMode: boolean;
  onDesktopModeChange: (enabled: boolean) => void;
  previewOpen: boolean;
  handleTogglePreview: () => void;
  setPreviewOpen: (open: boolean) => void;
  openTabs: GrixFileNode[];
  handleCloseTab: (path: string, e: React.MouseEvent) => void;
  editorContent: string;
  updateEditor: (content: string) => void;
  saveFile: (commitMessage: string) => Promise<void>;
  aiPanelOpen: boolean;
  handleToggleAiPanel: () => void;
  chatSessions: any[];
  activeChatSessionId: string;
  onSetActiveChatSessionId: (id: string) => void;
  onUpdateChatSessions: (sessions: any[]) => void;
  customApiKey: string;
  onSetCustomApiKey: (key: string) => void;
  groqApiKey: string;
  onSetGroqApiKey: (key: string) => void;
  appModels: any[];
  onUpdateAppModels: (models: any[]) => void;
  activeMainOption?: string;
  setActiveMainOption?: (val: string | ((prev: string) => string)) => void;
  disconnectGitHub?: () => Promise<void>;
  onClearAppData?: () => void;
  sbUser?: any;
}

export default function DesktopLayout({
  accentColor,
  activeStudio,
  handleSetActiveStudio,
  user,
  isMobile,
  activeSection,
  setActiveSection,
  selectedRepo,
  selectedBranch,
  fileSystemTree,
  activeFile,
  logout,
  disconnectGitHub,
  onClearAppData,
  sbUser,
  token,
  repos,
  branches,
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
  authConfig,
  uiScale,
  onUiScaleChange,
  themeMode,
  onThemeModeChange,
  onAccentColorChange,
  fontFamily,
  onFontFamilyChange,
  desktopMode,
  onDesktopModeChange,
  previewOpen,
  handleTogglePreview,
  setPreviewOpen,
  openTabs,
  handleCloseTab,
  editorContent,
  updateEditor,
  saveFile,
  aiPanelOpen,
  handleToggleAiPanel,
  chatSessions,
  activeChatSessionId,
  onSetActiveChatSessionId,
  onUpdateChatSessions,
  customApiKey,
  onSetCustomApiKey,
  groqApiKey,
  onSetGroqApiKey,
  appModels,
  onUpdateAppModels,
  activeMainOption = "gothwad_ai",
  setActiveMainOption
}: DesktopLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(true);

  const renderActiveMainWorkspace = () => {
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    switch (activeMainOption) {
      case "gothwad_ai":
        return <GothwadStudio accentColor={accentColor} customApiKey={customApiKey} onToggleSidebar={toggleSidebar} />;
      case "chat":
        return (
          <ChatStudio 
            accentColor={accentColor} 
            isMobile={isMobile} 
            sessions={chatSessions}
            activeSessionId={activeChatSessionId}
            onSetActiveSessionId={onSetActiveChatSessionId}
            onUpdateSessions={onUpdateChatSessions}
            customApiKey={customApiKey}
            onSetCustomApiKey={onSetCustomApiKey}
            groqApiKey={groqApiKey}
            onSetGroqApiKey={onSetGroqApiKey}
            appModels={appModels}
            onUpdateAppModels={onUpdateAppModels}
            onToggleSidebar={toggleSidebar}
            onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }}
          />
        );
      case "voice_assistant":
        return <VoiceStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "image_gen":
        return <ImageGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "video_gen":
        return <VideoGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "audio_gen":
        return <AudioGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "presentation_ai":
        return <PresentationStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "website_builder_ai":
        return <WebsiteStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "web_app_builder_ai":
        return <WebAppStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={toggleSidebar} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      default:
        return <GothwadStudio accentColor={accentColor} customApiKey={customApiKey} onToggleSidebar={toggleSidebar} />;
    }
  };

  const renderFullScreenSection = () => {
    if (activeSection === "source_control") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-6 font-sans">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-850 rounded-2xl shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
                >
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-white">Git Source Control</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Commits, ZIP merge payload & history checkpoints</p>
                </div>
              </div>
              {/* Quick Back Button */}
              <button 
                onClick={() => setActiveSection("explorer")}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-750 hover:text-white transition-all cursor-pointer"
              >
                ← Back to Editor
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="max-w-2xl mx-auto">
                <SourceControlPanel
                  token={token}
                  user={user}
                  onLogout={logout}
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
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "deployment") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-6 font-sans">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-850 rounded-2xl shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
                >
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-white">Deployment & Preview</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Staging environments & hosting deploy logs</p>
                </div>
              </div>
              {/* Quick Back Button */}
              <button 
                onClick={() => setActiveSection("explorer")}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-750 hover:text-white transition-all cursor-pointer"
              >
                ← Back to Editor
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="max-w-2xl mx-auto">
                <React.Suspense fallback={
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                    <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                    <span className="animate-pulse text-[10px]">LOADING DEPLOYMENT MODULE...</span>
                  </div>
                }>
                  <IntegrationsPanel
                    mode="deployment"
                    token={token}
                    user={user}
                    onLogout={logout}
                    patInput={patInput}
                    onPatInputChange={onPatInputChange}
                    onPatSubmit={onPatSubmit}
                    onTriggerOAuth={onTriggerOAuth}
                    authConfig={authConfig}
                    accentColor={accentColor}
                  />
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "cloud") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-6 font-sans">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-850 rounded-2xl shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-white">Cloud Services & DB</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Manage database connections, Firestore & Supabase integrations</p>
                </div>
              </div>
              {/* Quick Back Button */}
              <button 
                onClick={() => setActiveSection("explorer")}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-750 hover:text-white transition-all cursor-pointer"
              >
                ← Back to Editor
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="max-w-2xl mx-auto">
                <React.Suspense fallback={
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                    <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                    <span className="animate-pulse text-[10px]">LOADING CLOUD GATEWAY...</span>
                  </div>
                }>
                  <IntegrationsPanel
                    mode="cloud"
                    token={token}
                    user={user}
                    onLogout={logout}
                    patInput={patInput}
                    onPatInputChange={onPatInputChange}
                    onPatSubmit={onPatSubmit}
                    onTriggerOAuth={onTriggerOAuth}
                    authConfig={authConfig}
                    accentColor={accentColor}
                  />
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "settings") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-6 font-sans">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-850 rounded-2xl shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
                >
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-white">Studio Settings</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Configure layout options, font pairings, scales & themes</p>
                </div>
              </div>
              {/* Quick Back Button */}
              <button 
                onClick={() => setActiveSection("explorer")}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-750 hover:text-white transition-all cursor-pointer"
              >
                ← Back to Editor
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="max-w-2xl mx-auto">
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
                  onLogout={logout}
                  disconnectGitHub={disconnectGitHub}
                  onClearAppData={onClearAppData}
                  user={user}
                  sbUser={sbUser}
                  customApiKey={customApiKey}
                  onSetCustomApiKey={onSetCustomApiKey}
                  groqApiKey={groqApiKey}
                  onSetGroqApiKey={onSetGroqApiKey}
                  appModels={appModels}
                  onUpdateAppModels={onUpdateAppModels}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "github") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-6 font-sans">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden bg-zinc-900 border border-zinc-850 rounded-2xl shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-930/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
                >
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-white">GitHub Integration</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Configure OAuth applications, personal access tokens & repository synchronization</p>
                </div>
              </div>
              {/* Quick Back Button */}
              <button 
                onClick={() => setActiveSection("explorer")}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-750 hover:text-white transition-all cursor-pointer"
              >
                ← Back to Editor
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="max-w-2xl mx-auto">
                <IntegrationsPanel
                  mode="github"
                  token={token}
                  user={user}
                  onLogout={logout}
                  patInput={patInput}
                  onPatInputChange={onPatInputChange}
                  onPatSubmit={onPatSubmit}
                  onTriggerOAuth={onTriggerOAuth}
                  authConfig={authConfig}
                  accentColor={accentColor}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
      
      {/* Under-header Content */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* 1. VS Code Primary Sidebar (Collapsible Left) */}
        {isSidebarOpen && (
          <PrimarySidebar
            token={token}
            activeSection={activeSection}
            user={user}
            repos={repos}
            selectedRepo={selectedRepo}
            branches={branches}
            selectedBranch={selectedBranch}
            fileSystemTree={fileSystemTree}
            activeFile={activeFile}
            isLoading={isLoading}
            error={error}
            patInput={patInput}
            onPatInputChange={onPatInputChange}
            onPatSubmit={onPatSubmit}
            onTriggerOAuth={onTriggerOAuth}
            onSelectRepo={onSelectRepo}
            onSelectBranch={onSelectBranch}
            onToggleDir={onToggleDir}
            onSelectFile={onSelectFile}
            setActiveFile={setActiveFile}
            loadDirectory={loadDirectory}
            syncZipFiles={syncZipFiles}
            refreshRepos={refreshRepos}
            onLogout={logout}
            authConfig={authConfig}
            uiScale={uiScale}
            onUiScaleChange={onUiScaleChange}
            themeMode={themeMode}
            onThemeModeChange={onThemeModeChange}
            accentColor={accentColor}
            onAccentColorChange={onAccentColorChange}
            fontFamily={fontFamily}
            onFontFamilyChange={onFontFamilyChange}
            onSelectSection={setActiveSection}
            desktopMode={desktopMode}
            onDesktopModeChange={onDesktopModeChange}
            activeStudio={activeStudio}
            handleSetActiveStudio={handleSetActiveStudio}
            onToggleSidebar={() => setIsSidebarOpen(false)}
            chatSessions={chatSessions}
            activeChatSessionId={activeChatSessionId}
            onSetActiveChatSessionId={onSetActiveChatSessionId}
            onUpdateChatSessions={onUpdateChatSessions}
            customApiKey={customApiKey}
            onSetCustomApiKey={onSetCustomApiKey}
            activeMainOption={activeMainOption}
            setActiveMainOption={setActiveMainOption}
          />
        )}

        {/* 2. Main Content Canvas Frame (Center/Right) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeStudio === "chat" ? (
            <React.Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-r-2 border-zinc-400" style={{ borderTopColor: accentColor }} />
                <span className="font-mono text-[10px] animate-pulse">LOADING WORKSPACE...</span>
              </div>
            }>
              {renderActiveMainWorkspace()}
            </React.Suspense>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Upper Main Editor Workspace Row */}
              <div className="flex-1 flex overflow-hidden max-w-full">
                
                {/* 3. Code Canvas Frame (Center/Right) */}
                <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                  {activeSection !== "explorer" ? (
                    renderFullScreenSection()
                  ) : (
                    <>
                      {!activeFile && selectedRepo && (
                        <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between overflow-hidden shrink-0 px-3">
                          <div className="flex items-center gap-2 text-[10.5px] font-mono text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>workspace: {selectedRepo.owner.login}/{selectedRepo.name} ({selectedBranch})</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 h-full">
                            <button
                              onClick={handleTogglePreview}
                              className={`p-1 px-2 rounded hover:bg-zinc-850 text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                previewOpen ? "text-amber-400 bg-amber-400/10" : "text-zinc-400"
                              }`}
                              title="Toggle Live Sandbox Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Live Preview</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeFile ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          
                          {/* Horizontal Workspace Open Tabs bar */}
                          <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between overflow-hidden shrink-0">
                            <div className="flex-1 flex items-center overflow-x-auto no-scrollbar scroll-smooth h-full">
                              {openTabs.map((tab) => {
                                const isActive = activeFile?.path === tab.path;
                                return (
                                  <div
                                    key={tab.path}
                                    onClick={() => onSelectFile(tab)}
                                    className={`h-full px-3 py-1 flex items-center gap-2 border-r border-zinc-900 cursor-pointer text-[10.5px] font-mono select-none group transition-all relative ${
                                      isActive 
                                        ? "bg-zinc-950 text-zinc-100 font-bold border-t-2 border-t-[#375a7f]" 
                                        : "bg-zinc-930/50 text-zinc-500 hover:text-zinc-300"
                                    }`}
                                    style={isActive ? { borderTopColor: accentColor } : {}}
                                  >
                                    <span className="truncate max-w-[120px]">{tab.name}</span>
                                    
                                    {tab.isModified && (
                                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                                    )}

                                    <button
                                      onClick={(e) => handleCloseTab(tab.path, e)}
                                      className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Actions group */}
                            <div className="px-3 flex items-center gap-2 shrink-0 border-l border-zinc-900 h-full bg-zinc-930">
                              <button
                                onClick={handleTogglePreview}
                                className={`p-1 rounded hover:bg-zinc-850 text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  previewOpen ? "text-[#375a7f] bg-[#375a7f]/10" : "text-zinc-400"
                                }`}
                                title="Toggle Live Sandbox Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Live Preview</span>
                              </button>
                            </div>
                          </div>

                          {/* Editor Workspace viewport */}
                          <div className="flex-1 flex overflow-hidden relative">
                            <div className="flex-1 min-w-[300px] overflow-hidden relative">
                              <React.Suspense fallback={
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                                  <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                                  <span className="font-mono text-[9px] animate-pulse">LOADING EDITOR...</span>
                                </div>
                              }>
                                <CodeEditor
                                  activeFile={activeFile}
                                  editorContent={editorContent}
                                  onContentChange={updateEditor}
                                  onSave={saveFile}
                                  isLoading={isLoading}
                                />
                              </React.Suspense>
                            </div>
                            {previewOpen && (
                              <div className="w-[500px] lg:w-[600px] min-w-[350px] border-l border-zinc-900 overflow-hidden relative bg-zinc-950 flex flex-col shrink-0 animate-slide-in">
                                <React.Suspense fallback={
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                                    <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                                    <span className="font-mono text-[9px] animate-pulse">INITIALIZING PREVIEW...</span>
                                  </div>
                                }>
                                  <AppPreviewPanel
                                    fileSystemTree={fileSystemTree}
                                    onClose={() => setPreviewOpen(false)}
                                    accentColor={accentColor}
                                    selectedRepo={selectedRepo || undefined}
                                    selectedBranch={selectedBranch}
                                  />
                                </React.Suspense>
                              </div>
                            )}
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex overflow-hidden relative">
                          <div className="flex-1 overflow-hidden relative">
                            <React.Suspense fallback={
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                                <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                                <span className="font-mono text-[9px] animate-pulse">LOADING START SCREEN...</span>
                              </div>
                            }>
                              <WelcomeScreen
                                token={token}
                                user={user}
                                selectedRepo={selectedRepo}
                                selectedBranch={selectedBranch}
                                onSelectSection={(sec) => {
                                  setActiveSection(sec);
                                }}
                                onTriggerOAuth={onTriggerOAuth}
                                onTogglePreview={selectedRepo ? handleTogglePreview : undefined}
                                previewOpen={previewOpen}
                              />
                            </React.Suspense>
                          </div>
                          {previewOpen && selectedRepo && (
                            <div className="w-[500px] lg:w-[600px] min-w-[350px] border-l border-zinc-900 overflow-hidden relative bg-zinc-950 flex flex-col shrink-0 animate-slide-in">
                              <React.Suspense fallback={
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                                  <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                                  <span className="font-mono text-[9px] animate-pulse">INITIALIZING PREVIEW...</span>
                                </div>
                              }>
                                <AppPreviewPanel
                                  fileSystemTree={fileSystemTree}
                                  onClose={() => setPreviewOpen(false)}
                                  accentColor={accentColor}
                                  selectedRepo={selectedRepo}
                                  selectedBranch={selectedBranch}
                                />
                              </React.Suspense>
                            </div>
                          )}
                        </div>
                        )}
                      </>
                    )}
                  </div>

                {/* 4. AI Coding Companion Panel (Right Sidebar) */}
                <React.Suspense fallback={
                  <div className="w-80 border-l border-zinc-900 bg-zinc-950 h-full flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                    <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                    <span className="animate-pulse text-[10px]">LOADING AI ASSISTANT...</span>
                  </div>
                }>
                  <AiCompanionPanel
                    isOpen={aiPanelOpen}
                    onToggle={handleToggleAiPanel}
                    activeFile={activeFile}
                    fileSystemTree={fileSystemTree}
                    onApplyCode={(code) => {
                      updateEditor(code);
                    }}
                    accentColor={accentColor}
                    appModels={appModels}
                    customApiKey={customApiKey}
                    groqApiKey={groqApiKey}
                  />
                </React.Suspense>

              </div>

              {/* 5. Slim status metrics board (Very Bottom) */}
              <StatusBar
                selectedRepo={selectedRepo}
                selectedBranch={selectedBranch}
                isLoading={isLoading}
                user={user}
                activeFile={activeFile}
                uiScale={uiScale}
                onUiScaleChange={onUiScaleChange}
              />
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

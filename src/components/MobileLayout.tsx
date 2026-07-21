import React from "react";
import { GrixFileNode } from "../types/github";
import MobileHeader from "./MobileHeader";
import PrimarySidebar from "./PrimarySidebar";
import SettingsPanel from "./sidebar/SettingsPanel";
import ExplorerPanel from "./sidebar/ExplorerPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";

const ChatStudio = React.lazy(() => import("../features/chat/ChatStudio"));
const CodeEditor = React.lazy(() => import("./CodeEditor"));
const WelcomeScreen = React.lazy(() => import("./WelcomeScreen"));
const AppPreviewPanel = React.lazy(() => import("./AppPreviewPanel"));
const AiCompanionPanel = React.lazy(() => import("./AiCompanionPanel"));
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
import {
  X,
  Eye,
  FolderGit2,
  GitBranch,
  Sparkles,
  Database,
  Terminal,
  Settings,
  Menu,
  MessageSquare,
  FileCode2,
  FolderTree
} from "lucide-react";

interface MobileLayoutProps {
  activeStudio: "chat" | "software";
  isDarkActive: boolean;
  isLeftDrawerOpen: boolean;
  setIsLeftDrawerOpen: (open: boolean) => void;
  accentColor: string;
  selectedRepo: any;
  activeFile: GrixFileNode | null;
  token: string | null;
  selectRepo: any;
  logout: any;
  isMobile: boolean;
  mobileActiveTab: "explorer" | "editor" | "git" | "preview" | "ai" | "settings";
  setMobileActiveTab: (tab: "explorer" | "editor" | "git" | "preview" | "ai" | "settings") => void;
  activeSection: "explorer" | "source_control" | "unpacker" | "settings" | "github" | "deployment" | "cloud";
  setActiveSection: (section: any) => void;
  user: any;
  repos: any[];
  branches: any[];
  selectedBranch: string;
  fileSystemTree: GrixFileNode[];
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
  openTabs: GrixFileNode[];
  updateEditor: (content: string) => void;
  saveFile: (commitMessage: string) => Promise<void>;
  editorContent: string;
  handleSetActiveStudio: (studio: "chat" | "software") => void;
  handleCloseTab: (path: string, e: React.MouseEvent) => void;
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

export default function MobileLayout({
  activeStudio,
  isDarkActive,
  isLeftDrawerOpen,
  setIsLeftDrawerOpen,
  accentColor,
  selectedRepo,
  activeFile,
  token,
  selectRepo,
  logout,
  disconnectGitHub,
  onClearAppData,
  sbUser,
  isMobile,
  mobileActiveTab,
  setMobileActiveTab,
  activeSection,
  setActiveSection,
  user,
  repos,
  branches,
  selectedBranch,
  fileSystemTree,
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
  openTabs,
  updateEditor,
  saveFile,
  editorContent,
  handleSetActiveStudio,
  handleCloseTab,
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
}: MobileLayoutProps) {
  const renderActiveMainWorkspace = () => {
    const openMobileMenu = () => setIsLeftDrawerOpen(true);
    switch (activeMainOption) {
      case "gothwad_ai":
        return <GothwadStudio accentColor={accentColor} customApiKey={customApiKey} onToggleSidebar={openMobileMenu} />;
      case "chat":
        return (
          <ChatStudio 
            accentColor={accentColor} 
            isMobile={isMobile} 
            onOpenMenu={openMobileMenu}
            onToggleSidebar={openMobileMenu}
            onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }}
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
          />
        );
      case "voice_assistant":
        return <VoiceStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "image_gen":
        return <ImageGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "video_gen":
        return <VideoGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "audio_gen":
        return <AudioGenStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "presentation_ai":
        return <PresentationStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "website_builder_ai":
        return <WebsiteStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      case "web_app_builder_ai":
        return <WebAppStudio accentColor={accentColor} isMobile={isMobile} onToggleSidebar={openMobileMenu} onBackToMain={() => { safeStorage.setItem("gothwad_gothwad_ai_show_left_sidebar", "false"); setActiveMainOption?.("gothwad_ai"); }} />;
      default:
        return <GothwadStudio accentColor={accentColor} customApiKey={customApiKey} onToggleSidebar={openMobileMenu} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
      
      {/* 1. Mobile Top Branded Header */}
      {activeStudio === "software" && mobileActiveTab !== "ai" && (
        <MobileHeader
          isDarkActive={isDarkActive}
          accentColor={accentColor}
          selectedRepo={selectedRepo}
          activeFile={activeFile}
          token={token}
          setIsLeftDrawerOpen={setIsLeftDrawerOpen}
          handleThemeModeChange={onThemeModeChange}
          selectRepo={selectRepo}
          logout={logout}
        />
      )}

      {/* 2. Responsive Main Active Content Frame */}
      <div className="flex-1 w-full overflow-hidden relative flex flex-col bg-zinc-950">
        {activeStudio === "chat" && (
          <React.Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
              <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-r-2 border-zinc-400" style={{ borderTopColor: accentColor }} />
              <span className="font-mono text-[10px] animate-pulse">LOADING WORKSPACE...</span>
            </div>
          }>
            {renderActiveMainWorkspace()}
          </React.Suspense>
        )}

        {activeStudio === "software" && (
          <>
            {/* Tab view switches */}
            {mobileActiveTab === "explorer" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                {activeSection === "explorer" && (
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
                    onSelectFile={(file) => {
                      onSelectFile(file);
                      setMobileActiveTab("editor");
                    }}
                    setActiveFile={setActiveFile}
                    loadDirectory={loadDirectory}
                    refreshRepos={refreshRepos}
                    onSelectSection={(sec) => {
                      setActiveSection(sec);
                    }}
                  />
                )}

                {(activeSection === "source_control" || activeSection === "unpacker") && (
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
                )}

                {activeSection === "deployment" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-955">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                      <h2 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase">Deployment & Preview</h2>
                    </div>
                    <React.Suspense fallback={
                      <div className="flex h-32 flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                        <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                        <span className="animate-pulse text-[10px]">LOADING DEPLOYMENT...</span>
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
                )}

                {activeSection === "cloud" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-955">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                      <h2 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase">Cloud Services & DB</h2>
                    </div>
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
                )}

                {activeSection === "github" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-955">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                      <h2 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase">GitHub Integration</h2>
                    </div>
                    <React.Suspense fallback={
                      <div className="flex h-32 flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                        <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                        <span className="animate-pulse text-[10px]">LOADING GITHUB MODULE...</span>
                      </div>
                    }>
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
                    </React.Suspense>
                  </div>
                )}

                {activeSection === "settings" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-955">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                      <h2 className="text-xs font-mono font-bold tracking-tight text-zinc-300 uppercase">Studio Settings</h2>
                    </div>
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
                      showCompactTitle={true}
                      customApiKey={customApiKey}
                      onSetCustomApiKey={onSetCustomApiKey}
                      groqApiKey={groqApiKey}
                      onSetGroqApiKey={onSetGroqApiKey}
                      appModels={appModels}
                      onUpdateAppModels={onUpdateAppModels}
                    />
                  </div>
                )}


              </div>
            )}

            {mobileActiveTab === "editor" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                {activeFile ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Horizontal open tabs strip */}
                    <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center overflow-x-auto no-scrollbar shrink-0">
                      {openTabs.map((tab) => {
                        const isActive = activeFile?.path === tab.path;
                        return (
                          <div
                            key={tab.path}
                            onClick={() => onSelectFile(tab)}
                            className={`h-full px-3 py-1 flex items-center gap-2 border-r border-zinc-900 cursor-pointer text-[10.5px] font-mono select-none transition-all shrink-0 relative ${
                              isActive 
                                ? "bg-zinc-950 text-zinc-100 font-bold border-t-2 border-t-[#375a7f]" 
                                : "bg-zinc-930/50 text-zinc-500 hover:text-zinc-300"
                            }`}
                            style={isActive ? { borderTopColor: accentColor } : {}}
                          >
                            <span className="truncate max-w-[100px]">{tab.name}</span>
                            {tab.isModified && (
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                            )}
                            <button
                              onClick={(e) => handleCloseTab(tab.path, e)}
                              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex-1 overflow-hidden relative">
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
                  </div>
                ) : (
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
                        setMobileActiveTab("explorer");
                      }}
                      onTriggerOAuth={onTriggerOAuth}
                    />
                  </React.Suspense>
                )}
              </div>
            )}

            {mobileActiveTab === "preview" && (
              <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
                {selectedRepo ? (
                  <React.Suspense fallback={
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                      <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                      <span className="font-mono text-[9px] animate-pulse">INITIALIZING PREVIEW...</span>
                    </div>
                  }>
                    <AppPreviewPanel
                      fileSystemTree={fileSystemTree}
                      onClose={() => {}}
                      accentColor={accentColor}
                      selectedRepo={selectedRepo}
                      selectedBranch={selectedBranch}
                    />
                  </React.Suspense>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h3 className="text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider">No Workspace Loaded</h3>
                    <p className="text-zinc-500 text-[10.5px] font-mono max-w-xs leading-relaxed">
                      Please select or generate a repository inside the **Workspace** explorer view to launch a live sandbox.
                    </p>
                    <button
                      onClick={() => setMobileActiveTab("explorer")}
                      className="px-4 py-1.5 bg-[#375a7f] text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    >
                      Browse Workspace
                    </button>
                  </div>
                )}
              </div>
            )}

            {mobileActiveTab === "ai" && (
              <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
                <React.Suspense fallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
                    <div className="h-4 w-4 animate-spin rounded-full border-t border-zinc-500" style={{ borderTopColor: accentColor }} />
                    <span className="font-mono text-[9px] animate-pulse">LOADING AI ASSISTANT...</span>
                  </div>
                }>
                  <AiCompanionPanel
                    isOpen={true}
                    onToggle={() => {}}
                    activeFile={activeFile}
                    fileSystemTree={fileSystemTree}
                    onApplyCode={(code) => {
                      updateEditor(code);
                      setMobileActiveTab("editor");
                    }}
                    accentColor={accentColor}
                    appModels={appModels}
                    customApiKey={customApiKey}
                    groqApiKey={groqApiKey}
                    isMobile={true}
                    onOpenMenu={() => setIsLeftDrawerOpen(true)}
                  />
                </React.Suspense>
              </div>
            )}
          </>
        )}

      </div>

      {/* Left Drawer component */}
      {isLeftDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in flex"
          onClick={() => setIsLeftDrawerOpen(false)}
        >
          <div 
            className="w-[280px] max-w-[85vw] h-full flex flex-col shadow-2xl animate-[slideInLeft_0.2s_ease-out] select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
              onSelectRepo={(repo) => {
                onSelectRepo(repo);
                setIsLeftDrawerOpen(false);
              }}
              onSelectBranch={onSelectBranch}
              onToggleDir={onToggleDir}
              onSelectFile={(file) => {
                onSelectFile(file);
                setMobileActiveTab("editor");
                setIsLeftDrawerOpen(false);
              }}
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
              onSelectSection={(section) => {
                setActiveSection(section);
                setMobileActiveTab("explorer");
                setIsLeftDrawerOpen(false);
              }}
              isMobile={true}
              desktopMode={desktopMode}
              onDesktopModeChange={onDesktopModeChange}
              activeStudio={activeStudio}
              handleSetActiveStudio={(std) => {
                handleSetActiveStudio(std);
                setIsLeftDrawerOpen(false);
              }}
              setMobileActiveTab={setMobileActiveTab}
              chatSessions={chatSessions}
              activeChatSessionId={activeChatSessionId}
              onSetActiveChatSessionId={onSetActiveChatSessionId}
              onUpdateChatSessions={onUpdateChatSessions}
              customApiKey={customApiKey}
              onSetCustomApiKey={onSetCustomApiKey}
              onToggleSidebar={() => setIsLeftDrawerOpen(false)}
              activeMainOption={activeMainOption}
              setActiveMainOption={setActiveMainOption}
            />
          </div>
        </div>
      )}

    </div>
  );
}

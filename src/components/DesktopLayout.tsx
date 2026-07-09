import React from "react";
import { GrixFileNode } from "../types/github";
import PrimarySidebar from "./PrimarySidebar";
import CodeEditor from "./CodeEditor";
import AppPreviewPanel from "./AppPreviewPanel";
import WelcomeScreen from "./WelcomeScreen";
import AiCompanionPanel from "./AiCompanionPanel";
import StatusBar from "./StatusBar";
import ChatStudio from "../features/chatai/ChatStudio";
import { Eye, X, Sparkles, MessageSquare, FileCode2, Menu, GitBranch, UploadCloud, Database, Settings } from "lucide-react";
import IntegrationsPanel from "./IntegrationsPanel";
import SettingsPanel from "./sidebar/SettingsPanel";
import SourceControlPanel from "./sidebar/SourceControlPanel";

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
  handleToggleAiPanel
}: DesktopLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(true);

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
                  user={user}
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
      
      {/* Top Row Branded Header & Switcher */}
      <div className="h-14 bg-[#121214] border-b border-zinc-900 px-4 flex items-center justify-between shrink-0 font-sans z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 cursor-pointer transition-all active:scale-95 flex items-center justify-center mr-1"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md" 
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)` }}
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-mono font-bold tracking-tight text-white flex items-center gap-1.5">
              Gothwad Ai Studio
              <span className="text-[9px] bg-[#375a7f]/20 border border-[#375a7f]/30 px-1.5 py-0.5 rounded text-[#375a7f] font-mono tracking-wide uppercase" style={{ color: accentColor, borderColor: `${accentColor}30`, backgroundColor: `${accentColor}12` }}>Multi-Modal</span>
            </h1>
          </div>
        </div>

        {/* Studios switcher buttons */}
        <div className="flex items-center gap-1 bg-[#09090b] border border-zinc-900 rounded-xl p-1 font-mono text-[11px] font-semibold">
          {[
            { id: "chat", label: "AI Chat", icon: MessageSquare },
            { id: "software", label: "Software Builder", icon: FileCode2 }
          ].map((studio) => {
            const Icon = studio.icon;
            const isActive = activeStudio === studio.id;
            return (
              <button
                key={studio.id}
                onClick={() => handleSetActiveStudio(studio.id as any)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer select-none border border-transparent ${
                  isActive
                    ? "bg-[#375a7f]/15 text-[#375a7f] border-[#375a7f]/20 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
                style={isActive ? { color: accentColor, borderColor: `${accentColor}25`, backgroundColor: `${accentColor}12` } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{studio.label}</span>
              </button>
            );
          })}
        </div>

        {/* Session profile */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-900 rounded-xl p-1 pr-3">
              <img src={user.avatar_url} alt="Profile" className="w-6 h-6 rounded-lg select-none" />
              <span className="text-[10px] font-mono text-zinc-400">{user.login}</span>
            </div>
          )}
        </div>
      </div>

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
          />
        )}

        {/* 2. Main Content Canvas Frame (Center/Right) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeStudio === "chat" ? (
            <ChatStudio accentColor={accentColor} isMobile={isMobile} />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Upper Main Editor Workspace Row */}
              <div className="flex-1 flex overflow-hidden max-w-full">
                
                {/* 3. Code Canvas Frame (Center/Right) */}
                <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
                  {activeSection !== "explorer" && activeSection !== "github" ? (
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
                              <CodeEditor
                                activeFile={activeFile}
                                editorContent={editorContent}
                                onContentChange={updateEditor}
                                onSave={saveFile}
                                isLoading={isLoading}
                              />
                            </div>
                            {previewOpen && (
                              <div className="w-[500px] lg:w-[600px] min-w-[350px] border-l border-zinc-900 overflow-hidden relative bg-zinc-950 flex flex-col shrink-0 animate-slide-in">
                                <AppPreviewPanel
                                  fileSystemTree={fileSystemTree}
                                  onClose={() => setPreviewOpen(false)}
                                  accentColor={accentColor}
                                  selectedRepo={selectedRepo || undefined}
                                  selectedBranch={selectedBranch}
                                />
                              </div>
                            )}
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex overflow-hidden relative">
                          <div className="flex-1 overflow-hidden relative">
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
                          </div>
                          {previewOpen && selectedRepo && (
                            <div className="w-[500px] lg:w-[600px] min-w-[350px] border-l border-zinc-900 overflow-hidden relative bg-zinc-950 flex flex-col shrink-0 animate-slide-in">
                              <AppPreviewPanel
                                fileSystemTree={fileSystemTree}
                                onClose={() => setPreviewOpen(false)}
                                accentColor={accentColor}
                                selectedRepo={selectedRepo}
                                  selectedBranch={selectedBranch}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                {/* 4. AI Coding Companion Panel (Right Sidebar) */}
                <AiCompanionPanel
                  isOpen={aiPanelOpen}
                  onToggle={handleToggleAiPanel}
                  activeFile={activeFile}
                  fileSystemTree={fileSystemTree}
                  onApplyCode={(code) => {
                    updateEditor(code);
                  }}
                  accentColor={accentColor}
                />

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

import React from "react";
import { GrixFileNode } from "../types/github";
import MobileHeader from "./MobileHeader";
import ChatStudio from "../features/chatai/ChatStudio";
import PrimarySidebar from "./PrimarySidebar";
import CodeEditor from "./CodeEditor";
import WelcomeScreen from "./WelcomeScreen";
import AppPreviewPanel from "./AppPreviewPanel";
import AiCompanionPanel from "./AiCompanionPanel";
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
  FileCode2
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
  handleCloseTab
}: MobileLayoutProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
      
      {/* 1. Mobile Top Branded Header */}
      {activeStudio !== "software" ? (
        <div 
          className="h-14 border-b flex items-center justify-between px-3 shrink-0 z-40 transition-all duration-200"
          style={{ 
            backgroundColor: isDarkActive ? "#121214" : "#ffffff", 
            borderColor: isDarkActive ? "#1c1c1e" : "#e4e4e7" 
          }}
        >
          <div className="flex items-center gap-2">
            {/* Left Drawer triggers */}
            <button 
              onClick={() => setIsLeftDrawerOpen(true)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1">
                Gothwad Ai Studio
              </span>
              <span className="text-[8.5px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                {activeStudio === "chat" && "AI Chat Playground"}
              </span>
            </div>
          </div>

          {/* Top right quick theme toggle */}
          <button
            onClick={() => onThemeModeChange(isDarkActive ? "light" : "dark")}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all active:scale-95 flex items-center justify-center text-xs"
          >
            {isDarkActive ? "☀️" : "🌙"}
          </button>
        </div>
      ) : (
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
          <ChatStudio accentColor={accentColor} isMobile={isMobile} />
        )}

        {activeStudio === "software" && (
          <>
            {/* Tab view switches */}
            {mobileActiveTab === "explorer" && (
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
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  if (sec === "source_control" || sec === "unpacker") setMobileActiveTab("git");
                }}
                isMobile={true}
                desktopMode={desktopMode}
                onDesktopModeChange={onDesktopModeChange}
              />
            )}

            {mobileActiveTab === "git" && (
              <PrimarySidebar
                token={token}
                activeSection={activeSection === "unpacker" ? "unpacker" : "source_control"}
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
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  if (sec === "explorer" || sec === "deployment" || sec === "cloud" || sec === "settings" || sec === "github") {
                    setMobileActiveTab("explorer");
                  }
                }}
                isMobile={true}
                desktopMode={desktopMode}
                onDesktopModeChange={onDesktopModeChange}
              />
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
                      <CodeEditor
                        activeFile={activeFile}
                        editorContent={editorContent}
                        onContentChange={updateEditor}
                        onSave={saveFile}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                ) : (
                  <WelcomeScreen
                    token={token}
                    user={user}
                    selectedRepo={selectedRepo}
                    selectedBranch={selectedBranch}
                    onSelectSection={(sec) => {
                      setActiveSection(sec);
                      if (sec === "explorer") setMobileActiveTab("explorer");
                      else if (sec === "source_control" || sec === "unpacker") setMobileActiveTab("git");
                      else if (sec === "deployment" || sec === "cloud") setMobileActiveTab("explorer");
                      else if (sec === "settings") setMobileActiveTab("settings");
                    }}
                    onTriggerOAuth={onTriggerOAuth}
                  />
                )}
              </div>
            )}

            {mobileActiveTab === "preview" && (
              <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
                {selectedRepo ? (
                  <AppPreviewPanel
                    fileSystemTree={fileSystemTree}
                    onClose={() => {}}
                    accentColor={accentColor}
                    selectedRepo={selectedRepo}
                    selectedBranch={selectedBranch}
                  />
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
                />
              </div>
            )}

            {mobileActiveTab === "settings" && (
              <PrimarySidebar
                token={token}
                activeSection="settings"
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
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  if (sec === "explorer" || sec === "deployment" || sec === "cloud" || sec === "settings" || sec === "github") {
                    setMobileActiveTab("explorer");
                  } else if (sec === "source_control" || sec === "unpacker") {
                    setMobileActiveTab("git");
                  }
                }}
                isMobile={true}
                desktopMode={desktopMode}
                onDesktopModeChange={onDesktopModeChange}
              />
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
            />
          </div>
        </div>
      )}

    </div>
  );
}

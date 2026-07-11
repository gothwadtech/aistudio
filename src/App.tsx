import React, { useState, useEffect } from "react";
import { useGitHub } from "./hooks/useGitHub";
import { useOAuth } from "./hooks/useOAuth";
import { SidebarSection } from "./components/ActivityBar";
import { GrixFileNode } from "./types/github";
import { safeStorage } from "./utils/safeStorage";

const MobileLayout = React.lazy(() => import("./components/MobileLayout"));
const DesktopLayout = React.lazy(() => import("./components/DesktopLayout"));

export default function App() {
  const {
    token,
    user,
    repos,
    selectedRepo,
    branches,
    selectedBranch,
    fileSystemTree,
    activeFile,
    editorContent,
    isLoading,
    error,
    login,
    selectRepo,
    selectBranch,
    loadDirectory,
    loadFile,
    setActiveFile,
    updateEditor,
    saveFile,
    syncZipFiles,
    logout,
    refreshRepos
  } = useGitHub();

  const [desktopMode, setDesktopMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem("gothwad_studio_desktop_mode");
    return saved === "true";
  });

  const [isMobileWidth, setIsMobileWidth] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });

  const isMobile = isMobileWidth && !desktopMode;

  const handleDesktopModeChange = (enabled: boolean) => {
    setDesktopMode(enabled);
    safeStorage.setItem("gothwad_studio_desktop_mode", enabled ? "true" : "false");
  };

  const [mobileActiveTab, setMobileActiveTab] = useState<"explorer" | "editor" | "git" | "preview" | "ai" | "settings">("explorer");
  const [activeStudio, setActiveStudio] = useState<"chat" | "software">(() => {
    const saved = safeStorage.getItem("gothwad_studio_active_studio");
    return (saved === "software" ? "software" : "chat");
  });

  const [chatSessions, setChatSessions] = useState<any[]>(() => {
    const saved = safeStorage.getItem("gothwad_studio_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            messages: (s.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))
          }));
        }
      } catch (e) {
        console.error("Error parsing saved sessions", e);
      }
    }
    const defaultId = Date.now().toString();
    return [{
      id: defaultId,
      title: "Welcome Session",
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Welcome to **Gothwad Ai Studio Chat Workstation**!\n\nThis is a high-fidelity interactive chat sandbox styled like Google AI Studio. You can chat with advanced free or premium models, craft deep system instructions, configure inference parameters (temperature, token ceilings), and test complex prompt pipelines.\n\nType your query below to begin, or adjust the parameter console!",
          timestamp: new Date()
        }
      ],
      timestamp: Date.now(),
      selectedModel: "google/gemini-2.5-flash",
      systemInstruction: "You are an elite AI assistant trained by Google. Respond with precise, high-fidelity details, formatting code elegantly using Markdown.",
      temperature: 0.7,
      maxTokens: 2048
    }];
  });

  const [activeChatSessionId, setActiveChatSessionId] = useState<string>(() => {
    const savedActiveId = safeStorage.getItem("gothwad_studio_active_session_id");
    return savedActiveId || (chatSessions[0]?.id || Date.now().toString());
  });

  const [customApiKey, setCustomApiKey] = useState(() => safeStorage.getItem("gothwad_ai_key") || "");

  const handleSetActiveChatSessionId = (id: string) => {
    setActiveChatSessionId(id);
    safeStorage.setItem("gothwad_studio_active_session_id", id);
  };

  const handleUpdateChatSessions = (updated: any[]) => {
    setChatSessions(updated);
    safeStorage.setItem("gothwad_studio_chat_sessions", JSON.stringify(updated));
  };

  const handleSetActiveStudio = (studio: "chat" | "software") => {
    setActiveStudio(studio);
    safeStorage.setItem("gothwad_studio_active_studio", studio);
  };

  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHeightOverride = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty("--true-height", `${height}px`);
      setIsMobileWidth(window.innerWidth < 1024);
    };
    handleHeightOverride();
    window.addEventListener("resize", handleHeightOverride);
    window.addEventListener("orientationchange", handleHeightOverride);
    return () => {
      window.removeEventListener("resize", handleHeightOverride);
      window.removeEventListener("orientationchange", handleHeightOverride);
    };
  }, []);

  const [activeSection, setActiveSection] = useState<SidebarSection>("explorer");
  const [patInput, setPatInput] = useState<string>("");
  const [authConfig, setAuthConfig] = useState<{ clientId: string; appUrl: string } | null>(null);
  const [openTabs, setOpenTabs] = useState<GrixFileNode[]>([]);
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(() => {
    const saved = safeStorage.getItem("gothwad_studio_ai_panel_open");
    return saved === "true";
  });

  const [previewOpen, setPreviewOpen] = useState<boolean>(() => {
    const saved = safeStorage.getItem("gothwad_studio_preview_open");
    return saved === "true";
  });

  const handleTogglePreview = () => {
    setPreviewOpen(prev => {
      const next = !prev;
      safeStorage.setItem("gothwad_studio_preview_open", next ? "true" : "false");
      return next;
    });
  };

  const handleToggleAiPanel = () => {
    setAiPanelOpen(prev => {
      const next = !prev;
      safeStorage.setItem("gothwad_studio_ai_panel_open", next.toString());
      return next;
    });
  };

  const [uiScale, setUiScale] = useState<number>(() => {
    const saved = safeStorage.getItem("gothwad_studio_ui_scale");
    return saved ? parseFloat(saved) : 1.0;
  });

  const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">(() => {
    const saved = safeStorage.getItem("gothwad_studio_theme_mode");
    return (saved as "system" | "dark" | "light") || "dark";
  });

  const [isDarkActive, setIsDarkActive] = useState<boolean>(true);

  const [accentColor, setAccentColor] = useState<string>(() => {
    const saved = safeStorage.getItem("gothwad_studio_accent_color");
    return saved || "#375a7f";
  });

  const [fontFamily, setFontFamily] = useState<string>(() => {
    const saved = safeStorage.getItem("gothwad_studio_font_family");
    return saved || "Roboto";
  });

  const handleUiScaleChange = (val: number) => {
    setUiScale(val);
    safeStorage.setItem("gothwad_studio_ui_scale", val.toString());
  };

  const handleThemeModeChange = (mode: "system" | "dark" | "light") => {
    setThemeMode(mode);
    safeStorage.setItem("gothwad_studio_theme_mode", mode);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    safeStorage.setItem("gothwad_studio_accent_color", color);
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    safeStorage.setItem("gothwad_studio_font_family", font);
  };

  const loadGoogleFont = (fontName: string) => {
    if (!fontName || fontName === "System Font" || fontName === "Courier New" || fontName === "Georgia") return;
    const formattedName = fontName.replace(/\s+/g, "+");
    const linkId = `gothwad-font-${formattedName}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;700;900&display=swap`;
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", accentColor);
    document.documentElement.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`);

    loadGoogleFont(fontFamily);
    const cssFont = fontFamily === "System Font" ? "system-ui, sans-serif" : `"${fontFamily}", sans-serif`;
    document.documentElement.style.setProperty("--font-sans", cssFont);
    document.documentElement.style.setProperty("--font-mono", cssFont);
    document.body.style.fontFamily = cssFont;

    const isDark = themeMode === "dark" || (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkActive(isDark);
    if (isDark) {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.add("theme-light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [themeMode, accentColor, fontFamily]);

  useEffect(() => {
    fetch("/api/auth/config")
      .then(res => res.json())
      .then(data => setAuthConfig(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeFile) {
      setOpenTabs(prev => {
        const exists = prev.some(t => t.path === activeFile.path);
        if (exists) {
          return prev.map(t => t.path === activeFile.path ? activeFile : t);
        } else {
          return [...prev, activeFile];
        }
      });
    }
  }, [activeFile]);

  useEffect(() => {
    if (!selectedRepo) {
      setOpenTabs([]);
    }
  }, [selectedRepo]);

  const { triggerOAuthLogin } = useOAuth(authConfig, login);

  const handleSelectRepo = (repo: any) => {
    selectRepo(repo);
    setActiveSection("explorer");
  };

  const handleSelectFile = (node: GrixFileNode) => {
    loadFile(node);
    if (isMobile) {
      setMobileActiveTab("editor");
    }
  };

  const handleCloseTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter(t => t.path !== path);
    setOpenTabs(nextTabs);

    if (activeFile?.path === path) {
      if (nextTabs.length > 0) {
        const lastTab = nextTabs[nextTabs.length - 1];
        loadFile(lastTab);
      } else {
        setActiveFile(null);
      }
    }
  };

  const handlePatLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patInput.trim()) {
      login(patInput.trim());
      setPatInput("");
    }
  };

  const toggleDirectoryExpand = (path: string) => {
    loadDirectory(path);
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "var(--true-height, 100dvh)",
    overflow: "hidden",
  };

  return (
    <div 
      style={containerStyle}
      className="flex flex-col bg-zinc-950 text-zinc-300 selection:bg-zinc-850 select-none overflow-hidden font-sans relative"
    >
      <React.Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 font-sans text-xs text-zinc-500 tracking-wider">
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-r-2 border-zinc-400" style={{ borderTopColor: accentColor }} />
            <span className="font-mono text-[10px] animate-pulse">INITIALIZING GOTHWAD WORKSPACE...</span>
          </div>
        </div>
      }>
        {isMobile ? (
          <MobileLayout
            activeStudio={activeStudio}
            isDarkActive={isDarkActive}
            isLeftDrawerOpen={isLeftDrawerOpen}
            setIsLeftDrawerOpen={setIsLeftDrawerOpen}
            accentColor={accentColor}
            selectedRepo={selectedRepo}
            activeFile={activeFile}
            token={token}
            selectRepo={selectRepo}
            logout={logout}
            isMobile={isMobile}
            mobileActiveTab={mobileActiveTab}
            setMobileActiveTab={setMobileActiveTab}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            user={user}
            repos={repos}
            branches={branches}
            selectedBranch={selectedBranch}
            fileSystemTree={fileSystemTree}
            isLoading={isLoading}
            error={error}
            patInput={patInput}
            onPatInputChange={setPatInput}
            onPatSubmit={handlePatLoginSubmit}
            onTriggerOAuth={triggerOAuthLogin}
            onSelectRepo={handleSelectRepo}
            onSelectBranch={selectBranch}
            onToggleDir={toggleDirectoryExpand}
            onSelectFile={handleSelectFile}
            setActiveFile={setActiveFile}
            loadDirectory={loadDirectory}
            syncZipFiles={syncZipFiles}
            refreshRepos={refreshRepos}
            authConfig={authConfig}
            uiScale={uiScale}
            onUiScaleChange={handleUiScaleChange}
            themeMode={themeMode}
            onThemeModeChange={handleThemeModeChange}
            onAccentColorChange={handleAccentColorChange}
            fontFamily={fontFamily}
            onFontFamilyChange={handleFontFamilyChange}
            desktopMode={desktopMode}
            onDesktopModeChange={handleDesktopModeChange}
            openTabs={openTabs}
            updateEditor={updateEditor}
            saveFile={saveFile}
            editorContent={editorContent}
            handleSetActiveStudio={handleSetActiveStudio}
            handleCloseTab={handleCloseTab}
            chatSessions={chatSessions}
            activeChatSessionId={activeChatSessionId}
            onSetActiveChatSessionId={handleSetActiveChatSessionId}
            onUpdateChatSessions={handleUpdateChatSessions}
            customApiKey={customApiKey}
            onSetCustomApiKey={setCustomApiKey}
          />
        ) : (
          <DesktopLayout
            activeStudio={activeStudio}
            handleSetActiveStudio={handleSetActiveStudio}
            accentColor={accentColor}
            selectedRepo={selectedRepo}
            activeFile={activeFile}
            token={token}
            logout={logout}
            isMobile={isMobile}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            user={user}
            repos={repos}
            branches={branches}
            selectedBranch={selectedBranch}
            fileSystemTree={fileSystemTree}
            isLoading={isLoading}
            error={error}
            patInput={patInput}
            onPatInputChange={setPatInput}
            onPatSubmit={handlePatLoginSubmit}
            onTriggerOAuth={triggerOAuthLogin}
            onSelectRepo={handleSelectRepo}
            onSelectBranch={selectBranch}
            onToggleDir={toggleDirectoryExpand}
            onSelectFile={handleSelectFile}
            setActiveFile={setActiveFile}
            loadDirectory={loadDirectory}
            syncZipFiles={syncZipFiles}
            refreshRepos={refreshRepos}
            authConfig={authConfig}
            uiScale={uiScale}
            onUiScaleChange={handleUiScaleChange}
            themeMode={themeMode}
            onThemeModeChange={handleThemeModeChange}
            onAccentColorChange={handleAccentColorChange}
            fontFamily={fontFamily}
            onFontFamilyChange={handleFontFamilyChange}
            desktopMode={desktopMode}
            onDesktopModeChange={handleDesktopModeChange}
            previewOpen={previewOpen}
            handleTogglePreview={handleTogglePreview}
            setPreviewOpen={setPreviewOpen}
            openTabs={openTabs}
            handleCloseTab={handleCloseTab}
            editorContent={editorContent}
            updateEditor={updateEditor}
            saveFile={saveFile}
            aiPanelOpen={aiPanelOpen}
            handleToggleAiPanel={handleToggleAiPanel}
            chatSessions={chatSessions}
            activeChatSessionId={activeChatSessionId}
            onSetActiveChatSessionId={handleSetActiveChatSessionId}
            onUpdateChatSessions={handleUpdateChatSessions}
            customApiKey={customApiKey}
            onSetCustomApiKey={setCustomApiKey}
          />
        )}
      </React.Suspense>
    </div>
  );
}

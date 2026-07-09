import React, { useState, useEffect } from "react";
import { useGitHub } from "./hooks/useGitHub";
import { useOAuth } from "./hooks/useOAuth";
import { SidebarSection } from "./components/ActivityBar";
import { GrixFileNode } from "./types/github";
import { safeStorage } from "./utils/safeStorage";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";

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

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [desktopMode, setDesktopMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem("gothwad_studio_desktop_mode");
    return saved === "true";
  });

  const handleDesktopModeChange = (enabled: boolean) => {
    setDesktopMode(enabled);
    safeStorage.setItem("gothwad_studio_desktop_mode", enabled ? "true" : "false");
  };

  const [mobileActiveTab, setMobileActiveTab] = useState<"explorer" | "editor" | "git" | "preview" | "ai" | "settings">("explorer");
  const [activeStudio, setActiveStudio] = useState<"chat" | "software">(() => {
    const saved = safeStorage.getItem("gothwad_studio_active_studio");
    return (saved === "software" ? "software" : "chat");
  });

  const handleSetActiveStudio = (studio: "chat" | "software") => {
    setActiveStudio(studio);
    safeStorage.setItem("gothwad_studio_active_studio", studio);
  };

  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (desktopMode) {
        setIsMobile(false);
      } else {
        setIsMobile(window.innerWidth < 768);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [desktopMode]);

  useEffect(() => {
    const handleHeightOverride = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty("--true-height", `${height}px`);
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

  const containerStyle: React.CSSProperties = isMobile ? {
    position: "relative",
    width: "100%",
    height: "var(--true-height, 100dvh)",
    overflow: "hidden",
  } : {
    position: "absolute",
    top: 0,
    left: 0,
    width: `${100 / uiScale}%`,
    height: `${100 / uiScale}%`,
    transform: `scale(${uiScale})`,
    transformOrigin: "top left",
    maxWidth: "none",
    maxHeight: "none",
  };

  return (
    <div 
      style={containerStyle}
      className="flex flex-col bg-zinc-950 text-zinc-300 selection:bg-zinc-850 select-none overflow-hidden font-sans relative"
    >
      {!desktopMode ? (
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
        />
      ) : (
        <DesktopLayout
          accentColor={accentColor}
          activeStudio={activeStudio}
          handleSetActiveStudio={handleSetActiveStudio}
          user={user}
          isMobile={isMobile}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          selectedRepo={selectedRepo}
          selectedBranch={selectedBranch}
          fileSystemTree={fileSystemTree}
          activeFile={activeFile}
          logout={logout}
          token={token}
          repos={repos}
          branches={branches}
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
        />
      )}
    </div>
  );
}

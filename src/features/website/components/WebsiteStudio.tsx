import React, { useState, useEffect, useRef } from "react";
import { 
  Laptop, 
  Smartphone, 
  Sparkles, 
  Code, 
  Eye, 
  Download, 
  Trash2, 
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  Clock,
  X,
  FileCode,
  FileText,
  Save,
  Cpu,
  CheckCircle,
  FolderOpen,
  ChevronDown
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import ChatInputBar from "../../../components/ChatInputBar";
import { callAiChat } from "../../../utils/aiClient";
import { safeStorage } from "../../../utils/safeStorage";

interface WebsiteSession {
  id: string;
  prompt: string;
  files: { [path: string]: string };
  timestamp: string;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col justify-between">
  
  <!-- Navigation Header -->
  <nav class="max-w-6xl mx-auto w-full px-6 py-4 flex justify-between items-center border-b border-slate-900">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">W</div>
      <span class="font-bold text-sm uppercase tracking-wide">WebBuilder AI</span>
    </div>
    <div class="flex items-center gap-4 text-xs font-medium text-slate-400">
      <a href="#" class="hover:text-amber-400 transition-colors">Features</a>
      <a href="#" class="hover:text-amber-400 transition-colors">Pricing</a>
      <a href="#" class="hover:text-amber-400 transition-colors">Contact</a>
    </div>
  </nav>

  <!-- Main Hero Block -->
  <header class="max-w-4xl mx-auto px-6 py-16 text-center flex-1 flex flex-col justify-center">
    <span class="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full mx-auto w-max animate-pulse">
      AUTOPILOT CODES ACTIVE
    </span>
    <h1 class="text-4xl md:text-5xl font-black tracking-tight mt-6 leading-tight">
      Build Stunning Interfaces <br/>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">In Pure Milliseconds</span>
    </h1>
    <p class="text-slate-400 max-w-lg mx-auto text-xs mt-4 leading-relaxed font-sans">
      Use the bottom dynamic prompt bar to chat, generate bento grids, pricing tiers, and inject custom javascript click events instantly.
    </p>
    <div class="mt-8 flex justify-center gap-4">
      <button onclick="showAlert()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer">
        Execute script.js Alert
      </button>
      <button onclick="glowHero()" class="border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer">
        Toggle Glow Style
      </button>
    </div>
  </header>

  <!-- Footer block -->
  <footer class="border-t border-slate-900 py-6 text-center text-[10px] text-slate-500 font-mono">
    © 2026 WebBuilder AI Studio. Standardized modular preview sandbox.
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

const DEFAULT_CSS = `/* Custom styles for your landing page */
body {
  background-image: radial-gradient(circle at top center, rgba(234, 179, 8, 0.05) 0%, transparent 75%);
  transition: all 0.5s ease;
}
.glow-on {
  background-color: #0b0f19 !important;
  background-image: radial-gradient(circle at top center, rgba(234, 179, 8, 0.15) 0%, transparent 70%) !important;
}`;

const DEFAULT_JS = `// Custom javascript interactive behaviors
function showAlert() {
  alert("🎯 Interactivity confirmed! This alert was launched dynamically from your sandbox script.js file.");
}

function glowHero() {
  const body = document.body;
  body.classList.toggle("glow-on");
  console.log("Glow toggled successfully");
}`;

const AVAILABLE_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Default fast multimodal reasoning" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Slower, complex system planner" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3", desc: "High performance programming model" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1", desc: "Deep reasoning full-chain agent" }
];

export default function WebsiteStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: WebsiteStudioProps) {
  const [promptInput, setPromptInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Panels visibility
  const [showParametersPanel, setShowParametersPanel] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1280;
    }
    return true;
  });
  const [showLeftSidebar, setShowLeftSidebar] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "code">("desktop");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState("");

  // Virtual Filesystem State
  const [files, setFiles] = useState<{ [path: string]: string }>({
    "index.html": DEFAULT_HTML,
    "styles.css": DEFAULT_CSS,
    "script.js": DEFAULT_JS
  });
  const [activeFilePath, setActiveFilePath] = useState<string>("index.html");
  const [editorContent, setEditorContent] = useState<string>(DEFAULT_HTML);

  // Sync editor on active file change
  useEffect(() => {
    setEditorContent(files[activeFilePath] || "");
  }, [activeFilePath]);

  // Update virtual file when user edits code manually
  const handleContentChange = (newVal: string) => {
    setEditorContent(newVal);
    setFiles(prev => ({ ...prev, [activeFilePath]: newVal }));
  };

  // Compile active iframe srcDoc with injected CSS and JS dynamically
  const getCompiledIframeSrcDoc = () => {
    const html = files["index.html"] || "";
    const css = files["styles.css"] || "";
    const js = files["script.js"] || "";

    // Inject css stylesheet
    let doc = html;
    if (doc.includes('<link rel="stylesheet" href="styles.css">')) {
      doc = doc.replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`);
    } else {
      doc = doc.replace('</head>', `<style>${css}</style></head>`);
    }

    // Inject js script
    if (doc.includes('<script src="script.js"></script>')) {
      doc = doc.replace('<script src="script.js"></script>', `<script>${js}</script>`);
    } else {
      doc = doc.replace('</body>', `<script>${js}</script></body>`);
    }

    return doc;
  };

  // History State
  const [history, setHistory] = useState<WebsiteSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_website_v2");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleSelectHistory = (item: WebsiteSession) => {
    setActiveHistoryId(item.id);
    setFiles(item.files);
    setActiveFilePath("index.html");
    setEditorContent(item.files["index.html"]);
    setViewMode("desktop");
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setFiles({
      "index.html": DEFAULT_HTML,
      "styles.css": DEFAULT_CSS,
      "script.js": DEFAULT_JS
    });
    setActiveFilePath("index.html");
    setEditorContent(DEFAULT_HTML);
    setViewMode("desktop");
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_website_v2");
    } catch (e) {}
    setActiveHistoryId(null);
  };

  // AI Direct Generation call
  const handleSendMessage = async (customPrompt?: string) => {
    const activePrompt = customPrompt || promptInput;
    if (!activePrompt.trim() || generating) return;

    setGenerating(true);
    setPromptInput("");
    setProgress(15);
    setAiStatus("Parsing current workspace structure...");

    try {
      const systemInstruction = 
        "You are an elite, production-grade Web Design AI integrated into WebBuilder AI.\n" +
        "The user will describe their requested edits, page section additions, themes, or styles.\n" +
        "You have three files in the workspace: 'index.html', 'styles.css', and 'script.js'.\n" +
        "Always output the COMPLETE, updated content of the files you modify in your response, enclosed inside clear Markdown code blocks.\n" +
        "Prefix code blocks with the exact filename: e.g.\n" +
        "File: index.html\n```html\n...\n```\n" +
        "File: styles.css\n```css\n...\n```\n" +
        "File: script.js\n```javascript\n...\n```\n\n" +
        "Maintain absolute high visual fidelity, eye-safe beautiful colors, gorgeous layout structures using Tailwind, clean Inter typography, and elegant spacing. Do not write short placeholders or snippets — write the full compilable files so the code compiler doesn't break!";

      const messages = [
        {
          role: "user" as const,
          content: `Here is the current code of my files:\n\n` +
            `=== index.html ===\n${files["index.html"]}\n\n` +
            `=== styles.css ===\n${files["styles.css"]}\n\n` +
            `=== script.js ===\n${files["script.js"]}\n\n` +
            `My modification request: ${activePrompt}`
        }
      ];

      setProgress(40);
      setAiStatus(`Calling AI model: ${selectedModel}...`);

      const response = await callAiChat({
        messages,
        selectedModel,
        selectedAgent: "designer",
        systemInstructionOverride: systemInstruction,
        temperature: 0.2,
        maxTokens: 4096
      });

      setProgress(75);
      setAiStatus("Analyzing returned code payload...");

      const responseText = response.text || "";
      const updatedFiles = { ...files };
      let anyUpdated = false;

      // Extract html code block
      const htmlBlockMatch = responseText.match(/(?:File:\s*index\.html\s*)?```html\n([\s\S]*?)```/i);
      if (htmlBlockMatch && htmlBlockMatch[1]) {
        updatedFiles["index.html"] = htmlBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Extract css code block
      const cssBlockMatch = responseText.match(/(?:File:\s*styles\.css\s*)?```css\n([\s\S]*?)```/i);
      if (cssBlockMatch && cssBlockMatch[1]) {
        updatedFiles["styles.css"] = cssBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Extract js code block
      const jsBlockMatch = responseText.match(/(?:File:\s*script\.js\s*)?```(?:javascript|js)\n([\s\S]*?)```/i);
      if (jsBlockMatch && jsBlockMatch[1]) {
        updatedFiles["script.js"] = jsBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Fallback: If AI returned code block without label, try standard tags
      if (!anyUpdated) {
        const anyHtml = responseText.match(/```html\n([\s\S]*?)```/i);
        if (anyHtml) updatedFiles["index.html"] = anyHtml[1].trim();
        const anyCss = responseText.match(/```css\n([\s\S]*?)```/i);
        if (anyCss) updatedFiles["styles.css"] = anyCss[1].trim();
        const anyJs = responseText.match(/```(?:javascript|js)\n([\s\S]*?)```/i);
        if (anyJs) updatedFiles["script.js"] = anyJs[1].trim();
      }

      setFiles(updatedFiles);
      setEditorContent(updatedFiles[activeFilePath]);

      // Save to history list
      const newItem: WebsiteSession = {
        id: Date.now().toString(),
        prompt: activePrompt,
        files: updatedFiles,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const nextHistory = [newItem, ...history];
      setHistory(nextHistory);
      try {
        localStorage.setItem("gothwad_history_website_v2", JSON.stringify(nextHistory));
      } catch (e) {}
      setActiveHistoryId(newItem.id);

      setProgress(100);
      setAiStatus("Website successfully compiled!");
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 800);

    } catch (err: any) {
      console.error(err);
      alert(`AI compilation failed: ${err.message || err}`);
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    const activeCode = files[activeFilePath] || "";
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to revert to default code files?")) {
      handleNewSession();
    }
  };

  const selectedModelLabel = AVAILABLE_MODELS.find(m => m.value === selectedModel)?.label || "Gemini 2.5 Flash";

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-950 font-sans text-zinc-300 relative select-none">
      
      {/* 1. Left Sidebar - Combines History and Workspace File tree */}
      {showLeftSidebar && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setShowLeftSidebar(false)}
          />
          <div className="absolute lg:relative left-0 top-0 h-full z-40 shrink-0 shadow-2xl lg:shadow-none bg-zinc-900 border-r border-zinc-850 w-[260px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {(onToggleSidebar || onBackToMain) && (
                  <button
                    onClick={onToggleSidebar || onBackToMain}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                    title="Back"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 truncate">
                  Website Builder AI
                </span>
              </div>
              <button
                onClick={() => setShowLeftSidebar(false)}
                className="p-1 text-zinc-500 hover:text-zinc-350 hover:bg-zinc-850 border border-transparent hover:border-zinc-800 rounded-lg lg:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Button */}
            <div className="p-3 border-b border-zinc-850 shrink-0">
              <button
                onClick={handleNewSession}
                className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-xs font-medium tracking-wide transition-all cursor-pointer active:scale-95"
                style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
              >
                <Plus className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>New Session Workspace</span>
              </button>
            </div>

            {/* Combined Scrollable Section (History + Workspace Explorer) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-5">
              
              {/* Workspace File Explorer Panel */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                  Workspace Explorer
                </span>
                <div className="space-y-1 bg-zinc-950/20 border border-zinc-850/40 rounded-xl p-2.5">
                  {Object.keys(files).map((fName) => {
                    const isActive = activeFilePath === fName;
                    return (
                      <button
                        key={fName}
                        onClick={() => setActiveFilePath(fName)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          isActive 
                            ? "bg-zinc-800/80 text-white border-l-2 pl-1.5" 
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                        }`}
                        style={isActive ? { borderLeftColor: accentColor } : {}}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {fName.endsWith(".html") ? (
                            <FileCode className="w-3.5 h-3.5 text-orange-400" />
                          ) : fName.endsWith(".css") ? (
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-yellow-400" />
                          )}
                          <span className="truncate">{fName}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-650">simulated</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Build History Thread Panel */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    Build History
                  </span>
                  {history.length > 0 && (
                    <button 
                      onClick={handleClearHistory} 
                      className="text-[9px] font-mono text-zinc-650 hover:text-rose-400 transition-colors uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-6 border border-zinc-850/30 rounded-xl bg-zinc-950/10">
                    <span className="text-[9.5px] font-mono text-zinc-650 block">No past generations</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {history.map((item) => {
                      const isActive = activeHistoryId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectHistory(item)}
                          className={`w-full text-left p-2 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer ${
                            isActive
                              ? "bg-zinc-850/50 border-zinc-750 text-white"
                              : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-[11px] font-sans font-medium truncate w-full block">
                            {item.prompt}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-650 block">{item.timestamp}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

      {/* 2. Main Center Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* Header - Integrating model dropdown switcher in place of static DOM codes */}
        <GlobalStudioHeader
          title="Website Builder AI"
          badge={
            <div className="relative inline-block text-left mt-0.5">
              <button 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider select-none transition-all duration-150 cursor-pointer"
              >
                <span>{selectedModelLabel}</span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-500 shrink-0 ml-0.5" />
              </button>

              {showModelDropdown && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowModelDropdown(false)} />
                  <div className="absolute left-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 z-50 animate-[fadeIn_0.1s_ease-out] font-sans">
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => {
                          setSelectedModel(m.value);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex flex-col gap-0.5 cursor-pointer hover:bg-zinc-850 transition-colors ${
                          selectedModel === m.value ? "text-amber-400 bg-amber-400/5 font-bold" : "text-zinc-400"
                        }`}
                      >
                        <span>{m.label}</span>
                        <span className="text-[8.5px] text-zinc-600 font-sans leading-none">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          }
          onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
          onToggleSettings={() => setShowParametersPanel(!showParametersPanel)}
          showSettingsActive={showParametersPanel}
        />

        {/* Dynamic AI Generation Loader Banner */}
        {generating && (
          <div className="bg-amber-950/20 border-b border-amber-900/30 px-5 py-2 flex items-center justify-between text-amber-400 text-xs font-mono z-20 select-none animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-t border-r border-amber-400" />
              <span className="font-semibold">{aiStatus}</span>
            </div>
            <span className="font-bold">{progress}% parsed</span>
          </div>
        )}

        {/* Core Workspace - Left (Code Editor) and Right (Live Preview) split view */}
        <div className="flex-1 flex overflow-hidden w-full relative">
          
          {/* Split 1: Code Editor area */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-900 h-full">
            {/* Header bar of active tab */}
            <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
              <span className="text-[10.5px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Active File: {activeFilePath}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1 px-2.5 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Custom Manual Code Textarea block styled like a beautiful Editor */}
            <div className="flex-1 bg-zinc-950 p-4 font-mono text-xs overflow-hidden flex">
              {/* Lines gutter numbers */}
              <div className="text-zinc-650 pr-4 select-none text-right font-mono border-r border-zinc-900 leading-normal flex flex-col h-full overflow-y-hidden select-none">
                {Array.from({ length: editorContent.split("\n").length }).map((_, idx) => (
                  <span key={idx} className="block min-w-[20px] text-[10.5px] leading-5">{idx + 1}</span>
                ))}
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
                className="flex-1 h-full pl-4 bg-transparent outline-none border-none text-zinc-300 resize-none leading-5 text-[10.5px] overflow-auto select-text font-mono focus:ring-0"
              />
            </div>
          </div>

          {/* Split 2: Live View Frame on Desktop */}
          {(!isMobile || viewMode !== "code") && (
            <div className={`flex-1 flex flex-col overflow-hidden bg-zinc-950 h-full transition-all duration-300 ${
              viewMode === "mobile" ? "max-w-[360px] border-l border-zinc-900" : "flex-1"
            }`}>
              {/* Device switcher and action toolbar */}
              <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
                <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-850">
                  <button 
                    onClick={() => setViewMode("desktop")}
                    className={`p-1 px-2 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${viewMode === "desktop" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"}`}
                  >
                    <Laptop className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button 
                    onClick={() => setViewMode("mobile")}
                    className={`p-1 px-2 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${viewMode === "mobile" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-350"}`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  live_preview: active_sandbox
                </div>
              </div>

              {/* Live Preview Viewport */}
              <div className="flex-1 bg-zinc-930/30 p-4 flex items-center justify-center overflow-hidden">
                <iframe 
                  srcDoc={getCompiledIframeSrcDoc()} 
                  title="Gothwad Static Preview" 
                  className="w-full h-full bg-zinc-950 rounded-xl border border-zinc-850 shadow-2xl"
                />
              </div>
            </div>
          )}

        </div>

        {/* 3. Unified Bottom Typing/Chat input bar styled like high-end playground */}
        <ChatInputBar
          input={promptInput}
          setInput={setPromptInput}
          isLoading={generating}
          onSend={() => handleSendMessage()}
          selectedModel={selectedModel}
          accentColor={accentColor}
          customMediaActions={false}
          temperature={0.2}
          maxTokens={4096}
        />

      </div>

      {/* 4. Right Sidebar - Page Layout Settings */}
      {showParametersPanel && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setShowParametersPanel(false)}
          />
          <div className="absolute lg:relative right-0 top-0 h-full z-40 shrink-0 shadow-2xl lg:shadow-none bg-zinc-900 border-l border-zinc-850 w-[280px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Workspace Operations
              </span>
              <button
                onClick={() => setShowParametersPanel(false)}
                className="p-1 text-zinc-500 hover:text-zinc-350 hover:bg-zinc-850 border border-transparent hover:border-zinc-800 rounded-lg lg:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Operations */}
            <div className="p-4 space-y-6 overflow-y-auto no-scrollbar flex-1">
              
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">
                  Sandbox Commands
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleCopy}
                    className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>Copy Active File Code</span>
                  </button>

                  <button 
                    onClick={handleDiscard}
                    className="w-full py-2 px-3 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/20 hover:border-rose-900/30 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-350 flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-fade-in"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Discard Changes</span>
                  </button>
                </div>
              </div>

              {/* Developer specifications reference Card */}
              <div className="bg-zinc-950/40 border border-zinc-850/60 rounded-xl p-3 space-y-2.5 text-[10px]">
                <div className="text-zinc-500 font-extrabold uppercase tracking-widest text-[8px] font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-500" />
                  WORKSPACE TELEMETRY
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans">
                  The AI designer reads HTML, styles.css, and script.js as a combined pipeline, allowing you to build highly visual, responsive designs instantly.
                </p>
                <div className="space-y-1 pt-1 border-t border-zinc-850/50 font-mono text-[9px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>FRAME ENGINES:</span>
                    <span className="text-zinc-300">TAILWIND V3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COMPILER:</span>
                    <span className="text-zinc-300">GOTHWAD DOM</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

interface WebsiteStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

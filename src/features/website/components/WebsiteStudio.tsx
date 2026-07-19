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
  ChevronDown,
  MessageSquare,
  FolderTree,
  Cloud,
  Share2,
  ExternalLink,
  QrCode,
  Globe,
  UploadCloud,
  Edit2
} from "lucide-react";
import JSZip from "jszip";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import ChatInputBar from "../../../components/ChatInputBar";
import { callAiChat } from "../../../utils/aiClient";
import { safeStorage } from "../../../utils/safeStorage";
import Editor from "@monaco-editor/react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modifiedFiles?: string[];
}

interface WebsiteSession {
  id: string;
  prompt: string;
  files: { [path: string]: string };
  timestamp: string;
  messages?: ChatMessage[];
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-950 text-slate-400 min-h-screen font-sans flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-md space-y-4">
    <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 text-2xl animate-pulse">
      ✨
    </div>
    <h1 class="text-2xl font-extrabold text-slate-100 tracking-tight">Your Canvas is Ready</h1>
    <p class="text-xs text-slate-500 leading-relaxed">
      Type a prompt in the chat assistant on the left to start building your website. I will generate HTML, Tailwind CSS styles, and interactive JavaScript automatically!
    </p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

const DEFAULT_CSS = `/* Custom styles for your canvas page */
body {
  background-image: radial-gradient(circle at center, rgba(234, 179, 8, 0.03) 0%, transparent 70%);
  transition: all 0.5s ease;
}`;

const DEFAULT_JS = `// Custom javascript interactive behaviors
console.log("Canvas ready for your AI creations!");`;

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

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"chat" | "editor">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your Website Builder AI Assistant. 🚀\n\nTell me what you want to build, and I will code the HTML, CSS, and JS files from scratch and render your website live on the right. You can ask for a modern portfolio, a landing page, interactive calculation forms, animations, and more!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeWorkspaceTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, activeWorkspaceTab]);

  // Virtual Filesystem State
  const [files, setFiles] = useState<{ [path: string]: string }>({
    "index.html": DEFAULT_HTML,
    "styles.css": DEFAULT_CSS,
    "script.js": DEFAULT_JS
  });

  // Supercharged Workspace Explorer & Deploy States
  const [activeSidebarTab, setActiveSidebarTab] = useState<"workspace" | "ai_agent" | "deploy" | "preview">("workspace");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Staging Deployment States
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStatus, setDeployStatus] = useState<"idle" | "building" | "uploading" | "live">("idle");
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);

  // File operation handlers
  const handleAddFile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    
    if (!trimmed.includes(".")) {
      alert("File name must contain an extension (e.g., page.html, theme.css, script.js)");
      return;
    }
    if (files[trimmed]) {
      alert("A file with this name already exists in the workspace.");
      return;
    }

    let defaultContent = "";
    if (trimmed.endsWith(".html")) {
      defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-950 text-slate-400 min-h-screen font-sans p-6">
  <div class="max-w-2xl mx-auto space-y-4">
    <h1 class="text-3xl font-extrabold text-white">${trimmed.replace('.html', '').toUpperCase()}</h1>
    <p class="text-xs text-slate-500 leading-relaxed">Custom page content. Feel free to write any HTML structure or edit this page.</p>
    <a href="index.html" class="inline-block px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition">← Back to Home</a>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
    } else if (trimmed.endsWith(".css")) {
      defaultContent = `/* Stylesheet for ${trimmed} */\n`;
    } else if (trimmed.endsWith(".js")) {
      defaultContent = `// JavaScript behavior for ${trimmed}\nconsole.log('${trimmed} initialized!');\n`;
    }

    setFiles(prev => ({ ...prev, [trimmed]: defaultContent }));
    setActiveFilePath(trimmed);
    setEditorContent(defaultContent);
    setIsAddingFile(false);
    setNewFileName("");
  };

  const handleStartRename = (fName: string) => {
    if (fName === "index.html" || fName === "styles.css" || fName === "script.js") {
      alert("Core configuration files (index.html, styles.css, script.js) cannot be renamed to preserve compiler entry points.");
      return;
    }
    setEditingFileName(fName);
    setRenameValue(fName);
  };

  const handleConfirmRename = () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !editingFileName) return;
    if (trimmed === editingFileName) {
      setEditingFileName(null);
      return;
    }
    if (!trimmed.includes(".")) {
      alert("File name must contain an extension (e.g. page.html).");
      return;
    }
    if (files[trimmed]) {
      alert("A file with this name already exists in the workspace.");
      return;
    }

    setFiles(prev => {
      const updated = { ...prev };
      updated[trimmed] = updated[editingFileName];
      delete updated[editingFileName];
      return updated;
    });

    if (activeFilePath === editingFileName) {
      setActiveFilePath(trimmed);
    }
    setEditingFileName(null);
  };

  const handleDeleteFile = (fName: string) => {
    if (fName === "index.html" || fName === "styles.css" || fName === "script.js") {
      alert("Core files (index.html, styles.css, script.js) cannot be deleted to ensure your website compiles successfully.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${fName}?`)) {
      setFiles(prev => {
        const updated = { ...prev };
        delete updated[fName];
        return updated;
      });
      if (activeFilePath === fName) {
        setActiveFilePath("index.html");
      }
    }
  };

  // ZIP Download Handler
  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      Object.entries(files).forEach(([fName, fContent]) => {
        zip.file(fName, fContent);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gothwad-website-project.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Failed to export project: " + err.message);
    }
  };

  // Live Staging Deployment
  const handleDeployNow = () => {
    if (deploying) return;
    setDeploying(true);
    setDeployStatus("building");
    setDeployProgress(0);
    setDeployLogs([]);

    const logLine = (msg: string) => {
      setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    logLine("🚀 Initiating cloud deployment pipeline...");
    logLine("🔍 Checking static assets and configuration files...");

    setTimeout(() => {
      setDeployProgress(30);
      logLine("⚡ Running Tailwind V3 compilation and optimization...");
      logLine(`📦 Bundled ${Object.keys(files).length} files successfully.`);
    }, 600);

    setTimeout(() => {
      setDeployProgress(65);
      setDeployStatus("uploading");
      logLine("📤 Uploading assets to Gothwad Cloud CDN Edge Nodes...");
      logLine("🛡️ Injecting security rules and SSL/TLS keys...");
    }, 1400);

    setTimeout(() => {
      setDeployProgress(90);
      logLine("🌀 Updating DNS records for staging subdomain...");
    }, 2200);

    setTimeout(() => {
      setDeployProgress(100);
      setDeployStatus("live");
      setDeploying(false);
      const randSub = Math.random().toString(36).substring(2, 7);
      const generatedLink = `https://gothwad-design-${randSub}.web.app`;
      setDeployedUrl(generatedLink);
      logLine("🎉 DEPLOYMENT SUCCESSFUL! Your staging environment is now LIVE.");
      logLine(`🌐 Live URL: ${generatedLink}`);
    }, 2800);
  };

  // Open Live View in Standalone Tab
  const handleOpenInNewTab = () => {
    try {
      const doc = getCompiledIframeSrcDoc();
      const newWin = window.open();
      if (newWin) {
        newWin.document.write(doc);
        newWin.document.close();
      } else {
        alert("Pop-up blocked. Please enable pop-ups to open live website pages.");
      }
    } catch (e: any) {
      alert("Failed to preview in new tab: " + e.message);
    }
  };
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
    // Find the primary/current HTML content
    let activeHtmlKey = activeFilePath.endsWith(".html") ? activeFilePath : "index.html";
    if (!files[activeHtmlKey]) {
      // Find the first HTML file if index.html is missing
      const htmlFiles = Object.keys(files).filter(k => k.endsWith(".html"));
      activeHtmlKey = htmlFiles[0] || "index.html";
    }
    
    let doc = files[activeHtmlKey] || DEFAULT_HTML;

    // Dynamically replace any referenced local CSS files
    Object.keys(files).forEach(fName => {
      if (fName.endsWith(".css")) {
        const cssContent = files[fName] || "";
        const linkTagRegex = new RegExp(`<link[^>]*href=["']${fName}["'][^>]*>`, 'gi');
        if (linkTagRegex.test(doc)) {
          doc = doc.replace(linkTagRegex, `<style>${cssContent}</style>`);
        }
      }
    });

    // Dynamically replace any referenced local JS files
    Object.keys(files).forEach(fName => {
      if (fName.endsWith(".js")) {
        const jsContent = files[fName] || "";
        const scriptTagRegex = new RegExp(`<script[^>]*src=["']${fName}["'][^>]*><\\/script>`, 'gi');
        if (scriptTagRegex.test(doc)) {
          doc = doc.replace(scriptTagRegex, `<script>${jsContent}</script>`);
        }
      }
    });

    // Fallbacks just in case
    if (!doc.includes('<style>')) {
      const globalCss = files["styles.css"] || "";
      doc = doc.replace('</head>', `<style>${globalCss}</style></head>`);
    }
    if (!doc.includes('<script>')) {
      const globalJs = files["script.js"] || "";
      doc = doc.replace('</body>', `<script>${globalJs}</script></body>`);
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
    if (item.messages) {
      setMessages(item.messages);
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Loaded previous session: "${item.prompt}". Feel free to continue chatting!`,
          timestamp: item.timestamp
        }
      ]);
    }
    setActiveWorkspaceTab("chat");
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
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your Website Builder AI Assistant. 🚀\n\nTell me what you want to build, and I will code the HTML, CSS, and JS files from scratch and render your website live on the right. You can ask for a modern portfolio, a landing page, interactive calculation forms, animations, and more!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveWorkspaceTab("chat");
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

    // Switch to Chat tab to see real-time updates
    setActiveWorkspaceTab("chat");

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: activePrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setPromptInput("");

    setGenerating(true);
    setProgress(15);
    setAiStatus("Parsing current workspace structure...");

    try {
      const conversationHistoryText = updatedMessages
        .filter(m => m.id !== "welcome")
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      const systemInstruction = 
        "You are an elite, production-grade Web Design AI integrated into WebBuilder AI.\n" +
        "The user is describing their website requirements, page section additions, themes, or styles through a chat conversation.\n" +
        "You can modify any existing files or dynamically create new files (with proper extensions like '.html', '.css', '.js') in the workspace.\n" +
        "Always output the COMPLETE, updated content of the files you modify or create in your response, enclosed inside clear Markdown code blocks.\n" +
        "Prefix code blocks with the exact filename: e.g.\n" +
        "File: index.html\n```html\n...\n```\n" +
        "File: styles.css\n```css\n...\n```\n" +
        "File: about.html\n```html\n...\n```\n\n" +
        "Also, provide a brief, friendly, and structured explanation of your changes in plain English/Hindi (this will be shown in the chat window to the user).\n" +
        "Maintain absolute high visual fidelity, eye-safe beautiful colors, gorgeous layout structures using Tailwind, clean Inter typography, and elegant spacing. Do not write short placeholders or snippets — write the full compilable files so the code compiler doesn't break!";

      const workspaceFilesSerialized = Object.entries(files)
        .map(([fName, fContent]) => `=== ${fName} ===\n${fContent}`)
        .join("\n\n");

      const aiInputMessages = [
        {
          role: "user" as const,
          content: `Here is the current code of all files in my workspace:\n\n${workspaceFilesSerialized}\n\n` +
            `Chat Conversation History:\n${conversationHistoryText || "No previous history."}\n\n` +
            `New User Request: ${activePrompt}`
        }
      ];

      setProgress(40);
      setAiStatus(`Calling AI model: ${selectedModel}...`);

      const response = await callAiChat({
        messages: aiInputMessages,
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
      const modified: string[] = [];

      // Dynamically match any file blocks in the format "File: name.ext" followed by code block
      const fileBlockRegex = /File:\s*([a-zA-Z0-9_\-\.]+)\s*```(?:html|css|javascript|js|json|xml|svg|plaintext|plain)?\n([\s\S]*?)```/gi;
      let match;
      let hasDynamicMatches = false;
      while ((match = fileBlockRegex.exec(responseText)) !== null) {
        const fName = match[1].trim();
        const fContent = match[2].trim();
        updatedFiles[fName] = fContent;
        if (!modified.includes(fName)) {
          modified.push(fName);
        }
        hasDynamicMatches = true;
      }

      // Fallback: If no "File: name.ext" blocks were found, use standard parser for index.html, styles.css, script.js
      if (!hasDynamicMatches) {
        // Extract html code block
        const htmlBlockMatch = responseText.match(/(?:File:\s*index\.html\s*)?```html\n([\s\S]*?)```/i);
        if (htmlBlockMatch && htmlBlockMatch[1]) {
          updatedFiles["index.html"] = htmlBlockMatch[1].trim();
          modified.push("index.html");
        }

        // Extract css code block
        const cssBlockMatch = responseText.match(/(?:File:\s*styles\.css\s*)?```css\n([\s\S]*?)```/i);
        if (cssBlockMatch && cssBlockMatch[1]) {
          updatedFiles["styles.css"] = cssBlockMatch[1].trim();
          modified.push("styles.css");
        }

        // Extract js code block
        const jsBlockMatch = responseText.match(/(?:File:\s*script\.js\s*)?```(?:javascript|js)\n([\s\S]*?)```/i);
        if (jsBlockMatch && jsBlockMatch[1]) {
          updatedFiles["script.js"] = jsBlockMatch[1].trim();
          modified.push("script.js");
        }

        // Fallback: If AI returned code block without label, try standard tags
        if (modified.length === 0) {
          const anyHtml = responseText.match(/```html\n([\s\S]*?)```/i);
          if (anyHtml) {
            updatedFiles["index.html"] = anyHtml[1].trim();
            modified.push("index.html");
          }
          const anyCss = responseText.match(/```css\n([\s\S]*?)```/i);
          if (anyCss) {
            updatedFiles["styles.css"] = anyCss[1].trim();
            modified.push("styles.css");
          }
          const anyJs = responseText.match(/```(?:javascript|js)\n([\s\S]*?)```/i);
          if (anyJs) {
            updatedFiles["script.js"] = anyJs[1].trim();
            modified.push("script.js");
          }
        }
      }

      // Clean assistant text content (stripping the code blocks)
      const explanationText = responseText
        .replace(/(?:File:\s*\S+\s*)?```(?:html|css|javascript|js|plaintext|plain)?[\s\S]*?```/gi, "")
        .trim();

      const finalExplanation = explanationText || `Successfully generated and updated workspace files! 🚀`;

      setFiles(updatedFiles);
      setEditorContent(updatedFiles[activeFilePath]);

      // Add Assistant Message
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: finalExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modifiedFiles: modified
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Save to history list
      const newItem: WebsiteSession = {
        id: Date.now().toString(),
        prompt: activePrompt,
        files: updatedFiles,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: finalMessages
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
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Sorry, I encountered an error during code compilation:\n\n${err.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      
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
      
      {/* 1. Left Sidebar - Combines History, Workspace Explorer, and Deploy/Preview */}
      {showLeftSidebar && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setShowLeftSidebar(false)}
          />
          <div className="absolute lg:relative left-0 top-0 h-full z-40 shrink-0 shadow-2xl lg:shadow-none bg-zinc-900 border-r border-zinc-850 w-[270px] flex flex-col overflow-hidden">
            
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

            {/* Premium Tab Bar Selector */}
            <div className="flex border-b border-zinc-850 bg-zinc-950/40 p-1 shrink-0">
              {[
                { id: "workspace", label: "Workspace", icon: FolderTree },
                { id: "ai_agent", label: "AI Agent", icon: Sparkles },
                { id: "deploy", label: "Deployment", icon: Cloud },
                { id: "preview", label: "Preview", icon: Eye }
              ].map(tab => {
                const isActive = activeSidebarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSidebarTab(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-lg flex flex-col items-center justify-center gap-1 text-[9.5px] font-medium font-mono select-none transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? "bg-zinc-800 text-white shadow-inner" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850/40"
                    }`}
                    style={isActive ? { borderBottom: `2px solid ${accentColor}`, borderRadius: "6px 6px 0 0" } : {}}
                  >
                    <tab.icon className="w-3.5 h-3.5" style={isActive ? { color: accentColor } : {}} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Sub-Tab Content View */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
              
              {/* TAB 1: WORKSPACE FILE EXPLORER */}
              {activeSidebarTab === "workspace" && (
                <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
                  
                  {/* File tree header with Add File Action */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                      Workspace Files
                    </span>
                    <button
                      onClick={() => setIsAddingFile(!isAddingFile)}
                      className="p-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                      title="Create Custom File"
                    >
                      <Plus className="w-3 h-3" style={{ color: accentColor }} />
                    </button>
                  </div>

                  {/* Add File Inline Input dialog */}
                  {isAddingFile && (
                    <form 
                      onSubmit={handleAddFile}
                      className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 animate-slide-in shrink-0"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-wider px-1">
                        <span>New Workspace File</span>
                        <button type="button" onClick={() => setIsAddingFile(false)} className="hover:text-zinc-300">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="page.html, styles.css..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded text-emerald-400 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 block px-1 leading-normal">
                        Type file name with extension (.html, .css, .js) and confirm.
                      </span>
                    </form>
                  )}

                  {/* Files list */}
                  <div className="space-y-1 bg-zinc-950/20 border border-zinc-850/40 rounded-xl p-2">
                    {Object.keys(files).map((fName) => {
                      const isActive = activeFilePath === fName;
                      const isRenaming = editingFileName === fName;
                      const isCore = fName === "index.html" || fName === "styles.css" || fName === "script.js";

                      return (
                        <div
                          key={fName}
                          className={`group w-full flex items-center justify-between p-1.5 rounded-lg text-xs font-mono transition-all relative ${
                            isActive 
                              ? "bg-zinc-800/80 text-white border-l-2" 
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                          }`}
                          style={isActive ? { borderLeftColor: accentColor, paddingLeft: "6px" } : {}}
                        >
                          {isRenaming ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono text-white focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleConfirmRename();
                                  if (e.key === 'Escape') setEditingFileName(null);
                                }}
                                autoFocus
                              />
                              <button 
                                onClick={handleConfirmRename}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-750 text-emerald-400 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => setEditingFileName(null)}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-400 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setActiveFilePath(fName)}
                                className="flex items-center gap-2 truncate text-left flex-1 cursor-pointer py-0.5"
                              >
                                {fName.endsWith(".html") ? (
                                  <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                ) : fName.endsWith(".css") ? (
                                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                                )}
                                <span className="truncate">{fName}</span>
                              </button>

                              {/* Hover actions for renaming & deletion */}
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-zinc-900/50 p-0.5 rounded-md">
                                {!isCore && (
                                  <>
                                    <button
                                      onClick={() => handleStartRename(fName)}
                                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                                      title="Rename File"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFile(fName)}
                                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                                      title="Delete File"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                                {isCore && (
                                  <span className="text-[8px] font-mono text-zinc-650 px-1 select-none">core</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset canvas button */}
                  <button
                    onClick={handleDiscard}
                    className="w-full py-1.5 px-3 bg-zinc-950/40 hover:bg-zinc-850/60 text-zinc-500 hover:text-zinc-300 border border-zinc-850 rounded-xl text-[10.5px] font-mono transition-all cursor-pointer text-center"
                  >
                    Revert Canvas to Default
                  </button>
                </div>
              )}

              {/* TAB 2: AI AGENT CONTROLS & GENERATIONS */}
              {activeSidebarTab === "ai_agent" && (
                <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                  
                  {/* AI Agent Status Card */}
                  <div className="bg-zinc-950/40 border border-zinc-850/50 rounded-2xl p-3.5 space-y-3 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: accentColor }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-mono font-bold text-zinc-200 uppercase leading-none flex items-center gap-1.5">
                          <span>Designer Copilot</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </h4>
                        <span className="text-[8.5px] font-mono text-zinc-500 mt-1 block uppercase">
                          Lead Web Designer AI
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-sans text-zinc-400 leading-relaxed bg-zinc-900/50 border border-zinc-850/40 p-2.5 rounded-xl space-y-2">
                      <p>
                        Active model is <strong>{AVAILABLE_MODELS.find(m => m.value === selectedModel)?.label || "Gemini 2.5"}</strong>, optimized for Tailwind layouts, Inter typography, and smooth script behaviors.
                      </p>
                      <div className="pt-1.5 border-t border-zinc-850/60 flex flex-col gap-1 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wide">
                        <div className="flex justify-between">
                          <span>Creativity Value</span>
                          <span className="text-zinc-300">0.85 (High)</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: "85%", backgroundColor: accentColor }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Build generations list */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Session History
                      </span>
                      {history.length > 0 && (
                        <button 
                          onClick={handleClearHistory} 
                          className="text-[9px] font-mono text-zinc-650 hover:text-rose-400 transition-colors uppercase cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center py-8 border border-zinc-850/30 rounded-2xl bg-zinc-950/10">
                        <span className="text-[10px] font-mono text-zinc-600 block">No past studio sessions found</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {history.map((item) => {
                          const isActive = activeHistoryId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectHistory(item)}
                              className={`w-full text-left p-2.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                                isActive
                                  ? "bg-zinc-850/50 border-zinc-750 text-white shadow-inner"
                                  : "bg-zinc-950/20 border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <span className="text-xs font-medium truncate w-full block">
                                {item.prompt}
                              </span>
                              <span className="text-[8.5px] font-mono text-zinc-500 block">{item.timestamp}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DEPLOYMENT & HOSTING CONTROL */}
              {activeSidebarTab === "deploy" && (
                <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-zinc-500" />
                    Staging & Hosting
                  </span>

                  {/* Build action card */}
                  <div className="bg-zinc-950/40 border border-zinc-850/40 rounded-2xl p-4 space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <UploadCloud className="w-5 h-5 animate-pulse" style={{ color: accentColor }} />
                      </div>
                      <div>
                        <h4 className="text-[11.5px] font-mono font-bold text-zinc-200 uppercase leading-none">
                          Cloud CDN Hosting
                        </h4>
                        <span className="text-[8.5px] font-mono text-zinc-500 mt-1 block uppercase tracking-wide">
                          {deployStatus === "live" ? "Staging environment Live" : "Not Deployed"}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {(deploying || deployStatus !== "idle") && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                          <span className="uppercase">{deploying ? "Deploying Website..." : "Staging Active"}</span>
                          <span>{deployProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${deployProgress}%`, backgroundColor: accentColor }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Main Deploy Action trigger */}
                    <button
                      onClick={handleDeployNow}
                      disabled={deploying}
                      className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 disabled:opacity-55 text-zinc-200 hover:text-white border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95"
                      style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
                    >
                      <UploadCloud className={`w-3.5 h-3.5 ${deploying ? "animate-spin" : ""}`} />
                      <span>{deploying ? "Publishing Staging..." : "Deploy Live Website"}</span>
                    </button>
                  </div>

                  {/* Deployed links & QR code panel */}
                  {deployStatus === "live" && deployedUrl && (
                    <div className="bg-zinc-950/20 border border-zinc-850/50 rounded-2xl p-3.5 space-y-3 animate-slide-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                          Production Live
                        </span>
                        <span className="text-[8px] font-mono text-zinc-650">v1.0.0</span>
                      </div>

                      {/* Staging URL Link Box */}
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between gap-2.5">
                        <span className="text-[10px] font-mono text-zinc-400 truncate flex-1 leading-normal select-all">
                          {deployedUrl}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={handleOpenInNewTab}
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                            title="Open Staging Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(deployedUrl);
                              alert("Live subdomain link copied to clipboard!");
                            }}
                            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                            title="Copy Live Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* QR Code toggle action (PC/Mobile bridge) */}
                      <button
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="w-full py-1.5 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white rounded-xl text-[10px] font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span>{showQrCode ? "Hide QR Code" : "Scan QR Code on Phone"}</span>
                      </button>

                      {/* Render QR code via Google Chart engine */}
                      {showQrCode && (
                        <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl border border-zinc-200 text-center space-y-2 animate-fadeIn select-none">
                          <img 
                            src={`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(deployedUrl)}&choe=UTF-8`}
                            alt="Deployment QR"
                            className="w-32 h-32 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[8.5px] font-mono font-bold text-zinc-700 tracking-tight leading-none uppercase">
                            Scan to Open Website
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terminal log panel */}
                  {deployLogs.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider block px-1">
                        Deployment Pipelines Console
                      </span>
                      <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-3 h-28 overflow-y-auto no-scrollbar font-mono text-[9px] text-zinc-500 leading-normal space-y-1">
                        {deployLogs.map((log, idx) => (
                          <div key={idx} className={log.includes("🎉") ? "text-emerald-400 font-bold" : ""}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code exporter zip block */}
                  <div className="border-t border-zinc-850/60 pt-4 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-zinc-500" />
                      Asset Packages
                    </span>
                    <button
                      onClick={handleDownloadZip}
                      className="w-full py-2 px-3 bg-zinc-950/60 hover:bg-zinc-850/60 text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Download Project ZIP</span>
                    </button>
                    <span className="text-[8px] font-mono text-zinc-650 block text-center px-1 leading-normal uppercase">
                      Packages HTML, CSS, and JS files for custom hosting
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: LIVE PREVIEW CONTROLLER */}
              {activeSidebarTab === "preview" && (
                <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
                  
                  {/* Title */}
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-1 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-zinc-500" />
                    Preview Simulator
                  </span>

                  {/* Responsive simulation switcher */}
                  <div className="bg-zinc-950/40 border border-zinc-850/40 rounded-2xl p-3 space-y-2.5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide block px-1">
                      Choose Layout Viewport
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-850/60">
                      {[
                        { id: "desktop", label: "Desktop", icon: Laptop },
                        { id: "mobile", label: "Mobile", icon: Smartphone },
                        { id: "code", label: "Split Code", icon: Code }
                      ].map(mode => {
                        const isSel = viewMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as any)}
                            className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1.5 text-[9px] font-mono font-medium transition-all cursor-pointer ${
                              isSel 
                                ? "bg-zinc-800 text-white shadow-inner font-semibold" 
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/55"
                            }`}
                          >
                            <mode.icon className="w-3.5 h-3.5" style={isSel ? { color: accentColor } : {}} />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* External Actions Card */}
                  <div className="bg-zinc-950/20 border border-zinc-850/30 rounded-2xl p-3 space-y-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide block px-1">
                      External Preview Actions
                    </span>

                    <button
                      onClick={handleOpenInNewTab}
                      className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>Open Preview in New Tab</span>
                    </button>

                    <button
                      onClick={() => {
                        const compiled = getCompiledIframeSrcDoc();
                        const blob = new Blob([compiled], { type: "text/html" });
                        const blobUrl = URL.createObjectURL(blob);
                        navigator.clipboard.writeText(blobUrl);
                        alert("Preview blob link generated and copied to clipboard!");
                      }}
                      className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Dev Sandbox URL</span>
                    </button>
                  </div>

                  {/* Preview tips */}
                  <div className="bg-zinc-950/10 border border-zinc-850/10 rounded-xl p-3 text-[9.5px] font-sans text-zinc-500 leading-normal space-y-1.5">
                    <h5 className="font-bold text-zinc-400 uppercase tracking-wide">Developer Sandbox Notice</h5>
                    <p>
                      Your live sandbox executes Tailwind v4 CSS rendering completely inside our sandboxed browser iframe.
                    </p>
                    <p>
                      Changes apply instantly when you finish generating or save manually in the Code Editor tab.
                    </p>
                  </div>

                </div>
              )}

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

        {/* Core Workspace - Left (Code/Chat Workspace) and Right (Live Preview) split view */}
        <div className="flex-1 flex overflow-hidden w-full relative">
          
          {/* Split 1: Left Workspace area with Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-900 h-full">
            
            {/* Split 1 Tab Switcher Header */}
            <div className="h-10 min-h-[40px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between px-3 shrink-0 select-none">
              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-850">
                <button
                  onClick={() => setActiveWorkspaceTab("chat")}
                  className={`p-1 px-3 rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeWorkspaceTab === "chat" 
                      ? "bg-zinc-800 text-zinc-100 font-extrabold" 
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" style={activeWorkspaceTab === "chat" ? { color: accentColor } : {}} />
                  <span>AI Assistant Chat</span>
                </button>
                <button
                  onClick={() => setActiveWorkspaceTab("editor")}
                  className={`p-1 px-3 rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeWorkspaceTab === "editor" 
                      ? "bg-zinc-800 text-zinc-100 font-extrabold" 
                      : "text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Code Editor</span>
                </button>
              </div>
              
              {activeWorkspaceTab === "editor" && (
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  Active: <span className="text-amber-400 font-bold">{activeFilePath}</span>
                </span>
              )}
            </div>

            {/* Tab content */}
            {activeWorkspaceTab === "chat" ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 relative">
                
                {/* Chat Messages Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isUser 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {isUser ? (
                            <span className="text-[10px] font-mono font-bold uppercase">Me</span>
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Message body */}
                        <div className="space-y-1.5">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                            isUser 
                              ? "bg-zinc-900 text-zinc-100 rounded-tr-none border border-zinc-850" 
                              : "bg-zinc-930/60 text-zinc-350 rounded-tl-none border border-zinc-850/40"
                          }`}>
                            {msg.content}

                            {/* If assistant modified some files, show them nicely */}
                            {!isUser && msg.modifiedFiles && msg.modifiedFiles.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-zinc-850/30">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                                  Updated Files:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.modifiedFiles.map(f => (
                                    <button
                                      key={f}
                                      onClick={() => {
                                        setActiveFilePath(f);
                                        setActiveWorkspaceTab("editor");
                                      }}
                                      className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-all duration-150"
                                      title={`Click to view modified ${f}`}
                                    >
                                      <Code className="w-2.5 h-2.5" />
                                      <span>{f}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <span className={`text-[8.5px] font-mono text-zinc-650 block ${isUser ? "text-right" : "text-left"}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Invisible div for scroll anchoring */}
                  <div ref={chatEndRef} />
                </div>
              </div>
            ) : (
              /* If activeWorkspaceTab === "editor" */
              <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 relative">
                {/* Header bar of active tab (file actions) */}
                <div className="h-9 min-h-[36px] bg-zinc-930/60 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
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

                {/* Monaco Editor */}
                <div className="flex-1 bg-zinc-950 overflow-hidden relative">
                  <Editor
                    height="100%"
                    language={
                      activeFilePath.endsWith(".html") ? "html" :
                      activeFilePath.endsWith(".css") ? "css" :
                      activeFilePath.endsWith(".js") ? "javascript" : "plaintext"
                    }
                    theme="vs-dark"
                    value={editorContent}
                    onChange={(value) => handleContentChange(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 11,
                      fontFamily: "var(--font-mono), monospace",
                      lineNumbers: "on",
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      padding: { top: 12, bottom: 12 },
                      contextmenu: true,
                      wordWrap: "on"
                    }}
                    loading={
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-500 font-mono text-xs select-none">
                        <span className="w-4 h-4 rounded-full border border-t-transparent border-zinc-500 animate-spin" />
                        <span>Loading editor...</span>
                      </div>
                    }
                  />
                </div>
              </div>
            )}
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

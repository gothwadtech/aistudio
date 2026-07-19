import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Code, 
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
  Terminal,
  Play,
  Pause,
  Database,
  ArrowRight,
  Server
} from "lucide-react";
import GlobalStudioHeader from "../../../components/GlobalStudioHeader";
import ChatInputBar from "../../../components/ChatInputBar";
import { callAiChat } from "../../../utils/aiClient";
import { safeStorage } from "../../../utils/safeStorage";
import Editor from "@monaco-editor/react";

interface WebAppSession {
  id: string;
  prompt: string;
  files: { [path: string]: string };
  timestamp: string;
}

const DEFAULT_SERVER_JS = `// Elite Express Backend Server Simulator
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// Load virtual database.json context
const db = require("./database.json");

// Logger middleware
app.use((req, res, next) => {
  console.log(\`[\${new Date().toLocaleTimeString()}] \${req.method} \${req.url}\`);
  next();
});

// GET endpoints
app.get("/api/items", (req, res) => {
  res.json({
    success: true,
    count: db.items.length,
    data: db.items
  });
});

// POST endpoints
app.post("/api/items", (req, res) => {
  const newItem = {
    id: db.items.length + 1,
    name: req.body.name || "Default Item",
    category: req.body.category || "General",
    timestamp: new Date().toISOString()
  };
  db.items.push(newItem);
  res.status(201).json({
    success: true,
    message: "Item appended successfully",
    data: newItem
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Express microservice booted on container port \${PORT}\`);
  console.log(\`📡 Active endpoints mapped: [GET /api/items], [POST /api/items]\`);
});`;

const DEFAULT_DATABASE_JSON = `{
  "items": [
    { "id": 1, "name": "DeepMind Gemini Research", "category": "AI", "timestamp": "2026-07-16T12:00:00.000Z" },
    { "id": 2, "name": "Vite React Client", "category": "Web Dev", "timestamp": "2026-07-16T12:05:00.000Z" }
  ]
}`;

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-300 font-sans p-6">
  <div class="max-w-xl mx-auto space-y-4">
    <h1 class="text-xl font-bold text-indigo-400">API Client Frontend</h1>
    <p class="text-xs text-zinc-500">Interact with local endpoints defined in your server.js pipeline.</p>
  </div>
</body>
</html>`;

const AVAILABLE_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Default fast multimodal reasoning" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Slower, complex system planner" },
  { value: "deepseek/deepseek-chat", label: "DeepSeek V3", desc: "High performance programming model" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1", desc: "Deep reasoning full-chain agent" }
];

export default function WebAppStudio({ accentColor, isMobile, onToggleSidebar, onBackToMain }: WebAppStudioProps) {
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

  // Server state
  const [runningServer, setRunningServer] = useState(false);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [selectedEndpointResult, setSelectedEndpointResult] = useState<string>("");

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState("");
  const [copied, setCopied] = useState(false);

  // Virtual Filesystem State
  const [files, setFiles] = useState<{ [path: string]: string }>({
    "server.js": DEFAULT_SERVER_JS,
    "database.json": DEFAULT_DATABASE_JSON,
    "index.html": DEFAULT_INDEX_HTML
  });
  const [activeFilePath, setActiveFilePath] = useState<string>("server.js");
  const [editorContent, setEditorContent] = useState<string>(DEFAULT_SERVER_JS);

  // Sync editor on active file change
  useEffect(() => {
    setEditorContent(files[activeFilePath] || "");
  }, [activeFilePath]);

  // Update virtual file when user edits code manually
  const handleContentChange = (newVal: string) => {
    setEditorContent(newVal);
    setFiles(prev => ({ ...prev, [activeFilePath]: newVal }));
  };

  // Extract endpoint routes from server.js dynamically
  const getMappedEndpoints = () => {
    const code = files["server.js"] || "";
    const endpoints: Array<{ method: string; path: string }> = [];

    const getRegex = /app\.get\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const postRegex = /app\.post\s*\(\s*['"`]([^'"`]+)['"`]/g;

    let match;
    while ((match = getRegex.exec(code)) !== null) {
      endpoints.push({ method: "GET", path: match[1] });
    }
    while ((match = postRegex.exec(code)) !== null) {
      endpoints.push({ method: "POST", path: match[1] });
    }

    if (endpoints.length === 0) {
      endpoints.push({ method: "GET", path: "/api/items" });
      endpoints.push({ method: "POST", path: "/api/items" });
    }

    return endpoints;
  };

  // Start / Stop server container simulation
  const toggleServer = () => {
    if (runningServer) {
      setRunningServer(false);
      setServerLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🛑 Container server stopped successfully.`]);
    } else {
      setRunningServer(true);
      setServerLogs([
        `[${new Date().toLocaleTimeString()}] ⚙️ Loading modules from virtual context...`,
        `[${new Date().toLocaleTimeString()}] 🚀 Express microservice booted on container port 3000`,
        `[${new Date().toLocaleTimeString()}] 📡 Active database synced successfully: database.json loaded.`,
        `[${new Date().toLocaleTimeString()}] 📡 Ready for incoming API client test requests.`
      ]);
    }
  };

  // Test executing an endpoint in the sandbox terminal
  const executeEndpointTest = (method: string, path: string) => {
    if (!runningServer) return;

    setServerLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 📥 Received incoming client request: ${method} ${path}`
    ]);

    try {
      const dbParsed = JSON.parse(files["database.json"] || "{}");
      if (path === "/api/items" || path.includes("items")) {
        if (method === "GET") {
          const result = { success: true, count: dbParsed.items?.length || 0, data: dbParsed.items || [] };
          setSelectedEndpointResult(JSON.stringify(result, null, 2));
          setServerLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 📤 Sent response 200 OK: ${dbParsed.items?.length || 0} items returned`
          ]);
        } else {
          // POST Mock
          const newItem = {
            id: (dbParsed.items?.length || 0) + 1,
            name: "AI Test Item #" + ((dbParsed.items?.length || 0) + 1),
            category: "Dynamic",
            timestamp: new Date().toISOString()
          };
          if (!dbParsed.items) dbParsed.items = [];
          dbParsed.items.push(newItem);

          // Write back
          const updatedDb = JSON.stringify(dbParsed, null, 2);
          setFiles(prev => ({ ...prev, "database.json": updatedDb }));
          if (activeFilePath === "database.json") {
            setEditorContent(updatedDb);
          }

          const result = { success: true, message: "Item appended successfully", data: newItem };
          setSelectedEndpointResult(JSON.stringify(result, null, 2));
          setServerLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] 📤 Sent response 201 Created: item id #${newItem.id} appended to database.json`
          ]);
        }
      } else {
        // Dynamic fallback endpoint
        const result = { success: true, message: `Handled dynamic ${method} request successfully on ${path}` };
        setSelectedEndpointResult(JSON.stringify(result, null, 2));
        setServerLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📤 Sent response 200 OK: generic mapping`
        ]);
      }
    } catch (e: any) {
      setSelectedEndpointResult(JSON.stringify({ error: true, message: e.message }, null, 2));
      setServerLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Express internal execution exception: ${e.message}`
      ]);
    }
  };

  // History State
  const [history, setHistory] = useState<WebAppSession[]>(() => {
    try {
      const saved = localStorage.getItem("gothwad_history_webapp_v2");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const handleSelectHistory = (item: WebAppSession) => {
    setActiveHistoryId(item.id);
    setFiles(item.files);
    setActiveFilePath("server.js");
    setEditorContent(item.files["server.js"]);
    setRunningServer(false);
    setServerLogs([]);
    setSelectedEndpointResult("");
  };

  const handleNewSession = () => {
    setActiveHistoryId(null);
    setFiles({
      "server.js": DEFAULT_SERVER_JS,
      "database.json": DEFAULT_DATABASE_JSON,
      "index.html": DEFAULT_INDEX_HTML
    });
    setActiveFilePath("server.js");
    setEditorContent(DEFAULT_SERVER_JS);
    setRunningServer(false);
    setServerLogs([]);
    setSelectedEndpointResult("");
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gothwad_history_webapp_v2");
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
    setAiStatus("Analyzing backend schema files...");

    try {
      const systemInstruction = 
        "You are an elite, production-grade Backend Engineer AI integrated into WebAppBuilder AI.\n" +
        "The user will describe their requested routes, databases schemas, or JSON endpoints.\n" +
        "You have three files in the workspace: 'server.js', 'database.json', and 'index.html'.\n" +
        "Always output the COMPLETE, updated content of the files you modify in your response, enclosed inside clear Markdown code blocks.\n" +
        "Prefix code blocks with the exact filename: e.g.\n" +
        "File: server.js\n```javascript\n...\n```\n" +
        "File: database.json\n```json\n...\n```\n" +
        "File: index.html\n```html\n...\n```\n\n" +
        "Ensure realistic Express middleware, robust validation logic, accurate mock schemas in database.json, and thorough log outputs. Do not write short snippets — write the full compilable file contents so the server runs flawlessly!";

      const messages = [
        {
          role: "user" as const,
          content: `Here is the current code of my backend files:\n\n` +
            `=== server.js ===\n${files["server.js"]}\n\n` +
            `=== database.json ===\n${files["database.json"]}\n\n` +
            `=== index.html ===\n${files["index.html"]}\n\n` +
            `My modification request: ${activePrompt}`
        }
      ];

      setProgress(40);
      setAiStatus(`Calling AI model: ${selectedModel}...`);

      const response = await callAiChat({
        messages,
        selectedModel,
        selectedAgent: "planner",
        systemInstructionOverride: systemInstruction,
        temperature: 0.15,
        maxTokens: 4096
      });

      setProgress(75);
      setAiStatus("Integrating updated router endpoints...");

      const responseText = response.text || "";
      const updatedFiles = { ...files };
      let anyUpdated = false;

      // Extract server code block
      const serverBlockMatch = responseText.match(/(?:File:\s*server\.js\s*)?```(?:javascript|js)\n([\s\S]*?)```/i);
      if (serverBlockMatch && serverBlockMatch[1]) {
        updatedFiles["server.js"] = serverBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Extract database JSON block
      const dbBlockMatch = responseText.match(/(?:File:\s*database\.json\s*)?```(?:json)\n([\s\S]*?)```/i);
      if (dbBlockMatch && dbBlockMatch[1]) {
        updatedFiles["database.json"] = dbBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Extract html block if any
      const htmlBlockMatch = responseText.match(/(?:File:\s*index\.html\s*)?```html\n([\s\S]*?)```/i);
      if (htmlBlockMatch && htmlBlockMatch[1]) {
        updatedFiles["index.html"] = htmlBlockMatch[1].trim();
        anyUpdated = true;
      }

      // Fallback parser
      if (!anyUpdated) {
        const anyJs = responseText.match(/```(?:javascript|js)\n([\s\S]*?)```/i);
        if (anyJs) updatedFiles["server.js"] = anyJs[1].trim();
        const anyJson = responseText.match(/```json\n([\s\S]*?)```/i);
        if (anyJson) updatedFiles["database.json"] = anyJson[1].trim();
      }

      setFiles(updatedFiles);
      setEditorContent(updatedFiles[activeFilePath]);

      // Auto start server with fresh logs
      setRunningServer(true);
      setServerLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Express microservice re-booted with fresh endpoints!`,
        `[${new Date().toLocaleTimeString()}] 📡 Database.json linked & parsed.`,
        `[${new Date().toLocaleTimeString()}] ⚙️ Workspace loaded with updated backend routes.`
      ]);

      // Save to history list
      const newItem: WebAppSession = {
        id: Date.now().toString(),
        prompt: activePrompt,
        files: updatedFiles,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const nextHistory = [newItem, ...history];
      setHistory(nextHistory);
      try {
        localStorage.setItem("gothwad_history_webapp_v2", JSON.stringify(nextHistory));
      } catch (e) {}
      setActiveHistoryId(newItem.id);

      setProgress(100);
      setAiStatus("Backend API successfully compiled!");
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 800);

    } catch (err: any) {
      console.error(err);
      alert(`AI backend compile failed: ${err.message || err}`);
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
    if (confirm("Are you sure you want to revert to default Express API files?")) {
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
                  Web App Builder AI
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
                <span>New Express Session</span>
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
                          {fName.endsWith(".js") ? (
                            <FileCode className="w-3.5 h-3.5 text-yellow-500" />
                          ) : fName.endsWith(".json") ? (
                            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-orange-400" />
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
                    <span className="text-[9.5px] font-mono text-zinc-650 block">No API builds yet</span>
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
          title="Web App Builder AI"
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
                          selectedModel === m.value ? "text-indigo-400 bg-indigo-400/5 font-bold" : "text-zinc-400"
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
          <div className="bg-indigo-950/20 border-b border-indigo-900/30 px-5 py-2 flex items-center justify-between text-indigo-400 text-xs font-mono z-20 select-none animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-t border-r border-indigo-400" />
              <span className="font-semibold">{aiStatus}</span>
            </div>
            <span className="font-bold">{progress}% synced</span>
          </div>
        )}

        {/* Core Workspace - Left (Code Editor) and Right (Live Terminal) split view */}
        <div className="flex-1 flex overflow-hidden w-full relative">
          
          {/* Split 1: Code Editor area */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-900 h-full">
            {/* Header bar of active tab */}
            <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
              <span className="text-[10.5px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
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
            <div className="flex-1 bg-zinc-950 overflow-hidden relative">
              <Editor
                height="100%"
                language={
                  activeFilePath.endsWith(".html") ? "html" :
                  activeFilePath.endsWith(".css") ? "css" :
                  activeFilePath.endsWith(".json") ? "json" :
                  activeFilePath.endsWith(".ts") || activeFilePath.endsWith(".tsx") ? "typescript" : "javascript"
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

          {/* Split 2: Live Server Console on the Right */}
          <div className="w-[320px] xl:w-[420px] shrink-0 flex flex-col overflow-hidden bg-zinc-930/10 border-l border-zinc-900 h-full">
            
            {/* Header Controls */}
            <div className="h-9 min-h-[36px] bg-zinc-930 border-b border-zinc-900 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleServer}
                  className={`p-1 px-3 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    runningServer 
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25" 
                      : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                  }`}
                >
                  {runningServer ? (
                    <>
                      <Pause className="w-2.5 h-2.5 fill-current" />
                      <span>STOP API CONTAINER</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>START CONTAINER</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">PORT: 3000</span>
            </div>

            {/* Split top: Terminal Logger Output */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden min-h-[220px]">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-zinc-900 shrink-0">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Terminal Output Logs</span>
              </div>
              <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl p-3 font-mono text-[10px] text-zinc-400 overflow-y-auto space-y-1 select-text select-none scrollbar-none">
                {serverLogs.length === 0 ? (
                  <div className="text-center py-10 text-zinc-650 flex flex-col items-center justify-center h-full gap-1 font-mono text-[9px]">
                    <span>TERMINAL IDLE.</span>
                    <span>Start Express container to stream API logs...</span>
                  </div>
                ) : (
                  serverLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                  ))
                )}
              </div>
            </div>

            {/* Split bottom: Interactive API Client Sandbox Router tester */}
            <div className="h-[240px] border-t border-zinc-900 bg-zinc-930/30 p-4 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-zinc-900 shrink-0">
                <Server className="w-3.5 h-3.5 text-yellow-450" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">API Client Tester Ingress</span>
              </div>
              
              <div className="flex-1 flex gap-3 overflow-hidden">
                {/* Available routes */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 select-none">
                  {getMappedEndpoints().map((ep, i) => (
                    <button
                      key={i}
                      disabled={!runningServer}
                      onClick={() => executeEndpointTest(ep.method, ep.path)}
                      className={`w-full text-left p-2 rounded-xl border text-[10px] flex items-center justify-between transition-all select-none ${
                        runningServer 
                          ? "bg-zinc-950/50 border-zinc-850 hover:bg-zinc-900/60 text-zinc-300 cursor-pointer" 
                          : "bg-zinc-900/10 border-zinc-900/30 text-zinc-650 cursor-not-allowed"
                      }`}
                    >
                      <span className={`font-mono font-bold px-1 py-0.5 rounded text-[8.5px] ${ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono truncate ml-1 flex-1">{ep.path}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                    </button>
                  ))}
                </div>

                {/* API JSON response inspector */}
                <div className="w-[180px] xl:w-[220px] bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 font-mono text-[9.5px] text-zinc-400 overflow-y-auto select-text select-none scrollbar-none">
                  <span className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase block border-b border-zinc-900 pb-1 mb-1.5">RESPONSE BODY</span>
                  {selectedEndpointResult ? (
                    <pre className="text-zinc-300 font-mono text-[9px] leading-relaxed select-text">{selectedEndpointResult}</pre>
                  ) : (
                    <span className="text-zinc-650 text-[9px] leading-normal italic block">No response captured. Click any live API route on left to query...</span>
                  )}
                </div>
              </div>

            </div>

          </div>

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

      {/* 4. Right Sidebar - Express configurations panel */}
      {showParametersPanel && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setShowParametersPanel(false)}
          />
          <div className="absolute right-0 top-0 h-full z-40 shrink-0 shadow-2xl lg:shadow-none bg-zinc-900 border-l border-zinc-850 w-[280px] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="h-13 px-4 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Server Specifications
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
                  Sandbox Controls
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
                    <span>Copy Active Code</span>
                  </button>

                  <button 
                    onClick={handleDiscard}
                    className="w-full py-2 px-3 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-950/20 hover:border-rose-900/30 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-350 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset Workspace Code</span>
                  </button>
                </div>
              </div>

              {/* Server configurations specs card */}
              <div className="bg-zinc-950/40 border border-zinc-850/60 rounded-xl p-3 space-y-2.5 text-[10px]">
                <div className="text-zinc-500 font-extrabold uppercase tracking-widest text-[8px] font-mono flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" />
                  CONTAINER SPECIFICATIONS
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans">
                  The API container is loaded with Node.js and Express context. It dynamically parses server.js and database.json pipelines for local testing.
                </p>
                <div className="space-y-1 pt-1 border-t border-zinc-850/50 font-mono text-[9px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>RUNTIME ENGINE:</span>
                    <span className="text-zinc-300">NODEJS V18</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MIDDLEWARE:</span>
                    <span className="text-zinc-300">EXPRESS JSON</span>
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

interface WebAppStudioProps {
  accentColor: string;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToMain?: () => void;
}

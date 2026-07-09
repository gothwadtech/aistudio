import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RefreshCw, X, AlertTriangle, Terminal, Eye,
  Tv, Tablet, Smartphone, ExternalLink, Chrome, FileText, Check, Trash2,
  CloudLightning, Globe, Copy, CheckSquare
} from "lucide-react";
import { GrixFileNode } from "../types/github";

interface AppPreviewPanelProps {
  fileSystemTree: GrixFileNode[];
  onClose: () => void;
  accentColor: string;
  selectedRepo?: {
    name: string;
    owner: {
      login: string;
    };
    html_url: string;
  };
  selectedBranch?: string;
}

interface SandboxLog {
  id: string;
  type: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: Date;
}

// Helper to flatten the workspace file system tree into a plain path -> content map
function getFlatFileMap(nodes: GrixFileNode[]): Record<string, string> {
  const map: Record<string, string> = {};
  function recurse(list: GrixFileNode[]) {
    for (const node of list) {
      if (node.type === "file") {
        map[node.path] = node.content || "";
      } else if (node.type === "dir" && node.children) {
        recurse(node.children);
      }
    }
  }
  recurse(nodes);
  return map;
}

export default function AppPreviewPanel({
  fileSystemTree,
  onClose,
  accentColor,
  selectedRepo,
  selectedBranch
}: AppPreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [urlPath, setUrlPath] = useState<string>("/");
  const [logs, setLogs] = useState<SandboxLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildErrorFile, setBuildErrorFile] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"sandbox" | "deploy">("sandbox");
  const [copiedVercel, setCopiedVercel] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Set up message communication listener with the sandboxed iframe
  useEffect(() => {
    const handleSandboxMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "SANDBOX_LOG") {
        setLogs(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            type: data.logType,
            message: data.message,
            timestamp: new Date()
          }
        ]);
      } else if (data.type === "SANDBOX_ERROR") {
        setBuildError(data.message);
        setBuildErrorFile(data.file || "Runtime");
      } else if (data.type === "SANDBOX_COMPILE_ERROR") {
        setBuildError(data.message);
        setBuildErrorFile(data.file);
      } else if (data.type === "SANDBOX_LOADED") {
        setIsBuilding(false);
      } else if (data.type === "SANDBOX_LOAD_ERROR") {
        setBuildError(data.message);
        setBuildErrorFile("Bootloader");
        setIsBuilding(false);
      }
    };

    window.addEventListener("message", handleSandboxMessage);
    return () => window.removeEventListener("message", handleSandboxMessage);
  }, []);

  // Main build/compile execution block
  const compileAndRun = () => {
    setIsBuilding(true);
    setBuildError(null);
    setBuildErrorFile(null);
    setLogs([
      {
        id: "init",
        type: "info",
        message: "⚡ Initiating Gothwad Ai Studio compilation layer...",
        timestamp: new Date()
      }
    ]);

    const files = getFlatFileMap(fileSystemTree);

    // If we have absolutely no loaded files, supply a default React template
    if (Object.keys(files).length === 0) {
      files["index.html"] = `
        <!DOCTYPE html>
        <html>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `;
      files["src/main.tsx"] = `
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        
        function App() {
          return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-600/15 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                <span className="text-xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Gothwad Ai Studio Sandbox</h1>
              <p className="text-zinc-400 text-xs mt-2 max-w-sm">
                This is a real-time, zero-server-needed in-browser client compiler. Edit your codebase and hit compile to preview.
              </p>
            </div>
          );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      `;
    }

    // Identify standard html entry file
    const htmlFile = files["index.html"] || files["public/index.html"] || `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"/></head>
        <body><div id="root"></div></body>
      </html>
    `;

    // Package everything up inside our dynamic sandbox
    const filesJson = JSON.stringify(files);

    // Build the integrated srcDoc based on user's actual index.html template
    let modifiedHtml = htmlFile;

    // Suppress native browser script tag loads for tsx/ts/jsx files to prevent native 404/syntax errors
    modifiedHtml = modifiedHtml.replace(/<script\b[^>]*src=["']([^"']+)["'][^>]*>([\s\S]*?)<\/script>/gi, (match, src) => {
      const lowerSrc = src.toLowerCase();
      if (lowerSrc.endsWith('.tsx') || lowerSrc.endsWith('.ts') || lowerSrc.endsWith('.jsx')) {
        return `<!-- Suppressed native compilation-required script: ${src} -->`;
      }
      return match;
    });

    // Inject compilation scripts & standard UI log-interceptors into <head>
    const headInjector = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    #sandbox-loader {
      position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #09090b; z-index: 99999; font-family: monospace; font-size: 11px; color: #a1a1aa;
    }
    .spinner { border: 2px solid #27272a; border-top-color: #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script>
    const _log = console.log;
    const _error = console.error;
    const _warn = console.warn;
    const _info = console.info;
    
    function sendLog(type, args) {
      window.parent.postMessage({
        type: 'SANDBOX_LOG',
        logType: type,
        message: args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch(e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ')
      }, '*');
    }

    console.log = (...args) => { _log(...args); sendLog('log', args); };
    console.warn = (...args) => { _warn(...args); sendLog('warn', args); };
    console.error = (...args) => { _error(...args); sendLog('error', args); };
    console.info = (...args) => { _info(...args); sendLog('info', args); };

    window.onerror = (message, source, lineno, colno, error) => {
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        message: message,
        line: lineno,
        file: source ? source.split('/').pop() : 'Runtime'
      }, '*');
    };
  </script>
`;

    if (modifiedHtml.includes("<head>")) {
      modifiedHtml = modifiedHtml.replace("<head>", "<head>" + headInjector);
    } else if (modifiedHtml.includes("<html>")) {
      modifiedHtml = modifiedHtml.replace("<html>", "<html><head>" + headInjector + "</head>");
    } else {
      modifiedHtml = "<head>" + headInjector + "</head>" + modifiedHtml;
    }

    // Inject the loader UI spinner right after <body> starts
    const bodyLoaderInjector = `
  <div id="sandbox-loader">
    <div class="spinner"></div>
    <div id="loader-status" style="letter-spacing: 0.05em">Booting Gothwad Ai Studio compiler...</div>
  </div>
`;

    if (modifiedHtml.includes("<body>")) {
      modifiedHtml = modifiedHtml.replace("<body>", "<body>" + bodyLoaderInjector);
    } else {
      modifiedHtml = bodyLoaderInjector + modifiedHtml;
    }

    // Inject module resolver & runtime engine before the close of </body>
    const bodyScriptsInjector = `
  <script>
    const files = ${filesJson};
    const moduleCache = {};

    function resolvePath(currentPath, importPath) {
      const isAsset = importPath.endsWith('.css') || importPath.endsWith('.scss') || importPath.endsWith('.less') ||
                      importPath.endsWith('.png') || importPath.endsWith('.jpg') || importPath.endsWith('.jpeg') ||
                      importPath.endsWith('.svg') || importPath.endsWith('.gif') || importPath.endsWith('.webp') ||
                      importPath.endsWith('.ico');

      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        return { isExternal: true, pkg: importPath, isAsset };
      }
      
      const parts = currentPath ? currentPath.split('/') : [];
      if (parts.length > 0) {
        parts.pop(); // remove file name
      }
      
      const importParts = importPath.split('/');
      for (const p of importParts) {
        if (p === '.') continue;
        if (p === '..') {
          parts.pop();
        } else {
          parts.push(p);
        }
      }
      
      let resolved = parts.join('/');
      if (resolved.startsWith('/')) resolved = resolved.slice(1);
      if (resolved.startsWith('./')) resolved = resolved.slice(2);
      
      const candidates = [
        resolved,
        resolved + '.tsx',
        resolved + '.ts',
        resolved + '.jsx',
        resolved + '.js',
        resolved + '/index.tsx',
        resolved + '/index.ts',
        resolved + '/index.jsx',
        resolved + '/index.js',
        'src/' + resolved,
        'src/' + resolved + '.tsx',
        'src/' + resolved + '.ts',
        'src/' + resolved + '.jsx',
        'src/' + resolved + '.js'
      ];
      
      for (const cand of candidates) {
        if (files[cand] !== undefined) {
          return { isExternal: false, path: cand, isAsset };
        }
      }
      
      return { isExternal: false, path: resolved, isAsset, notFound: true };
    }

    function requireModule(currentPath, importPath) {
      const res = resolvePath(currentPath, importPath);
      
      if (res.isAsset) {
        const ext = res.path.split('.').pop().toLowerCase();
        if (ext === 'css' || ext === 'scss') {
          const cssContent = files[res.path] || files['src/' + res.path];
          if (cssContent) {
            const styleEl = document.createElement('style');
            styleEl.setAttribute('data-file', res.path);
            styleEl.innerHTML = cssContent;
            document.head.appendChild(styleEl);
          }
        }
        return { default: res.path || importPath };
      }

      if (res.isExternal) {
        const pkg = res.pkg;
        if (pkg === 'react') return window.React;
        if (pkg === 'react-dom' || pkg === 'react-dom/client') return window.ReactDOM;
        if (pkg === 'lucide-react') return window.Lucide;
        if (pkg === 'motion' || pkg === 'motion/react' || pkg === 'framer-motion') return window.Motion;
        
        if (window.GothwadPackages && window.GothwadPackages[pkg]) {
          return window.GothwadPackages[pkg];
        }

        const basePkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
        if (window.GothwadPackages && window.GothwadPackages[basePkg]) {
          return window.GothwadPackages[basePkg];
        }

        // Return a proxy/stub module to prevent crashing if the dependency fails or is un-imported
        console.warn("External package '" + pkg + "' not loaded from CDN. Returning stub object.");
        return new Proxy({}, { get: () => () => null });
      }

      const resolvedPath = res.path;
      if (moduleCache[resolvedPath]) {
        return moduleCache[resolvedPath].exports;
      }

      const fileContent = files[resolvedPath];
      if (fileContent === undefined) {
        console.warn("Module '" + importPath + "' was not found in files. Returning dummy module.");
        return { default: {} };
      }

      const module = { exports: {} };
      moduleCache[resolvedPath] = module;

      let transpiled;
      try {
        transpiled = Babel.transform(fileContent, {
          presets: ['react', ['typescript', { isTSX: true, allExtensions: true }]],
          filename: resolvedPath
        }).code;
      } catch (err) {
        window.parent.postMessage({
          type: 'SANDBOX_COMPILE_ERROR',
          file: resolvedPath,
          message: err.message
        }, '*');
        throw err;
      }

      const moduleFunc = new Function('require', 'module', 'exports', '__filename', '__dirname', transpiled);
      const localRequire = (path) => requireModule(resolvedPath, path);
      
      try {
        moduleFunc(localRequire, module, module.exports, resolvedPath, resolvedPath.split('/').slice(0,-1).join('/'));
      } catch (err) {
        console.error("Runtime error in " + resolvedPath + ": ", err);
        throw err;
      }

      return module.exports;
    }

    async function init() {
      try {
        const loaderStatus = document.getElementById('loader-status');
        
        loaderStatus.innerText = "Synchronizing CDN dependencies...";
        while (typeof Babel === 'undefined') {
          await new Promise(r => setTimeout(r, 100));
        }

        // Fetch standard react context on window
        loaderStatus.innerText = "Resolving React framework core...";
        window.React = await import('https://esm.sh/react@18.2.0');
        window.ReactDOM = await import('https://esm.sh/react-dom@18.2.0/client');
        
        try {
          window.Lucide = await import('https://esm.sh/lucide-react@0.344.0');
        } catch(e) {}
        
        try {
          window.Motion = await import('https://esm.sh/motion/react');
        } catch(e) {}

        // Scan all codebase files to extract and pre-fetch NPM dependencies
        loaderStatus.innerText = "Analyzing project dependencies...";
        const externalPkgs = new Set();
        for (const filePath in files) {
          const content = files[filePath];
          if (typeof content !== 'string') continue;
          
          // Match standard imports
          const importRegex = /(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
          let m;
          while ((m = importRegex.exec(content)) !== null) {
            const imp = m[1];
            if (!imp.startsWith('.') && !imp.startsWith('/')) {
              const basePkg = imp.startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0];
              externalPkgs.add(basePkg);
            }
          }

          // Match dynamic imports
          const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
          while ((m = dynamicRegex.exec(content)) !== null) {
            const imp = m[1];
            if (!imp.startsWith('.') && !imp.startsWith('/')) {
              const basePkg = imp.startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0];
              externalPkgs.add(basePkg);
            }
          }
        }

        // Pre-fetch everything from esm.sh
        window.GothwadPackages = {};
        const loadPromises = Array.from(externalPkgs).map(async (pkg) => {
          if (['react', 'react-dom', 'lucide-react', 'motion', 'motion/react', 'framer-motion'].includes(pkg)) {
            return;
          }
          try {
            loaderStatus.innerText = "Syncing dependency: " + pkg + "...";
            const mod = await import('https://esm.sh/' + pkg);
            window.GothwadPackages[pkg] = mod;
          } catch (err) {
            console.warn("Failed to pre-fetch package '" + pkg + "' from esm.sh: " + err.message);
          }
        });
        
        if (loadPromises.length > 0) {
          await Promise.all(loadPromises);
        }

        loaderStatus.innerText = "Mounting build registry...";

        // Discover the entry point dynamically from script tags in the original HTML template
        let entryPoint = '';
        const htmlContent = files["index.html"] || files["public/index.html"] || "";
        
        const scriptRegex = /<script\\b[^>]*src=["']([^"']+)["']/gi;
        let match;
        while ((match = scriptRegex.exec(htmlContent)) !== null) {
          const src = match[1];
          let cleanedSrc = src.startsWith('/') ? src.slice(1) : src;
          if (cleanedSrc.startsWith('./')) cleanedSrc = cleanedSrc.slice(2);
          
          if (files[cleanedSrc] !== undefined) {
            entryPoint = cleanedSrc;
            break;
          }
          const cand = Object.keys(files).find(f => f.toLowerCase() === cleanedSrc.toLowerCase());
          if (cand) {
            entryPoint = cand;
            break;
          }
        }

        // Search for fallback standard files
        if (!entryPoint) {
          const COMMON_ENTRIES = [
            'src/main.tsx', 'src/index.tsx', 'src/main.ts', 'src/index.ts',
            'src/main.jsx', 'src/index.jsx', 'src/main.js', 'src/index.js',
            'src/App.tsx', 'src/App.jsx', 'main.tsx', 'index.tsx', 'main.ts',
            'index.ts', 'main.jsx', 'index.jsx', 'main.js', 'index.js', 'App.tsx', 'App.jsx'
          ];
          for (const item of COMMON_ENTRIES) {
            if (files[item] !== undefined) {
              entryPoint = item;
              break;
            }
          }
        }

        // Search for any other module files if still empty
        if (!entryPoint) {
          const anyJsTs = Object.keys(files).filter(f => f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.js'));
          if (anyJsTs.length > 0) {
            const withReact = anyJsTs.find(f => files[f].includes('ReactDOM') || files[f].includes('react'));
            entryPoint = withReact || anyJsTs[0];
          }
        }

        if (!entryPoint) {
          const hasHtmlOnly = Object.keys(files).some(f => f.endsWith('.html'));
          if (hasHtmlOnly) {
            document.getElementById('sandbox-loader').style.display = 'none';
            window.parent.postMessage({ type: 'SANDBOX_LOADED' }, '*');
            return;
          }
          throw new Error("No primary entry file found (e.g. src/main.tsx or similar). Please create or configure your entrypoint.");
        }

        // Run the entrypoint
        requireModule('', './' + entryPoint);

        // Hide loader
        document.getElementById('sandbox-loader').style.display = 'none';
        window.parent.postMessage({ type: 'SANDBOX_LOADED' }, '*');
      } catch (err) {
        console.error(err);
        document.getElementById('loader-status').innerHTML = '<span style="color:#f43f5e;font-weight:bold">Compilation Failed</span><br/><div style="margin-top:6px;max-width:300px;line-height:1.4;color:#a1a1aa">' + err.message + '</div>';
        window.parent.postMessage({
          type: 'SANDBOX_LOAD_ERROR',
          message: err.message
        }, '*');
      }
    }

    window.onload = init;
  </script>
`;

    if (modifiedHtml.includes("</body>")) {
      modifiedHtml = modifiedHtml.replace("</body>", bodyScriptsInjector + "</body>");
    } else {
      modifiedHtml = modifiedHtml + bodyScriptsInjector;
    }

    setIframeSrcDoc(modifiedHtml);
  };

  // Compile automatically on mount
  useEffect(() => {
    compileAndRun();
  }, [fileSystemTree.length]);

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col overflow-hidden relative">
      
      {/* 1. Address / Control Bar Row */}
      <div className="h-14 min-h-[56px] border-b border-zinc-900 bg-zinc-940/80 px-4 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
          
          <h3 className="text-xs font-bold text-zinc-300 ml-1.5 flex items-center gap-1.5 font-mono">
            <Chrome className="w-3.5 h-3.5 text-zinc-500" />
            gothwad_sandbox
          </h3>
        </div>

        {/* Address Bar Emulator */}
        <div className="flex-1 max-w-sm bg-zinc-950 border border-zinc-900 rounded-lg h-7 px-3 flex items-center justify-between text-[10.5px] font-mono text-zinc-500 select-text">
          <span className="truncate text-zinc-400 select-none">localhost:3000{urlPath}</span>
          <button 
            onClick={compileAndRun}
            className="text-zinc-600 hover:text-zinc-300 p-0.5 rounded transition-colors"
            title="Rebuild Sandbox"
          >
            <RefreshCw className={`w-3 h-3 ${isBuilding ? "animate-spin text-amber-500" : ""}`} />
          </button>
        </div>

        {/* Device View Width Controllers */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 p-0.5 rounded-lg">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`p-1.5 rounded-md transition-all ${deviceMode === "desktop" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            title="Desktop View (Full Width)"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode("tablet")}
            className={`p-1.5 rounded-md transition-all ${deviceMode === "tablet" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`p-1.5 rounded-md transition-all ${deviceMode === "mobile" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Close Toggle */}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
          title="Close Preview Screen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Switcher Sub-header Row */}
      <div className="h-10 min-h-[40px] bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between select-none">
        <div className="flex gap-4 h-full">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`text-[10.5px] font-bold uppercase tracking-wider font-mono h-full border-b-2 px-1 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "sandbox" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sandbox Preview</span>
          </button>
          <button
            onClick={() => setActiveTab("deploy")}
            className={`text-[10.5px] font-bold uppercase tracking-wider font-mono h-full border-b-2 px-1 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "deploy" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>Production Deploy</span>
          </button>
        </div>
        <div className="text-[10px] font-mono text-zinc-600">
          {activeTab === "sandbox" ? "⚡ Running Local Compiler" : "🌐 Continuous Integration Setup"}
        </div>
      </div>

      {/* 2. Primary Content Stage (Sandbox Iframe OR Deployment Guides) */}
      <div className="flex-1 bg-zinc-900/40 flex flex-col overflow-hidden relative">
        {activeTab === "sandbox" ? (
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto relative">
            
            {/* Device width constraints wrapping iframe with sleek drop shadows */}
            <div 
              className="h-full max-h-full bg-zinc-950 transition-all duration-300 flex flex-col overflow-hidden relative border border-zinc-900 shadow-2xl rounded-xl"
              style={{
                width: deviceMode === "desktop" ? "100%" : deviceMode === "tablet" ? "768px" : "375px",
                boxShadow: `0 25px 50px -12px rgba(0,0,0,0.8)`
              }}
            >
              {iframeSrcDoc ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={iframeSrcDoc}
                  className="w-full flex-1 bg-[#09090b] border-none"
                  title="Gothwad Ai Studio Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950">
                  <Play className="w-8 h-8 text-zinc-600 mb-3 animate-pulse" />
                  <p className="text-zinc-400 font-mono text-xs">Sandbox Engine Staged</p>
                  <button
                    onClick={compileAndRun}
                    className="mt-4 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-[10.5px] rounded-lg border border-zinc-800 transition-all"
                  >
                    Launch Sandbox Server
                  </button>
                </div>
              )}

              {/* Compilation Build Error Panel Overlay */}
              {buildError && (
                <div className="absolute inset-0 bg-zinc-950/95 z-50 p-6 flex flex-col justify-center animate-fade-in font-mono">
                  <div className="max-w-2xl mx-auto w-full bg-red-950/20 border border-red-500/30 p-5 rounded-xl shadow-xl flex gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                        Build failed
                      </span>
                      <p className="text-zinc-100 font-bold text-xs mt-3 leading-normal">
                        Compilation crashed in: <span className="text-red-400">{buildErrorFile}</span>
                      </p>
                      <pre className="mt-3 p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-[10.5px] text-zinc-400 overflow-x-auto leading-relaxed max-h-48 scrollbar-thin select-text">
                        <code>{buildError}</code>
                      </pre>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={compileAndRun}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10.5px] text-zinc-200 border border-zinc-800 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Recompile codebase</span>
                        </button>
                        <button
                          onClick={() => setBuildError(null)}
                          className="px-3 py-1.5 bg-transparent hover:bg-zinc-900 text-[10.5px] text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                        >
                          Dismiss banner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Production Deploy panel */
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar font-sans select-none text-zinc-300 bg-zinc-950/80">
            <div className="max-w-xl mx-auto space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500">
                  <CloudLightning className="w-5 h-5 animate-pulse" />
                  <h4 className="text-sm font-bold tracking-wider uppercase font-mono">Production Deployment</h4>
                </div>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  Your codebase is directly synchronized with your GitHub repository! Because this in-browser sandbox compiles files locally in your tab, advanced React features (like routing configs or dynamic server backend APIs) build and deploy most successfully on professional production platforms like Vercel or Netlify.
                </p>
              </div>

              {selectedRepo ? (
                <div className="space-y-4">
                  {/* 1-Click Launchers card */}
                  <div className="p-4 bg-zinc-940 border border-zinc-900 rounded-xl space-y-3">
                    <span className="text-[9.5px] uppercase font-bold tracking-widest font-mono text-zinc-500 block">
                      1-Click Hosting Providers
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Vercel */}
                      <a
                        href={`https://vercel.com/new/clone?repository-url=https://github.com/${selectedRepo.owner.login}/${selectedRepo.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-lg bg-black hover:bg-zinc-900 border border-zinc-800 flex flex-col gap-1 transition-all group cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 76 65">
                              <path d="M37.527 0L75.054 65H0L37.527 0Z" />
                            </svg>
                            Vercel
                          </span>
                          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[9.5px] text-zinc-500 mt-1 font-mono">Continuous push-to-deploy pipeline</span>
                      </a>

                      {/* Netlify */}
                      <a
                        href={`https://app.netlify.com/start/deploy?repository=https://github.com/${selectedRepo.owner.login}/${selectedRepo.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-lg bg-[#0e1e25] hover:bg-[#12262e] border border-[#1b343e] flex flex-col gap-1 transition-all group cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#00c7b7] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19.16 12.92l3.41-3.41c.54-.54.54-1.42 0-1.96l-3.41-3.41c-.54-.54-1.42-.54-1.96 0l-3.41 3.41c-.54.54-.54 1.42 0 1.96l3.41 3.41c.54.54 1.42.54 1.96 0zM12 1.54l-3.41 3.41c-.54.54-.54 1.42 0 1.96l3.41 3.41c.54.54 1.42.54 1.96 0l3.41-3.41c.54-.54.54-1.42 0-1.96L12 1.54zm-7.16 11.38l3.41-3.41c.54-.54.54-1.42 0-1.96L4.84 4.14c-.54-.54-1.42-.54-1.96 0L.47 7.55c-.54.54-.54 1.42 0 1.96l3.41 3.41c.54.54 1.42.54 1.96 0zm7.16 8.08l-3.41-3.41c-.54-.54-.54-1.42 0-1.96l3.41-3.41c.54-.54 1.42-.54 1.96 0l3.41 3.41c.54.54.54 1.42 0 1.96l-3.41 3.41c-.54.54-1.42.54-1.96 0z" />
                            </svg>
                            Netlify
                          </span>
                          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[9.5px] text-zinc-500 mt-1 font-mono">Deploy on every main branch push</span>
                      </a>
                    </div>
                  </div>

                  {/* Vercel JSON Setup Guide */}
                  <div className="p-4 bg-zinc-940 border border-zinc-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] uppercase font-bold tracking-widest font-mono text-zinc-500 block">
                        Vercel Rewrite Rules (vercel.json)
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify({
                            rewrites: [{ source: "/(.*)", destination: "/index.html" }]
                          }, null, 2));
                          setCopiedVercel(true);
                          setTimeout(() => setCopiedVercel(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white text-[9.5px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedVercel ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedVercel ? "Copied config!" : "Copy config"}</span>
                      </button>
                    </div>

                    <p className="text-[10.5px] text-zinc-400 leading-normal">
                      For single-page client routing (e.g. React Router) to function perfectly when refreshing routes on Vercel, copy this file structure and name it <span className="font-mono text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded">vercel.json</span> inside your root directory:
                    </p>

                    <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-[10.5px] text-zinc-500 font-mono overflow-x-auto select-text">
{`{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`}
                    </pre>
                  </div>

                  {/* Step-by-Step GitHub continuous deployment instructions */}
                  <div className="p-5 bg-zinc-940/40 border border-zinc-900/60 rounded-xl space-y-4">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider font-mono text-amber-500">
                      Step-by-Step Deploy Instructions
                    </span>
                    <ol className="text-[11px] space-y-3 text-zinc-400 list-decimal pl-4 leading-relaxed">
                      <li>
                        Click either the <strong className="text-zinc-200">Vercel</strong> or <strong className="text-zinc-200">Netlify</strong> quick deploy buttons above to redirect to their project imports.
                      </li>
                      <li>
                        Sign in using your <strong className="text-zinc-200">GitHub</strong> profile and grant permission to import the repository <strong className="text-zinc-300 font-mono">"{selectedRepo.owner.login}/{selectedRepo.name}"</strong>.
                      </li>
                      <li>
                        Set the Build Command to <code className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-amber-400">npm run build</code> and the Output Directory to <code className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-amber-400">dist</code>.
                      </li>
                      <li>
                        Click <strong className="text-white bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">Deploy</strong>. Any future git commits you make from Gothwad Studio will automatically trigger fresh builds and update your live preview link instantly!
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-zinc-940 border border-zinc-900 rounded-xl">
                  <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs font-mono text-zinc-500">Connect to a GitHub Repository to access production pipelines.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Collapse/Expand Console logs dock */}
      <div 
        className="border-t border-zinc-900 bg-zinc-950 flex flex-col shrink-0 select-none z-20"
        style={{ height: isConsoleOpen ? "200px" : "36px" }}
      >
        {/* Dock Header Toolbar */}
        <div 
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="h-9 min-h-[36px] bg-zinc-940 px-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono tracking-wider font-bold">Console Terminal Logs</span>
            {logs.length > 0 && (
              <span className="text-[9.5px] px-1.5 bg-zinc-900 text-zinc-400 rounded-full font-mono border border-zinc-850">
                {logs.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isConsoleOpen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLogs([]);
                }}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <span className="text-[10px] font-mono text-zinc-600">
              {isConsoleOpen ? "Collapse ▾" : "Expand ▴"}
            </span>
          </div>
        </div>

        {/* Logs timeline lists */}
        {isConsoleOpen && (
          <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[10px] space-y-1 bg-zinc-950 scrollbar-thin select-text">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-[9.5px] select-none">
                No logs recorded. Logs will appear here when they are emitted by the sandbox.
              </div>
            ) : (
              logs.map((log) => {
                const badgeColor = 
                  log.type === "error" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                  log.type === "warn" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                  log.type === "info" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                  "text-zinc-500 bg-zinc-900 border-zinc-850";

                return (
                  <div key={log.id} className="flex items-start gap-2.5 py-0.5 border-b border-zinc-900/20">
                    <span className="text-zinc-600 shrink-0 select-none">
                      {log.timestamp.toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase shrink-0 border ${badgeColor}`}>
                      {log.type}
                    </span>
                    <span className={`flex-1 break-words leading-relaxed ${log.type === "error" ? "text-red-300" : log.type === "warn" ? "text-yellow-200" : "text-zinc-300"}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={consoleBottomRef} />
          </div>
        )}
      </div>

    </div>
  );
}

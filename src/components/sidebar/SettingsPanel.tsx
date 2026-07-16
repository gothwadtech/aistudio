import React, { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, Key, Eye, EyeOff, Cpu, Layers } from "lucide-react";

interface SettingsPanelProps {
  themeMode: "system" | "dark" | "light";
  onThemeModeChange: (mode: "system" | "dark" | "light") => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  desktopMode: boolean;
  onDesktopModeChange?: (enabled: boolean) => void;
  token: string | null;
  onLogout: () => void;
  user: any;
  showCompactTitle?: boolean;
  customApiKey: string;
  onSetCustomApiKey: (key: string) => void;
  groqApiKey: string;
  onSetGroqApiKey: (key: string) => void;
  appModels: any[];
  onUpdateAppModels: (models: any[]) => void;
}

export default function SettingsPanel({
  themeMode,
  onThemeModeChange,
  accentColor,
  onAccentColorChange,
  fontFamily,
  onFontFamilyChange,
  uiScale,
  onUiScaleChange,
  desktopMode,
  onDesktopModeChange,
  token,
  onLogout,
  user,
  showCompactTitle = false,
  customApiKey,
  onSetCustomApiKey,
  groqApiKey,
  onSetGroqApiKey,
  appModels = [],
  onUpdateAppModels
}: SettingsPanelProps) {
  const [scaleInputText, setScaleInputText] = useState(Math.round(uiScale * 100).toString());

  useEffect(() => {
    setScaleInputText(Math.round(uiScale * 100).toString());
  }, [uiScale]);

  const handleManualScaleChange = (val: string) => {
    setScaleInputText(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 10 && parsed <= 400) {
      onUiScaleChange(parsed / 100);
    }
  };

  // Custom AI model management states
  const [newModelValue, setNewModelValue] = useState("");
  const [newModelLabel, setNewModelLabel] = useState("");
  const [newModelDesc, setNewModelDesc] = useState("");
  const [newModelChats, setNewModelChats] = useState(true);
  const [newModelSoftware, setNewModelSoftware] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);

  const handleResetModels = () => {
    if (window.confirm("Are you sure you want to reset all models to defaults? This will erase custom added models.")) {
      const DEFAULT_MODELS = [
        { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fast, multi-modal, great for general tasks.", categories: ["chats", "software"] },
        { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)", desc: "State-of-the-art open model with high intelligence.", categories: ["chats", "software"] },
        { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B (Free)", desc: "Massive scale model for complex structural answers.", categories: ["chats", "software"] },
        { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 Reasoning (Free)", desc: "Advanced reasoning and step-by-step thinking.", categories: ["chats", "software"] },
        { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder (Free)", desc: "Optimized for programming and logic syntax.", categories: ["chats", "software"] },
        { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", desc: "Top-tier developer model for precise refactoring.", categories: ["chats", "software"] },
        { value: "deepseek/deepseek-chat", label: "DeepSeek V3 (Cheap Paid)", desc: "Standard intelligence general purpose model.", categories: ["software"] },
        { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Standard)", desc: "Highly intelligent model, optimized for reasoning.", categories: ["software"] }
      ];
      onUpdateAppModels(DEFAULT_MODELS);
    }
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelValue.trim() || !newModelLabel.trim()) {
      alert("Model Value (Identifier) and Label (Display Name) are required.");
      return;
    }
    
    // Check if model already exists
    if (appModels.some(m => m.value.toLowerCase() === newModelValue.trim().toLowerCase())) {
      alert("A model with this identifier already exists.");
      return;
    }

    const categories: ("chats" | "software")[] = [];
    if (newModelChats) categories.push("chats");
    if (newModelSoftware) categories.push("software");

    if (categories.length === 0) {
      alert("Please assign the model to at least one category (Chats or Software).");
      return;
    }

    const nextModels = [
      ...appModels,
      {
        value: newModelValue.trim(),
        label: newModelLabel.trim(),
        desc: newModelDesc.trim() || "User custom added model.",
        categories
      }
    ];

    onUpdateAppModels(nextModels);
    
    // Clear inputs
    setNewModelValue("");
    setNewModelLabel("");
    setNewModelDesc("");
    setNewModelChats(true);
    setNewModelSoftware(true);
  };

  const handleDeleteModel = (modelValue: string) => {
    if (window.confirm(`Are you sure you want to delete ${modelValue}?`)) {
      const nextModels = appModels.filter(m => m.value !== modelValue);
      onUpdateAppModels(nextModels);
    }
  };

  return (
    <div className="space-y-4 font-mono text-[10px] animate-[fadeIn_0.15s_ease-out]">
      {showCompactTitle && (
        <span className="text-[#375a7f] font-mono font-bold uppercase tracking-wider text-[9px] block" style={{ color: accentColor }}>
          Studio Settings
        </span>
      )}

      {/* Theme Settings Section */}
      <div className="space-y-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>Theme Engine</span>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Configure dark, light or system preference styles.
        </p>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {(["system", "dark", "light"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onThemeModeChange(mode)}
              className={`text-[9px] py-1.5 rounded font-bold transition-all uppercase cursor-pointer border ${
                themeMode === mode 
                  ? "bg-[#375a7f] text-white border-[#375a7f]" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
              }`}
              style={themeMode === mode ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Section */}
      <div className="space-y-2.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>Accent Color / Brand hex</span>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Input custom hex code or select dynamic color presets.
        </p>
        
        {/* Custom input */}
        <div className="flex gap-1.5 items-center">
          <div 
            className="w-6 h-6 rounded-md border border-zinc-800 shrink-0" 
            style={{ backgroundColor: accentColor }}
          />
          <input
            type="text"
            maxLength={7}
            value={accentColor}
            onChange={(e) => {
              const val = e.target.value;
              onAccentColorChange(val);
            }}
            placeholder="#375a7f"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-[10.5px] text-zinc-300 rounded px-2 py-1 outline-none font-mono focus:border-zinc-700 uppercase"
          />
        </div>

        {/* Color presets circles */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "#375a7f", // Google Blue
            "#ea4335", // Google Red
            "#34a853", // Google Green
            "#fbbc05", // Google Yellow
            "#e91e63", // Hot Pink
            "#9c27b0", // Purple
            "#ff9800", // Orange
            "#00bcd4"  // Cyan
          ].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onAccentColorChange(color)}
              className="w-5 h-5 rounded-full border border-zinc-800 cursor-pointer relative hover:scale-110 transition-transform shrink-0"
              style={{ backgroundColor: color }}
              title={color}
            >
              {accentColor.toLowerCase() === color.toLowerCase() && (
                <span className="absolute inset-1 bg-white rounded-full opacity-60" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family Section */}
      <div className="space-y-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>Font Engine</span>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Override all Gothwad Ai Studio visual elements with specific font parameters.
        </p>
        <div className="pt-1">
          <select
            className="w-full bg-zinc-900 border border-zinc-800 text-[10.5px] font-mono text-zinc-300 rounded px-2 py-1.5 outline-none cursor-pointer hover:border-zinc-700"
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
          >
            {[
              "Roboto",
              "Inter",
              "System Font",
              "Fira Code",
              "JetBrains Mono",
              "SF Mono",
              "Playfair Display",
              "DM Sans",
              "Space Grotesk",
              "Outfit",
              "Plus Jakarta Sans",
              "IBM Plex Sans",
              "IBM Plex Mono",
              "Open Sans",
              "Montserrat",
              "Lato",
              "Poppins",
              "Oswald",
              "Nunito",
              "Raleway",
              "Ubuntu",
              "Merriweather",
              "Lora",
              "Inconsolata",
              "Source Code Pro",
              "Source Sans Pro",
              "Play",
              "Quicksand",
              "Cabin",
              "Kanit",
              "Work Sans",
              "Georgia",
              "Courier New",
              "Hack",
              "PT Sans"
            ].map((font) => (
              <option key={font} value={font} className="bg-zinc-900">
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TV & PC Screen Optimization Settings */}
      <div className="space-y-2.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>TV Screen, PC & Zoom Scale Factor</span>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Enter any custom zoom percentage (e.g., 51% or 120%) or click default size mode presets to perfectly adjust Gothwad Ai Studio.
        </p>
        
        {/* Manual scale percentage input and preset selection */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-zinc-400 shrink-0">Scale factor %:</span>
          <div className="relative flex-1">
            <input
              type="text"
              value={scaleInputText}
              onChange={(e) => {
                // Allow only numbers
                const val = e.target.value.replace(/\D/g, "");
                handleManualScaleChange(val);
              }}
              placeholder="100"
              className="w-full bg-zinc-900 border border-zinc-800 text-[10.5px] text-zinc-300 rounded px-2 py-1 outline-none font-mono focus:border-zinc-700"
            />
            <span className="absolute right-2 top-1 text-zinc-500 text-[9px]">%</span>
          </div>
        </div>

        <div className="flex gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onUiScaleChange(0.5)}
            className={`flex-1 text-[9px] py-1.5 rounded font-bold transition-all cursor-pointer ${
              uiScale === 0.5 ? "bg-[#375a7f] text-white" : "bg-zinc-950 border border-zinc-850 text-zinc-400 hover:bg-zinc-800"
            }`}
            style={uiScale === 0.5 ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
          >
            TV Mode (50%)
          </button>
          <button
            type="button"
            onClick={() => onUiScaleChange(1.0)}
            className={`flex-1 text-[9px] py-1.5 rounded font-bold transition-all cursor-pointer ${
              uiScale === 1.0 ? "bg-[#375a7f] text-white" : "bg-zinc-950 border border-zinc-850 text-zinc-400 hover:bg-zinc-800"
            }`}
            style={uiScale === 1.0 ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
          >
            PC Mode (100%)
          </button>
        </div>
      </div>

      {/* Responsive Layout Controls */}
      <div className="space-y-2.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>Responsive Layout Mode</span>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Force high-fidelity PC desktop layout on small screen mobile viewports.
        </p>
        <div className="flex items-center justify-between pt-1 select-none">
          <span className="text-zinc-300 font-medium text-[10.5px]">Desktop View Mode</span>
          <button
            type="button"
            onClick={() => onDesktopModeChange?.(!desktopMode)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              desktopMode ? "bg-[#375a7f]" : "bg-zinc-800"
            }`}
            style={desktopMode ? { backgroundColor: accentColor } : {}}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                desktopMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Global OpenRouter API Key configuration - Moved here! */}
      <div className="space-y-2.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <div className="flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>OpenRouter API Credentials</span>
        </div>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Configure a custom OpenRouter authentication key for unlimited, high-rate limit chat & software building sessions.
        </p>
        
        <div className="relative pt-1">
          <input
            type={showApiKey ? "text" : "password"}
            value={customApiKey}
            onChange={(e) => onSetCustomApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full bg-zinc-900 border border-zinc-800 text-[10.5px] font-mono text-zinc-300 rounded px-2.5 py-1.5 pr-8 outline-none focus:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[8.5px] text-zinc-600 leading-normal">
          If empty, Gothwad AI Studio will fall back to its internal workspace proxy engine keys.
        </p>
      </div>

      {/* Groq API Key configuration */}
      <div className="space-y-2.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <div className="flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>Groq API Credentials</span>
        </div>
        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Configure a custom Groq API key to use ultra-fast open-weights model inference (such as Llama 3.3, DeepSeek R1 70B, Gemma 2) directly inside your companion.
        </p>
        
        <div className="relative pt-1">
          <input
            type={showGroqKey ? "text" : "password"}
            value={groqApiKey}
            onChange={(e) => onSetGroqApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full bg-zinc-900 border border-zinc-800 text-[10.5px] font-mono text-zinc-300 rounded px-2.5 py-1.5 pr-8 outline-none focus:border-zinc-700"
          />
          <button
            type="button"
            onClick={() => setShowGroqKey(!showGroqKey)}
            className="absolute right-2 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[8.5px] text-zinc-600 leading-normal">
          Provide your Groq API Key (gsk_...) to unlock blazing-fast sub-second model responses.
        </p>
      </div>

      {/* Dynamic Model Engine Configuration Panel */}
      <div className="space-y-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="text-[#375a7f] font-bold uppercase block tracking-wide text-[9px]" style={{ color: accentColor }}>AI Models Directory</span>
          </div>
          <button
            type="button"
            onClick={handleResetModels}
            className="px-2 py-0.5 border border-zinc-850 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 text-[8.5px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset Defaults
          </button>
        </div>

        <p className="text-zinc-500 text-[9px] leading-relaxed">
          Manage AI endpoints globally. Added models will appear automatically inside corresponding studio dropdown listings in real-time.
        </p>

        {/* Form to add model */}
        <form onSubmit={handleAddModel} className="space-y-2 border-t border-zinc-900 pt-2.5">
          <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider">Add Custom LLM Engine</span>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[8px] uppercase text-zinc-600">Model Value (Identifier)</span>
              <input
                type="text"
                placeholder="anthropic/claude-3-opus"
                value={newModelValue}
                onChange={(e) => setNewModelValue(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1 outline-none font-mono focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] uppercase text-zinc-600">Display Label</span>
              <input
                type="text"
                placeholder="Claude 3 Opus"
                value={newModelLabel}
                onChange={(e) => setNewModelLabel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1 outline-none font-mono focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] uppercase text-zinc-600">Description Summary</span>
            <input
              type="text"
              placeholder="Ultra intelligent reasoning model for structural planning."
              value={newModelDesc}
              onChange={(e) => setNewModelDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1 outline-none font-mono focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center gap-4 py-1">
            <span className="text-[8px] uppercase text-zinc-600">Target Categories:</span>
            <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newModelChats}
                onChange={(e) => setNewModelChats(e.target.checked)}
                className="w-3 h-3 rounded border-zinc-800 bg-zinc-950 text-[#375a7f] focus:ring-0 cursor-pointer"
                style={{ accentColor }}
              />
              <span className="text-[9.5px]">AI Chat (Chats)</span>
            </label>
            <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newModelSoftware}
                onChange={(e) => setNewModelSoftware(e.target.checked)}
                className="w-3 h-3 rounded border-zinc-800 bg-zinc-950 text-[#375a7f] focus:ring-0 cursor-pointer"
                style={{ accentColor }}
              />
              <span className="text-[9.5px]">Software Companion</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 text-[9.5px] font-bold text-white rounded font-mono hover:opacity-90 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-1"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-3 h-3" />
            Register LLM Model Endpoint
          </button>
        </form>

        {/* List of models */}
        <div className="space-y-1.5 border-t border-zinc-900 pt-2.5 max-h-56 overflow-y-auto no-scrollbar">
          <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider block mb-1">Active Registered Models Directory</span>
          {appModels.map((m) => (
            <div 
              key={m.value}
              className="flex items-start justify-between p-2 rounded bg-zinc-900/60 border border-zinc-850 gap-2.5"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-zinc-200">{m.label}</span>
                  <span className="text-[8.5px] text-zinc-500 font-sans truncate">({m.value})</span>
                </div>
                <p className="text-zinc-500 text-[8.5px] leading-relaxed line-clamp-1">{m.desc}</p>
                <div className="flex gap-1 pt-1">
                  {m.categories.map((cat: string) => (
                    <span 
                      key={cat}
                      className="text-[7.5px] font-bold uppercase font-mono px-1 py-0.2 rounded border bg-zinc-950 text-zinc-400"
                      style={{ 
                        color: cat === "chats" ? accentColor : "#a855f7",
                        borderColor: cat === "chats" ? `${accentColor}25` : "#a855f725"
                      }}
                    >
                      {cat === "chats" ? "Chats" : "Software"}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteModel(m.value)}
                className="p-1 rounded text-zinc-650 hover:text-red-400 hover:bg-zinc-800/30 cursor-pointer self-center transition-colors"
                title={`Delete ${m.label}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Information */}
      <div className="space-y-1.5">
        <label className="text-zinc-500 font-bold uppercase block">Gothwad Ai Studio Developer Token</label>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 break-all text-zinc-300">
          {token ? `${token.substring(0, 10)}****************` : "Not connected"}
        </div>
      </div>

      {user && (
        <div className="space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
          <span className="text-zinc-500 font-bold uppercase block">PROFILE SESSION</span>
          <p className="text-zinc-200">@{user.login}</p>
          <p className="text-zinc-400 font-sans text-[10px]">{user.name || "GitHub Dev"}</p>
        </div>
      )}

      <div className="bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-850 text-zinc-500 leading-normal space-y-1">
        <span className="text-zinc-400 font-bold uppercase block">WORKSTATION HOTKEYS</span>
        <p>• <span style={{ color: accentColor }}>Cmd + S</span> / <span style={{ color: accentColor }}>Ctrl + S</span>: Save File</p>
        <p>• <span style={{ color: accentColor }}>Explorer tab</span>: Browse code records</p>
        <p>• <span style={{ color: accentColor }}>Timeline tabs</span>: Checkpoint rollback</p>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-red-950/15 hover:bg-red-900/25 text-red-400 border border-red-900/35 py-2 rounded-lg transition-colors text-center font-bold font-mono cursor-pointer"
      >
        Disconnect GitHub Session
      </button>
    </div>
  );
}

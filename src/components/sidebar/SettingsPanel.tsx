import React, { useState, useEffect } from "react";

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
  showCompactTitle = false
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

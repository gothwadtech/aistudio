import React, { useState } from "react";
import { Save, RefreshCw, ChevronDown, Check, FileCode } from "lucide-react";
import { GrixFileNode } from "../../types/github";
import { SupportedLanguage } from "./SyntaxHighlighter";

interface EditorHeaderProps {
  activeFile: GrixFileNode;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onSaveTrigger: () => void;
  isLoading: boolean;
}

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "plain", label: "Plain Text" },
];

export default function EditorHeader({
  activeFile,
  selectedLanguage,
  onLanguageChange,
  onSaveTrigger,
  isLoading
}: EditorHeaderProps) {
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);

  return (
    <div className="bg-zinc-900/50 border-b border-zinc-900 px-4 py-2 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <FileCode className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="text-xs font-mono text-zinc-200 font-bold truncate max-w-[200px]">
          {activeFile.name}
        </span>
        <span className="text-[10px] font-mono text-zinc-600 truncate max-w-xs hidden sm:inline" title={activeFile.path}>
          {activeFile.path}
        </span>
        {activeFile.isModified && (
          <span className="bg-amber-500/10 text-amber-500 text-[9.5px] font-mono px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 select-none animate-pulse">
            Edited
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Language selector pill */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-[10.5px] font-mono rounded-lg transition-all"
          >
            <span>{LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showLangDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowLangDropdown(false)} 
              />
              <div className="absolute right-0 mt-1 w-40 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl py-1.5 z-50 max-h-60 overflow-y-auto no-scrollbar font-mono text-[10px]">
                <div className="px-2.5 py-1 text-zinc-650 uppercase font-bold text-[8.5px] tracking-wider border-b border-zinc-900 mb-1">
                  Language Support
                </div>
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.value === selectedLanguage;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => {
                        onLanguageChange(lang.value);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-left transition-colors ${
                        isSelected 
                          ? "bg-zinc-900 text-zinc-100 font-bold" 
                          : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-zinc-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {activeFile.isModified && (
          <button
            onClick={onSaveTrigger}
            disabled={isLoading}
            className="bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit Changes</span>
          </button>
        )}
      </div>
    </div>
  );
}

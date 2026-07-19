import React, { useState, useEffect } from "react";
import { GrixFileNode } from "../../../types/github";
import { Save, RefreshCw, AlertCircle, Check } from "lucide-react";
import EditorHeader from "./EditorHeader";
import MediaViewer from "./MediaViewer";
import { 
  SupportedLanguage, 
  detectLanguage, 
  isMediaFile 
} from "./SyntaxHighlighter";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  activeFile: GrixFileNode | null;
  editorContent: string;
  onContentChange: (content: string) => void;
  onSave: (commitMessage: string) => Promise<void>;
  isLoading: boolean;
}

export default function CodeEditor({
  activeFile,
  editorContent,
  onContentChange,
  onSave,
  isLoading
}: CodeEditorProps) {
  const [commitMsg, setCommitMsg] = useState<string>("");
  const [showCommitInput, setShowCommitInput] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("plain");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Auto-detect language when file changes
  useEffect(() => {
    if (activeFile) {
      setSelectedLanguage(detectLanguage(activeFile.name));
      setShowCommitInput(false);
      setCommitMsg("");
    }
  }, [activeFile?.path]);

  if (!activeFile) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center select-none h-full">
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <span className="text-zinc-500 font-mono text-lg font-bold">{"</>"}</span>
        </div>
        <p className="text-zinc-300 font-mono text-xs font-semibold">No Active File Selected</p>
        <p className="text-zinc-650 font-mono text-[10.5px] mt-1 max-w-xs leading-normal">
          Select a code, visual, or audio file from the explorer on the left to inspect or modify
        </p>
      </div>
    );
  }

  // If the file is classified as visual/audio media (and we have loaded content)
  const isMedia = isMediaFile(activeFile.name);
  if (isMedia) {
    return (
      <MediaViewer 
        activeFile={activeFile} 
        content={editorContent} 
      />
    );
  }

  const handleCommitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(commitMsg || `Update ${activeFile.name}`);
      setCommitMsg("");
      setShowCommitInput(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      // handled by global state
    }
  };

  const mapLanguageToMonaco = (lang: string): string => {
    if (lang === "plain") return "plaintext";
    return lang;
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 12,
    fontFamily: "var(--font-mono), monospace",
    lineNumbers: "on" as const,
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    cursorBlinking: "smooth" as const,
    cursorSmoothCaretAnimation: "on" as const,
    padding: { top: 12, bottom: 12 },
    contextmenu: true,
    wordWrap: "on" as const,
    theme: "vs-dark",
  };

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col h-full border-l border-r border-zinc-900 relative">
      {/* Editor Header */}
      <EditorHeader
        activeFile={activeFile}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onSaveTrigger={() => setShowCommitInput(!showCommitInput)}
        isLoading={isLoading}
      />

      {/* Save success toast alert banner */}
      {savedSuccess && (
        <div className="bg-emerald-950/20 border-b border-emerald-900/30 px-4 py-1.5 flex items-center justify-between text-emerald-400 text-[10.5px] font-mono z-20 select-none animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Changes successfully pushed to GitHub repository!</span>
          </div>
          <button 
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-500 hover:text-emerald-300 transition-colors"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Commit Message Panel */}
      {showCommitInput && (
        <form 
          onSubmit={handleCommitSubmit} 
          className="bg-zinc-900 border-b border-zinc-850 p-4 flex flex-col gap-3 z-20 shadow-2xl animate-slideDown"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#375a7f]" />
              <label className="text-zinc-300 font-mono text-[10.5px] font-bold uppercase tracking-wider">
                Create GitHub Commit Message
              </label>
            </div>
            <input
              type="text"
              required
              autoFocus
              placeholder={`Update ${activeFile.name}`}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 outline-none px-3 py-1.5 rounded-lg text-xs font-mono focus:border-zinc-700 transition-all shadow-inner w-full"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCommitInput(false)}
              className="bg-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs px-3 py-1.5 rounded-lg transition-all font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#375a7f] hover:bg-[#375a7f]/80 active:scale-[0.98] text-white text-xs px-4 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Commit & Push</span>
            </button>
          </div>
        </form>
      )}

      {/* Monaco Code Editor Workspace */}
      <div className="flex-1 overflow-hidden relative bg-zinc-950">
        <Editor
          height="100%"
          language={mapLanguageToMonaco(selectedLanguage)}
          theme="vs-dark"
          value={editorContent}
          onChange={(value) => onContentChange(value || "")}
          options={editorOptions}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-500 font-mono text-xs select-none">
              <RefreshCw className="w-5 h-5 animate-spin text-[#375a7f]" />
              <span>Initialising editor context...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

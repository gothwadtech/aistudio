import React, { useState, useEffect, useRef } from "react";
import { GrixFileNode } from "../../types/github";
import { Save, RefreshCw, AlertCircle, FileText, Check } from "lucide-react";
import EditorHeader from "./EditorHeader";
import MediaViewer from "./MediaViewer";
import { 
  SupportedLanguage, 
  detectLanguage, 
  highlightCode, 
  isMediaFile 
} from "./SyntaxHighlighter";

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
  const [activeLineIndex, setActiveLineIndex] = useState<number>(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const highlightContainerRef = useRef<HTMLDivElement>(null);

  // Auto-detect language when file changes
  useEffect(() => {
    if (activeFile) {
      setSelectedLanguage(detectLanguage(activeFile.name));
      setShowCommitInput(false);
      setCommitMsg("");
      setActiveLineIndex(1);
    }
  }, [activeFile?.path]);

  // Update active line based on caret position
  const updateActiveLine = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorSel = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorSel);
    const lineNumber = textBeforeCursor.split("\n").length;
    setActiveLineIndex(lineNumber);
  };

  // Sync scroll positions
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (highlightContainerRef.current) {
      highlightContainerRef.current.style.transform = `translateY(${-scrollTop}px)`;
    }
  };

  // Handle key controls like Tab support & save keybinds
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      
      const tabSpaces = "  ";
      const newValue = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
      
      onContentChange(newValue);
      
      // Keep cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + tabSpaces.length;
        updateActiveLine();
      }, 0);
    }

    // Ctrl+S or Cmd+S to save/commit
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (activeFile?.isModified) {
        setShowCommitInput(true);
      }
    }
  };

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

  const lines = editorContent.split("\n");
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

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

      {/* Dual Overlay Editor Workspace (Scroll Synced Gutter + Textarea Overlay) */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-[12px] leading-[20px]">
        
        {/* 1. Gutter / Line Numbers Column with Highlighted Active Row */}
        <div 
          ref={gutterRef}
          className="w-12 text-right bg-zinc-950/40 select-none py-4 border-r border-zinc-900/40 font-mono overflow-hidden flex flex-col shrink-0 relative"
        >
          {lineNumbers.map((num) => {
            const isActive = num === activeLineIndex;
            return (
              <div 
                key={num} 
                className={`h-[20px] leading-[20px] pr-3.5 tracking-tighter text-[11px] font-mono select-none relative transition-colors duration-75 flex items-center justify-end ${
                  isActive ? "text-[#375a7f] font-bold" : "text-zinc-650 font-normal"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-y-0 right-0 w-[2px] bg-[#375a7f]" />
                )}
                <span>{num}</span>
              </div>
            );
          })}
        </div>

        {/* 2. Text Canvas Viewport containing Transparent Input overlaying Pre/Code and Active Row Highlight */}
        <div className="flex-1 relative overflow-hidden bg-zinc-950">
          
          {/* Active Row Highlight Backplate (Scroll-Aligned via translateX/translateY) */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
            <div ref={highlightContainerRef} className="relative w-full h-full">
              <div 
                className="absolute left-0 right-0 bg-[#375a7f]/5 border-y border-[#375a7f]/10 pointer-events-none flex items-center"
                style={{ 
                  top: `${16 + (activeLineIndex - 1) * 20}px`, 
                  height: '20px' 
                }}
              >
                <div className="w-[3px] h-full bg-[#375a7f] rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Syntax Highlighted Backdrop code */}
          <pre 
            ref={preRef}
            className="absolute inset-0 m-0 p-4 font-mono text-[12px] font-medium leading-[20px] text-zinc-300 pointer-events-none select-none overflow-auto whitespace-pre no-scrollbar z-10"
            dangerouslySetInnerHTML={{ 
              __html: highlightCode(editorContent, selectedLanguage) + "\n" 
            }}
          />

          {/* Interactive Text Input area (Transparent text, caret visible) */}
          <textarea
            ref={textareaRef}
            className="absolute inset-0 p-4 font-mono text-[12px] font-medium leading-[20px] text-transparent caret-[#375a7f] bg-transparent resize-none outline-none overflow-auto whitespace-pre z-20 w-full h-full"
            value={editorContent}
            onChange={(e) => {
              onContentChange(e.target.value);
              setTimeout(updateActiveLine, 0);
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onClick={updateActiveLine}
            onKeyUp={updateActiveLine}
            onFocus={updateActiveLine}
            placeholder="// Write code here..."
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

      </div>
    </div>
  );
}

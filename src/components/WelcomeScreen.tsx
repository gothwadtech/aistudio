import React from "react";
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  UploadCloud, 
  Settings, 
  ShieldCheck, 
  FileCode2,
  Lock,
  ExternalLink,
  Eye
} from "lucide-react";

interface WelcomeScreenProps {
  token: string | null;
  user: any;
  selectedRepo: any;
  selectedBranch: string;
  onSelectSection: (section: any) => void;
  onTriggerOAuth: () => void;
  onTogglePreview?: () => void;
  previewOpen?: boolean;
}

export default function WelcomeScreen({
  token,
  user,
  selectedRepo,
  selectedBranch,
  onSelectSection,
  onTriggerOAuth,
  onTogglePreview,
  previewOpen
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 bg-zinc-950 flex flex-col justify-center items-center p-6 sm:p-12 font-sans select-none overflow-y-auto no-scrollbar">
      <div className="max-w-xl w-full space-y-8 my-auto">
        
        {/* 1. Header Branded Title */}
        <div className="space-y-2.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-mono">
                Gothwad Ai Studio <span className="text-[#375a7f] text-xs font-semibold px-2 py-0.5 rounded-full bg-[#375a7f]/10 border border-[#375a7f]/15 uppercase font-sans tracking-widest">VS Code v1.2</span>
              </h1>
              <p className="text-zinc-500 text-xs font-mono mt-0.5">Desktop Git Sandbox Compiler & ZIP Sync workspace</p>
            </div>
          </div>
        </div>

        {/* 2. Active Session Hook details card */}
        {selectedRepo ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4" />
                Workstation Connected
              </span>
              <span className="text-[9px] font-mono text-zinc-500">HTTPS Safe TLS</span>
            </div>
            <p className="text-xs text-zinc-350 leading-relaxed font-mono">
              Active synchronizer hook with <strong className="text-zinc-200">@{selectedRepo.owner.login}/{selectedRepo.name}</strong> on branch <strong className="text-[#375a7f]">{selectedBranch}</strong>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onSelectSection("explorer")}
                className="bg-[#375a7f] hover:bg-[#375a7f]/90 text-white font-mono text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Browse Files</span>
              </button>
              <button
                onClick={() => onSelectSection("unpacker")}
                className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 font-mono text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>ZIP Unpacker</span>
              </button>
              {onTogglePreview && (
                <button
                  onClick={onTogglePreview}
                  className={`font-mono text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                    previewOpen 
                      ? "bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-500/30" 
                      : "bg-[#375a7f]/10 hover:bg-[#375a7f]/20 text-[#375a7f] border-[#375a7f]/20"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewOpen ? "Close Live Preview" : "Launch Live Preview"}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1.5 uppercase">
                <Lock className="w-3.5 h-3.5" />
                No Active Workspace
              </span>
              <span className="text-[9px] font-mono text-zinc-650">Idle State</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-mono">
              Please connect your secure credentials or choose an existing project repository from the file explorer tab to load active workspace files.
            </p>
            {token && (
              <button
                onClick={() => onSelectSection("explorer")}
                className="bg-[#375a7f]/15 hover:bg-[#375a7f]/25 text-[#375a7f] border border-[#375a7f]/20 font-mono text-[10px] font-bold px-4 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Choose Repository</span>
              </button>
            )}
          </div>
        )}

        {/* 3. VS Code styled grid Quick Start Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div 
            onClick={() => onSelectSection("explorer")}
            className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all cursor-pointer group"
          >
            <FolderGit2 className="w-5 h-5 text-[#375a7f] mb-2 group-hover:scale-105 transition-transform" />
            <h3 className="text-xs font-mono font-bold text-zinc-200">Start Workspace</h3>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-mono mt-1">
              Select or generate a repository to hotpatch source structures.
            </p>
          </div>

          <div 
            onClick={() => onSelectSection("unpacker")}
            className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all cursor-pointer group"
          >
            <UploadCloud className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-105 transition-transform" />
            <h3 className="text-xs font-mono font-bold text-zinc-200">ZIP Unpack & Sync</h3>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-mono mt-1">
              Directly upload client-side archives to merge into GitHub instantly.
            </p>
          </div>

          <div 
            onClick={() => onSelectSection("settings")}
            className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all cursor-pointer group"
          >
            <Settings className="w-5 h-5 text-zinc-500 mb-2 group-hover:rotate-45 transition-transform duration-300" />
            <h3 className="text-xs font-mono font-bold text-zinc-200">Configure Credentials</h3>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-mono mt-1">
              Update client credentials, personal access keys or OAuth scopes.
            </p>
          </div>

          <div 
            onClick={() => window.open("https://github.com/settings/tokens", "_blank")}
            className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all cursor-pointer group"
          >
            <ExternalLink className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-105 transition-transform" />
            <h3 className="text-xs font-mono font-bold text-zinc-200">Manage GitHub Tokens</h3>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-mono mt-1">
              Generate developer credentials inside GitHub user accounts.
            </p>
          </div>

        </div>

        {/* 4. Footer keyboard command status lines */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] font-mono text-zinc-650">
          <span>Gothwad Ai Studio Sandbox • v1.2.0 CJS Bundle</span>
          <div className="flex gap-3">
            <span>[Ctrl + S] Save File</span>
            <span>[F1] Help Console</span>
          </div>
        </div>

      </div>
    </div>
  );
}

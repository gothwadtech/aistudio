import React, { useState, useEffect } from "react";
import { 
  Github, 
  GitCommit, 
  UploadCloud, 
  ChevronDown, 
  ChevronRight 
} from "lucide-react";
import IntegrationsPanel from "../IntegrationsPanel";
import ZipUploader from "../ZipUploader";
import CommitHistory from "../projects/CommitHistory";
import { github } from "../../services/github";

interface SourceControlPanelProps {
  token: string | null;
  user: any;
  onLogout: () => void;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  authConfig: any;
  accentColor: string;
  selectedRepo: any;
  selectedBranch: string;
  activeFile: any;
  syncZipFiles: (files: { path: string; content: string }[]) => Promise<void>;
  isLoading: boolean;
  loadDirectory: (path: string) => Promise<any>;
  setActiveFile: (node: any) => void;
}

export default function SourceControlPanel({
  token,
  user,
  onLogout,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  authConfig,
  accentColor,
  selectedRepo,
  selectedBranch,
  activeFile,
  syncZipFiles,
  isLoading,
  loadDirectory,
  setActiveFile
}: SourceControlPanelProps) {
  const [showGitHubSection, setShowGitHubSection] = useState(false);
  const [showCommitSection, setShowCommitSection] = useState(true);
  const [showUnpackerSection, setShowUnpackerSection] = useState(false);
  const [showHistorySection, setShowHistorySection] = useState(true);

  // Local commits state
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);

  const fetchCommits = async () => {
    if (!selectedRepo) return;
    setIsLoadingCommits(true);
    setCommitsError(null);
    try {
      const data = await github.getCommits(selectedRepo.owner.login, selectedRepo.name, selectedBranch);
      setCommits(data || []);
    } catch (err: any) {
      setCommitsError(err.message || "Failed to fetch commit timeline");
    } finally {
      setIsLoadingCommits(false);
    }
  };

  useEffect(() => {
    if (selectedRepo) {
      fetchCommits();
    }
  }, [selectedRepo, selectedBranch]);

  const handleRollback = async (commitSha: string, commitMsg: string) => {
    if (!selectedRepo) return;
    setIsLoadingCommits(true);
    try {
      await github.restoreToCommit(
        selectedRepo.owner.login,
        selectedRepo.name,
        selectedBranch,
        commitSha
      );

      setActiveFile(null);
      await loadDirectory("");
      await fetchCommits();
      alert(`Repository restored to checkpoint: ${commitMsg}`);
    } catch (err: any) {
      alert(`Rollback failed: ${err.message || err}`);
      throw err;
    } finally {
      setIsLoadingCommits(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#375a7f]/5 border-b border-zinc-855 flex items-center gap-2">
          <Github className="w-4 h-4 text-[#375a7f]" style={{ color: accentColor }} />
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wide">Connect to GitHub</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <IntegrationsPanel
            mode="github"
            token={token}
            user={user}
            onLogout={onLogout}
            patInput={patInput}
            onPatInputChange={onPatInputChange}
            onPatSubmit={onPatSubmit}
            onTriggerOAuth={onTriggerOAuth}
            authConfig={authConfig}
            accentColor={accentColor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Accordion 0: GitHub Connection */}
      <div className="border-b border-zinc-850/50">
        <button
          onClick={() => setShowGitHubSection(!showGitHubSection)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            {showGitHubSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            GitHub Connection
          </span>
          <Github className="w-3.5 h-3.5 text-zinc-650" />
        </button>

        {showGitHubSection && (
          <div className="p-1 bg-zinc-950/10 animate-[fadeIn_0.15s_ease-out]">
            <IntegrationsPanel
              mode="github"
              token={token}
              user={user}
              onLogout={onLogout}
              patInput={patInput}
              onPatInputChange={onPatInputChange}
              onPatSubmit={onPatSubmit}
              onTriggerOAuth={onTriggerOAuth}
              authConfig={authConfig}
              accentColor={accentColor}
            />
          </div>
        )}
      </div>
      
      {/* ACCORDION 1: Active Diffs & Commit Message Submission */}
      <div className="border-b border-zinc-850/50">
        <button
          onClick={() => setShowCommitSection(!showCommitSection)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            {showCommitSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Git Commit
          </span>
          <GitCommit className="w-3.5 h-3.5 text-zinc-650" />
        </button>

        {showCommitSection && (
          <div className="p-3 bg-zinc-950/40 space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
            {activeFile?.isModified ? (
              <div className="p-2 border border-amber-950/40 bg-amber-950/5 rounded-lg flex items-center justify-between gap-1.5">
                <div className="truncate pr-1">
                  <p className="text-[10px] font-mono font-bold text-amber-500 truncate">Edited: {activeFile.name}</p>
                  <p className="text-[8.5px] font-mono text-zinc-550 truncate">src/{activeFile.path}</p>
                </div>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
              </div>
            ) : (
              <div className="p-2.5 bg-zinc-900/30 border border-zinc-950/45 text-center text-zinc-600 text-[9.5px] font-mono leading-relaxed">
                Workspace clean. Edit records in the editor workspace area to stage Git updates.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACCORDION 1.5: ZIP Unpacker / Merge Payload Engine */}
      <div className="border-b border-zinc-850/50">
        <button
          onClick={() => setShowUnpackerSection(!showUnpackerSection)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            {showUnpackerSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            ZIP Unpacker
          </span>
          <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {showUnpackerSection && (
          <div className="p-3 bg-zinc-950/40 space-y-3 animate-[fadeIn_0.15s_ease-out]">
            <div className="bg-indigo-950/10 border border-indigo-900/20 p-2.5 rounded-lg">
              <h4 className="text-indigo-400 font-mono text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                Merge Payload Engine
              </h4>
              <p className="text-zinc-550 text-[8.5px] font-mono leading-relaxed mt-1">
                Drag & drop package ZIP files directly to inflate and stage changes.
              </p>
            </div>

            {selectedRepo ? (
              <ZipUploader onSyncFiles={syncZipFiles} isLoading={isLoading} />
            ) : (
              <div className="bg-zinc-950/40 p-2.5 border border-zinc-850 text-center text-zinc-650 text-[9px] font-mono rounded-lg leading-normal">
                ⚠️ Selection required. Hook a target repository first to unpack zip buffers.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACCORDION 2: Commit History / Timelines & Checkpoint Restores */}
      <div className="border-b border-zinc-850/50">
        <button
          onClick={() => setShowHistorySection(!showHistorySection)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            {showHistorySection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            History Checkpoints
          </span>
          <GitCommit className="w-3.5 h-3.5 text-zinc-650" />
        </button>

        {showHistorySection && (
          <div className="p-2 bg-zinc-950/10 animate-[fadeIn_0.15s_ease-out]">
            {selectedRepo ? (
              <CommitHistory
                commits={commits}
                isLoadingCommits={isLoadingCommits}
                onRollback={handleRollback}
              />
            ) : (
              <div className="p-4 text-center text-[9.5px] font-mono text-zinc-600">
                Please hook a repository first to browse past commit checkpoints.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

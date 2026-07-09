import React, { useState, useEffect } from "react";
import { 
  FolderTree, 
  HelpCircle, 
  AlertCircle, 
  ArrowLeft,
  BookOpen,
  GitBranch,
  ShieldCheck,
  FileCode,
  History,
  Loader2,
  X,
  AlertTriangle
} from "lucide-react";
import FileTree from "../FileTree";
import AuthPanel from "../AuthPanel";
import CommitHistory from "./CommitHistory";
import { github } from "../../services/github";

interface ProjectsScreenProps {
  token: string | null;
  selectedRepo: any;
  selectedBranch: string;
  fileSystemTree: any[];
  onToggleDir: (path: string) => void;
  onSelectFile: (node: any) => void;
  activeFile: any;
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  authConfig: { clientId: string; appUrl: string } | null;
  setActiveTab: (tab: any) => void;
  loadDirectory: (path: string) => Promise<any>;
  setActiveFile: (node: any) => void;
}

export default function ProjectsScreen({
  token,
  selectedRepo,
  selectedBranch,
  fileSystemTree,
  onToggleDir,
  onSelectFile,
  activeFile,
  isLoading: isGlobalLoading,
  error: globalError,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  authConfig,
  setActiveTab,
  loadDirectory,
  setActiveFile
}: ProjectsScreenProps) {
  const [viewMode, setViewMode] = useState<"explorer" | "history">("explorer");
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);

  // File Deletion Modal States
  const [deleteTargetNode, setDeleteTargetNode] = useState<any | null>(null);
  const [deleteCommitMsg, setDeleteCommitMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch commits dynamically on repository or branch change, or when toggling view mode
  const fetchCommits = async () => {
    if (!selectedRepo) return;
    setIsLoadingCommits(true);
    setCommitsError(null);
    try {
      const data = await github.getCommits(selectedRepo.owner.login, selectedRepo.name, selectedBranch);
      setCommits(data || []);
    } catch (err: any) {
      setCommitsError(err.message || "Failed to fetch commit history");
    } finally {
      setIsLoadingCommits(false);
    }
  };

  useEffect(() => {
    if (viewMode === "history" && selectedRepo) {
      fetchCommits();
    }
  }, [viewMode, selectedRepo, selectedBranch]);

  // Handle individual file deletion modal opener
  const handleOpenDeleteModal = (node: any) => {
    setDeleteTargetNode(node);
    setDeleteCommitMsg(`Delete file: ${node.path}`);
  };

  // Perform actual deletion
  const handleConfirmDelete = async () => {
    if (!selectedRepo || !deleteTargetNode) return;
    setIsDeleting(true);
    try {
      let actualSha = deleteTargetNode.sha || "";
      try {
        const freshDetails = await github.getFileBlob(
          selectedRepo.owner.login,
          selectedRepo.name,
          deleteTargetNode.path,
          selectedBranch
        );
        if (freshDetails && freshDetails.sha) {
          actualSha = freshDetails.sha;
        }
      } catch (e) {
        console.warn("[handleConfirmDelete] Failed to fetch fresh SHA, using node SHA:", e);
      }

      await github.deleteFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        deleteTargetNode.path,
        deleteCommitMsg || `Delete ${deleteTargetNode.name}`,
        actualSha,
        selectedBranch
      );

      if (activeFile && activeFile.path === deleteTargetNode.path) {
        setActiveFile(null);
      }

      setDeleteTargetNode(null);
      // Reload tree
      await loadDirectory("");
    } catch (err: any) {
      alert(`Deletion failed: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Rollback branch HEAD to a previous commit SHA
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
      setViewMode("explorer");
    } catch (err: any) {
      alert(`Rollback failed: ${err.message || err}`);
      throw err;
    } finally {
      setIsLoadingCommits(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-2xl mx-auto w-full font-sans">
      {!token ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-xl text-center">
            <h3 className="text-zinc-150 font-mono text-xs font-bold uppercase tracking-wider">Explorer Workspace Locked</h3>
            <p className="text-zinc-500 text-[10.5px] font-mono mt-1 leading-normal">
              Connect your secure GitHub session keys below to inspect and browse codebase trees.
            </p>
          </div>
          <AuthPanel
            authConfig={authConfig}
            error={globalError}
            isLoading={isGlobalLoading}
            patInput={patInput}
            onPatInputChange={onPatInputChange}
            onPatSubmit={onPatSubmit}
            onTriggerOAuth={onTriggerOAuth}
          />
        </div>
      ) : (
        <>
          <div className="bg-[var(--box-bg)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#375a7f]" />
              <div>
                <h2 className="text-[var(--text-primary)] font-bold text-xs font-mono uppercase tracking-wider">Code Explorer</h2>
                <p className="text-zinc-500 text-[9.5px] font-mono mt-0.5">Explore files and restore past commit checkpoints</p>
              </div>
            </div>
            
            {selectedRepo && (
              <div className="flex items-center gap-1 bg-[#375a7f]/10 text-[#375a7f] text-[9px] px-2 py-0.5 rounded-full border border-[#375a7f]/15 font-mono">
                <GitBranch className="w-2.5 h-2.5" />
                <span>{selectedBranch}</span>
              </div>
            )}
          </div>

          {(globalError || commitsError) && (
            <div className="bg-rose-950/20 border border-rose-900/35 p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-rose-400 leading-normal">{globalError || commitsError}</p>
            </div>
          )}

          {!selectedRepo ? (
            <div className="bg-[var(--box-bg)]/50 border border-[var(--border-color)] rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-zinc-900/35 border border-zinc-850 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[var(--text-primary)] font-bold font-mono text-xs">No Repository Hooked</h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed max-w-sm mx-auto">
                  To load code documents, select your desired workspace directory on the Home screen.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#375a7f] hover:text-[#375a7f]/80 py-1 px-3 border border-[#375a7f]/20 rounded-lg bg-[#375a7f]/5 hover:bg-[#375a7f]/10 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose Repository</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 border border-[var(--border-color)] rounded-xl">
                <button
                  onClick={() => setViewMode("explorer")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                    viewMode === "explorer"
                      ? "bg-zinc-850 text-zinc-100 shadow"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>File System</span>
                </button>
                <button
                  onClick={() => setViewMode("history")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                    viewMode === "history"
                      ? "bg-zinc-850 text-zinc-100 shadow"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Commit Checkpoints</span>
                </button>
              </div>

              {viewMode === "explorer" ? (
                <div className="bg-[var(--box-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm min-h-[300px]">
                  {isGlobalLoading || isLoadingCommits ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3">
                      <Loader2 className="w-6 h-6 text-[#375a7f] animate-spin" />
                      <p className="text-[10px] font-mono text-zinc-500">Syncing files with GitHub...</p>
                    </div>
                  ) : fileSystemTree && fileSystemTree.length > 0 ? (
                    <div className="pb-4">
                      <FileTree
                        tree={fileSystemTree}
                        onToggleDir={onToggleDir}
                        onSelectFile={onSelectFile}
                        activeFile={activeFile}
                        onDeleteFile={handleOpenDeleteModal}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <span className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold text-[var(--text-primary)]">Syncing Core Tree...</p>
                        <p className="text-[9.5px] font-mono text-zinc-500">Resolving tree structure logs from GitHub API</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CommitHistory
                  commits={commits}
                  isLoadingCommits={isLoadingCommits}
                  onRollback={handleRollback}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Reusable state-based HTML File Deletion Confirmation Modal Overlay */}
      {deleteTargetNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[zoomIn_0.15s_ease-out] p-5 space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wide">Delete Repository File</h3>
              </div>
              <button 
                onClick={() => setDeleteTargetNode(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[11px] font-mono leading-relaxed text-zinc-300">
              <p>
                Are you absolutely sure you want to permanently delete the file <strong className="text-rose-400 break-all bg-zinc-950 px-1.5 py-0.5 border border-zinc-850 rounded">{deleteTargetNode.name}</strong> from your GitHub repository?
              </p>
              
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-zinc-500 font-bold block">Commit Message</label>
                <input
                  type="text"
                  placeholder="e.g. Delete file"
                  value={deleteCommitMsg}
                  onChange={(e) => setDeleteCommitMsg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTargetNode(null)}
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete File</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="pt-2 flex items-center justify-center gap-4 text-zinc-600 font-mono text-[9px]">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Encrypted Vault</span>
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Sandboxed Files</span>
      </div>
    </div>
  );
}

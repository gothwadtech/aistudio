import React, { useState, useRef } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  FilePlus, 
  FolderPlus, 
  RefreshCw, 
  Loader2, 
  BookOpen, 
  AlertTriangle, 
  X,
  Github
} from "lucide-react";
import FileTree from "../FileTree";
import CreateRepoForm from "../home/CreateRepoForm";
import { github } from "../../services/github";

interface ExplorerPanelProps {
  token: string | null;
  repos: any[];
  selectedRepo: any;
  branches: any[];
  selectedBranch: string;
  fileSystemTree: any[];
  activeFile: any;
  isLoading: boolean;
  accentColor: string;
  onSelectRepo: (repo: any) => void;
  onSelectBranch: (branch: string) => void;
  onToggleDir: (path: string) => void;
  onSelectFile: (node: any) => void;
  setActiveFile: (node: any) => void;
  loadDirectory: (path: string) => Promise<any>;
  refreshRepos: () => Promise<void>;
  onSelectSection?: (section: any) => void;
}

export default function ExplorerPanel({
  token,
  repos = [],
  selectedRepo,
  branches = [],
  selectedBranch,
  fileSystemTree,
  activeFile,
  isLoading,
  accentColor,
  onSelectRepo,
  onSelectBranch,
  onToggleDir,
  onSelectFile,
  setActiveFile,
  loadDirectory,
  refreshRepos,
  onSelectSection
}: ExplorerPanelProps) {
  const [showWorkspaceSection, setShowWorkspaceSection] = useState(true);
  const [showFilesSection, setShowFilesSection] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");

  const fileTreeRef = useRef<any>(null);

  // Deletion Modal state
  const [deleteTargetNode, setDeleteTargetNode] = useState<any | null>(null);
  const [deleteCommitMsg, setDeleteCommitMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Repository Purging state
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeCommitMsg, setPurgeCommitMsg] = useState("Purge all files in repository");
  const [isPurging, setIsPurging] = useState(false);

  // Filter repos
  const filteredRepos = repos ? repos.filter(r => 
    r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase()))
  ) : [];

  const handleCreatedRepository = async (created: any) => {
    setShowCreateForm(false);
    await refreshRepos();
    onSelectRepo(created);
  };

  const handleDeleteRepository = async () => {
    if (!selectedRepo) return;
    const confirmName = prompt(`To delete this repository permanently from GitHub, type its name: "${selectedRepo.name}"`);
    if (confirmName === selectedRepo.name) {
      setIsDeleting(true);
      try {
        await github.deleteRepository(selectedRepo.owner.login, selectedRepo.name);
        onSelectRepo(null);
        await refreshRepos();
        alert("Repository deleted successfully.");
      } catch (e: any) {
        alert(`Deletion failed: ${e.message || e}`);
      } finally {
        setIsDeleting(false);
      }
    } else if (confirmName !== null) {
      alert("Name verification failed. Repository was not deleted.");
    }
  };

  const handleOpenDeleteModal = (node: any) => {
    setDeleteTargetNode(node);
    setDeleteCommitMsg(`Delete file: ${node.path}`);
  };

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
      await loadDirectory("");
    } catch (err: any) {
      alert(`Deletion failed: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmPurge = async () => {
    if (!selectedRepo) return;
    setIsPurging(true);
    try {
      const owner = selectedRepo.owner.login;
      const repoName = selectedRepo.name;
      const branch = selectedBranch;
      const commitMessage = purgeCommitMsg || "Purge all files in repository";

      // Fetch all files recursively
      const allFiles: { path: string; sha: string }[] = [];
      const getFilesRecursive = async (path: string) => {
        const items = await github.getRepositoryContents(owner, repoName, path, branch);
        for (const item of items) {
          if (item.type === "dir") {
            await getFilesRecursive(item.path);
          } else if (item.type === "file") {
            allFiles.push({ path: item.path, sha: item.sha });
          }
        }
      };

      await getFilesRecursive("");

      if (allFiles.length === 0) {
        alert("The repository is already empty!");
        setShowPurgeModal(false);
        return;
      }

      // Delete each file
      for (const file of allFiles) {
        await github.deleteFile(
          owner,
          repoName,
          file.path,
          commitMessage,
          file.sha,
          branch
        );
      }

      if (activeFile) {
        setActiveFile(null);
      }
      setShowPurgeModal(false);
      await loadDirectory("");
      alert("All files have been successfully deleted from the repository!");
    } catch (err: any) {
      alert(`Purge failed: ${err.message || err}`);
    } finally {
      setIsPurging(false);
    }
  };

  const renderConnectionPrompt = (tabName: string) => (
    <div className="flex-1 p-4 flex flex-col justify-center items-center text-center space-y-4 no-scrollbar">
      <div className="bg-[#375a7f]/5 border border-[#375a7f]/15 rounded-xl p-4 max-w-xs space-y-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-[#375a7f]/10 flex items-center justify-center mx-auto text-[#375a7f]">
          <Github className="w-5 h-5 animate-pulse" />
        </div>
        <h3 className="text-zinc-200 text-[10.5px] font-bold font-mono uppercase tracking-wider">{tabName} Offline</h3>
        <p className="text-zinc-500 text-[9.5px] font-mono leading-relaxed">
          Gothwad Ai Studio requires an authorized connection to GitHub to browse repositories, explore files, or stage ZIP modifications in {tabName}.
        </p>
        <button
          onClick={() => onSelectSection?.("github")}
          className="w-full bg-[#375a7f] hover:bg-[#375a7f]/95 text-white py-1.5 px-3 rounded font-bold font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          Connect GitHub
        </button>
      </div>
    </div>
  );

  if (!token) {
    return renderConnectionPrompt("Explorer");
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* ACCORDION 1: Workspace Selection */}
      <div className="border-b border-zinc-850/50 shrink-0">
        <button
          onClick={() => setShowWorkspaceSection(!showWorkspaceSection)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 focus:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            {showWorkspaceSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Repositories
          </span>
          <Database className="w-3.5 h-3.5 text-zinc-650" />
        </button>

        {showWorkspaceSection && (
          <div className="p-3 bg-zinc-950/40 space-y-3 border-t border-zinc-850/35 animate-[fadeIn_0.15s_ease-out]">
            
            {/* Repository search filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search workspace repos..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-[10.5px] font-mono text-zinc-300 rounded-lg pl-3 pr-8 py-1.5 placeholder-zinc-700 outline-none focus:border-[#375a7f] transition-colors"
                style={{ fontFamily: "inherit" }}
              />
              <Search className="w-3 h-3 text-zinc-650 absolute right-2.5 top-2.5" />
            </div>

            {/* Repository selection dropdown */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 font-bold block">ACTIVE REPOSITORY</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] font-mono text-zinc-300 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-[#375a7f]"
                value={selectedRepo?.id || ""}
                onChange={(e) => {
                  const repo = repos.find(r => r.id === Number(e.target.value));
                  if (repo) onSelectRepo(repo);
                }}
              >
                <option value="" disabled>-- Select workspace --</option>
                {filteredRepos.map(repo => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active branch selector */}
            {selectedRepo && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 font-bold block">ACTIVE BRANCH</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-850 text-[11px] font-mono text-zinc-300 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-[#375a7f]"
                  value={selectedBranch}
                  onChange={(e) => onSelectBranch(e.target.value)}
                >
                  {branches.map(branch => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Repository Utilities Row */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex-1 bg-[#375a7f]/15 hover:bg-[#375a7f] text-[#375a7f] hover:text-white border border-[#375a7f]/20 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                style={{ color: accentColor, borderColor: `${accentColor}30` }}
              >
                <Plus className="w-3 h-3" />
                <span>New Repo</span>
              </button>

              {selectedRepo && (
                <button
                  onClick={handleDeleteRepository}
                  className="px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Delete current repository from GitHub"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showCreateForm && (
              <div className="pt-2">
                <CreateRepoForm
                  onCreated={handleCreatedRepository}
                  onCancel={() => setShowCreateForm(false)}
                  refreshRepos={refreshRepos}
                />
              </div>
            )}

          </div>
        )}
      </div>

      {/* ACCORDION 2: Hierarchical directory file tree explorer */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-850/50">
        <div className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-400 shrink-0">
          <button
            onClick={() => setShowFilesSection(!showFilesSection)}
            className="flex items-center gap-1.5 uppercase tracking-wide hover:text-zinc-200 focus:outline-none cursor-pointer text-left"
          >
            {showFilesSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Workspace Files
          </button>

          {/* VS Code like header action toolbar */}
          {selectedRepo && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => fileTreeRef.current?.triggerRootCreate("file")}
                className="p-1 hover:bg-zinc-800 text-zinc-550 hover:text-sky-400 rounded transition-colors"
                title="New File at Root"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileTreeRef.current?.triggerRootCreate("dir")}
                className="p-1 hover:bg-zinc-800 text-zinc-550 hover:text-amber-400 rounded transition-colors"
                title="New Folder at Root"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setShowPurgeModal(true);
                  setPurgeCommitMsg("Purge all files in repository");
                }}
                className="p-1 hover:bg-zinc-800 text-zinc-550 hover:text-red-400 rounded transition-colors"
                title="Purge / Clean All Repository Files"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={async () => {
                  if (selectedRepo) {
                    await loadDirectory("");
                  }
                }}
                className={`p-1 hover:bg-zinc-800 text-zinc-550 hover:text-zinc-200 rounded transition-colors ${isLoading ? 'animate-spin' : ''}`}
                title="Refresh Repository"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {showFilesSection && (
          <div className="flex-1 min-h-0 bg-zinc-950/20 animate-[fadeIn_0.15s_ease-out] flex flex-col">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 shrink-0">
                <Loader2 className="w-4 h-4 text-[#375a7f] animate-spin" style={{ color: accentColor }} />
                <span className="text-[9px] font-mono text-zinc-600">Resolving tree logs...</span>
              </div>
            ) : selectedRepo ? (
              <div className="flex-1 min-h-0 w-full">
                <FileTree
                  ref={fileTreeRef}
                  tree={fileSystemTree}
                  onToggleDir={onToggleDir}
                  onSelectFile={onSelectFile}
                  activeFile={activeFile}
                  onDeleteFile={handleOpenDeleteModal}
                />
              </div>
            ) : (
              <div className="p-4 text-center space-y-1 shrink-0">
                <BookOpen className="w-4 h-4 text-zinc-700 mx-auto" />
                <p className="text-[9.5px] font-mono text-zinc-600">No active workspace directory loaded.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STATE-BASED DELETION MODAL */}
      {deleteTargetNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-[zoomIn_0.15s_ease-out] p-5 space-y-4">
            
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-mono"
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

      {/* REPOSITORY PURGING / CLEANING MODAL */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-[zoomIn_0.15s_ease-out] p-5 space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wide">Purge Repository</h3>
              </div>
              <button 
                disabled={isPurging}
                onClick={() => setShowPurgeModal(false)}
                className="text-zinc-555 hover:text-zinc-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[11px] font-mono leading-relaxed text-zinc-300">
              <p className="text-zinc-400">
                This action will completely empty the repository <strong className="text-white">@{selectedRepo?.owner?.login}/{selectedRepo?.name}</strong>.
              </p>
              <p className="text-rose-400 font-bold">
                WARNING: This will permanently delete ALL files and folders. This action cannot be undone!
              </p>
              
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-zinc-500 font-bold block">Commit Message for Purge</label>
                <input
                  type="text"
                  disabled={isPurging}
                  placeholder="e.g. Purge all files in repository"
                  value={purgeCommitMsg}
                  onChange={(e) => setPurgeCommitMsg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setShowPurgeModal(false)}
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-mono cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleConfirmPurge}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <span>Purge & Commit</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

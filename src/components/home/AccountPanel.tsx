import React, { useState } from "react";
import { 
  UserCheck, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Loader2,
  X 
} from "lucide-react";

interface AccountPanelProps {
  user: { login: string; avatar_url: string; name?: string; html_url?: string } | null;
  reposCount: number;
  selectedRepo: any;
  selectedBranch: string;
  onLogout: () => void;
  onDeleteRepo: () => Promise<void>;
  setActiveTab: (tab: any) => void;
}

export default function AccountPanel({
  user,
  reposCount,
  selectedRepo,
  selectedBranch,
  onLogout,
  onDeleteRepo,
  setActiveTab
}: AccountPanelProps) {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenDelete = () => {
    setConfirmInput("");
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) return;
    
    if (confirmInput !== selectedRepo.name) {
      setDeleteError("Verification failed: The name you entered does not match.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteRepo();
      setShowDeleteConfirm(false);
      setShowDangerZone(false);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete repository.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Profile Panel */}
      <div className="bg-[var(--box-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url}
            alt={user?.login || "User profile"}
            className="w-14 h-14 rounded-2xl border border-[var(--border-color)] shadow-sm shrink-0"
          />
          <div className="space-y-1.5 truncate flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[var(--text-primary)] font-bold font-mono text-xs tracking-tight truncate">
                @{user?.login}
              </h3>
              <div className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                <UserCheck className="w-2 h-2" />
                <span>ONLINE</span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] font-mono text-[10px] truncate">
              {user?.name || "GitHub Developer"}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Disconnect Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--text-secondary)]">
          <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] p-2.5 rounded-xl">
            <p className="text-zinc-500 uppercase text-[8px] font-bold">Repositories</p>
            <p className="text-[var(--text-primary)] text-xs font-bold mt-0.5">{reposCount}</p>
          </div>
          <div className="bg-[var(--bg-main)]/50 border border-[var(--border-color)] p-2.5 rounded-xl">
            <p className="text-zinc-500 uppercase text-[8px] font-bold">Status Code</p>
            <p className="text-emerald-500 text-xs font-bold mt-0.5 uppercase">STABLE</p>
          </div>
        </div>
      </div>

      {/* 2. Workspace Status Hook */}
      {selectedRepo && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl space-y-3 text-emerald-400 font-mono text-[10.5px]">
          <h4 className="font-bold flex items-center gap-1.5 text-emerald-500">
            <ShieldCheck className="w-3.5 h-3.5" /> Workspace Connected
          </h4>
          <p className="text-[10px] leading-relaxed text-[var(--text-secondary)]">
            Active sync with <strong className="text-emerald-500">@{selectedRepo.owner.login}/{selectedRepo.name}</strong> on branch <strong className="text-emerald-500">{selectedBranch}</strong>.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("projects")}
              className="flex-1 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white font-mono font-bold text-[10.5px] py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Manage Workspace</span>
            </button>

            <button
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="px-3 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/15 font-mono font-bold text-[10.5px] rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
          </div>

          {showDangerZone && (
            <div className="mt-2 pt-3 border-t border-red-955/20 space-y-2 text-zinc-400 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>CRITICAL REPOSITORY DELETION</span>
              </div>
              <p className="text-[9.5px] text-zinc-500 leading-normal">
                This completely deletes <strong>{selectedRepo.name}</strong> from GitHub. There is no recovery option.
              </p>
              <button
                onClick={handleOpenDelete}
                className="w-full bg-red-950/20 hover:bg-red-900/35 border border-red-900/40 text-red-400 font-mono font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedRepo.name}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reusable state-based HTML Repository Deletion Modal Overlay */}
      {showDeleteConfirm && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_0.15s_ease-out]">
          <form 
            onSubmit={handleConfirmDeleteSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[zoomIn_0.15s_ease-out] p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wide">Danger Zone: Delete Repo</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-950/20 border border-rose-900/35 rounded-xl text-[10px] font-mono text-rose-400">
                {deleteError}
              </div>
            )}

            <div className="space-y-3 text-[11px] font-mono leading-relaxed text-zinc-350">
              <p>
                This action is <strong className="text-rose-400">irreversible</strong>. This will permanently destroy the repository <strong className="text-white">@{selectedRepo.owner.login}/{selectedRepo.name}</strong>, including all files, releases, and commit checkpoints on GitHub.
              </p>
              
              <div className="space-y-1.5 bg-zinc-950 p-2.5 border border-zinc-850 rounded-xl">
                <p className="text-zinc-500 text-[10px] font-bold uppercase">To verify, type the repository name below:</p>
                <p className="text-zinc-300 font-bold select-all text-xs">"{selectedRepo.name}"</p>
              </div>

              <div className="space-y-1 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Enter name to confirm"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

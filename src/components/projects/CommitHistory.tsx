import React, { useState } from "react";
import { 
  Search, 
  Loader2, 
  User, 
  Calendar, 
  RotateCcw, 
  AlertTriangle, 
  X 
} from "lucide-react";

interface CommitHistoryProps {
  commits: any[];
  isLoadingCommits: boolean;
  onRollback: (sha: string, msg: string) => Promise<void>;
}

export default function CommitHistory({
  commits = [],
  isLoadingCommits,
  onRollback
}: CommitHistoryProps) {
  const [commitSearch, setCommitSearch] = useState("");
  const [selectedCommit, setSelectedCommit] = useState<{ sha: string; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter commits based on search query
  const filteredCommits = commits.filter(c => {
    const msg = c.commit?.message?.toLowerCase() || "";
    const author = c.commit?.author?.name?.toLowerCase() || "";
    const sha = c.sha?.toLowerCase() || "";
    const search = commitSearch.toLowerCase();
    return msg.includes(search) || author.includes(search) || sha.includes(search);
  });

  const handleOpenRestoreConfirm = (sha: string, message: string) => {
    setSelectedCommit({ sha, message });
  };

  const handleConfirmRestore = async () => {
    if (!selectedCommit) return;
    setIsProcessing(true);
    try {
      await onRollback(selectedCommit.sha, selectedCommit.message);
      setSelectedCommit(null);
    } catch (e) {
      // errors are handled in parent
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[var(--box-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm min-h-[350px] space-y-4 font-sans">
      {/* 1. Commit Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search commits by message, SHA, or author..."
          value={commitSearch}
          onChange={(e) => setCommitSearch(e.target.value)}
          className="w-full bg-zinc-950 border border-[var(--border-color)] pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
        />
      </div>

      {/* 2. Commit List */}
      {isLoadingCommits ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-6 h-6 text-[#375a7f] animate-spin" />
          <p className="text-[10px] font-mono text-zinc-500">Retrieving commit checkpoints...</p>
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="py-16 text-center text-zinc-600 font-mono text-[10.5px]">
          No commit checkpoints found matching your search.
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
          {filteredCommits.map((c) => {
            const shaShort = c.sha?.substring(0, 7) || "";
            const message = c.commit?.message || "No message";
            const authorName = c.commit?.author?.name || "Unknown";
            const authorLogin = c.author?.login;
            const authorAvatar = c.author?.avatar_url;
            const date = c.commit?.author?.date 
              ? new Date(c.commit.author.date).toLocaleString() 
              : "Unknown time";

            return (
              <div 
                key={c.sha} 
                className="p-3 border border-zinc-850 bg-zinc-950/40 rounded-xl hover:border-zinc-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <p className="text-zinc-200 font-mono text-xs font-semibold leading-relaxed break-words">
                    {message}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-zinc-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      {authorAvatar ? (
                        <img 
                          src={authorAvatar} 
                          alt={authorName} 
                          className="w-3.5 h-3.5 rounded-full border border-zinc-800" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-3 h-3 text-zinc-600" />
                      )}
                      <span className="text-zinc-400 font-bold">{authorLogin || authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      <span>{date}</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-[9.5px] text-zinc-400 font-bold select-all">
                      {shaShort}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRestoreConfirm(c.sha, message)}
                  className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-[#375a7f]/10 hover:bg-[#375a7f] text-[#375a7f] hover:text-white border border-[#375a7f]/20 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer"
                  title="Restore whole repository to this point in time"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom HTML/CSS-Based Checkpoint Restore Confirmation Dialog Modal Overlay */}
      {selectedCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[zoomIn_0.15s_ease-out] p-5 space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wide">Confirm Git Rollback</h3>
              </div>
              <button 
                onClick={() => setSelectedCommit(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-[11px] leading-relaxed text-zinc-300">
              <p>
                Are you absolutely sure you want to restore the entire repository state back to commit:
              </p>
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-zinc-200 text-xs font-semibold break-words">
                "{selectedCommit.message}"
              </div>
              <p className="text-amber-500/90 font-semibold flex items-start gap-1">
                <span>⚠️</span>
                <span>
                  This will force-push the active branch pointer back to commit <strong className="bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800 text-zinc-100">{selectedCommit.sha.substring(0, 7)}</strong>. All newer file modifications will be instantly reverted on GitHub!
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedCommit(null)}
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white font-mono font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Restore Checkpoint</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

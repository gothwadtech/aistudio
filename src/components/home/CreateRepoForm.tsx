import React, { useState } from "react";
import { FolderGit2, Loader2, Lock, Unlock } from "lucide-react";
import { github } from "../../services/github";

interface CreateRepoFormProps {
  onCreated: (repo: any) => void;
  onCancel: () => void;
  refreshRepos: () => Promise<void>;
}

export default function CreateRepoForm({
  onCreated,
  onCancel,
  refreshRepos
}: CreateRepoFormProps) {
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Sanitizes repo names on the fly
  const handleNameChange = (val: string) => {
    // Convert spaces to dashes, strip special characters, make lowercase
    const sanitized = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    setNewRepoName(sanitized);
  };

  const handleCreateRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) {
      setCreateError("Repository name must not be blank.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await github.createRepository(
        newRepoName.trim(),
        newRepoDesc.trim(),
        newRepoPrivate
      );

      // Reset form
      setNewRepoName("");
      setNewRepoDesc("");
      setNewRepoPrivate(false);

      // Refresh list
      await refreshRepos();

      // Callback
      onCreated(created);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create repository");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form 
      onSubmit={handleCreateRepoSubmit} 
      className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-3 animate-[fadeIn_0.2s_ease-out] font-sans"
    >
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1">
          <FolderGit2 className="w-3.5 h-3.5 text-[#375a7f]" />
          Create New GitHub Repository
        </span>
        <span className="text-[9px] font-mono text-zinc-500">Auto-initialized</span>
      </div>

      {createError && (
        <div className="p-2.5 bg-rose-950/20 border border-rose-900/35 rounded-xl text-[10px] font-mono text-rose-400">
          {createError}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] font-mono text-zinc-400 font-bold block">Repo Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. awesome-grix-project"
          value={newRepoName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full bg-[var(--box-bg)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
        />
        <p className="text-[9px] font-mono text-zinc-500">
          Spaces turn to dashes. Allowed characters: lowercase a-z, 0-9, dash, and underscore.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-mono text-zinc-400 block">Description (Optional)</label>
        <input
          type="text"
          placeholder="A short description of your new workspace project..."
          value={newRepoDesc}
          onChange={(e) => setNewRepoDesc(e.target.value)}
          className="w-full bg-[var(--box-bg)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
        />
      </div>

      <div className="flex items-center justify-between bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2">
          {newRepoPrivate ? (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <div>
            <p className="text-[10px] font-mono font-bold text-zinc-300">Visibility Status</p>
            <p className="text-[9px] text-zinc-500 font-mono">
              {newRepoPrivate ? "Private: Accessible only by you" : "Public: Visibly discoverable on GitHub"}
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={newRepoPrivate}
          onChange={(e) => setNewRepoPrivate(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#375a7f] focus:ring-[#375a7f]"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-zinc-850 text-zinc-500 hover:text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="px-4 py-1.5 bg-[#375a7f] hover:bg-[#375a7f]/90 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-all"
        >
          {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Create Workspace</span>
        </button>
      </div>
    </form>
  );
}

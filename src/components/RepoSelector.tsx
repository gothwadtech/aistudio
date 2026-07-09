import { GitHubRepo, GitHubBranch } from "../types/github";
import { FolderGit2, GitBranch, LogOut, Check } from "lucide-react";

interface RepoSelectorProps {
  repos: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  onSelectRepo: (repo: GitHubRepo) => void;
  branches: GitHubBranch[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  onLogout: () => void;
  user: { login: string; avatar_url: string } | null;
}

export default function RepoSelector({
  repos,
  selectedRepo,
  onSelectRepo,
  branches,
  selectedBranch,
  onSelectBranch,
  onLogout,
  user
}: RepoSelectorProps) {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-zinc-800 text-zinc-100 p-2 rounded-lg border border-zinc-700 font-mono text-sm tracking-widest font-bold">
          Gothwad Ai Studio
        </div>
        
        {/* Repo Select */}
        <div className="relative">
          <select
            className="bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-sm outline-none focus:border-zinc-500 cursor-pointer appearance-none pr-8 font-mono"
            value={selectedRepo?.id || ""}
            onChange={(e) => {
              const repo = repos.find(r => r.id === Number(e.target.value));
              if (repo) onSelectRepo(repo);
            }}
          >
            <option value="" disabled>Select Repository</option>
            {repos.map(repo => (
              <option key={repo.id} value={repo.id}>
                {repo.owner.login}/{repo.name}
              </option>
            ))}
          </select>
          <FolderGit2 className="absolute right-2 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>

        {/* Branch Select */}
        {selectedRepo && (
          <div className="relative">
            <select
              className="bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-sm outline-none focus:border-zinc-500 cursor-pointer appearance-none pr-8 font-mono"
              value={selectedBranch}
              onChange={(e) => onSelectBranch(e.target.value)}
            >
              {branches.map(branch => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
            <GitBranch className="absolute right-2 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 bg-zinc-800/50 py-1 px-2.5 rounded-full border border-zinc-800">
            <img src={user.avatar_url} alt={user.login} className="w-5 h-5 rounded-full" />
            <span className="text-zinc-300 text-xs font-mono">{user.login}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 p-2 rounded-md transition-colors border border-zinc-800"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

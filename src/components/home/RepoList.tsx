import React from "react";

interface RepoListProps {
  repos: any[];
  selectedRepo: any;
  onSelectRepo: (repo: any) => void;
}

export default function RepoList({
  repos = [],
  selectedRepo,
  onSelectRepo
}: RepoListProps) {
  if (repos.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--box-bg)]/40 border border-[var(--border-color)] rounded-2xl">
        <span className="text-[10.5px] font-mono text-zinc-500">No matching projects found.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 font-sans">
      {repos.map((repo) => {
        const isSelected = selectedRepo?.id === repo.id;
        return (
          <div
            key={repo.id}
            onClick={() => onSelectRepo(repo)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
              isSelected 
                ? "bg-[#375a7f]/5 border-[#375a7f] text-[var(--text-primary)] shadow-sm" 
                : "bg-[var(--box-bg)]/50 border-[var(--border-color)] hover:border-zinc-700/80 hover:bg-[var(--box-bg)] text-[var(--text-secondary)]"
            }`}
          >
            <div className="space-y-1 truncate pr-3 flex-1">
              <p className={`text-xs font-mono font-bold truncate transition-colors ${isSelected ? "text-[#375a7f]" : "text-[var(--text-primary)]"}`}>
                {repo.name}
              </p>
              <p className="text-[10px] text-zinc-500 truncate leading-relaxed">
                {repo.description || "No description provided."}
              </p>
              <div className="flex items-center gap-2.5 text-[9px] font-mono text-zinc-500 pt-1">
                <span>★ {repo.stargazers_count} stars</span>
                <span>• {repo.forks_count} forks</span>
              </div>
            </div>
            {isSelected ? (
              <span className="text-[8.5px] font-semibold bg-[#375a7f] text-white px-2 py-0.5 rounded-full uppercase shrink-0 font-mono tracking-tight shadow-sm">
                Selected
              </span>
            ) : (
              <span className="text-[8.5px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Connect →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

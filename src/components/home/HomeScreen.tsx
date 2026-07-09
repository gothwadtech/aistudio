import React, { useState } from "react";
import { 
  FolderGit2, 
  Search, 
  Terminal, 
  BookOpen,
  Plus
} from "lucide-react";
import AuthPanel from "../AuthPanel";
import RepoSelector from "../RepoSelector";
import AccountPanel from "./AccountPanel";
import CreateRepoForm from "./CreateRepoForm";
import RepoList from "./RepoList";
import { github } from "../../services/github";

interface HomeScreenProps {
  token: string | null;
  user: { login: string; avatar_url: string; name?: string; html_url?: string } | null;
  repos: any[];
  selectedRepo: any;
  branches: any[];
  selectedBranch: string;
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  onSelectRepo: (repo: any) => void;
  onSelectBranch: (branch: string) => void;
  onLogout: () => void;
  repoSearchQuery: string;
  onRepoSearchQueryChange: (val: string) => void;
  authConfig: { clientId: string; appUrl: string } | null;
  setActiveTab: (tab: any) => void;
  refreshRepos: () => Promise<void>;
}

export default function HomeScreen({
  token,
  user,
  repos = [],
  selectedRepo,
  branches = [],
  selectedBranch,
  isLoading,
  error,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  onSelectRepo,
  onSelectBranch,
  onLogout,
  repoSearchQuery,
  onRepoSearchQueryChange,
  authConfig,
  setActiveTab,
  refreshRepos
}: HomeScreenProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter repositories based on search
  const filteredRepos = repos ? repos.filter(repo => 
    repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(repoSearchQuery.toLowerCase()))
  ) : [];

  const handleCreatedRepository = async (created: any) => {
    setShowCreateForm(false);
    // Refresh the repository list
    await refreshRepos();
    // Select the newly created repository
    onSelectRepo(created);
    // Switch to files
    setActiveTab("projects");
  };

  const handleDeleteRepository = async () => {
    if (!selectedRepo) return;
    await github.deleteRepository(selectedRepo.owner.login, selectedRepo.name);
    // Clear selection
    onSelectRepo(null);
    // Refresh repos
    await refreshRepos();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-2xl mx-auto w-full font-sans">
      
      {/* 1. Account Info or Authentication Panel */}
      {!token ? (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-xl text-center">
            <h2 className="text-zinc-100 font-bold text-sm select-none font-mono flex items-center justify-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-[#375a7f]" />
              Gothwad Ai Studio Mobile Session
            </h2>
            <p className="text-zinc-500 text-[11px] font-mono leading-relaxed mt-1.5">
              Securely authenticate your session key to unpack packages, inspect repositories and commit changes.
            </p>
          </div>
          
          <AuthPanel
            authConfig={authConfig}
            error={error}
            isLoading={isLoading}
            patInput={patInput}
            onPatInputChange={onPatInputChange}
            onPatSubmit={onPatSubmit}
            onTriggerOAuth={onTriggerOAuth}
          />
        </div>
      ) : (
        <AccountPanel
          user={user}
          reposCount={repos?.length || 0}
          selectedRepo={selectedRepo}
          selectedBranch={selectedBranch}
          onLogout={onLogout}
          onDeleteRepo={handleDeleteRepository}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 2. Repositories Selection and Utilities List */}
      {token && (
        <div className="space-y-3.5 pt-1 animate-[fadeIn_0.15s_ease-out]">
          
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-mono font-bold text-zinc-500 tracking-wider uppercase">
              Available Repositories ({filteredRepos.length})
            </span>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-1 bg-[#375a7f]/10 hover:bg-[#375a7f] text-[#375a7f] hover:text-white px-2.5 py-1 rounded-lg border border-[#375a7f]/20 text-[10px] font-mono font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create Repository</span>
            </button>
          </div>

          {/* Create Repository Drawer */}
          {showCreateForm && (
            <CreateRepoForm
              onCreated={handleCreatedRepository}
              onCancel={() => setShowCreateForm(false)}
              refreshRepos={refreshRepos}
            />
          )}

          {/* Repository Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter repositories..."
              value={repoSearchQuery}
              onChange={(e) => onRepoSearchQueryChange(e.target.value)}
              className="w-full bg-[var(--box-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-3.5 pr-10 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[#375a7f] focus:ring-1 focus:ring-[#375a7f] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-3" />
          </div>

          {/* Branch & Repo Selector Config Block */}
          <div className="bg-[var(--box-bg)] border border-[var(--border-color)] p-3.5 rounded-2xl">
            <RepoSelector
              repos={repos}
              selectedRepo={selectedRepo}
              onSelectRepo={onSelectRepo}
              branches={branches}
              selectedBranch={selectedBranch}
              onSelectBranch={onSelectBranch}
              onLogout={onLogout}
              user={user}
            />
          </div>

          {/* Repo List */}
          <RepoList
            repos={filteredRepos}
            selectedRepo={selectedRepo}
            onSelectRepo={onSelectRepo}
          />
        </div>
      )}

      {/* Safety Sandboxed Session Banner */}
      <div className="pt-2 flex items-center justify-center gap-4 text-zinc-600 font-mono text-[9px]">
        <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Secured Env</span>
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Local Buffer</span>
      </div>
    </div>
  );
}

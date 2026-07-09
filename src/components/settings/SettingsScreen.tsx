import React from "react";
import { 
  Settings, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  CheckCircle, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  Globe,
  Terminal
} from "lucide-react";
import AuthPanel from "../AuthPanel";

interface SettingsScreenProps {
  token: string | null;
  user: { login: string; avatar_url: string; name?: string } | null;
  repos: any[];
  isLoading: boolean;
  error: string | null;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  onLogout: () => void;
  authConfig: { clientId: string; appUrl: string } | null;
}

export default function SettingsScreen({
  token,
  user,
  repos = [],
  isLoading,
  error,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  onLogout,
  authConfig
}: SettingsScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-2xl mx-auto w-full font-sans">
      
      {/* Tab Header Badge */}
      <div className="bg-[var(--box-bg)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center gap-2.5 shadow-sm">
        <Settings className="w-5 h-5 text-[#375a7f]" />
        <div>
          <h2 className="text-[var(--text-primary)] font-bold text-xs font-mono uppercase tracking-wider">System Settings</h2>
          <p className="text-zinc-500 text-[9.5px] font-mono mt-0.5 font-medium">Configure tokens, host addresses, and read guide documents</p>
        </div>
      </div>

      {/* Profile summary if authenticated */}
      {token && (
        <div className="bg-[var(--box-bg)]/55 border border-[var(--border-color)] p-4 rounded-2xl space-y-3">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">Active Workspace Session</span>
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url}
              alt={user?.login || "Active credentials"}
              className="w-10 h-10 rounded-xl border border-[var(--border-color)] shadow-sm shrink-0"
            />
            <div className="space-y-0.5 truncate flex-1">
              <h4 className="text-[var(--text-primary)] font-bold text-xs font-mono truncate">@{user?.login}</h4>
              <p className="text-emerald-500 text-[9px] font-mono flex items-center gap-1 font-bold">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> Authorized Connection
              </p>
            </div>
            
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-[10.5px] font-mono font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Guest Mode settings container */}
      {!token && (
        <div className="space-y-4">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col items-center text-center space-y-2 font-mono">
            <h3 className="text-zinc-100 font-bold text-sm">Guest Mode</h3>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              You are currently using Gothwad Ai Studio without an active session. Connect your GitHub profile to unlock all persistent cloud sync integrations.
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
      )}

      {/* Security Guarantee Box */}
      <div className="border border-[var(--border-color)] rounded-2xl p-4 bg-[var(--box-bg)]/40 space-y-2.5 font-mono">
        <h4 className="text-[10.5px] font-bold text-[var(--accent-color)] uppercase tracking-wide flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#375a7f]" /> Security Guarantee
        </h4>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Tokens and active credentials are saved strictly inside your browser sandbox. Gothwad Ai Studio never uploads, intercepts, or logs personal password keys or private developer files on any external database tracker lists. Use limited scopes on Personal Access Tokens for optimal sandboxing index attributes.
        </p>
      </div>

      {/* Setup Guide instructions */}
      <div className="bg-[var(--box-bg)] border border-[var(--border-color)] rounded-2xl p-4 space-y-3 font-mono">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#375a7f]" /> Developer Guidelines
        </span>
        <div className="space-y-2.5 text-[9.5px] text-zinc-500 leading-normal">
          <p className="border-l-2 border-[#375a7f]/35 pl-2 font-medium">
            1. Use <strong className="text-[var(--text-primary)]">Home</strong> to easily load, filter, and connect any of your live workspace repositories and default branches.
          </p>
          <p className="border-l-2 border-[#375a7f]/35 pl-2 font-medium">
            2. Toggle directories and explore the modular folder structures in <strong className="text-[var(--text-primary)]">Projects</strong> in real time.
          </p>
          <p className="border-l-2 border-[#375a7f]/35 pl-2 font-medium">
            3. Modify files with full text editing, and press <strong className="text-[var(--text-primary)]">Commit Action</strong> in the <strong className="text-[var(--text-primary)]">Editor</strong> panel to sync instantly to the cloud.
          </p>
          <p className="border-l-2 border-[#375a7f]/35 pl-2 font-medium">
            4. Merge whole bundles natively and easily by dropping zip assets under the <strong className="text-[var(--text-primary)]">Upload</strong> screen.
          </p>
        </div>
      </div>

      {/* Host App Domain Details */}
      <div className="bg-[var(--box-bg)]/40 border border-[var(--border-color)] rounded-2xl p-4 font-mono text-[10px] space-y-2 text-zinc-500">
        <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-400">Environment Node Information</span>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-0.5">
            <span className="text-[8.5px] uppercase text-zinc-650">Host System URL</span>
            <p className="text-[var(--text-primary)] font-bold text-[9px] truncate">{authConfig?.appUrl || "Fetching..."}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[8.5px] uppercase text-zinc-650">Sandbox Client Id</span>
            <p className="text-[var(--text-primary)] font-bold text-[9px] truncate">{authConfig?.clientId || "Inactive/Missing"}</p>
          </div>
        </div>
      </div>

      {/* Safe bottom margin */}
      <div className="h-6" />

    </div>
  );
}

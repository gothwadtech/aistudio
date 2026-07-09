import React from "react";
import { FolderGit2 } from "lucide-react";
import AuthPanel from "./AuthPanel";

interface UnauthenticatedGatewayProps {
  authConfig: { clientId: string; appUrl: string } | null;
  error: string | null;
  isLoading: boolean;
  patInput: string;
  onPatInputChange: (val: string) => void;
  onPatSubmit: (e: React.FormEvent) => void;
  onTriggerOAuth: () => void;
  tabLabel: string;
}

export default function UnauthenticatedGateway({
  authConfig,
  error,
  isLoading,
  patInput,
  onPatInputChange,
  onPatSubmit,
  onTriggerOAuth,
  tabLabel
}: UnauthenticatedGatewayProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-6 max-w-md mx-auto w-full font-sans">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-xl text-center w-full">
        <h2 className="text-zinc-100 font-bold text-sm select-none font-mono flex items-center justify-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-[#375a7f]" />
          {tabLabel} Locked
        </h2>
        <p className="text-zinc-500 text-[11px] font-mono leading-relaxed mt-1.5">
          Please connect your GitHub wallet or provide a token to access this environment section.
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
  );
}

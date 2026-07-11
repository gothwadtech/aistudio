import React from "react";
import { GrixFileNode } from "../../../types/github";
import ChatInputBar from "../../../components/ChatInputBar";

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  handleSend: (customPrompt?: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  setSelectedAgent: (val: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer") => void;
  agents: any;
  activeFile: GrixFileNode | null;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  apiProvider: string;
  accentColor: string;
  popularModels: Array<{ value: string; label: string; provider: string }>;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  keyStatus: "custom" | "server" | "missing";
}

export default function ChatInput({
  input,
  setInput,
  isLoading,
  handleSend,
  selectedAgent,
  setSelectedAgent,
  agents,
  activeFile,
  selectedModel,
  setSelectedModel,
  accentColor,
  popularModels,
  attachedFiles,
  setAttachedFiles,
  keyStatus
}: ChatInputProps) {
  return (
    <ChatInputBar
      input={input}
      setInput={setInput}
      isLoading={isLoading}
      onSend={handleSend}
      selectedModel={selectedModel}
      accentColor={accentColor}
      quickModes={true}
      selectedAgent={selectedAgent}
      setSelectedAgent={setSelectedAgent}
      agents={agents}
      activeFile={activeFile}
      popularModels={popularModels}
      onModelChange={setSelectedModel}
      attachedFiles={attachedFiles}
      setAttachedFiles={setAttachedFiles}
      keyStatus={keyStatus}
    />
  );
}

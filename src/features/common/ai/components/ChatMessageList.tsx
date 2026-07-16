import React from "react";
import { Cpu } from "lucide-react";
import ChatMessageBubble from "../../../../components/ChatMessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agent?: string;
  keyStatus?: "custom" | "server" | "missing";
}

interface ChatMessageListProps {
  messages: Message[];
  agents: any;
  isLoading: boolean;
  selectedAgent: "engineer" | "explainer" | "bug_hunter" | "architect" | "planner" | "agentic" | "designer";
  copiedId: string | null;
  copyToClipboard: (text: string, id: string) => void;
  handleApplyToEditor: (code: string, blockId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  accentColor?: string;
}

export default function ChatMessageList({
  messages,
  agents,
  isLoading,
  selectedAgent,
  copiedId,
  copyToClipboard,
  handleApplyToEditor,
  messagesEndRef,
  accentColor = "#375a7f"
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950">
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          msg={msg}
          accentColor={accentColor}
          agents={agents}
          selectedAgent={selectedAgent}
          copiedId={copiedId}
          onCopyText={copyToClipboard}
          onApplyToEditor={handleApplyToEditor}
        />
      ))}

      {/* Typing indicator spinner loading state */}
      {isLoading && (
        <div className="flex flex-col items-start select-none">
          <div className="flex items-center gap-1.5 mb-1 text-[9px] text-zinc-500 px-1 font-mono">
            <Cpu className="w-2.5 h-2.5 animate-spin" style={{ color: agents[selectedAgent]?.color }} />
            <span className="font-bold">{agents[selectedAgent]?.name || "AI"} is thinking...</span>
          </div>
          <div className="bg-zinc-900 text-zinc-400 rounded-xl rounded-tl-none px-3.5 py-3 border border-zinc-850 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px] font-mono text-zinc-650">evaluating_model_tokens...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

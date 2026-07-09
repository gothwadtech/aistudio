import React from "react";
import { Bot, Cpu, Copy, Check, Play } from "lucide-react";
import { MarkdownText, parseMarkdown } from "../../../components/ui/MarkdownText";

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
}

export default function ChatMessageList({
  messages,
  agents,
  isLoading,
  selectedAgent,
  copiedId,
  copyToClipboard,
  handleApplyToEditor,
  messagesEndRef
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            {/* Message Header info */}
            <div className="flex items-center gap-1.5 mb-1 text-[9px] text-zinc-500 px-1 font-mono">
              {isUser ? (
                <>
                  <span>You</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>
                    {msg.timestamp instanceof Date 
                      ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                </>
              ) : (
                <>
                  <Bot className="w-2.5 h-2.5" style={{ color: msg.agent ? agents[msg.agent as keyof typeof agents]?.color : undefined }} />
                  <span className="font-bold">{msg.agent ? agents[msg.agent as keyof typeof agents]?.name : "Assistant"}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>
                    {msg.timestamp instanceof Date 
                      ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                </>
              )}
            </div>

            {/* Chat Bubble Card */}
            <div
              className={`max-w-[95%] rounded-xl px-3.5 py-2.5 text-xs tracking-wide leading-relaxed shadow-md ${
                isUser
                  ? "bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700"
                  : "bg-zinc-910 text-zinc-300 rounded-tl-none border border-zinc-900/50"
              }`}
            >
              {/* Parse & render rich block formats with pristine layouts */}
              {parseMarkdown(msg.content).map((block, idx) => {
                if (block.type === "code") {
                  const blockId = `${msg.id}-block-${idx}`;
                  return (
                    <div 
                      key={idx} 
                      className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-left"
                    >
                      {/* Code Header Controls */}
                      <div className="bg-zinc-900 px-3 py-1.5 flex items-center justify-between border-b border-zinc-800 text-[10px] text-zinc-500">
                        <span className="text-[9.5px] font-bold text-zinc-400 lowercase">{block.language || "typescript"}</span>
                        <div className="flex items-center gap-2">
                          {/* Copy button */}
                          <button
                            onClick={() => copyToClipboard(block.content, blockId)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy code"
                          >
                            {copiedId === blockId ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === blockId ? "copied" : "copy"}</span>
                          </button>

                          {/* Apply code to active file */}
                          <button
                            onClick={() => handleApplyToEditor(block.content, blockId)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer font-bold text-amber-500"
                            title="Apply code directly to current active file"
                          >
                            <Play className="w-3 h-3" />
                            <span>apply</span>
                          </button>
                        </div>
                      </div>

                      {/* Code canvas viewport */}
                      <pre className="p-3 text-[11px] overflow-x-auto leading-relaxed max-h-72 scrollbar-thin select-text">
                        <code className="text-zinc-100">{block.content}</code>
                      </pre>
                    </div>
                  );
                }

                // Standard Text Blocks
                return (
                  <MarkdownText key={idx} text={block.content} />
                );
              })}

              {/* API Key Status Indicator for Assistant replies */}
              {!isUser && msg.keyStatus && (
                <div className="mt-2.5 pt-1.5 border-t border-zinc-800/40 flex items-center justify-between text-[8px] font-mono select-none text-zinc-500">
                  <span className="flex items-center gap-1">
                    {msg.keyStatus === "custom" ? (
                      <span className="text-emerald-400 font-bold bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-900/30">
                        🟢 Active: Custom OpenRouter API Key (Unlimited Usage)
                      </span>
                    ) : msg.keyStatus === "server" ? (
                      <span className="text-blue-400 font-bold bg-blue-950/20 px-1 py-0.5 rounded border border-blue-900/30">
                        🔵 Active: Server Environment (.env) Key
                      </span>
                    ) : (
                      <span className="text-zinc-400 font-bold bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                        ⚪ Active: Default Server Key
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator spinner loading state */}
      {isLoading && (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 mb-1 text-[9px] text-zinc-500 px-1 font-mono">
            <Cpu className="w-2.5 h-2.5 animate-spin" style={{ color: agents[selectedAgent].color }} />
            <span className="font-bold">{agents[selectedAgent].name} is thinking...</span>
          </div>
          <div className="bg-zinc-910 text-zinc-400 rounded-xl rounded-tl-none px-3.5 py-3 border border-zinc-900/50 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 select-none">evaluating_model_tokens...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

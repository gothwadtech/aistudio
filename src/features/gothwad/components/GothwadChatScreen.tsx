import React, { useState, useEffect, useRef } from "react";
import { Bot, User, Code2, Cpu, Info, Terminal, Copy, Check, RotateCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { GothwadSession, Message } from "./LeftSidebar";
import { SUPPORTED_MODELS } from "./RightSidebar";
import Markdown from "react-markdown";

interface GothwadChatScreenProps {
  activeSession: GothwadSession | null;
  accentColor: string;
  generating: boolean;
  setInputText: (text: string) => void;
  onRetryMessage?: (messageId: string) => Promise<void> | void;
}

// Custom CodeBlock Component for elegant code rendering with Copy to Clipboard support
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-mono text-xs text-zinc-300">
      <div className="bg-zinc-900/60 px-4 py-2 border-b border-zinc-850 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto no-scrollbar max-h-[400px]">
        <pre className="whitespace-pre">{code.trim()}</pre>
      </div>
    </div>
  );
}

// Function to parse and render message content with high-fidelity Markdown support
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body text-zinc-300 text-sm leading-relaxed space-y-3">
      <Markdown
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const isBlock = className && className.startsWith("language-");
            
            if (isBlock) {
              return (
                <CodeBlock
                  language={match ? match[1] : "code"}
                  code={codeContent}
                />
              );
            }
            
            if (codeContent.includes("\n")) {
              return (
                <CodeBlock
                  language="code"
                  code={codeContent}
                />
              );
            }

            return (
              <code className="bg-zinc-850 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-zinc-800 mx-0.5" {...props}>
                {children}
              </code>
            );
          },
          p({ children }: any) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-zinc-300">{children}</p>;
          },
          strong({ children }: any) {
            return <strong className="font-semibold text-zinc-100">{children}</strong>;
          },
          em({ children }: any) {
            return <em className="italic text-zinc-350">{children}</em>;
          },
          ul({ children }: any) {
            return <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-zinc-300">{children}</ul>;
          },
          ol({ children }: any) {
            return <ol className="list-decimal list-inside pl-4 mb-3 space-y-1 text-zinc-300">{children}</ol>;
          },
          li({ children }: any) {
            return <li className="leading-relaxed text-zinc-300 mb-0.5">{children}</li>;
          },
          h1({ children }: any) {
            return <h1 className="text-base font-bold text-zinc-100 mt-4 mb-2">{children}</h1>;
          },
          h2({ children }: any) {
            return <h2 className="text-sm font-semibold text-zinc-200 mt-3 mb-1.5">{children}</h2>;
          },
          h3({ children }: any) {
            return <h3 className="text-xs font-semibold text-zinc-300 mt-2.5 mb-1">{children}</h3>;
          },
          blockquote({ children }: any) {
            return <blockquote className="border-l-2 border-zinc-700 pl-3 italic text-zinc-400 my-2">{children}</blockquote>;
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

export default function GothwadChatScreen({
  activeSession,
  accentColor,
  generating,
  setInputText,
  onRetryMessage
}: GothwadChatScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [likedMsgId, setLikedMsgId] = useState<string | null>(null);
  const [dislikedMsgId, setDislikedMsgId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length, generating]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {!activeSession ? (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
          <Bot className="w-12 h-12 text-zinc-700 animate-pulse" style={{ color: accentColor }} />
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider font-mono">No Active Chat Session</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Click the "New Chat Playground" button in the sidebar to start a new dynamic conversation thread!
          </p>
        </div>
      ) : activeSession.messages.length === 1 && activeSession.messages[0].id.startsWith("welcome") ? (
        /* Welcome / Onboarding Card State */
        <div className="max-w-2xl mx-auto pt-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mb-2">
              <Bot className="w-7 h-7 text-indigo-400" style={{ color: accentColor }} />
            </div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
              Gothwad AI Workspace
            </h1>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              A high-fidelity developer-first workspace. Choose a specialized language model, configure parameters, and chat with precision.
            </p>
          </div>

          {/* Starter Presets */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => setInputText("Write a recursive function to check if a string is a palindrome in TypeScript")}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-4 text-left transition-all cursor-pointer group active:scale-[0.98]"
            >
              <Code2 className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-semibold text-zinc-300 mb-1">Coding Assistant</h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Write high-performance functions, debug systems, or format JSON schemas.
              </p>
            </button>

            <button
              onClick={() => setInputText("Solve this logic problem: A father is 4 times older than his son, in 20 years he will be twice as old. How old are they?")}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-2xl p-4 text-left transition-all cursor-pointer group active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-semibold text-zinc-300 mb-1">Deductive Logic</h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Test reasoning abilities, complex mathematical calculations, and step-by-step logic.
              </p>
            </button>
          </div>

          {/* Active Model Summary Badges */}
          <div className="bg-zinc-900/20 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-3">
            <Info className="w-5 h-5 text-zinc-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 leading-normal">
              Current Engine: <strong className="text-zinc-300">{SUPPORTED_MODELS.find(m => m.id === activeSession.model)?.name}</strong>. You can switch to other models like DeepSeek Reasoning or Claude Sonnet in the configuration panel.
            </p>
          </div>
        </div>
      ) : (
        /* Active Message List */
        <div className="max-w-3xl mx-auto space-y-8">
          {activeSession.messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div 
                key={msg.id} 
                className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-[fadeIn_0.15s_ease-out]`}
              >
                {/* Chat Bubble / Text Block */}
                <div className={`flex flex-col space-y-1.5 ${isAssistant ? "w-full" : "max-w-[85%]"}`}>
                  {/* Model Name and timestamp info row */}
                  <div className={`flex items-center gap-2 text-[9px] font-mono text-zinc-500 ${isAssistant ? "justify-start" : "justify-end"} select-none`}>
                    {isAssistant && (
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                        {msg.model?.split("/").pop() || "Gothwad AI"}
                      </span>
                    )}
                    {!isAssistant && <span className="text-zinc-400 font-semibold">User</span>}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {isAssistant ? (
                    // Assistant View: Plain text background, markdown rendering
                    <div className="bg-transparent text-zinc-200 border-none px-0 py-1">
                      <MarkdownContent content={msg.content} />
                      
                      {/* Visible light separator line at the end of the response */}
                      <div className="w-full h-px bg-zinc-850/60 mt-4 mb-2" />
                      
                      {/* Interactive action icons bar underneath the separator */}
                      <div className="flex items-center gap-3 select-none py-1">
                        {/* Copy button */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMsgId(msg.id);
                            setTimeout(() => setCopiedMsgId(null), 2000);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-850/60 bg-zinc-900/40 hover:bg-zinc-900 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-all active:scale-95 cursor-pointer"
                          title="Copy message content"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Retry / Regenerate button */}
                        <button
                          onClick={() => onRetryMessage && onRetryMessage(msg.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-850/60 bg-zinc-900/40 hover:bg-zinc-900 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Regenerate this response"
                          disabled={generating}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>

                        {/* Thumbs Up feedback */}
                        <button
                          onClick={() => {
                            setLikedMsgId(likedMsgId === msg.id ? null : msg.id);
                            setDislikedMsgId(null);
                          }}
                          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                            likedMsgId === msg.id
                              ? "border-emerald-800/45 bg-emerald-950/20 text-emerald-400"
                              : "border-zinc-850/40 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300"
                          }`}
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs Down feedback */}
                        <button
                          onClick={() => {
                            setDislikedMsgId(dislikedMsgId === msg.id ? null : msg.id);
                            setLikedMsgId(null);
                          }}
                          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                            dislikedMsgId === msg.id
                              ? "border-rose-800/45 bg-rose-950/20 text-rose-400"
                              : "border-zinc-850/40 bg-zinc-900/30 text-zinc-500 hover:text-rose-400"
                          }`}
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Spacer/separation line if user posts another message */}
                      <div className="w-full h-px bg-zinc-900/50 mt-3 last:hidden" />
                    </div>
                  ) : (
                    // User View: Beautiful card bubble matching AI's former container
                    <div className="bg-zinc-900/50 border border-zinc-850 text-zinc-100 px-4 py-3 rounded-2xl shadow-sm">
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Streaming/Generating Thinking Indicator */}
          {generating && (
            <div className="flex justify-start">
              <div className="flex flex-col space-y-1.5 w-full">
                <div className="text-[9px] font-mono text-zinc-650 uppercase tracking-wide">
                  {activeSession.model.split("/").pop()?.toUpperCase()} THINKING...
                </div>
                <div className="bg-transparent py-1 flex items-center gap-2.5">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-zinc-550 font-mono">
                    {activeSession.model === "deepseek/deepseek-r1" ? "Formulating step-by-step reasoning steps..." : "Analyzing semantic intent..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll reference target */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

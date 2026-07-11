import React, { useState } from "react";
import { Cpu, Copy, Check, Play, AlertCircle, CheckCircle2 } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date | number;
  agent?: string;
  keyStatus?: "custom" | "server" | "missing";
  durationSec?: number;
}

const MODELS_MAP = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
  { value: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 550B" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1" },
  { value: "qwen/qwen-2.5-coder-32b-instruct:free", label: "Qwen 2.5 Coder" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" }
];

function getModelLabel(modelKey: string | undefined): string {
  if (!modelKey) return "Gothwad AI";
  const found = MODELS_MAP.find(m => m.value === modelKey);
  if (found) return found.label;
  
  // Format beautifully (e.g. "meta-llama/llama-3.3-70b-instruct:free" -> "Llama 3.3 70B")
  const parts = modelKey.split("/");
  let name = parts[parts.length - 1];
  if (name.includes(":")) {
    name = name.split(":")[0];
  }
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface ChatMessageBubbleProps {
  key?: any;
  msg: Message;
  accentColor: string;
  agents?: any;
  selectedAgent?: string;
  copiedId: string | null;
  onCopyText: (text: string, id: string) => void;
  onApplyToEditor?: (code: string, id: string) => void;
  isMobile?: boolean;
}

// Interfaces for text sub-blocks
interface TableRow {
  cells: string[];
}

interface SubBlock {
  type: "paragraph" | "header" | "bullet-list" | "ordered-list" | "table" | "hr" | "empty";
  level?: number;
  items?: string[];
  headers?: string[];
  rows?: TableRow[];
  content?: string;
}

interface ContentBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

// Robust, high-fidelity markdown parser to split text & code blocks
export function parseMarkdown(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const regex = /```(\w*)\n([\s\S]*?)(?:```|$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      blocks.push({ type: "text", content: textBefore });
    }
    blocks.push({
      type: "code",
      language: match[1] || "typescript",
      content: match[2]
    });
    lastIndex = regex.lastIndex;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText || blocks.length === 0) {
    blocks.push({ type: "text", content: remainingText || " " });
  }

  return blocks;
}

// Inner parser for rich formatting (tables, lists, headers, etc)
export function parseTextContent(text: string): SubBlock[] {
  const lines = text.split("\n");
  const subBlocks: SubBlock[] = [];
  let currentBlock: SubBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Horizontal Rule
    if (trimmed === "---" || trimmed === "===" || trimmed === "***") {
      if (currentBlock) {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }
      subBlocks.push({ type: "hr" });
      continue;
    }

    // 2. Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      if (currentBlock) {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }
      subBlocks.push({
        type: "header",
        level: headerMatch[1].length,
        content: headerMatch[2]
      });
      continue;
    }

    // 3. Table Row check (starts/ends with | or contains multiple pipes)
    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
    if (isTableRow) {
      const isDivider = (l: string) => /^\s*\|\s*(:?-+:?\s*\|)+$/.test(l);
      
      if (currentBlock && currentBlock.type !== "table") {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }

      const cells = trimmed
        .split("|")
        .map(cell => cell.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      if (!currentBlock) {
        // Look ahead for table divider confirmation
        const nextLine = lines[i + 1];
        if (nextLine && isDivider(nextLine.trim())) {
          currentBlock = {
            type: "table",
            headers: cells,
            rows: []
          };
          i++; // Skip the divider line
          continue;
        }
      } else if (currentBlock.type === "table") {
        currentBlock.rows?.push({ cells });
        continue;
      }
    }

    // 4. Bullet lists
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)$/);
    if (bulletMatch) {
      if (currentBlock && currentBlock.type !== "bullet-list") {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = { type: "bullet-list", items: [] };
      }
      currentBlock.items?.push(bulletMatch[3]);
      continue;
    }

    // 5. Ordered lists
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (currentBlock && currentBlock.type !== "ordered-list") {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = { type: "ordered-list", items: [] };
      }
      currentBlock.items?.push(orderedMatch[3]);
      continue;
    }

    // 6. Empty lines
    if (!trimmed) {
      if (currentBlock) {
        subBlocks.push(currentBlock);
        currentBlock = null;
      }
      subBlocks.push({ type: "empty" });
      continue;
    }

    // 7. Paragraph
    if (currentBlock && currentBlock.type !== "paragraph") {
      subBlocks.push(currentBlock);
      currentBlock = null;
    }
    if (!currentBlock) {
      currentBlock = { type: "paragraph", content: line };
    } else {
      currentBlock.content += "\n" + line;
    }
  }

  if (currentBlock) {
    subBlocks.push(currentBlock);
  }

  return subBlocks;
}

// Inline Markdown parsing (bold & inline code)
function renderBold(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }
    parts.push(
      <strong key={`bold-${match.index}`} className="font-bold text-white">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const backtickRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = backtickRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(...renderBold(textBefore));
    }
    parts.push(
      <code key={`code-${match.index}`} className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-500 font-mono text-[10px] border border-zinc-900 select-text">
        {match[1]}
      </code>
    );
    lastIndex = backtickRegex.lastIndex;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    parts.push(...renderBold(remaining));
  }

  return parts;
}

export default function ChatMessageBubble({
  msg,
  accentColor,
  agents,
  selectedAgent,
  copiedId,
  onCopyText,
  onApplyToEditor,
  isMobile = false
}: ChatMessageBubbleProps) {
  const isUser = msg.role === "user";

  const renderSubBlock = (block: SubBlock, blockIdx: number) => {
    switch (block.type) {
      case "header":
        if (block.level === 1) {
          return (
            <h1 key={blockIdx} className="text-white font-extrabold text-[14px] font-mono mt-4 mb-2 pb-1 border-b border-zinc-800">
              {renderInline(block.content || "")}
            </h1>
          );
        }
        if (block.level === 2) {
          return (
            <h2 key={blockIdx} className="text-zinc-50 font-extrabold text-[12.5px] font-mono mt-3 mb-2 pb-1 border-b border-zinc-800 text-white">
              {renderInline(block.content || "")}
            </h2>
          );
        }
        if (block.level === 3) {
          return (
            <h3 key={blockIdx} className="text-zinc-100 font-bold text-[11.5px] font-mono mt-3 mb-1 pb-1 border-b border-zinc-900 flex items-center gap-1.5">
              {renderInline(block.content || "")}
            </h3>
          );
        }
        return (
          <h4 key={blockIdx} className="text-zinc-200 font-bold text-[10.5px] mt-2 mb-1">
            {renderInline(block.content || "")}
          </h4>
        );

      case "bullet-list":
        return (
          <div key={blockIdx} className="my-2 space-y-1">
            {block.items?.map((item, itemIdx) => (
              <div 
                key={itemIdx} 
                className="flex items-start gap-2 text-zinc-300 py-0.5 leading-relaxed font-sans pl-2"
              >
                <span className="text-zinc-500 shrink-0 font-bold select-none mt-1 text-[10px]">•</span>
                <span className="flex-1 text-zinc-300 text-xs">{renderInline(item)}</span>
              </div>
            ))}
          </div>
        );

      case "ordered-list":
        return (
          <div key={blockIdx} className="my-2 space-y-1">
            {block.items?.map((item, itemIdx) => (
              <div 
                key={itemIdx} 
                className="flex items-start gap-2 text-zinc-300 py-0.5 leading-relaxed font-sans pl-2"
              >
                <span className="text-zinc-500 shrink-0 font-mono font-bold select-none text-[10px] min-w-[14px] text-right mt-0.5">{itemIdx + 1}.</span>
                <span className="flex-1 text-zinc-300 text-xs">{renderInline(item)}</span>
              </div>
            ))}
          </div>
        );

      case "table":
        return (
          <div key={blockIdx} className="my-4 overflow-x-auto rounded-lg border border-zinc-850 bg-zinc-900/40 no-scrollbar">
            <table className="w-full text-left border-collapse text-xs select-text">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/45 text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                  {block.headers?.map((h, hIdx) => (
                    <th key={hIdx} className="p-2.5 font-bold border-r border-zinc-850/50 last:border-r-0">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows?.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className="border-b border-zinc-850/40 last:border-b-0 odd:bg-zinc-900/30 hover:bg-zinc-850/20 transition-all"
                  >
                    {row.cells.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-zinc-300 align-top border-r border-zinc-850/30 last:border-r-0 leading-relaxed">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "hr":
        return <hr key={blockIdx} className="my-4 border-zinc-850" />;

      case "empty":
        return <div key={blockIdx} className="h-2" />;

      case "paragraph":
      default:
        // Handle linebreaks inside normal paragraph blocks
        const lines = (block.content || "").split("\n");
        return (
          <div key={blockIdx} className="my-1.5 space-y-1">
            {lines.map((line, lIdx) => (
              <p key={lIdx} className="text-zinc-300 leading-relaxed font-sans text-xs select-text break-words whitespace-pre-wrap">
                {renderInline(line)}
              </p>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full space-y-3 pb-8 border-b-2 border-zinc-800/80 last:border-b-0">
      {/* Header Avatar and Label Row */}
      <div className={`flex items-center gap-1.5 px-1 select-none ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm bg-transparent">
          <img 
            src="/icon-512.png" 
            alt={isUser ? "User" : getModelLabel(msg.agent)} 
            className="w-full h-full object-cover filter brightness-110" 
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
          {isUser ? "USER" : getModelLabel(msg.agent)}
        </span>
        {!isUser && (
          <span className="ml-2 text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
            WORKED FOR {msg.durationSec !== undefined ? msg.durationSec : "0.0"} SECONDS
          </span>
        )}
      </div>

      {/* Message Body Bubble */}
      <div className={`w-full ${isUser ? "flex justify-end" : ""}`}>
        {isUser ? (
          <div className="bg-zinc-900/85 border border-zinc-800 text-zinc-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] sm:max-w-xl shadow-md select-text text-xs leading-relaxed mb-1">
            {msg.content}
          </div>
        ) : (
          <div className="bg-transparent text-zinc-300 p-0 w-full select-text leading-relaxed">
            {parseMarkdown(msg.content).map((block, idx) => {
            if (block.type === "code") {
              const blockId = `${msg.id}-block-${idx}`;
              return (
                <div 
                  key={idx} 
                  className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-left shadow-lg"
                >
                  {/* Code Header Controls */}
                  <div className="bg-zinc-900 px-3 py-1.5 flex items-center justify-between border-b border-zinc-800 text-[10px] text-zinc-500">
                    <span className="text-[9.5px] font-bold text-zinc-400 lowercase">{block.language || "typescript"}</span>
                    <div className="flex items-center gap-2 select-none">
                      {/* Copy button */}
                      <button
                        onClick={() => onCopyText(block.content, blockId)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedId === blockId ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 font-bold">copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>copy</span>
                          </>
                        )}
                      </button>

                      {/* Apply code to active file (if handler provided) */}
                      {onApplyToEditor && (
                        <button
                          onClick={() => onApplyToEditor(block.content, blockId)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer font-bold text-amber-500"
                          title="Apply code directly to active workspace file"
                        >
                          <Play className="w-3 h-3" />
                          <span>apply</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Code canvas viewport */}
                  <pre className="p-3 text-[11px] overflow-x-auto leading-relaxed max-h-72 scrollbar-thin select-text">
                    <code className="text-zinc-100">{block.content}</code>
                  </pre>
                </div>
              );
            }

            // Textblock that needs headings, tables, bullets lists formatting
            const textBlocks = parseTextContent(block.content);
            return (
              <div key={idx} className="space-y-1.5 select-text">
                {textBlocks.map((tb, tbIdx) => renderSubBlock(tb, tbIdx))}
              </div>
            );
          })}

          {/* Key Status Indicator inside assistant bubble */}
          {!isUser && msg.keyStatus && (
            <div className="mt-2.5 pt-1.5 border-t border-zinc-850/60 flex items-center justify-between text-[8px] font-mono select-none text-zinc-500">
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
        )}

        {/* Timestamp / Copy meta for standard text responses */}
        <div className={`flex items-center gap-3 px-1.5 text-[9.5px] font-mono text-zinc-550 ${isUser ? "justify-end" : ""}`}>
          <span>
            {msg.timestamp instanceof Date 
              ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </span>
          {!isUser && (
            <button
              onClick={() => onCopyText(msg.content, msg.id)}
              className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedId === msg.id ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

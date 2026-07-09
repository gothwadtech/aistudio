import React from "react";

export interface ContentBlock {
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
      <code key={`code-${match.index}`} className="bg-zinc-950 px-1.5 py-0.5 rounded text-amber-500 font-mono text-[10.5px] border border-zinc-900 select-text">
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

interface MarkdownTextProps {
  text: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text }) => {
  const lines = text.split("\n");
  
  return (
    <div className="space-y-1 select-text">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={lineIdx} className="text-zinc-100 font-bold text-[12px] font-mono mt-3 mb-1 pb-1 border-b border-zinc-900 flex items-center gap-1.5">
              {renderInline(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={lineIdx} className="text-zinc-200 font-bold text-[11px] mt-2 mb-1">
              {renderInline(trimmed.substring(5))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={lineIdx} className="text-zinc-50 font-extrabold text-[13px] font-mono mt-4 mb-2 pb-1 border-b border-zinc-800 flex items-center gap-1.5 text-white">
              {renderInline(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={lineIdx} className="text-white font-extrabold text-[14.5px] font-mono mt-4 mb-2 pb-1 border-b border-zinc-800">
              {renderInline(trimmed.substring(2))}
            </h1>
          );
        }

        // Unordered lists (- or * or •)
        const ulMatch = line.match(/^(\s*)([-*•])\s+(.*)$/);
        if (ulMatch) {
          const indent = ulMatch[1].length;
          const content = ulMatch[3];
          return (
            <div 
              key={lineIdx} 
              className="flex items-start gap-1.5 text-zinc-300 py-0.5 leading-relaxed font-sans"
              style={{ paddingLeft: `${Math.max(12, indent * 8)}px` }}
            >
              <span className="text-[#375a7f] shrink-0 font-bold select-none mt-1 text-[10px]">•</span>
              <span className="flex-1 text-zinc-300">{renderInline(content)}</span>
            </div>
          );
        }

        // Ordered lists (e.g. 1. or 2.)
        const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (olMatch) {
          const indent = olMatch[1].length;
          const num = olMatch[2];
          const content = olMatch[3];
          return (
            <div 
              key={lineIdx} 
              className="flex items-start gap-1.5 text-zinc-300 py-0.5 leading-relaxed font-sans"
              style={{ paddingLeft: `${Math.max(12, indent * 8)}px` }}
            >
              <span className="text-[#375a7f] shrink-0 font-mono font-bold select-none text-[10px] min-w-[14px] text-right mt-0.5">{num}.</span>
              <span className="flex-1 text-zinc-300">{renderInline(content)}</span>
            </div>
          );
        }

        // If empty line, render a small space
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Standard paragraph
        return (
          <p key={lineIdx} className="text-zinc-300 leading-relaxed font-sans text-xs my-1 select-text break-words whitespace-pre-wrap">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

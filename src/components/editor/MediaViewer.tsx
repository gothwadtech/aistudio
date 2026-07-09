import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  FileAudio, 
  FileVideo, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw,
  FileText
} from "lucide-react";
import { GrixFileNode } from "../../types/github";
import { getMimeType } from "./SyntaxHighlighter";

interface MediaViewerProps {
  activeFile: GrixFileNode;
  content: string; // Base64 data URL
}

export default function MediaViewer({ activeFile, content }: MediaViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  const filename = activeFile.name;
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mime = getMimeType(filename);
  
  const isImage = mime.startsWith("image/");
  const isAudio = mime.startsWith("audio/");
  const isVideo = mime.startsWith("video/");

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleResetZoom = () => setZoom(100);

  // Download trigger
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = content;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to compute size if base64
  const getApproxSize = () => {
    if (!content.startsWith("data:")) return "Unknown size";
    const base64Part = content.split(",")[1] || "";
    const sizeInBytes = Math.floor((base64Part.length * 3) / 4);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col h-full overflow-hidden select-none">
      {/* Media control toolbar */}
      <div className="bg-zinc-900/40 border-b border-zinc-900/80 px-4 py-2 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {isImage && <ImageIcon className="w-4 h-4 text-emerald-400" />}
          {isAudio && <FileAudio className="w-4 h-4 text-sky-400" />}
          {isVideo && <FileVideo className="w-4 h-4 text-pink-400" />}
          {!isImage && !isAudio && !isVideo && <FileText className="w-4 h-4 text-indigo-400" />}
          
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-medium text-zinc-200">{filename}</span>
            <span className="text-[9px] font-mono text-zinc-500 lowercase">
              {mime} • {getApproxSize()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <div className="flex items-center bg-zinc-900 border border-zinc-850 rounded-lg p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-2 text-zinc-400 min-w-[3.5rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleResetZoom}
                className="p-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-1 text-[10px] font-mono border rounded-lg transition-all ${
                  showGrid 
                    ? "bg-zinc-800 border-zinc-750 text-zinc-200" 
                    : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-300"
                }`}
                title="Toggle checkerboard backdrop"
              >
                Grid: {showGrid ? "ON" : "OFF"}
              </button>
            </>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg text-xs font-medium font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8 relative">
        {isImage && (
          <div 
            className="relative transition-all duration-150 flex items-center justify-center rounded-lg shadow-2xl border border-zinc-900"
            style={{
              backgroundImage: showGrid 
                ? "linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)" 
                : "none",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              backgroundColor: "#09090b",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
            }}
          >
            <img 
              src={content} 
              alt={filename}
              className="max-w-full max-h-[70vh] object-contain pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {isAudio && (
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
            
            {/* Spinning disc layout */}
            <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center shadow-inner relative group">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
              </div>
              <FileAudio className="absolute w-5 h-5 text-sky-400 opacity-60 pointer-events-none" />
            </div>

            <div className="text-center">
              <h4 className="text-zinc-200 font-mono text-xs font-bold truncate max-w-xs">{filename}</h4>
              <p className="text-zinc-500 font-mono text-[10px] mt-1 uppercase">Audio Asset Payload</p>
            </div>

            <audio 
              src={content} 
              controls 
              className="w-full h-10 accent-sky-500 outline-none"
            />
          </div>
        )}

        {isVideo && (
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video 
                src={content} 
                controls 
                className="w-full h-full object-contain outline-none"
              />
            </div>
            <div className="p-4 border-t border-zinc-850 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-300 font-medium">{filename}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                Video Player
              </span>
            </div>
          </div>
        )}

        {!isImage && !isAudio && !isVideo && (
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-6 text-center flex flex-col items-center gap-4 shadow-xl">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center text-indigo-400">
              <FileText className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-zinc-200 font-mono text-xs font-bold break-all">{filename}</h4>
              <p className="text-zinc-500 font-mono text-[10px] uppercase">Binary / Document Format</p>
            </div>

            <p className="text-zinc-400 text-[10.5px] font-mono leading-relaxed max-w-xs">
              Gothwad Ai Studio cannot preview this binary file inline. You can download this file to inspect it on your local workstation.
            </p>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium font-mono shadow-md transition-all mt-2"
            >
              <Download className="w-4 h-4" />
              <span>Download File Payload</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

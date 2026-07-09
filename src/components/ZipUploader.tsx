import React, { useState } from "react";
import JSZip from "jszip";
import { Upload, FileUp, CheckCircle, RefreshCw, FileText, AlertCircle } from "lucide-react";

interface UnzippedFile {
  path: string;
  content: string;
  selected: boolean;
}

interface ZipUploaderProps {
  onSyncFiles: (files: { path: string; content: string }[]) => Promise<void>;
  isLoading: boolean;
}

export default function ZipUploader({ onSyncFiles, isLoading }: ZipUploaderProps) {
  const [zipFiles, setZipFiles] = useState<UnzippedFile[]>([]);
  const [zipName, setZipName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setError("Please select a valid .zip compressed archive.");
      return;
    }

    setZipName(file.name);
    setError(null);
    setSuccessMsg(null);
    setZipFiles([]);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const zip = await JSZip.loadAsync(arrayBuffer);
          const extractedFiles: UnzippedFile[] = [];

          // Walk files
          const promises: Promise<void>[] = [];
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
              const promise = zipEntry.async("string").then((content) => {
                extractedFiles.push({
                  path: relativePath,
                  content,
                  selected: true,
                });
              });
              promises.push(promise);
            }
          });

          await Promise.all(promises);
          setZipFiles(extractedFiles);
          setSuccessMsg(`Extracted ${extractedFiles.length} files successfully! Select files below to sync.`);
        } catch (err: any) {
          setError(`Failed to read ZIP: ${err.message || err}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(`File read failed: ${err.message || err}`);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = zipFiles.every(f => f.selected);
    setZipFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };

  const toggleFileSelect = (index: number) => {
    setZipFiles(prev => prev.map((f, i) => i === index ? { ...f, selected: !f.selected } : f));
  };

  const handleSyncSubmit = async () => {
    const toSync = zipFiles.filter(f => f.selected);
    if (toSync.length === 0) {
      setError("Please select at least one file to sync.");
      return;
    }

    setError(null);
    try {
      await onSyncFiles(toSync.map(f => ({ path: f.path, content: f.content })));
      setSuccessMsg(`Successfully prepared ${toSync.length} files for synchronization! Please commit your changes.`);
      setZipFiles([]);
      setZipName("");
    } catch (err: any) {
      setError(err.message || "Sync failed");
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-200 font-mono text-xs font-semibold flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          ZIP Sync Engine
        </h3>
        <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
          Unpack & Sync
        </span>
      </div>

      <p className="text-zinc-500 text-[10px] leading-relaxed font-mono">
        Upload a library ZIP file to unzip in the browser, compare/diff, and automatically stage the entire codebase directly onto GitHub.
      </p>

      {/* File Dropper Pin */}
      <div className="relative border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-4 bg-zinc-950/40 text-center transition-colors">
        <input
          type="file"
          accept=".zip"
          onChange={handleZipUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-1.5">
          <FileUp className="w-5 h-5 text-zinc-500" />
          <span className="text-xs font-mono text-zinc-400">
            {zipName ? zipName : "Select ZIP Codebase"}
          </span>
          <span className="text-[9px] text-zinc-650 font-mono">Drag here or tap to unpack</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded flex items-start gap-2 text-rose-450 font-mono text-[10px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded flex items-start gap-2 text-emerald-450 font-mono text-[10px]">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Extracted File list selector */}
      {zipFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
            <span className="text-[10px] font-mono text-zinc-400">Unpacked Files ({zipFiles.length})</span>
            <button
              onClick={toggleSelectAll}
              className="text-zinc-500 hover:text-zinc-300 font-mono text-[9px] uppercase tracking-wider"
            >
              Toggle All
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {zipFiles.map((file, i) => (
              <div
                key={file.path}
                onClick={() => toggleFileSelect(i)}
                className="flex items-center justify-between p-1.5 rounded bg-zinc-950/60 border border-zinc-900 cursor-pointer select-none text-zinc-400 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2 truncate pr-4">
                  <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-[10px] font-mono truncate">{file.path}</span>
                </div>
                <input
                  type="checkbox"
                  checked={file.selected}
                  onChange={() => {}} // event handled by container click
                  className="rounded border-zinc-800 bg-zinc-900 text-zinc-100"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSyncSubmit}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Sync Unzipped Code to Repository</span>
          </button>
        </div>
      )}
    </div>
  );
}

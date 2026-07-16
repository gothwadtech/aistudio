import React from "react";
import { Database, Plus, Trash2, Server, X } from "lucide-react";

interface SchemaItem {
  name: string;
  fields: string;
}

interface RightSidebarProps {
  accentColor: string;
  schemaModels: SchemaItem[];
  onRemoveField: (idx: number) => void;
  newModelName: string;
  setNewModelName: (val: string) => void;
  newModelFields: string;
  setNewModelFields: (val: string) => void;
  onAddField: () => void;
  hasApp: boolean;
  runningServer: boolean;
  onStartServer: () => void;
  onClose?: () => void;
}

export default function RightSidebar({
  accentColor,
  schemaModels,
  onRemoveField,
  newModelName,
  setNewModelName,
  newModelFields,
  setNewModelFields,
  onAddField,
  hasApp,
  runningServer,
  onStartServer,
  onClose
}: RightSidebarProps) {
  return (
    <div className="w-[280px] bg-zinc-900 border-l border-zinc-850 flex flex-col shrink-0 h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-13 px-3 flex items-center justify-between border-b border-zinc-850 bg-zinc-930/40 shrink-0">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          Backend Properties
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 border border-zinc-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Close Sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Collections Schema Editor */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Database Collections</span>
          </h2>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {schemaModels.map((m, i) => (
              <div key={i} className="p-2.5 bg-zinc-950/50 border border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-zinc-300 block truncate">{m.name}</span>
                  <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">{m.fields}</p>
                </div>
                <button onClick={() => onRemoveField(i)} className="text-zinc-650 hover:text-red-400 transition-all cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom schema */}
          <div className="pt-2 border-t border-zinc-850 space-y-1.5">
            <input 
              type="text" 
              placeholder="Name (e.g. Task)"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 text-xs rounded-lg p-2 text-zinc-200 outline-none"
            />
            <input 
              type="text" 
              placeholder="Fields (comma-sep)"
              value={newModelFields}
              onChange={(e) => setNewModelFields(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 text-xs rounded-lg p-2 text-zinc-200 outline-none"
            />
            <button 
              onClick={onAddField}
              className="w-full bg-zinc-950 hover:bg-zinc-850 text-xs font-semibold py-1.5 rounded-lg border border-zinc-800 text-zinc-350 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Collection</span>
            </button>
          </div>
        </div>

        {/* Server Actions */}
        {hasApp && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Node Container Control</span>
            </h2>
            <button
              onClick={onStartServer}
              disabled={runningServer}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-95"
              style={{ backgroundColor: runningServer ? undefined : accentColor }}
            >
              <span>{runningServer ? "Container Online" : "Boot Server Container"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

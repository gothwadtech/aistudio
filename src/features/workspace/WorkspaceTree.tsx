import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  Image as ImageIcon, 
  FileAudio, 
  FileVideo, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  FolderPlus, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  X, 
  Check, 
  Loader2,
  FileJson,
  FileText,
  Copy,
  Scissors,
  Clipboard,
  Download,
  Files,
  FolderArchive
} from "lucide-react";
import { GrixFileNode } from "../../types/github";
import { github } from "../../services/github";
import JSZip from "jszip";

export interface WorkspaceTreeProps {
  tree: GrixFileNode[];
  onSelectFile: (node: GrixFileNode) => void;
  onToggleDir: (path: string) => void;
  activeFile: GrixFileNode | null;
  onCreateFile: (parentPath: string, name: string, content?: string) => Promise<void>;
  onCreateFolder: (parentPath: string, name: string) => Promise<void>;
  onRenameNode: (node: GrixFileNode, newName: string) => Promise<void>;
  onDeleteNode: (node: GrixFileNode) => Promise<void>;
  isLoading?: boolean;
  selectedRepo?: any;
  selectedBranch?: string;
}

export interface WorkspaceTreeRef {
  triggerRootCreate: (type: "file" | "dir") => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: GrixFileNode | null;
}

const WorkspaceTree = forwardRef<WorkspaceTreeRef, WorkspaceTreeProps>(({
  tree,
  onSelectFile,
  onToggleDir,
  activeFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  isLoading = false,
  selectedRepo,
  selectedBranch
}, ref) => {
  useImperativeHandle(ref, () => ({
    triggerRootCreate: (type: "file" | "dir") => {
      triggerCreate("", type);
    }
  }));

  // Local state for Context Menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null
  });

  // Local clipboard state for Copy/Cut/Paste operations
  const [clipboard, setClipboard] = useState<{ type: "copy" | "cut"; node: GrixFileNode } | null>(null);

  // Unzip settings dialog state
  const [unzipDialog, setUnzipDialog] = useState<{
    visible: boolean;
    zipNode: GrixFileNode | null;
    destination: "here" | "custom";
    customFolderName: string;
    overwrite: boolean;
  }>({
    visible: false,
    zipNode: null,
    destination: "here",
    customFolderName: "",
    overwrite: true
  });

  // State for inline modifications
  const [editingNodePath, setEditingNodePath] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const [creatingType, setCreatingType] = useState<"file" | "dir" | null>(null);
  const [creatingParentPath, setCreatingParentPath] = useState<string | null>(null);
  const [creatingName, setCreatingName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    if (editingNodePath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingNodePath]);

  useEffect(() => {
    if (creatingType && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingType]);

  // Handle right-click context menu trigger
  const handleContextMenu = (e: React.MouseEvent, node: GrixFileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // Close context menu on outside click
  useEffect(() => {
    const closeMenu = () => {
      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [contextMenu.visible]);

  // Custom icon selector based on extension/type
  const getFileIcon = (filename: string, isDir: boolean, isOpen?: boolean) => {
    if (isDir) {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
      );
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "json":
      case "lock":
        return <FileJson className="w-4 h-4 text-rose-400 shrink-0" />;
      case "ts":
      case "tsx":
      case "js":
      case "jsx":
        return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
        return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "mp3":
      case "wav":
      case "m4a":
        return <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />;
      case "mp4":
      case "webm":
        return <FileVideo className="w-4 h-4 text-pink-400 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-500 shrink-0" />;
    }
  };

  // Rename node handler
  const triggerRename = (node: GrixFileNode) => {
    setEditingNodePath(node.path);
    setEditingName(node.name);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const submitRename = async () => {
    if (!editingNodePath || !editingName.trim()) return;
    const nodeToRename = findNodeByPath(tree, editingNodePath);
    if (!nodeToRename) return;

    setIsSubmitting(true);
    try {
      await onRenameNode(nodeToRename, editingName.trim());
      setEditingNodePath(null);
    } catch (e) {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find node by path helper
  const findNodeByPath = (nodes: GrixFileNode[], path: string): GrixFileNode | null => {
    for (const n of nodes) {
      if (n.path === path) return n;
      if (n.children) {
        const found = findNodeByPath(n.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // Copy path and details to clipboard
  const handleCopyPath = (node: GrixFileNode, isRelative: boolean) => {
    const pathText = isRelative ? node.path : `src/${node.path}`;
    navigator.clipboard.writeText(pathText)
      .then(() => alert(`Path copied: "${pathText}"`))
      .catch(() => {});
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Copy node details for internal Paste
  const handleCopyNode = (node: GrixFileNode) => {
    setClipboard({ type: "copy", node });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Cut node details for internal Paste
  const handleCutNode = (node: GrixFileNode) => {
    setClipboard({ type: "cut", node });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Paste copied/cut item at target folder (or root if null)
  const handlePasteNode = async (targetFolderNode: GrixFileNode | null) => {
    if (!clipboard || !selectedRepo) return;
    const targetDir = targetFolderNode ? targetFolderNode.path : "";
    
    setIsSubmitting(true);
    setContextMenu(prev => ({ ...prev, visible: false }));

    try {
      if (clipboard.node.type === "file") {
        // Read file content
        let fileContent = "";
        if (clipboard.node.isLoaded && clipboard.node.content !== undefined) {
          fileContent = clipboard.node.content;
        } else {
          const { content } = await github.getFileBlob(
            selectedRepo.owner.login,
            selectedRepo.name,
            clipboard.node.path,
            selectedBranch
          );
          fileContent = content;
        }

        // Create new file
        await onCreateFile(targetDir, clipboard.node.name, fileContent);

        // If cut, delete the old node
        if (clipboard.type === "cut") {
          await onDeleteNode(clipboard.node);
          setClipboard(null);
        }
      } else {
        // Recursive folder copying
        const recursiveCopyFolder = async (srcDirPath: string, destDirPath: string) => {
          const items = await github.getRepositoryContents(
            selectedRepo.owner.login,
            selectedRepo.name,
            srcDirPath,
            selectedBranch
          );

          for (const item of items) {
            const relPath = item.path.substring(srcDirPath.length);
            const targetPath = destDirPath ? `${destDirPath}${relPath}` : item.name;

            if (item.type === "dir") {
              await recursiveCopyFolder(item.path, targetPath);
            } else {
              const { content } = await github.getFileBlob(
                selectedRepo.owner.login,
                selectedRepo.name,
                item.path,
                selectedBranch
              );
              const lastSlash = targetPath.lastIndexOf("/");
              const parent = lastSlash !== -1 ? targetPath.substring(0, lastSlash) : "";
              const fname = lastSlash !== -1 ? targetPath.substring(lastSlash + 1) : targetPath;

              await onCreateFile(parent, fname, content);
            }
          }
        };

        const targetFolderDest = targetDir ? `${targetDir}/${clipboard.node.name}` : clipboard.node.name;
        await recursiveCopyFolder(clipboard.node.path, targetFolderDest);

        if (clipboard.type === "cut") {
          await onDeleteNode(clipboard.node);
          setClipboard(null);
        }
      }
      
      await onToggleDir(""); // Refresh root
    } catch (err: any) {
      alert(`Paste failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate file/folder instantly
  const handleDuplicateNode = async (node: GrixFileNode) => {
    if (!selectedRepo) return;
    setIsSubmitting(true);
    setContextMenu(prev => ({ ...prev, visible: false }));

    try {
      const extIndex = node.name.lastIndexOf(".");
      let newName = "";
      if (extIndex !== -1) {
        newName = `${node.name.substring(0, extIndex)}_copy${node.name.substring(extIndex)}`;
      } else {
        newName = `${node.name}_copy`;
      }

      const parentPath = node.path.includes("/") 
        ? node.path.substring(0, node.path.lastIndexOf("/")) 
        : "";

      if (node.type === "file") {
        let fileContent = "";
        if (node.isLoaded && node.content !== undefined) {
          fileContent = node.content;
        } else {
          const { content } = await github.getFileBlob(
            selectedRepo.owner.login,
            selectedRepo.name,
            node.path,
            selectedBranch
          );
          fileContent = content;
        }
        await onCreateFile(parentPath, newName, fileContent);
      } else {
        // Recursive folder copying
        const recursiveCopyFolder = async (srcDirPath: string, destDirPath: string) => {
          const items = await github.getRepositoryContents(
            selectedRepo.owner.login,
            selectedRepo.name,
            srcDirPath,
            selectedBranch
          );

          for (const item of items) {
            const relPath = item.path.substring(srcDirPath.length);
            const targetPath = `${destDirPath}${relPath}`;

            if (item.type === "dir") {
              await recursiveCopyFolder(item.path, targetPath);
            } else {
              const { content } = await github.getFileBlob(
                selectedRepo.owner.login,
                selectedRepo.name,
                item.path,
                selectedBranch
              );
              const lastSlash = targetPath.lastIndexOf("/");
              const parent = lastSlash !== -1 ? targetPath.substring(0, lastSlash) : "";
              const fname = lastSlash !== -1 ? targetPath.substring(lastSlash + 1) : targetPath;

              await onCreateFile(parent, fname, content);
            }
          }
        };

        const targetFolderDest = parentPath ? `${parentPath}/${newName}` : newName;
        await recursiveCopyFolder(node.path, targetFolderDest);
      }

      await onToggleDir(""); // Refresh root
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download files locally
  const handleDownloadFile = async (node: GrixFileNode) => {
    if (!selectedRepo) return;
    setIsSubmitting(true);
    setContextMenu(prev => ({ ...prev, visible: false }));

    try {
      let fileContent = "";
      if (node.isLoaded && node.content !== undefined) {
        fileContent = node.content;
      } else {
        const { content } = await github.getFileBlob(
          selectedRepo.owner.login,
          selectedRepo.name,
          node.path,
          selectedBranch
        );
        fileContent = content;
      }

      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Download failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unzip archive handler
  const handleUnzipArchive = async () => {
    const { zipNode, destination, customFolderName, overwrite } = unzipDialog;
    if (!zipNode || !selectedRepo) return;

    setUnzipDialog(prev => ({ ...prev, visible: false }));
    setIsSubmitting(true);

    try {
      // Fetch contents
      const query = selectedBranch ? `?ref=${selectedBranch}` : "";
      const data = await github.getRepositoryContents(
        selectedRepo.owner.login,
        selectedRepo.name,
        zipNode.path,
        selectedBranch
      ) as any;

      let base64Content = "";
      if (data && data.content) {
        base64Content = data.content.replace(/\s/g, "");
      } else {
        const blobData = await github.getFileBlob(
          selectedRepo.owner.login,
          selectedRepo.name,
          zipNode.path,
          selectedBranch
        );
        base64Content = btoa(unescape(encodeURIComponent(blobData.content)));
      }

      if (!base64Content) {
        throw new Error("Unable to read archive content payload.");
      }

      const zip = new JSZip();
      await zip.loadAsync(base64Content, { base64: true });

      const parentPath = zipNode.path.includes("/")
        ? zipNode.path.substring(0, zipNode.path.lastIndexOf("/"))
        : "";

      let targetBase = parentPath;
      if (destination === "custom" && customFolderName.trim()) {
        targetBase = parentPath ? `${parentPath}/${customFolderName.trim()}` : customFolderName.trim();
      }

      const fileList: { path: string; content: string }[] = [];

      for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;

        const extractedContent = await fileObj.async("string");
        const targetPath = targetBase ? `${targetBase}/${filename}` : filename;

        fileList.push({
          path: targetPath,
          content: extractedContent
        });
      }

      if (fileList.length === 0) {
        alert("The zip archive is empty or contains no files.");
        return;
      }

      let writtenCount = 0;
      for (const file of fileList) {
        let sha: string | undefined = undefined;

        if (!overwrite) {
          try {
            const details = await github.getFileBlob(
              selectedRepo.owner.login,
              selectedRepo.name,
              file.path,
              selectedBranch
            );
            if (details) continue;
          } catch (e) {}
        } else {
          try {
            const details = await github.getFileBlob(
              selectedRepo.owner.login,
              selectedRepo.name,
              file.path,
              selectedBranch
            );
            if (details) {
              sha = details.sha;
            }
          } catch (e) {}
        }

        await github.writeConfigFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          file.path,
          `Unzip ${zipNode.name} to ${file.path}`,
          file.content,
          sha,
          selectedBranch
        );
        writtenCount++;
      }

      alert(`Successfully extracted ${writtenCount} files to "${targetBase || "root"}"`);
      await onToggleDir(""); // Refresh root
    } catch (err: any) {
      alert(`Extraction failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create file/folder triggers
  const triggerCreate = (parentPath: string | null, type: "file" | "dir") => {
    setCreatingType(type);
    setCreatingParentPath(parentPath);
    setCreatingName("");
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const submitCreate = async () => {
    if (!creatingType || !creatingName.trim()) return;
    const parentPath = creatingParentPath || "";
    setIsSubmitting(true);
    try {
      if (creatingType === "file") {
        await onCreateFile(parentPath, creatingName.trim());
      } else {
        await onCreateFolder(parentPath, creatingName.trim());
      }
      setCreatingType(null);
      setCreatingParentPath(null);
    } catch (e) {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete trigger with confirmation
  const triggerDelete = async (node: GrixFileNode) => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    const confirmMsg = node.type === "dir" 
      ? `Are you sure you want to recursively delete the directory "${node.name}" and all of its contents from GitHub?`
      : `Are you sure you want to delete "${node.name}" from GitHub?`;
    if (confirm(confirmMsg)) {
      setIsSubmitting(true);
      try {
        await onDeleteNode(node);
      } catch (err) {
        // handled
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderNodes = (nodes: GrixFileNode[], depth: number = 0) => {
    return nodes.map(node => {
      const isSelected = activeFile?.path === node.path;
      const isDir = node.type === "dir";
      const isEditing = editingNodePath === node.path;

      return (
        <div key={node.path} className="select-none flex flex-col">
          {isEditing ? (
            <div 
              className="flex items-center gap-2 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-md mx-2 my-0.5"
              style={{ marginLeft: `${depth * 12 + 8}px` }}
            >
              {getFileIcon(node.name, isDir, node.isOpen)}
              <input
                ref={renameInputRef}
                type="text"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 outline-none px-2 py-0.5 rounded text-xs font-mono w-full"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={submitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") setEditingNodePath(null);
                }}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div
              className={`flex items-center justify-between group py-1.5 px-3.5 cursor-pointer transition-colors hover:bg-zinc-900/65 border-l-2 ${
                isSelected 
                  ? "bg-zinc-900/80 border-[#375a7f] text-zinc-100 font-medium" 
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
              style={{ paddingLeft: `${depth * 12 + 16}px` }}
              onClick={() => {
                if (isDir) {
                  onToggleDir(node.path);
                } else {
                  onSelectFile(node);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, node)}
            >
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                {getFileIcon(node.name, isDir, node.isOpen)}
                <span className="text-xs font-mono truncate">{node.name}</span>
                {node.isModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1.5 shrink-0" title="Modified locally" />
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {/* Inline Action Hover Buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all shrink-0">
                  {isDir && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCreate(node.path, "file");
                        }}
                        className="p-1 text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 rounded transition-colors"
                        title="New File"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCreate(node.path, "dir");
                        }}
                        className="p-1 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                        title="New Folder"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerRename(node);
                    }}
                    className="p-1 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerDelete(node);
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Triangle folder expansion arrow placed at the very end of the row */}
                {isDir && (
                  <span className="text-zinc-500 shrink-0 select-none">
                    {node.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Child creations inline view */}
          {creatingType && creatingParentPath === node.path && isDir && node.isOpen && (
            <div 
              className="flex items-center gap-2 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-md mx-2 my-0.5 animate-fadeIn"
              style={{ marginLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              {getFileIcon(creatingType === "file" ? "file.txt" : "dir", creatingType === "dir", false)}
              <input
                ref={createInputRef}
                type="text"
                placeholder={creatingType === "file" ? "file.txt" : "New Folder"}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 outline-none px-2 py-0.5 rounded text-xs font-mono w-full"
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                onBlur={submitCreate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitCreate();
                  if (e.key === "Escape") {
                    setCreatingType(null);
                    setCreatingParentPath(null);
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Directory children container */}
          {isDir && node.isOpen && node.children && (
            <div className="border-l border-zinc-900 ml-[18px] my-0.5 flex flex-col relative">
              {/* Visual Vertical Guideline Indent */}
              <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-zinc-900 pointer-events-none" />
              {node.children.length === 0 ? (
                <div className="py-1 px-3 pl-6 text-zinc-600 font-mono text-[10px] italic select-none">
                  Empty Directory
                </div>
              ) : (
                renderNodes(node.children, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    });
  };

  if (tree.length === 0) {
    return (
      <div className="p-6 text-zinc-500 font-mono text-xs text-center border border-dashed border-zinc-800 rounded-xl m-4 bg-zinc-950/40">
        No directory loaded. Please specify a workspace repository.
      </div>
    );
  }

  return (
    <div className="py-2 overflow-y-auto select-none relative h-full w-full min-h-0">
      {/* Root files creations view (at root tree) */}
      {creatingType && creatingParentPath === "" && (
        <div className="flex items-center gap-2 py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-md mx-2 mb-2 animate-fadeIn">
          {getFileIcon(creatingType === "file" ? "file.txt" : "dir", creatingType === "dir", false)}
          <input
            ref={createInputRef}
            type="text"
            placeholder={creatingType === "file" ? "file.txt" : "New Folder"}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 outline-none px-2 py-0.5 rounded text-xs font-mono w-full"
            value={creatingName}
            onChange={(e) => setCreatingName(e.target.value)}
            onBlur={submitCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCreate();
              if (e.key === "Escape") {
                setCreatingType(null);
                setCreatingParentPath(null);
              }
            }}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Actual Tree render */}
      {renderNodes(tree)}

      {/* VS Code Custom Context Menu */}
      {contextMenu.visible && contextMenu.node && (
        <div 
          className="fixed bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 min-w-[200px] font-mono text-[11px] text-zinc-300 animate-fadeIn"
          style={{ 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[9px] font-bold text-zinc-600 uppercase border-b border-zinc-900 mb-1.5">
            File Operations
          </div>
          
          {contextMenu.node.type === "dir" ? (
            <>
              <button
                onClick={() => triggerCreate(contextMenu.node!.path, "file")}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>New File...</span>
              </button>
              <button
                onClick={() => triggerCreate(contextMenu.node!.path, "dir")}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Folder...</span>
              </button>
              {clipboard && (
                <button
                  onClick={() => handlePasteNode(contextMenu.node)}
                  className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5 text-green-400" />
                  <span>Paste Here ({clipboard.type === "copy" ? "Copy" : "Cut"})</span>
                </button>
              )}
              <div className="border-t border-zinc-900 my-1.5" />
            </>
          ) : (
            <>
              {contextMenu.node.name.toLowerCase().endsWith(".zip") && (
                <>
                  <button
                    onClick={() => {
                      setUnzipDialog({
                        visible: true,
                        zipNode: contextMenu.node,
                        destination: "here",
                        customFolderName: contextMenu.node!.name.substring(0, contextMenu.node!.name.lastIndexOf(".")),
                        overwrite: true
                      });
                      setContextMenu(prev => ({ ...prev, visible: false }));
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-[#375a7f]" />
                    <span className="font-bold text-[#375a7f]">Unzip Archive...</span>
                  </button>
                  <div className="border-t border-zinc-900 my-1.5" />
                </>
              )}
            </>
          )}

          <button
            onClick={() => handleCopyNode(contextMenu.node!)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy</span>
          </button>
          
          <button
            onClick={() => handleCutNode(contextMenu.node!)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cut</span>
          </button>

          {clipboard && (
            <button
              onClick={() => handlePasteNode(null)}
              className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5 text-green-400" />
              <span>Paste at Root</span>
            </button>
          )}

          <button
            onClick={() => handleDuplicateNode(contextMenu.node!)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Files className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duplicate</span>
          </button>

          {contextMenu.node.type === "file" && (
            <button
              onClick={() => handleDownloadFile(contextMenu.node!)}
              className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download File</span>
            </button>
          )}

          <div className="border-t border-zinc-900 my-1.5" />

          <button
            onClick={() => triggerRename(contextMenu.node!)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rename Node</span>
          </button>

          <button
            onClick={() => handleCopyPath(contextMenu.node!, false)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-550" />
            <span>Copy Path</span>
          </button>

          <button
            onClick={() => handleCopyPath(contextMenu.node!, true)}
            className="w-full px-3 py-1.5 text-left hover:bg-zinc-900 hover:text-zinc-100 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-550" />
            <span>Copy Relative Path</span>
          </button>

          <div className="border-t border-zinc-900 my-1.5" />

          <button
            onClick={() => triggerDelete(contextMenu.node!)}
            className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Permanently</span>
          </button>
        </div>
      )}

      {/* Unzip Dialog Overlay */}
      {unzipDialog.visible && unzipDialog.zipNode && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden font-mono text-xs animate-scaleUp text-zinc-300">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
              <span className="font-bold text-zinc-200">Extract ZIP Archive</span>
              <button 
                onClick={() => setUnzipDialog(prev => ({ ...prev, visible: false }))}
                className="text-zinc-550 hover:text-zinc-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <span className="text-[10px] text-zinc-650 block uppercase font-bold mb-1">Source Archive</span>
                <div className="bg-zinc-950 px-3 py-2 border border-zinc-850 rounded-lg text-zinc-400 select-all truncate">
                  {unzipDialog.zipNode.path}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-650 block uppercase font-bold mb-2">Extraction Destination</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input 
                      type="radio" 
                      name="unzip_dest" 
                      checked={unzipDialog.destination === "here"}
                      onChange={() => setUnzipDialog(prev => ({ ...prev, destination: "here" }))}
                      className="accent-[#375a7f]"
                    />
                    <span>Extract Here (same directory)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-zinc-100">
                    <input 
                      type="radio" 
                      name="unzip_dest" 
                      checked={unzipDialog.destination === "custom"}
                      onChange={() => setUnzipDialog(prev => ({ ...prev, destination: "custom" }))}
                      className="accent-[#375a7f]"
                    />
                    <span>Extract into sub-folder</span>
                  </label>
                </div>
              </div>

              {unzipDialog.destination === "custom" && (
                <div className="animate-fadeIn">
                  <span className="text-[10px] text-zinc-650 block uppercase font-bold mb-1">Sub-folder Name</span>
                  <input 
                    type="text" 
                    placeholder="e.g. extracted-files"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-[#375a7f] transition-colors"
                    value={unzipDialog.customFolderName}
                    onChange={(e) => setUnzipDialog(prev => ({ ...prev, customFolderName: e.target.value }))}
                  />
                </div>
              )}

              <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-zinc-550">Overwrite matches:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={unzipDialog.overwrite}
                    onChange={(e) => setUnzipDialog(prev => ({ ...prev, overwrite: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-8.5 h-4.5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#375a7f] peer-checked:after:bg-zinc-100"></div>
                </label>
              </div>
            </div>

            <div className="px-4 py-3 bg-zinc-950/40 border-t border-zinc-850 flex justify-end gap-2">
              <button
                onClick={() => setUnzipDialog(prev => ({ ...prev, visible: false }))}
                className="px-3 py-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUnzipArchive}
                className="px-4 py-1.5 bg-[#375a7f] text-white hover:bg-sky-600 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Extract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay spinner if workspace is committing */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[1px] flex items-center justify-center z-40 select-none pointer-events-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-2xl animate-scaleUp">
            <Loader2 className="w-4 h-4 text-[#375a7f] animate-spin" />
            <span className="text-[10px] font-mono text-zinc-300">Synchronizing Git payload...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default WorkspaceTree;

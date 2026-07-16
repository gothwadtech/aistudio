import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { GrixFileNode } from "../types/github";
import WorkspaceTree, { WorkspaceTreeRef } from "../features/common/workspace/WorkspaceTree";
import { useGitHub } from "../hooks/useGitHub";

interface FileTreeProps {
  tree: GrixFileNode[];
  onSelectFile: (node: GrixFileNode) => void;
  onToggleDir: (path: string) => void;
  activeFile: GrixFileNode | null;
  onDeleteFile?: (node: GrixFileNode) => void;
}

export interface FileTreeRef {
  triggerRootCreate: (type: "file" | "dir") => void;
}

const FileTree = forwardRef<FileTreeRef, FileTreeProps>(({ 
  tree, 
  onSelectFile, 
  onToggleDir, 
  activeFile,
  onDeleteFile
}, ref) => {
  // Gracefully pull the core workspace operations from the useGitHub hook
  const { createFile, createFolder, renameNode, deleteNode, isLoading, selectedRepo, selectedBranch } = useGitHub();
  const workspaceTreeRef = useRef<WorkspaceTreeRef>(null);

  useImperativeHandle(ref, () => ({
    triggerRootCreate: (type: "file" | "dir") => {
      workspaceTreeRef.current?.triggerRootCreate(type);
    }
  }));

  return (
    <WorkspaceTree
      ref={workspaceTreeRef}
      tree={tree}
      onSelectFile={onSelectFile}
      onToggleDir={onToggleDir}
      activeFile={activeFile}
      onCreateFile={createFile}
      onCreateFolder={createFolder}
      onRenameNode={renameNode}
      onDeleteNode={async (node) => {
        // Fallback to custom prop if passed, otherwise use hook's direct action
        if (node.type === "file" && onDeleteFile) {
          onDeleteFile(node);
        } else {
          await deleteNode(node);
        }
      }}
      isLoading={isLoading}
      selectedRepo={selectedRepo}
      selectedBranch={selectedBranch}
    />
  );
});

export default FileTree;

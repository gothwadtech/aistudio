import { useState, useCallback, useEffect } from "react";
import { GitHubRepo, GitHubBranch, GrixFileNode } from "../types/github";
import { github } from "../services/github";
import { updateTreeWithChildren, updateFileNodeInTree, toggleDirectoryInTree } from "../utils/treeUtils";
import { dbCache } from "../utils/dbCache";

// Helper to find a node by its path in the tree hierarchy
const findNodeInTree = (nodes: GrixFileNode[], path: string): GrixFileNode | null => {
  for (const n of nodes) {
    if (n.path === path) return n;
    if (n.children) {
      const found = findNodeInTree(n.children, path);
      if (found) return found;
    }
  }
  return null;
};

export function useGitHubFileSystem() {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [fileSystemTree, setFileSystemTree] = useState<GrixFileNode[]>([]);
  const [activeFile, setActiveFile] = useState<GrixFileNode | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Restore state from IndexedDB on startup
  useEffect(() => {
    const restoreCachedWorkspace = async () => {
      try {
        const repo = await dbCache.get<GitHubRepo>("keyval", "current_repo");
        const branchList = await dbCache.get<GitHubBranch[]>("keyval", "current_branches");
        const branch = await dbCache.get<string>("keyval", "current_branch");
        const tree = await dbCache.get<GrixFileNode[]>("keyval", "current_tree");
        const active = await dbCache.get<GrixFileNode>("keyval", "active_file");
        const content = await dbCache.get<string>("keyval", "editor_content");

        if (repo) setSelectedRepo(repo);
        if (branchList) setBranches(branchList);
        if (branch) setSelectedBranch(branch);
        if (tree) setFileSystemTree(tree);
        if (active) setActiveFile(active);
        if (content !== null && content !== undefined) setEditorContent(content);
      } catch (e) {
        console.warn("[FileSystem] Error restoring workspace cache:", e);
      }
    };
    restoreCachedWorkspace();
  }, []);

  // Helper to persist key states
  const saveStateToCache = async (
    repo: GitHubRepo | null,
    branch: string,
    tree: GrixFileNode[],
    active: GrixFileNode | null,
    content: string,
    branchList: GitHubBranch[] = []
  ) => {
    try {
      await dbCache.set("keyval", "current_repo", repo);
      await dbCache.set("keyval", "current_branch", branch);
      await dbCache.set("keyval", "current_tree", tree);
      await dbCache.set("keyval", "active_file", active);
      await dbCache.set("keyval", "editor_content", content);
      if (branchList.length > 0) {
        await dbCache.set("keyval", "current_branches", branchList);
      }
    } catch (e) {
      console.warn("[FileSystem] Error saving state cache:", e);
    }
  };

  const loadDirectoryContents = async (
    repo: GitHubRepo,
    branch: string,
    path: string,
    force: boolean = false
  ) => {
    const cacheKey = `${repo.owner.login}/${repo.name}/${branch}/${path}`;

    if (!force) {
      try {
        const cached = await dbCache.get<GrixFileNode[]>("dir_cache", cacheKey);
        if (cached && cached.length > 0) {
          if (path === "") {
            setFileSystemTree(cached);
            await dbCache.set("keyval", "current_tree", cached);
          } else {
            setFileSystemTree(prevTree => {
              const updated = updateTreeWithChildren(prevTree, path, cached);
              dbCache.set("keyval", "current_tree", updated);
              return updated;
            });
          }
          return;
        }
      } catch (e) {
        console.warn("[FileSystem] Error fetching directory from cache:", e);
      }
    }

    try {
      const contents = await github.getRepositoryContents(repo.owner.login, repo.name, path, branch);
      const parsedNodes: GrixFileNode[] = contents.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        type: item.type === "dir" ? "dir" : "file",
        children: item.type === "dir" ? [] : undefined,
        isOpen: false,
        isLoaded: item.type !== "dir"
      }));

      // Cache directory result
      await dbCache.set("dir_cache", cacheKey, parsedNodes);

      if (path === "") {
        setFileSystemTree(parsedNodes);
        await dbCache.set("keyval", "current_tree", parsedNodes);
      } else {
        setFileSystemTree(prevTree => {
          const updated = updateTreeWithChildren(prevTree, path, parsedNodes);
          dbCache.set("keyval", "current_tree", updated);
          return updated;
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to navigate directory");
    }
  };

  const handleSelectRepo = async (repo: GitHubRepo | null) => {
    setSelectedRepo(repo);
    setFileSystemTree([]);
    setActiveFile(null);
    setEditorContent("");
    
    if (!repo) {
      setBranches([]);
      setSelectedBranch("");
      await resetFileSystem();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const gitBranches = await github.getBranches(repo.owner.login, repo.name);
      setBranches(gitBranches);
      
      const defaultBranch = repo.default_branch || (gitBranches.length > 0 ? gitBranches[0].name : "");
      setSelectedBranch(defaultBranch);
      
      await saveStateToCache(repo, defaultBranch, [], null, "", gitBranches);
      await loadDirectoryContents(repo, defaultBranch, "", false);
    } catch (err: any) {
      setError(err.message || "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBranch = async (branchName: string) => {
    if (!selectedRepo) return;
    setSelectedBranch(branchName);
    setFileSystemTree([]);
    setActiveFile(null);
    setEditorContent("");
    setIsLoading(true);
    setError(null);

    try {
      await dbCache.set("keyval", "current_branch", branchName);
      await loadDirectoryContents(selectedRepo, branchName, "", false);
    } catch (err: any) {
      setError(err.message || `Failed to load branch ${branchName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFileContent = async (fileNode: GrixFileNode, force: boolean = false) => {
    if (!selectedRepo) return;

    // Check if the file is already loaded and cached in active state tree
    const existingNode = findNodeInTree(fileSystemTree, fileNode.path);
    if (existingNode && existingNode.isLoaded && existingNode.content !== undefined && !force) {
      setActiveFile(existingNode);
      setEditorContent(existingNode.content);
      await dbCache.set("keyval", "active_file", existingNode);
      await dbCache.set("keyval", "editor_content", existingNode.content);
      return;
    }

    const cacheKey = `${selectedRepo.owner.login}/${selectedRepo.name}/${selectedBranch}/${fileNode.path}`;
    
    if (!force) {
      try {
        const cached = await dbCache.get<any>("file_cache", cacheKey);
        if (cached && cached.content !== undefined) {
          const updatedNode = {
            ...fileNode,
            content: cached.content,
            originalContent: cached.originalContent || cached.content,
            sha: cached.sha || fileNode.sha,
            isLoaded: true,
            isModified: cached.isModified || false
          };
          setActiveFile(updatedNode);
          setEditorContent(cached.content);
          setFileSystemTree(prevTree => {
            const ut = updateFileNodeInTree(prevTree, fileNode.path, updatedNode);
            dbCache.set("keyval", "current_tree", ut);
            return ut;
          });
          await dbCache.set("keyval", "active_file", updatedNode);
          await dbCache.set("keyval", "editor_content", cached.content);
          return;
        }
      } catch (e) {
        console.warn("[FileSystem] Error reading file content from cache:", e);
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileData = await github.getFileBlob(
        selectedRepo.owner.login,
        selectedRepo.name,
        fileNode.path,
        selectedBranch
      );
      
      const updatedNode = {
        ...fileNode,
        content: fileData.content,
        originalContent: fileData.content,
        isLoaded: true,
        isModified: false,
        sha: fileData.sha
      };

      // Cache file blob locally
      await dbCache.set("file_cache", cacheKey, {
        content: fileData.content,
        originalContent: fileData.content,
        sha: fileData.sha,
        isModified: false
      });

      setActiveFile(updatedNode);
      setEditorContent(fileData.content);
      setFileSystemTree(prevTree => {
        const ut = updateFileNodeInTree(prevTree, fileNode.path, updatedNode);
        dbCache.set("keyval", "current_tree", ut);
        return ut;
      });
      await dbCache.set("keyval", "active_file", updatedNode);
      await dbCache.set("keyval", "editor_content", fileData.content);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve file content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (newContent: string) => {
    if (!activeFile || !selectedRepo) return;
    setEditorContent(newContent);
    const updated = {
      ...activeFile,
      content: newContent,
      isModified: newContent !== activeFile.originalContent
    };
    setActiveFile(updated);
    setFileSystemTree(prevTree => {
      const ut = updateFileNodeInTree(prevTree, activeFile.path, updated);
      dbCache.set("keyval", "current_tree", ut);
      return ut;
    });

    dbCache.set("keyval", "active_file", updated);
    dbCache.set("keyval", "editor_content", newContent);

    // Also update current active file in local cache
    const cacheKey = `${selectedRepo.owner.login}/${selectedRepo.name}/${selectedBranch}/${activeFile.path}`;
    dbCache.set("file_cache", cacheKey, {
      content: newContent,
      originalContent: activeFile.originalContent,
      sha: activeFile.sha,
      isModified: newContent !== activeFile.originalContent
    });
  };

  const handleSaveFile = async (commitMessage: string) => {
    if (!selectedRepo || !activeFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const fileDetails = await github.getFileBlob(
        selectedRepo.owner.login,
        selectedRepo.name,
        activeFile.path,
        selectedBranch
      );

      await github.writeConfigFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        activeFile.path,
        commitMessage || `Update ${activeFile.name}`,
        editorContent,
        fileDetails.sha,
        selectedBranch
      );

      const savedNode = {
        ...activeFile,
        originalContent: editorContent,
        isModified: false,
        sha: fileDetails.sha
      };

      const cacheKey = `${selectedRepo.owner.login}/${selectedRepo.name}/${selectedBranch}/${activeFile.path}`;
      await dbCache.set("file_cache", cacheKey, {
        content: editorContent,
        originalContent: editorContent,
        sha: fileDetails.sha,
        isModified: false
      });

      setActiveFile(savedNode);
      setFileSystemTree(prevTree => {
        const ut = updateFileNodeInTree(prevTree, activeFile.path, savedNode);
        dbCache.set("keyval", "current_tree", ut);
        return ut;
      });
      await dbCache.set("keyval", "active_file", savedNode);
      await dbCache.set("keyval", "editor_content", editorContent);
    } catch (err: any) {
      setError(err?.message || "Failed to save file change to GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncZipFiles = async (files: { path: string; content: string }[]) => {
    if (!selectedRepo) return;
    setIsLoading(true);
    setError(null);

    let completedCount = 0;
    try {
      for (const file of files) {
        let sha: string | undefined = undefined;

        try {
          const fileDetails = await github.getFileBlob(
            selectedRepo.owner.login,
            selectedRepo.name,
            file.path,
            selectedBranch
          );
          if (fileDetails) {
            sha = fileDetails.sha;
          }
        } catch (e) {}

        await github.writeConfigFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          file.path,
          `Sync ${file.path} unpacked from Gothwad Ai Studio ZIP`,
          file.content,
          sha,
          selectedBranch
        );

        // Pre-cache synchronized files
        const cacheKey = `${selectedRepo.owner.login}/${selectedRepo.name}/${selectedBranch}/${file.path}`;
        await dbCache.set("file_cache", cacheKey, {
          content: file.content,
          originalContent: file.content,
          sha: sha || "",
          isModified: false
        });

        completedCount++;
      }

      await loadDirectoryContents(selectedRepo, selectedBranch, "", true);
    } catch (err: any) {
      setError(`Failed to sync ZIP archive fully. Synchronized ${completedCount}/${files.length}. Error: ${err.message || err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (parentPath: string, filename: string, content: string = "") => {
    if (!selectedRepo) return;
    setIsLoading(true);
    setError(null);
    try {
      const fullPath = parentPath ? `${parentPath}/${filename}` : filename;
      await github.writeConfigFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        fullPath,
        `Create file: ${fullPath}`,
        content,
        undefined,
        selectedBranch
      );
      await loadDirectoryContents(selectedRepo, selectedBranch, "", true);
    } catch (err: any) {
      setError(err?.message || "Failed to create file");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (parentPath: string, folderName: string) => {
    if (!selectedRepo) return;
    setIsLoading(true);
    setError(null);
    try {
      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      const gitkeepPath = `${fullPath}/.gitkeep`;
      await github.writeConfigFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        gitkeepPath,
        `Create folder: ${fullPath}`,
        "",
        undefined,
        selectedBranch
      );
      await loadDirectoryContents(selectedRepo, selectedBranch, "", true);
    } catch (err: any) {
      setError(err?.message || "Failed to create folder");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameNode = async (node: GrixFileNode, newName: string) => {
    if (!selectedRepo) return;
    setIsLoading(true);
    setError(null);
    try {
      const parentPath = node.path.includes("/") 
        ? node.path.substring(0, node.path.lastIndexOf("/")) 
        : "";
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;

      if (node.type === "file") {
        const { content } = await github.getFileBlob(
          selectedRepo.owner.login,
          selectedRepo.name,
          node.path,
          selectedBranch
        );
        await github.writeConfigFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          newPath,
          `Rename file from ${node.name} to ${newName}`,
          content,
          undefined,
          selectedBranch
        );
        await github.deleteFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          node.path,
          `Delete old renamed file: ${node.path}`,
          node.sha || "",
          selectedBranch
        );
      } else {
        const renameFolderContents = async (dirPath: string) => {
          const items = await github.getRepositoryContents(
            selectedRepo.owner.login,
            selectedRepo.name,
            dirPath,
            selectedBranch
          );
          for (const item of items) {
            const relativePath = item.path.substring(node.path.length);
            const targetPath = `${newPath}${relativePath}`;
            if (item.type === "dir") {
              await renameFolderContents(item.path);
            } else {
              const { content } = await github.getFileBlob(
                selectedRepo.owner.login,
                selectedRepo.name,
                item.path,
                selectedBranch
              );
              await github.writeConfigFile(
                selectedRepo.owner.login,
                selectedRepo.name,
                targetPath,
                `Rename nested folder item: ${item.path} -> ${targetPath}`,
                content,
                undefined,
                selectedBranch
              );
              await github.deleteFile(
                selectedRepo.owner.login,
                selectedRepo.name,
                item.path,
                `Cleanup old renamed folder item: ${item.path}`,
                item.sha,
                selectedBranch
              );
            }
          }
        };
        await renameFolderContents(node.path);
      }
      if (activeFile && (activeFile.path === node.path || activeFile.path.startsWith(node.path + "/"))) {
        setActiveFile(null);
      }
      await loadDirectoryContents(selectedRepo, selectedBranch, "", true);
    } catch (err: any) {
      setError(err?.message || "Failed to rename");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNode = async (node: GrixFileNode) => {
    if (!selectedRepo) return;
    setIsLoading(true);
    setError(null);
    try {
      if (node.type === "file") {
        let actualSha = node.sha || "";
        try {
          const freshDetails = await github.getFileBlob(
            selectedRepo.owner.login,
            selectedRepo.name,
            node.path,
            selectedBranch
          );
          if (freshDetails && freshDetails.sha) {
            actualSha = freshDetails.sha;
          }
        } catch (e) {
          console.warn("[handleDeleteNode] Failed to fetch fresh SHA, falling back to node SHA:", e);
        }

        await github.deleteFile(
          selectedRepo.owner.login,
          selectedRepo.name,
          node.path,
          `Delete file: ${node.path}`,
          actualSha,
          selectedBranch
        );
      } else {
        const fetchAndDelete = async (dirPath: string) => {
          const items = await github.getRepositoryContents(
            selectedRepo.owner.login,
            selectedRepo.name,
            dirPath,
            selectedBranch
          );

          for (const item of items) {
            if (item.type === "dir") {
              await fetchAndDelete(item.path);
            } else {
              await github.deleteFile(
                selectedRepo.owner.login,
                selectedRepo.name,
                item.path,
                `Delete ${item.path} (folder cleanup)`,
                item.sha,
                selectedBranch
              );
            }
          }
        };
        await fetchAndDelete(node.path);
      }
      if (activeFile && (activeFile.path === node.path || activeFile.path.startsWith(node.path + "/"))) {
        setActiveFile(null);
      }
      await loadDirectoryContents(selectedRepo, selectedBranch, "", true);
    } catch (err: any) {
      setError(err?.message || "Failed to delete item");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetFileSystem = async () => {
    setSelectedRepo(null);
    setBranches([]);
    setSelectedBranch("");
    setFileSystemTree([]);
    setActiveFile(null);
    setEditorContent("");

    try {
      await dbCache.clearStore("dir_cache");
      await dbCache.clearStore("file_cache");
      await dbCache.delete("keyval", "current_repo");
      await dbCache.delete("keyval", "current_branch");
      await dbCache.delete("keyval", "current_tree");
      await dbCache.delete("keyval", "active_file");
      await dbCache.delete("keyval", "editor_content");
      await dbCache.delete("keyval", "current_branches");
    } catch (e) {}
  };

  return {
    selectedRepo,
    branches,
    selectedBranch,
    fileSystemTree,
    activeFile,
    editorContent,
    isLoading,
    error,
    selectRepo: handleSelectRepo,
    selectBranch: handleSelectBranch,
    loadDirectory: async (path: string, force: boolean = false) => {
      if (!selectedRepo) return;
      if (path === "") {
        setIsLoading(true);
        try {
          await loadDirectoryContents(selectedRepo, selectedBranch, "", force);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      const existingNode = findNodeInTree(fileSystemTree, path);
      if (existingNode && existingNode.isLoaded && !force) {
        setFileSystemTree(prevTree => {
          const toggled = toggleDirectoryInTree(prevTree, path);
          dbCache.set("keyval", "current_tree", toggled);
          return toggled;
        });
        return;
      }
      setIsLoading(true);
      try {
        await loadDirectoryContents(selectedRepo, selectedBranch, path, force);
      } finally {
        setIsLoading(false);
      }
    },
    loadFile: async (node: GrixFileNode, force: boolean = false) => {
      await loadFileContent(node, force);
    },
    setActiveFile,
    updateEditor: handleEditorChange,
    saveFile: handleSaveFile,
    syncZipFiles: handleSyncZipFiles,
    createFile: handleCreateFile,
    createFolder: handleCreateFolder,
    renameNode: handleRenameNode,
    deleteNode: handleDeleteNode,
    resetFileSystem
  };
}

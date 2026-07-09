import { useGitHubAuth } from "./useGitHubAuth";
import { useGitHubFileSystem } from "./useGitHubFileSystem";

export function useGitHub() {
  const auth = useGitHubAuth();
  const fs = useGitHubFileSystem();

  const handleLogout = () => {
    auth.logout();
    fs.resetFileSystem();
  };

  // Combine states from both sub-hooks
  const isLoading = auth.isLoading || fs.isLoading;
  const error = auth.error || fs.error;

  // Intercept selectRepo to clear filesystem when disconnected
  const handleSelectRepo = async (repo: any) => {
    await fs.selectRepo(repo);
  };

  return {
    token: auth.token,
    user: auth.user,
    repos: auth.repos,
    selectedRepo: fs.selectedRepo,
    branches: fs.branches,
    selectedBranch: fs.selectedBranch,
    fileSystemTree: fs.fileSystemTree,
    activeFile: fs.activeFile,
    editorContent: fs.editorContent,
    isLoading,
    error,
    login: auth.login,
    selectRepo: handleSelectRepo,
    selectBranch: fs.selectBranch,
    loadDirectory: fs.loadDirectory,
    loadFile: fs.loadFile,
    setActiveFile: fs.setActiveFile,
    updateEditor: fs.updateEditor,
    saveFile: fs.saveFile,
    syncZipFiles: fs.syncZipFiles,
    createFile: fs.createFile,
    createFolder: fs.createFolder,
    renameNode: fs.renameNode,
    deleteNode: fs.deleteNode,
    logout: handleLogout,
    refreshRepos: auth.refreshRepos
  };
}

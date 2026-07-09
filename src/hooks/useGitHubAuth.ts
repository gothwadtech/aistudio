import { useState, useEffect, useCallback } from "react";
import { GitHubUser, GitHubRepo } from "../types/github";
import { github } from "../services/github";

export function useGitHubAuth() {
  const [token, setTokenState] = useState<string | null>(github.getToken());
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async (newToken?: string) => {
    if (newToken) {
      github.setToken(newToken);
      setTokenState(newToken);
    }

    const currentToken = github.getToken();
    if (!currentToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const gitUser = await github.getUser();
      setUser(gitUser);
      
      const gitRepos = await github.getRepositories();
      setRepos(gitRepos);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve GitHub profile");
      const msg = (err.message || "").toLowerCase();
      const isAuthError = msg.includes("unauthorized") || msg.includes("401") || msg.includes("bad credentials") || msg.includes("invalid");
      if (isAuthError) {
        github.setToken(null);
        setTokenState(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogout = () => {
    github.setToken(null);
    setTokenState(null);
    setUser(null);
    setRepos([]);
  };

  const refreshRepos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gitRepos = await github.getRepositories();
      setRepos(gitRepos);
    } catch (err: any) {
      setError(err.message || "Failed to refresh repositories");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    token,
    user,
    repos,
    isLoading,
    error,
    login: initAuth,
    logout: handleLogout,
    refreshRepos
  };
}

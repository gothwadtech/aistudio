import { useState, useEffect, useCallback } from "react";
import { GitHubUser, GitHubRepo } from "../types/github";
import { github } from "../services/github";
import { supabaseService } from "../services/supabase";

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
      try {
        await supabaseService.saveUserGitHubToken(newToken);
      } catch (e) {
        console.warn("Failed to auto-save GitHub token to Supabase:", e);
      }
    }

    let currentToken = github.getToken();
    if (!currentToken) {
      try {
        const savedToken = await supabaseService.getUserGitHubToken();
        if (savedToken) {
          github.setToken(savedToken);
          setTokenState(savedToken);
          currentToken = savedToken;
        }
      } catch (e) {
        console.warn("Failed to check Supabase for saved GitHub token:", e);
      }
    }

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

  // Intercept Supabase redirection and extract provider token
  useEffect(() => {
    const handleSupabaseSession = async () => {
      try {
        const client = supabaseService.getClient();
        if (!client) return;

        // Try to extract provider_token from the URL hash first (from Supabase redirect)
        let providerToken = null;
        const hash = window.location.hash || "";
        if (hash.includes("provider_token=")) {
          const match = hash.match(/provider_token=([^&]*)/);
          if (match && match[1]) {
            providerToken = decodeURIComponent(match[1]);
          }
        }

        const { data: { session }, error } = await client.auth.getSession();
        if (error) {
          console.error("Supabase session error:", error);
          return;
        }

        if (session) {
          if (!providerToken) {
            providerToken = session.provider_token || session.user?.user_metadata?.github_token;
          }
          
          if (!providerToken) {
            // Check if there is a saved token in SQL database
            const savedToken = await supabaseService.getUserGitHubToken();
            if (savedToken) {
              providerToken = savedToken;
            }
          }

          if (providerToken) {
            initAuth(providerToken);
            if (window.location.hash) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }
          }
        }
      } catch (e) {
        console.warn("Could not retrieve Supabase session:", e);
      }
    };

    handleSupabaseSession();

    let subscription: any = null;
    try {
      const client = supabaseService.getClient();
      if (client) {
        const authChange = client.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            let tokenToUse = null;
            const hash = window.location.hash || "";
            if (hash.includes("provider_token=")) {
              const match = hash.match(/provider_token=([^&]*)/);
              if (match && match[1]) {
                tokenToUse = decodeURIComponent(match[1]);
              }
            }

            if (!tokenToUse) {
              tokenToUse = session.provider_token || session.user?.user_metadata?.github_token;
            }

            if (!tokenToUse) {
              const savedToken = await supabaseService.getUserGitHubToken();
              if (savedToken) {
                tokenToUse = savedToken;
              }
            }

            if (tokenToUse) {
              initAuth(tokenToUse);
              if (window.location.hash) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
              }
            }
          } else if (event === "SIGNED_OUT") {
            handleLogout();
          }
        });
        subscription = authChange.data.subscription;
      }
    } catch (e) {
      console.warn("Could not subscribe to Supabase auth changes:", e);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [initAuth]);


  const disconnectGitHub = async () => {
    github.setToken(null);
    setTokenState(null);
    setUser(null);
    setRepos([]);
    try {
      await supabaseService.saveUserGitHubToken("");
    } catch (e) {
      console.warn("Failed to clear GitHub token from Supabase:", e);
    }
  };

  const handleLogout = async () => {
    github.setToken(null);
    setTokenState(null);
    setUser(null);
    setRepos([]);
    // Sign out from Supabase only if there is an active session
    try {
      const client = supabaseService.getClient();
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          await client.auth.signOut();
        }
      }
    } catch (e) {
      console.warn("Failed to sign out from Supabase on logout:", e);
    }
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
    disconnectGitHub,
    refreshRepos
  };
}

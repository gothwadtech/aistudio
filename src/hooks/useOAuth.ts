import { useEffect } from "react";
import { safeStorage } from "../utils/safeStorage";

interface AuthConfig {
  clientId: string;
  appUrl: string;
}

export function useOAuth(
  authConfig: AuthConfig | null,
  login: (token: string) => void
) {
  // Handle OAuth Redirect login URL via centered safe popup
  const triggerOAuthLogin = () => {
    if (!authConfig || !authConfig.clientId) {
      alert("GitHub Client ID is not configured. Please use a Personal Access Token below.");
      return;
    }
    const scopes = "repo,user";
    const redirectUri = `${authConfig.appUrl}/api/auth/github/callback`;
    const state = Math.random().toString(36).substring(7);
    
    try {
      safeStorage.setItem("oauth_state", state);
    } catch (e) {
      console.warn("Could not save oauth_state to safeStorage", e);
    }
    
    const width = 580;
    const height = 700;
    let left = (window.outerWidth - width) / 2 + window.screenX;
    let top = (window.outerHeight - height) / 2 + window.screenY;
    
    try {
      if (window.top && window.top.location.origin === window.location.origin) {
        left = (window.top.outerWidth - width) / 2 + window.top.screenX;
        top = (window.top.outerHeight - height) / 2 + window.top.screenY;
      }
    } catch (e) {}
    
    const popupUrl = `https://github.com/login/oauth/authorize?client_id=${authConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
    
    const oauthWindow = window.open(
      popupUrl,
      "gothwad_studio_github_oauth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    );

    if (!oauthWindow) {
      alert("Popup Blocked! Please allow popups so Gothwad Ai Studio can securely authenticate your GitHub account.");
    }
  };

  // Listen for callback messages from the popup or fallback query parsing
  useEffect(() => {
    const handleOauthMessage = (e: MessageEvent) => {
      if (e.data?.type === "GOTHWAD_STUDIO_OAUTH_SUCCESS" && e.data.token) {
        login(e.data.token);
      } else if (e.data?.type === "GOTHWAD_STUDIO_OAUTH_FAILURE" && e.data.error) {
        alert(`Authentication Error: ${e.data.error}`);
      }
    };
    window.addEventListener("message", handleOauthMessage);

    // Fallback: direct code redirection check in same window
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      fetch("/api/auth/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          login(data.access_token);
        } else if (data.error) {
          alert(`Authentication error: ${data.error_description || data.error}`);
        }
      })
      .catch(err => {
        console.error("Token exchange failed", err);
        alert("GitHub Serverless Callback: Token exchange requires an active Express backend. Please use a GitHub Personal Access Token (PAT) under settings to log in on Cloudflare Pages/static hosting.");
      });
    }

    return () => {
      window.removeEventListener("message", handleOauthMessage);
    };
  }, [login]);

  return {
    triggerOAuthLogin
  };
}

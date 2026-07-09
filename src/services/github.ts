import { GitHubUser, GitHubRepo, GitHubBranch, GitHubFileItem, GitHubCommit } from "../types/github";
import { safeStorage } from "../utils/safeStorage";

/**
 * Service to interact with Gothwad Ai Studio API proxy & GitHub
 */
class GitHubService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      safeStorage.setItem("gothwad_studio_token", token);
    } else {
      safeStorage.removeItem("gothwad_studio_token");
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = safeStorage.getItem("gothwad_studio_token");
    }
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { "Authorization": `token ${token}` } : {};
  }

  // Handle API request proxying
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...this.getHeaders(),
      ...(options.headers as any),
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`/api/github-proxy/${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `GitHub request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.message || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Fetch verified user details
  async getUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("user");
  }

  // List repositories for authenticated user
  async getRepositories(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>("user/repos?sort=updated&per_page=100");
  }

  // Fetch branches for a specific repository
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request<GitHubBranch[]>(`repos/${owner}/${repo}/branches`);
  }

  // Get repository file content tree or specific subdirectory
  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = "",
    ref?: string
  ): Promise<GitHubFileItem[]> {
    const query = ref ? `?ref=${ref}` : "";
    return this.request<GitHubFileItem[]>(`repos/${owner}/${repo}/contents/${path}${query}`);
  }

  // Retrieve raw file payload
  async getRawFileContent(downloadUrl: string): Promise<string> {
    const response = await fetch(downloadUrl, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error("Failed to fetch file content");
    }

    return response.text();
  }

  // Helper to check if a file path is a text file
  private isTextFile(path: string): boolean {
    const filename = path.split("/").pop() || "";
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!filename.includes(".")) return true; // LICENSE, Makefile, etc.
    
    const textExtensions = new Set([
      "txt", "md", "markdown", "mdown", "js", "jsx", "ts", "tsx", "mjs", "cjs", 
      "css", "scss", "sass", "less", "html", "htm", "xml", "svg", "json", "lock", 
      "py", "r", "rb", "pl", "pm", "php", "go", "rs", "c", "cpp", "h", "hpp", 
      "cc", "java", "kt", "kts", "gradle", "sql", "yaml", "yml", "sh", "bash", 
      "zsh", "bat", "cmd", "ps1", "ini", "conf", "config", "properties", "env", 
      "example", "gitignore", "gitattributes", "dockerfile", "editorconfig", "toml",
      "babelrc", "eslintrc", "prettierrc", "flowconfig"
    ]);
    return textExtensions.has(ext);
  }

  // Fetch file metadata and decoded Base64 contents from GitHub
  async getFileBlob(owner: string, repo: string, path: string, ref?: string): Promise<{ content: string; sha: string }> {
    const query = ref ? `?ref=${ref}` : "";
    const data = await this.request<{ content: string; sha: string; encoding: string }>(
      `repos/${owner}/${repo}/contents/${path}${query}`
    );

    let decoded = "";
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const isText = this.isTextFile(path);

    if (data.content && data.encoding === "base64") {
      // Remove newline characters from base64 string
      const sanitizedBase64 = data.content.replace(/\s/g, "");
      if (!isText) {
        const mimeTypes: Record<string, string> = {
          png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", bmp: "image/bmp",
          mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4", mp4: "video/mp4", webm: "video/webm", pdf: "application/pdf",
          zip: "application/zip", rar: "application/x-rar-compressed", tar: "application/x-tar", gz: "application/gzip", "7z": "application/x-7z-compressed"
        };
        const mime = mimeTypes[ext] || "application/octet-stream";
        decoded = `data:${mime};base64,${sanitizedBase64}`;
      } else {
        // Robust UTF-8 Base64 decoding
        try {
          const binString = atob(sanitizedBase64);
          const len = binString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binString.charCodeAt(i);
          }
          decoded = new TextDecoder("utf-8").decode(bytes);
        } catch (e) {
          console.warn("[getFileBlob] TextDecoder failed, fallback to atob:", e);
          decoded = atob(sanitizedBase64);
        }
      }
    }

    return {
      content: decoded,
      sha: data.sha
    };
  }

  // Write content (create or update file) in GitHub Repository
  async writeConfigFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha?: string,
    branch?: string
  ): Promise<any> {
    let encodedContent = "";
    try {
      const bytes = new TextEncoder().encode(content);
      let binString = "";
      const len = bytes.byteLength;
      const chunkSize = 8192;
      for (let i = 0; i < len; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binString += String.fromCharCode.apply(null, chunk as any);
      }
      encodedContent = btoa(binString);
    } catch (e) {
      encodedContent = btoa(unescape(encodeURIComponent(content)));
    }

    const body: Record<string, any> = {
      message,
      content: encodedContent,
    };

    if (sha) body.sha = sha;
    if (branch) body.branch = branch;

    return this.request(`repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // Fetch commits for a specific repository
  async getCommits(owner: string, repo: string, branch?: string): Promise<GitHubCommit[]> {
    const query = branch ? `?sha=${branch}` : "";
    return this.request<GitHubCommit[]>(`repos/${owner}/${repo}/commits${query}`);
  }

  // Create a new repository for the authenticated user
  async createRepository(name: string, description: string, isPrivate: boolean): Promise<GitHubRepo> {
    return this.request<GitHubRepo>("user/repos", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true // creates an initial README.md
      })
    });
  }

  // Delete a repository
  async deleteRepository(owner: string, repo: string): Promise<any> {
    return this.request(`repos/${owner}/${repo}`, {
      method: "DELETE"
    });
  }

  // Delete a specific file in the repository
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ): Promise<any> {
    const body: Record<string, any> = {
      message,
      sha
    };
    if (branch) body.branch = branch;

    return this.request(`repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify(body)
    });
  }

  // Restore/rollback branch pointer to a specific commit SHA (force-push branch reference)
  async restoreToCommit(owner: string, repo: string, branch: string, commitSha: string): Promise<any> {
    return this.request(`repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({
        sha: commitSha,
        force: true
      })
    });
  }
}

export const github = new GitHubService();

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected?: boolean;
}

export interface GitHubFileItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir" | "submodule";
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GrixFileNode {
  name: string;
  path: string;
  sha?: string;
  type: "file" | "dir";
  children?: GrixFileNode[];
  isOpen?: boolean;
  content?: string;
  isLoaded?: boolean;
  isModified?: boolean;
  originalContent?: string;
}

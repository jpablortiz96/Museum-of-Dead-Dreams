export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  language: string | null;
  languages_url: string;
  commits_url: string;
  size: number;
  html_url: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics: string[];
  owner: {
    login: string;
  };
}

export interface GitHubLanguage {
  [key: string]: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string | null;
    };
  };
}

export interface GitHubRootItem {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

export interface RepoManifestSnippet {
  name: string;
  excerpt: string;
}

export interface CommitSnapshot {
  totalCommits: number;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string | null;
}

export interface AnalyzedRepo {
  repo: GitHubRepo;
  totalCommits: number;
  languages: string[];
  daysAbandoned: number;
  estimatedLOC: number;
  rank: number;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string | null;
  rootItems: string[];
  readmeExcerpt: string | null;
  manifestSnippets: RepoManifestSnippet[];
}

export interface AnalyzeProgress {
  completedRepos: string[];
  currentRepo: string;
  progress: number;
  totalRepos: number;
}

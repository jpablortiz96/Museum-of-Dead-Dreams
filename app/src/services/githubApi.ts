import { type Exhibit } from "@/data/exhibits";
import {
  type AnalyzeProgress,
  type AnalyzedRepo,
  type CommitSnapshot,
  type GitHubCommit,
  type GitHubLanguage,
  type GitHubRepo,
  type GitHubRootItem,
  type RepoManifestSnippet,
} from "@/types/github";
import {
  calculateDaysAbandoned,
  selectMostAbandonedRepos,
} from "@/utils/repoAnalyzer";

const GITHUB_API_BASE = "https://api.github.com";
const CACHE_TTL_MS = 60 * 60 * 1000;
const README_MAX_CHARS = 1400;
const ROOT_ITEM_LIMIT = 8;
const MANIFEST_EXCERPT_MAX_CHARS = 900;
const MAX_MANIFEST_FILES = 2;
const MANIFEST_CANDIDATES = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "composer.json",
  "Gemfile",
  "mix.exs",
  "Package.swift",
  "Dockerfile",
  "docker-compose.yml",
] as const;

type GitHubErrorCode =
  | "all_forks"
  | "network"
  | "no_public_repos"
  | "not_found"
  | "rate_limit"
  | "request_failed";

interface CachedMuseum {
  exhibits: Exhibit[];
  fetchedAt: number;
}

export class GitHubApiError extends Error {
  code: GitHubErrorCode;
  status?: number;

  constructor(code: GitHubErrorCode, message: string, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.code = code;
    this.status = status;
  }
}

function getGitHubHeaders(): HeadersInit {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function sleep(delayMs: number) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? `GitHub request failed with status ${response.status}.`;
  } catch {
    return `GitHub request failed with status ${response.status}.`;
  }
}

async function requestGitHub(
  url: string,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...getGitHubHeaders(),
          ...(init?.headers ?? {}),
        },
      });

      if (response.ok || response.status === 409) {
        return response;
      }

      const remaining = response.headers.get("x-ratelimit-remaining");
      if (response.status === 403 && remaining === "0") {
        throw new GitHubApiError(
          "rate_limit",
          "GitHub's spirits are tired. Try again in an hour.",
          response.status
        );
      }

      if (response.status === 404) {
        throw new GitHubApiError(
          "not_found",
          "That user doesn't exist in the GitHub graveyard.",
          response.status
        );
      }

      if (response.status >= 500 && attempt < retries) {
        await sleep(350 * (attempt + 1));
        continue;
      }

      const message = await readErrorMessage(response);
      throw new GitHubApiError("request_failed", message, response.status);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }

      if (attempt === retries) {
        throw new GitHubApiError(
          "network",
          "The museum gates failed to reach GitHub. Try again in a moment."
        );
      }

      await sleep(350 * (attempt + 1));
    }
  }

  throw new GitHubApiError(
    "request_failed",
    "The GitHub graveyard request exited unexpectedly."
  );
}

function normalizeText(value: string, maxChars: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function summarizeManifest(name: string, rawContent: string) {
  const trimmedContent = rawContent.trim();

  if (name === "package.json") {
    try {
      const parsedManifest = JSON.parse(trimmedContent) as {
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const scripts = Object.keys(parsedManifest.scripts ?? {}).slice(0, 8);
      const dependencies = Object.keys(parsedManifest.dependencies ?? {}).slice(0, 10);
      const devDependencies = Object.keys(parsedManifest.devDependencies ?? {}).slice(0, 8);

      return normalizeText(
        [
          `scripts: ${scripts.join(", ") || "none"}`,
          `dependencies: ${dependencies.join(", ") || "none"}`,
          `devDependencies: ${devDependencies.join(", ") || "none"}`,
        ].join(" | "),
        MANIFEST_EXCERPT_MAX_CHARS
      );
    } catch {
      return normalizeText(trimmedContent, MANIFEST_EXCERPT_MAX_CHARS);
    }
  }

  if (name === "requirements.txt") {
    const requirements = trimmedContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .slice(0, 16);

    return normalizeText(
      requirements.join(", "),
      MANIFEST_EXCERPT_MAX_CHARS
    );
  }

  return normalizeText(trimmedContent, MANIFEST_EXCERPT_MAX_CHARS);
}

export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const response = await requestGitHub(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(
      username
    )}/repos?sort=pushed&direction=asc&per_page=100&type=owner`
  );
  const repos = (await response.json()) as GitHubRepo[];

  if (repos.length === 0) {
    throw new GitHubApiError(
      "no_public_repos",
      "No public repos found. Either they're private or this developer is too perfect."
    );
  }

  return repos;
}

export async function getRepoLanguages(
  languagesUrl: string
): Promise<GitHubLanguage> {
  const response = await requestGitHub(languagesUrl);
  return (await response.json()) as GitHubLanguage;
}

function getCommitCountFromLinkHeader(linkHeader: string | null): number | null {
  if (!linkHeader) {
    return null;
  }

  const lastRelation = linkHeader
    .split(",")
    .map((linkPart) => linkPart.trim())
    .find((linkPart) => linkPart.endsWith('rel="last"'));

  if (!lastRelation) {
    return null;
  }

  const pageMatch = lastRelation.match(/[?&]page=(\d+)/);
  return pageMatch ? Number(pageMatch[1]) : null;
}

async function getRepoCommitSnapshot(
  owner: string,
  repo: string
): Promise<CommitSnapshot> {
  const response = await requestGitHub(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/commits?per_page=1`
  );

  if (response.status === 409) {
    return {
      totalCommits: 0,
      lastCommitSha: "EMPTY",
      lastCommitMessage: "Empty repository",
      lastCommitDate: null,
    };
  }

  const commits = (await response.json()) as GitHubCommit[];
  const totalCommits =
    getCommitCountFromLinkHeader(response.headers.get("link")) ??
    commits.length;

  return {
    totalCommits,
    lastCommitSha: commits[0]?.sha ?? "UNKNOWN",
    lastCommitMessage: normalizeText(
      commits[0]?.commit.message ?? "No commit message available.",
      220
    ),
    lastCommitDate: commits[0]?.commit.author.date ?? null,
  };
}

async function getRepoRootItems(
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<string[]> {
  const response = await requestGitHub(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo
    )}/contents?ref=${encodeURIComponent(defaultBranch)}`
  );

  if (response.status === 409) {
    return [];
  }

  const rootItems = (await response.json()) as GitHubRootItem[] | { message?: string };
  if (!Array.isArray(rootItems)) {
    return [];
  }

  return rootItems
    .filter((item) => item.type === "file" || item.type === "dir")
    .slice(0, ROOT_ITEM_LIMIT)
    .map((item) => item.name);
}

async function getRepoReadmeExcerpt(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const response = await requestGitHub(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
        },
      },
      1
    );

    if (response.status === 409) {
      return null;
    }

    const readmeText = await response.text();
    const normalizedReadme = normalizeText(readmeText, README_MAX_CHARS);
    return normalizedReadme || null;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return null;
    }

    return null;
  }
}

async function getRepoManifestSnippets(
  owner: string,
  repo: string,
  defaultBranch: string,
  rootItems: string[]
): Promise<RepoManifestSnippet[]> {
  const manifestNames: string[] = MANIFEST_CANDIDATES.filter((candidate) =>
    rootItems.includes(candidate)
  ).slice(0, MAX_MANIFEST_FILES);

  if (manifestNames.length === 0) {
    return [];
  }

  const manifests = await Promise.all(
    manifestNames.map(async (manifestName) => {
      try {
        const response = await requestGitHub(
          `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
            repo
          )}/contents/${encodeURIComponent(manifestName)}?ref=${encodeURIComponent(
            defaultBranch
          )}`,
          {
            headers: {
              Accept: "application/vnd.github.raw+json",
            },
          },
          1
        );

        if (response.status === 409) {
          return null;
        }

        const manifestText = await response.text();
        const excerpt = summarizeManifest(manifestName, manifestText);

        return excerpt
          ? {
              name: manifestName,
              excerpt,
            }
          : null;
      } catch {
        return null;
      }
    })
  );

  return manifests.filter((manifest) => manifest !== null) as RepoManifestSnippet[];
}

export async function getRepoCommitCount(
  owner: string,
  repo: string
): Promise<number> {
  const snapshot = await getRepoCommitSnapshot(owner, repo);
  return snapshot.totalCommits;
}

export async function analyzeUserRepos(
  username: string,
  onProgress?: (progress: AnalyzeProgress) => void
): Promise<AnalyzedRepo[]> {
  const repos = await getUserRepos(username);
  const selectedRepos = selectMostAbandonedRepos(repos);

  if (selectedRepos.length === 0) {
    throw new GitHubApiError(
      "all_forks",
      "Only forks found. This user only copies, never creates."
    );
  }

  const analyzedRepos: AnalyzedRepo[] = [];

  for (const [index, repo] of selectedRepos.entries()) {
    const [languagesPayload, commitSnapshot, rootItems, readmeExcerpt] = await Promise.all([
      getRepoLanguages(repo.languages_url),
      getRepoCommitSnapshot(repo.owner.login, repo.name),
      getRepoRootItems(repo.owner.login, repo.name, repo.default_branch),
      getRepoReadmeExcerpt(repo.owner.login, repo.name),
    ]);
    const manifestSnippets = await getRepoManifestSnippets(
      repo.owner.login,
      repo.name,
      repo.default_branch,
      rootItems
    );

    const languages = Object.entries(languagesPayload)
      .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
      .map(([language]) => language);

    const normalizedLanguages =
      languages.length > 0
        ? languages
        : repo.language
        ? [repo.language]
        : ["Unknown"];

    analyzedRepos.push({
      repo,
      totalCommits: commitSnapshot.totalCommits,
      languages: normalizedLanguages,
      daysAbandoned: calculateDaysAbandoned(repo.pushed_at ?? repo.created_at),
      estimatedLOC: Math.max(100, repo.size * 100),
      rank: index + 1,
      lastCommitSha: commitSnapshot.lastCommitSha,
      lastCommitMessage: commitSnapshot.lastCommitMessage,
      lastCommitDate: commitSnapshot.lastCommitDate,
      rootItems,
      readmeExcerpt,
      manifestSnippets,
    });

    onProgress?.({
      completedRepos: analyzedRepos.map((analyzedRepo) => analyzedRepo.repo.name),
      currentRepo: repo.name,
      progress: Math.round(((index + 1) / selectedRepos.length) * 100),
      totalRepos: selectedRepos.length,
    });
  }

  return analyzedRepos;
}

function getCacheKey(username: string) {
  return `modd-user-${username.toLowerCase()}`;
}

export function getCachedExhibits(username: string): Exhibit[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawCache = window.localStorage.getItem(getCacheKey(username));
  if (!rawCache) {
    return null;
  }

  try {
    const parsedCache = JSON.parse(rawCache) as CachedMuseum;
    if (Date.now() - parsedCache.fetchedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(getCacheKey(username));
      return null;
    }

    return parsedCache.exhibits;
  } catch {
    window.localStorage.removeItem(getCacheKey(username));
    return null;
  }
}

export function cacheExhibits(username: string, exhibits: Exhibit[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CachedMuseum = {
    exhibits,
    fetchedAt: Date.now(),
  };

  window.localStorage.setItem(getCacheKey(username), JSON.stringify(payload));
}

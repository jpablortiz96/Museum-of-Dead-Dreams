import { resurrectionExhibit, type Exhibit } from "@/data/exhibits";
import { type AnalyzedRepo } from "@/types/github";
import {
  type MuseumExhibitContent,
  type MuseumRepoContext,
} from "@/types/museum";
import {
  buildExhibitFromGeneratedContent,
  generateExhibitsFromAnalyzedRepos,
} from "@/utils/contentGenerator";

interface MuseumApiResponse {
  exhibits: MuseumExhibitContent[];
}

const REQUEST_TIMEOUT_MS = 20000;

class MuseumApiError extends Error {
  code: "aborted" | "invalid_response" | "request_failed";

  constructor(
    code: MuseumApiError["code"],
    message: string,
  ) {
    super(message);
    this.name = "MuseumApiError";
    this.code = code;
  }
}

function getApiUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_REVIVAL_API_BASE_URL ?? "").replace(/\/+$/, "");
  return configuredBaseUrl
    ? `${configuredBaseUrl}/api/museum-exhibits`
    : "/api/museum-exhibits";
}

function getPrimaryLanguage(repo: AnalyzedRepo) {
  return repo.languages[0] ?? repo.repo.language ?? "Unknown";
}

function createRepoContext(repo: AnalyzedRepo): MuseumRepoContext {
  return {
    id: repo.repo.id,
    name: repo.repo.name,
    owner: repo.repo.owner.login,
    description: repo.repo.description,
    htmlUrl: repo.repo.html_url,
    primaryLanguage: getPrimaryLanguage(repo),
    languages: repo.languages.slice(0, 5),
    topics: repo.repo.topics.slice(0, 5),
    daysAbandoned: repo.daysAbandoned,
    estimatedLOC: repo.estimatedLOC,
    totalCommits: repo.totalCommits,
    lastCommitSha: repo.lastCommitSha,
    lastCommitMessage: repo.lastCommitMessage,
    lastCommitDate: repo.lastCommitDate,
    deathDate: (repo.repo.pushed_at ?? repo.repo.created_at).slice(0, 10),
    stargazersCount: repo.repo.stargazers_count,
    forksCount: repo.repo.forks_count,
    openIssuesCount: repo.repo.open_issues_count,
    rank: repo.rank,
    rootItems: repo.rootItems.slice(0, 8),
    readmeExcerpt: repo.readmeExcerpt,
    manifestSnippets: repo.manifestSnippets.slice(0, 2),
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Museum API failed with status ${response.status}.`;
  } catch {
    return `Museum API failed with status ${response.status}.`;
  }
}

function appendResurrectionExhibit(exhibits: Exhibit[]): Exhibit[] {
  return [
    ...exhibits,
    {
      ...resurrectionExhibit,
      unlocked: false,
    },
  ];
}

async function requestMuseumExhibits(
  username: string,
  repos: AnalyzedRepo[]
): Promise<Exhibit[]> {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        repos: repos.map(createRepoContext),
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new MuseumApiError(
        "request_failed",
        await readErrorMessage(response),
      );
    }

    const payload = (await response.json()) as MuseumApiResponse;
    if (!Array.isArray(payload.exhibits) || payload.exhibits.length !== repos.length) {
      throw new MuseumApiError(
        "invalid_response",
        "Museum API returned an invalid exhibit set.",
      );
    }

    const exhibitMap = new Map(
      payload.exhibits.map((exhibit) => [exhibit.repoId, exhibit])
    );
    const generatedExhibits = repos.map((repo) => {
      const exhibit = exhibitMap.get(repo.repo.id);

      if (!exhibit) {
        throw new MuseumApiError(
          "invalid_response",
          `Museum API omitted exhibit content for ${repo.repo.name}.`,
        );
      }

      return buildExhibitFromGeneratedContent(repo, exhibit);
    });

    return appendResurrectionExhibit(generatedExhibits);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new MuseumApiError(
        "aborted",
        "Museum AI generation timed out before the curator finished writing.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function generateMuseumExhibits(
  username: string,
  repos: AnalyzedRepo[]
): Promise<Exhibit[]> {
  try {
    return await requestMuseumExhibits(username, repos);
  } catch {
    return generateExhibitsFromAnalyzedRepos(repos);
  }
}

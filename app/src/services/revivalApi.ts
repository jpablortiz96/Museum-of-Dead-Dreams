import { type Exhibit } from "@/data/exhibits";
import {
  type RevivalPlanRequestExhibit,
  type RevivalReport,
} from "@/types/revival";
import { detectProjectType } from "@/utils/projectClassifier";
import { generateRevivalReport } from "@/utils/revivalTemplates";

const CACHE_PREFIX = "modd-revival-plan-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const HEALTH_TIMEOUT_MS = 1500;
const inflightRequests = new Map<string, Promise<RevivalReport>>();

interface CachedRevivalReport {
  fetchedAt: number;
  report: RevivalReport;
}

interface RevivalApiResponse {
  report: RevivalReport;
}

class RevivalApiError extends Error {
  code: "aborted" | "invalid_response" | "request_failed";

  constructor(
    code: RevivalApiError["code"],
    message: string,
  ) {
    super(message);
    this.name = "RevivalApiError";
    this.code = code;
  }
}

function getApiUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_REVIVAL_API_BASE_URL ?? "").replace(/\/+$/, "");
  return configuredBaseUrl
    ? `${configuredBaseUrl}/api/revival-plan`
    : "/api/revival-plan";
}

function getHealthUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_REVIVAL_API_BASE_URL ?? "").replace(/\/+$/, "");
  return configuredBaseUrl
    ? `${configuredBaseUrl}/api/health`
    : "/api/health";
}

function getCacheKey(exhibit: Exhibit) {
  return [
    CACHE_PREFIX,
    exhibit.id,
    exhibit.lastCommit,
    exhibit.stats.commits,
    exhibit.stats.linesOfCode,
    exhibit.stats.daysAlive,
  ].join(":");
}

function createRevivalRequest(exhibit: Exhibit): RevivalPlanRequestExhibit {
  return {
    id: exhibit.id,
    name: exhibit.name,
    subtitle: exhibit.subtitle,
    description: exhibit.description,
    status: exhibit.status,
    deathDate: exhibit.deathDate,
    lastCommit: exhibit.lastCommit,
    tags: exhibit.tags.slice(0, 6),
    projectType: detectProjectType(exhibit),
    stats: {
      linesOfCode: exhibit.stats.linesOfCode,
      commits: exhibit.stats.commits,
      daysAlive: exhibit.stats.daysAlive,
      causeOfDeath: exhibit.stats.causeOfDeath,
    },
    artifacts: exhibit.artifacts.slice(0, 4).map((artifact) => ({
      name: artifact.name,
      description: artifact.description,
      state: artifact.state,
    })),
    revivalContext: exhibit.revivalContext ?? exhibit.description,
    founderContext:
      exhibit.founderContext ??
      "The original builder already understands the first failure mode firsthand.",
  };
}

function readCachedReport(exhibit: Exhibit): RevivalReport | null {
  const rawCache = window.localStorage.getItem(getCacheKey(exhibit));
  if (!rawCache) {
    return null;
  }

  try {
    const parsedCache = JSON.parse(rawCache) as CachedRevivalReport;
    if (Date.now() - parsedCache.fetchedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(getCacheKey(exhibit));
      return null;
    }

    return {
      ...parsedCache.report,
      meta: {
        ...parsedCache.report.meta,
        cached: true,
      },
    };
  } catch {
    window.localStorage.removeItem(getCacheKey(exhibit));
    return null;
  }
}

function cacheRevivalReport(exhibit: Exhibit, report: RevivalReport) {
  const payload: CachedRevivalReport = {
    fetchedAt: Date.now(),
    report: {
      ...report,
      meta: {
        ...report.meta,
        cached: false,
      },
    },
  };

  window.localStorage.setItem(getCacheKey(exhibit), JSON.stringify(payload));
}

function buildFallbackReport(exhibit: Exhibit, reason: string): RevivalReport {
  const fallbackReport = generateRevivalReport(exhibit);

  return {
    ...fallbackReport,
    meta: {
      ...fallbackReport.meta,
      fallbackReason: reason,
    },
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Revival API failed with status ${response.status}.`;
  } catch {
    return `Revival API failed with status ${response.status}.`;
  }
}

async function isRevivalApiAvailable() {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(
    () => abortController.abort(),
    HEALTH_TIMEOUT_MS
  );

  try {
    const response = await fetch(getHealthUrl(), {
      signal: abortController.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function requestRevivalReport(exhibit: Exhibit): Promise<RevivalReport> {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exhibit: createRevivalRequest(exhibit),
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new RevivalApiError(
        "request_failed",
        await readErrorMessage(response),
      );
    }

    const payload = (await response.json()) as RevivalApiResponse;
    if (!payload.report) {
      throw new RevivalApiError(
        "invalid_response",
        "Revival API returned an empty report.",
      );
    }

    const report: RevivalReport = {
      ...payload.report,
      meta: {
        ...payload.report.meta,
        cached: Boolean(payload.report.meta.cached),
      },
    };

    cacheRevivalReport(exhibit, report);
    return report;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RevivalApiError(
        "aborted",
        "Revival analysis timed out before the model finished.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getFallbackReason(error: unknown) {
  if (error instanceof RevivalApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Fell back to the offline template generator.";
}

export async function loadRevivalReport(exhibit: Exhibit): Promise<RevivalReport> {
  const cachedReport = readCachedReport(exhibit);
  if (cachedReport) {
    return cachedReport;
  }

  const cacheKey = getCacheKey(exhibit);
  const inflightRequest = inflightRequests.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = (async () => {
    try {
      const apiAvailable = await isRevivalApiAvailable();
      if (!apiAvailable) {
        return buildFallbackReport(
          exhibit,
          "Local museum intelligence server unavailable. Using offline fallback."
        );
      }

      return await requestRevivalReport(exhibit);
    } catch (error) {
      return buildFallbackReport(exhibit, getFallbackReason(error));
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

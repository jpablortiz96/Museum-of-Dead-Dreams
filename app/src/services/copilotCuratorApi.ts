import { type Exhibit } from "@/data/exhibits";
import {
  type CuratorChatMessage,
  type CuratorChatPayload,
  type CuratorChatRequestExhibit,
  type CuratorReply,
} from "@/types/curator";

const CACHE_PREFIX = "modd-curator-chat-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12000;
const inflightRequests = new Map<string, Promise<CuratorReply>>();

interface CachedCuratorReply {
  fetchedAt: number;
  reply: CuratorReply;
}

interface CuratorApiResponse {
  reply: CuratorReply;
}

class CopilotCuratorError extends Error {
  code: "aborted" | "invalid_response" | "request_failed";

  constructor(code: CopilotCuratorError["code"], message: string) {
    super(message);
    this.name = "CopilotCuratorError";
    this.code = code;
  }
}

function getApiUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_REVIVAL_API_BASE_URL ?? "").replace(/\/+$/, "");
  return configuredBaseUrl
    ? `${configuredBaseUrl}/api/copilot-curator`
    : "/api/copilot-curator";
}

function hashValue(value: string) {
  let hash = 7;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash.toString(16);
}

function buildHistory(messages: CuratorChatMessage[]) {
  return messages.slice(-6).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function createCuratorRequestExhibit(exhibit: Exhibit): CuratorChatRequestExhibit {
  return {
    id: exhibit.id,
    name: exhibit.name,
    subtitle: exhibit.subtitle,
    description: exhibit.description,
    status: exhibit.status,
    deathDate: exhibit.deathDate,
    lastCommit: exhibit.lastCommit,
    causeOfDeath: exhibit.stats.causeOfDeath,
    stats: {
      linesOfCode: exhibit.stats.linesOfCode,
      commits: exhibit.stats.commits,
      daysAlive: exhibit.stats.daysAlive,
    },
    tags: exhibit.tags.slice(0, 8),
    artifacts: exhibit.artifacts.slice(0, 6).map((artifact) => ({
      name: artifact.name,
      description: artifact.description,
      state: artifact.state,
    })),
    copilotInsight: exhibit.copilotInsight,
    copilotEpitaph: exhibit.copilotEpitaph,
    funFact: exhibit.funFact,
    revivalContext: exhibit.revivalContext,
    founderContext: exhibit.founderContext,
    curatorContext: exhibit.curatorContext,
  };
}

function getCacheKey(payload: CuratorChatPayload) {
  return [
    CACHE_PREFIX,
    payload.exhibit.id,
    hashValue(
      JSON.stringify({
        question: payload.question,
        history: payload.history,
      })
    ),
  ].join(":");
}

function readCachedReply(cacheKey: string): CuratorReply | null {
  const rawValue = window.localStorage.getItem(cacheKey);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CachedCuratorReply;
    if (Date.now() - parsedValue.fetchedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return {
      ...parsedValue.reply,
      meta: {
        ...parsedValue.reply.meta,
        cached: true,
      },
    };
  } catch {
    window.localStorage.removeItem(cacheKey);
    return null;
  }
}

function writeCachedReply(cacheKey: string, reply: CuratorReply) {
  const payload: CachedCuratorReply = {
    fetchedAt: Date.now(),
    reply: {
      ...reply,
      meta: {
        ...reply.meta,
        cached: false,
      },
    },
  };

  window.localStorage.setItem(cacheKey, JSON.stringify(payload));
}

function buildFallbackReply(
  exhibit: Exhibit,
  question: string,
  fallbackReason: string
): CuratorReply {
  const normalizedQuestion = question.toLowerCase();
  let answer = `${exhibit.name} looks like a ${exhibit.tags.join(", ") || "software"} project that stalled after ${exhibit.stats.commits} commits and ${exhibit.stats.daysAlive} silent days. `;

  if (/why|die|abandon|fail|murio|murió|aband/.test(normalizedQuestion)) {
    answer += `The clearest grounded answer is its recorded cause of death: ${exhibit.stats.causeOfDeath}. The exhibit description also suggests: ${exhibit.description}`;
  } else if (/stack|tech|language|lenguaje|framework/.test(normalizedQuestion)) {
    answer += `The strongest stack signals I have are ${exhibit.curatorContext?.primaryLanguage ?? exhibit.tags[0] ?? "unknown"} plus ${exhibit.curatorContext?.languages?.join(", ") ?? exhibit.tags.join(", ")}. The recovered artifacts also point to ${exhibit.artifacts.map((artifact) => artifact.name).join(", ")}.`;
  } else if (/first|fix|improve|mejor|arreglar|priority|prioridad/.test(normalizedQuestion)) {
    answer += `The first place I would push is the failure mode named in the exhibit: ${exhibit.stats.causeOfDeath}. After that, I would stabilize the most suspicious artifact: ${exhibit.artifacts[0]?.name ?? "the core entry point"}.`;
  } else {
    answer += `From the grounded evidence, the safest interpretation is that it had an interesting premise but weak follow-through in execution, packaging, or scope control. Ask me about why it died, what stack it used, or what should be fixed first.`;
  }

  return {
    answer,
    evidence: [
      `Cause of death: ${exhibit.stats.causeOfDeath}`,
      `Recovered artifacts: ${exhibit.artifacts
        .slice(0, 2)
        .map((artifact) => artifact.name)
        .join(", ")}`,
      `Repo stats: ${exhibit.stats.commits} commits, ${exhibit.stats.linesOfCode.toLocaleString()} LOC, ${exhibit.stats.daysAlive} silent days`,
    ],
    suggestedFollowUps: [
      `What would you fix first in ${exhibit.name}?`,
      `What stack clues do you see in this repo?`,
      `Why did this project likely stall?`,
    ],
    meta: {
      source: "fallback",
      model: null,
      generatedAt: new Date().toISOString(),
      cached: false,
      promptVersion: "template-curator-v1",
      fallbackReason,
    },
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Copilot Curator API failed with status ${response.status}.`;
  } catch {
    return `Copilot Curator API failed with status ${response.status}.`;
  }
}

async function requestCuratorReply(payload: CuratorChatPayload): Promise<CuratorReply> {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new CopilotCuratorError(
        "request_failed",
        await readErrorMessage(response)
      );
    }

    const parsedResponse = (await response.json()) as CuratorApiResponse;
    if (!parsedResponse.reply) {
      throw new CopilotCuratorError(
        "invalid_response",
        "Copilot Curator returned an empty reply."
      );
    }

    return {
      ...parsedResponse.reply,
      meta: {
        ...parsedResponse.reply.meta,
        cached: Boolean(parsedResponse.reply.meta.cached),
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new CopilotCuratorError(
        "aborted",
        "Copilot Curator timed out before answering."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getFallbackReason(error: unknown) {
  if (error instanceof CopilotCuratorError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Copilot Curator fell back to local grounded heuristics.";
}

export async function askCopilotCurator(options: {
  exhibit: Exhibit;
  question: string;
  messages: CuratorChatMessage[];
}): Promise<CuratorReply> {
  const payload: CuratorChatPayload = {
    exhibit: createCuratorRequestExhibit(options.exhibit),
    question: options.question.trim(),
    history: buildHistory(options.messages),
  };

  const cacheKey = getCacheKey(payload);
  const cachedReply = readCachedReply(cacheKey);
  if (cachedReply) {
    return cachedReply;
  }

  const inflightRequest = inflightRequests.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const requestPromise = (async () => {
    try {
      const reply = await requestCuratorReply(payload);
      writeCachedReply(cacheKey, reply);
      return reply;
    } catch (error) {
      return buildFallbackReply(options.exhibit, options.question, getFallbackReason(error));
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

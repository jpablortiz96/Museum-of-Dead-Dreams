import http from "node:http";
import { createHash } from "node:crypto";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const API_HOST = process.env.REVIVAL_API_HOST ?? "127.0.0.1";
const API_PORT = Number(process.env.REVIVAL_API_PORT ?? "8787");
const CACHE_TTL_MS = Number(
  process.env.REVIVAL_CACHE_TTL_MS ?? 24 * 60 * 60 * 1000
);
const REVIVAL_PROMPT_VERSION = "openai-revival-v1";
const MUSEUM_PROMPT_VERSION = "openai-museum-v1";
const CURATOR_PROMPT_VERSION = "openai-curator-v1";
const REVIVAL_MODEL =
  process.env.OPENAI_REVIVAL_MODEL ??
  process.env.OPENAI_MUSEUM_MODEL ??
  "gpt-5.4-mini";
const MUSEUM_MODEL =
  process.env.OPENAI_MUSEUM_MODEL ??
  process.env.OPENAI_REVIVAL_MODEL ??
  "gpt-5.4-mini";
const CURATOR_MODEL =
  process.env.OPENAI_CURATOR_MODEL ??
  process.env.OPENAI_REVIVAL_MODEL ??
  process.env.OPENAI_MUSEUM_MODEL ??
  "gpt-5.4-mini";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const artifactIconSchema = z.enum([
  "TrendingDown",
  "BarChart3",
  "ShieldAlert",
  "Scale",
  "Gauge",
  "Folder",
  "Code",
  "BookOpen",
  "Beaker",
  "FileText",
  "GitBranch",
  "Music",
  "Split",
  "AudioLines",
  "Bot",
  "Flame",
]);

const museumArtifactSchema = z.object({
  name: z.string().min(1),
  icon: artifactIconSchema,
  description: z.string().min(1),
  state: z.enum(["rotten", "broken", "unfinished", "working"]),
});

const museumRepoSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  owner: z.string().min(1),
  description: z.string().nullable(),
  htmlUrl: z.string().min(1),
  primaryLanguage: z.string().min(1),
  languages: z.array(z.string().min(1)).min(1).max(5),
  topics: z.array(z.string().min(1)).max(5),
  daysAbandoned: z.number().int().nonnegative(),
  estimatedLOC: z.number().int().nonnegative(),
  totalCommits: z.number().int().nonnegative(),
  lastCommitSha: z.string().min(1),
  lastCommitMessage: z.string().min(1),
  lastCommitDate: z.string().nullable(),
  deathDate: z.string().min(1),
  stargazersCount: z.number().int().nonnegative(),
  forksCount: z.number().int().nonnegative(),
  openIssuesCount: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  rootItems: z.array(z.string().min(1)).max(8),
  readmeExcerpt: z.string().nullable(),
  manifestSnippets: z.array(
    z.object({
      name: z.string().min(1),
      excerpt: z.string().min(1),
    })
  ).max(2),
});

const museumRequestSchema = z.object({
  username: z.string().min(1),
  repos: z.array(museumRepoSchema).min(1).max(4),
});

const museumExhibitSchema = z.object({
  repoId: z.number().int().nonnegative(),
  subtitle: z.string().min(1),
  epitaph: z.string().min(1),
  description: z.string().min(1),
  causeOfDeath: z.string().min(1),
  artifacts: z.array(museumArtifactSchema).length(3),
  copilotInsight: z.string().min(1),
  copilotEpitaph: z.string().min(1),
  funFact: z.string().min(1),
  revivalContext: z.string().min(1),
  founderContext: z.string().min(1),
});

const museumResponseSchema = z.object({
  exhibits: z.array(museumExhibitSchema).min(1).max(4),
});

const revivalArtifactSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  state: z.enum(["rotten", "broken", "unfinished", "working"]),
});

const revivalRequestSchema = z.object({
  exhibit: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["dead", "zombie", "mummified", "buried"]),
    deathDate: z.string().min(1),
    lastCommit: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1).max(6),
    projectType: z.string().min(1),
    stats: z.object({
      linesOfCode: z.number().int().nonnegative(),
      commits: z.number().int().nonnegative(),
      daysAlive: z.number().int().nonnegative(),
      causeOfDeath: z.string().min(1),
    }),
    artifacts: z.array(revivalArtifactSchema).max(4),
    revivalContext: z.string().min(1),
    founderContext: z.string().min(1),
  }),
});

const featureSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  complexity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  techRecommendation: z.string().min(1),
});

const reportSchema = z.object({
  diagnosis: z.object({
    technical: z.string().min(1),
    market: z.string().min(1),
  }),
  architecture: z.object({
    before: z.string().min(1),
    after: z.string().min(1),
  }),
  techStack: z.array(
    z.object({
      component: z.string().min(1),
      before: z.string().min(1),
      after: z.string().min(1),
      reason: z.string().min(1),
    })
  ).length(5),
  features: z.object({
    mustHave: z.array(featureSchema).length(3),
    shouldHave: z.array(featureSchema).length(2),
    niceToHave: z.array(featureSchema).length(1),
  }),
  goToMarket: z.object({
    audience: z.string().min(1),
    pricingModel: z.string().min(1),
    launchStrategy: z.string().min(1),
    differentiator: z.string().min(1),
  }),
  score: z.object({
    codebaseHealth: z.number().int().min(0).max(100),
    marketOpportunity: z.number().int().min(0).max(100),
    complexity: z.number().int().min(0).max(100),
    founderFit: z.number().int().min(0).max(100),
  }),
});

const curatorContextSchema = z.object({
  owner: z.string().min(1).optional(),
  htmlUrl: z.string().min(1).optional(),
  primaryLanguage: z.string().min(1).optional(),
  languages: z.array(z.string().min(1)).max(6).optional(),
  topics: z.array(z.string().min(1)).max(6).optional(),
  lastCommitMessage: z.string().min(1).optional(),
  lastCommitDate: z.string().nullable().optional(),
  rootItems: z.array(z.string().min(1)).max(10).optional(),
  readmeExcerpt: z.string().nullable().optional(),
  manifestSnippets: z
    .array(
      z.object({
        name: z.string().min(1),
        excerpt: z.string().min(1),
      })
    )
    .max(3)
    .optional(),
});

const curatorRequestSchema = z.object({
  exhibit: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    subtitle: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["dead", "zombie", "mummified", "buried"]),
    deathDate: z.string().min(1),
    lastCommit: z.string().min(1),
    causeOfDeath: z.string().min(1),
    stats: z.object({
      linesOfCode: z.number().int().nonnegative(),
      commits: z.number().int().nonnegative(),
      daysAlive: z.number().int().nonnegative(),
    }),
    tags: z.array(z.string().min(1)).max(8),
    artifacts: z
      .array(
        z.object({
          name: z.string().min(1),
          description: z.string().min(1),
          state: z.enum(["rotten", "broken", "unfinished", "working"]),
        })
      )
      .max(6),
    copilotInsight: z.string().min(1),
    copilotEpitaph: z.string().min(1),
    funFact: z.string().min(1),
    revivalContext: z.string().optional(),
    founderContext: z.string().optional(),
    curatorContext: curatorContextSchema.optional(),
  }),
  question: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .max(6)
    .default([]),
});

const curatorReplySchema = z.object({
  answer: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(2).max(4),
  suggestedFollowUps: z.array(z.string().min(1)).length(3),
});

const cacheStore = new Map();
let requestCounter = 0;

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildVerdict(overall) {
  if (overall >= 85) {
    return "Prime resurrection candidate. Rebuild aggressively.";
  }
  if (overall >= 70) {
    return "Worth the effort. The second attempt has a clear path.";
  }
  if (overall >= 55) {
    return "Promising, but only if the relaunch is much sharper than version one.";
  }
  if (overall >= 40) {
    return "Possible, but only with a radical rewrite and tighter go-to-market discipline.";
  }
  return "Miracle territory. Rebuild only if the core insight is too good to bury.";
}

function withPriority(features, priority) {
  return features.map((feature) => ({
    ...feature,
    priority,
  }));
}

function calculateOverallScore(score) {
  return clampScore(
    score.codebaseHealth * 0.3 +
      score.marketOpportunity * 0.3 +
      score.complexity * 0.2 +
      score.founderFit * 0.2
  );
}

function getCacheKey(scope, payload, model, promptVersion) {
  return createHash("sha256")
    .update(JSON.stringify({ scope, payload, model, promptVersion }))
    .digest("hex");
}

function readCachedPayload(cacheKey) {
  const cacheEntry = cacheStore.get(cacheKey);
  if (!cacheEntry) {
    return null;
  }

  if (Date.now() - cacheEntry.fetchedAt > CACHE_TTL_MS) {
    cacheStore.delete(cacheKey);
    return null;
  }

  return cacheEntry.payload;
}

function writeCachedPayload(cacheKey, payload) {
  cacheStore.set(cacheKey, {
    fetchedAt: Date.now(),
    payload,
  });
}

function buildMuseumRepoSummary(repo) {
  const rootItems = repo.rootItems.length
    ? repo.rootItems.join(", ")
    : "No top-level files recovered.";
  const readmeExcerpt = repo.readmeExcerpt
    ? repo.readmeExcerpt
    : "README not available.";
  const manifestSummary = repo.manifestSnippets.length
    ? repo.manifestSnippets
        .map((manifest) => `${manifest.name}: ${manifest.excerpt}`)
        .join("\n")
    : "No manifest snippets recovered.";

  return [
    `Repo ${repo.rank}: ${repo.owner}/${repo.name}`,
    `Repo ID: ${repo.id}`,
    `Primary language: ${repo.primaryLanguage}`,
    `Languages: ${repo.languages.join(", ")}`,
    `Topics: ${repo.topics.join(", ") || "none"}`,
    `Description: ${repo.description ?? "none"}`,
    `Days abandoned: ${repo.daysAbandoned}`,
    `Estimated LOC: ${repo.estimatedLOC}`,
    `Commits: ${repo.totalCommits}`,
    `Stars: ${repo.stargazersCount}`,
    `Forks: ${repo.forksCount}`,
    `Open issues: ${repo.openIssuesCount}`,
    `Last commit: ${repo.lastCommitSha} on ${repo.lastCommitDate ?? "unknown date"}`,
    `Last commit message: ${repo.lastCommitMessage}`,
    `Death date: ${repo.deathDate}`,
    `Root items: ${rootItems}`,
    `README excerpt: ${readmeExcerpt}`,
    `Manifest snippets:\n${manifestSummary}`,
    `URL: ${repo.htmlUrl}`,
  ].join("\n");
}

function buildMuseumMessages(username, repos) {
  return [
    {
      role: "system",
      content: [
        "You are the curator of the Museum of Dead Dreams.",
        "You write grounded, witty but factual museum text about abandoned software projects.",
        "Return only the structured schema.",
        "You must stay anchored to the provided repo evidence.",
        "Do not invent users, funding, customers, benchmarks, adoption numbers, private context, or code that was not implied by the metadata, root files, README excerpt, languages, and commit history.",
        "Humor is allowed, fabrication is not.",
        "Keep every field concise: subtitle <= 18 words, epitaph <= 24 words, causeOfDeath <= 2 sentences, description 2 or 3 sentences, funFact 1 sentence, founderContext 1 sentence.",
        "Artifacts must reference plausible files or folders from the provided root items whenever possible.",
        "Use manifest snippets and README evidence to infer the stack and maturity level instead of guessing.",
        "For founderContext, only infer what the repository history suggests about builder fit. If evidence is weak, say that uncertainty explicitly.",
        "Preserve repo order exactly.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        `Generate exhibit copy for ${username}'s most abandoned repositories.`,
        "Return one exhibit per repo in the same order.",
        repos.map(buildMuseumRepoSummary).join("\n\n---\n\n"),
      ].join("\n\n"),
    },
  ];
}

function buildRevivalProjectSummary(exhibit) {
  const artifactLines = exhibit.artifacts.length
    ? exhibit.artifacts
        .map(
          (artifact) =>
            `- ${artifact.name} [${artifact.state}]: ${artifact.description}`
        )
        .join("\n")
    : "- No notable artifacts were recovered.";

  return [
    `Project: ${exhibit.name}`,
    `Type: ${exhibit.projectType}`,
    `Subtitle: ${exhibit.subtitle}`,
    `Status: ${exhibit.status}`,
    `Death date: ${exhibit.deathDate}`,
    `Last commit: ${exhibit.lastCommit}`,
    `Tags: ${exhibit.tags.join(", ")}`,
    `LOC: ${exhibit.stats.linesOfCode}`,
    `Commits: ${exhibit.stats.commits}`,
    `Days abandoned: ${exhibit.stats.daysAlive}`,
    `Cause of death: ${exhibit.stats.causeOfDeath}`,
    `Description: ${exhibit.description}`,
    `Revival context: ${exhibit.revivalContext}`,
    `Founder context: ${exhibit.founderContext}`,
    "Artifacts:",
    artifactLines,
  ].join("\n");
}

function buildRevivalMessages(exhibit) {
  return [
    {
      role: "system",
      content: [
        "You are an uncompromising CTO consultant writing a revival plan for an abandoned software project.",
        "Return only the structured fields required by the schema.",
        "Be concrete, commercially grounded, concise, and evidence-aware.",
        "Assume the current year is 2026.",
        "Do not write generic AI fluff or invent traction data.",
        "Use at most two sentences for diagnosis and go-to-market fields.",
        "Architecture before and after should be concise multiline text with 4 to 6 lines separated by newline characters.",
        "Provide exactly 5 tech stack rows, 3 must-have features, 2 should-have features, and 1 nice-to-have feature.",
        "Complexity scores must reflect implementation burden where 1 is easiest and 5 is hardest.",
        "Score values represent revival viability, where higher is better.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Generate a resurrection plan for this project.\n\n${buildRevivalProjectSummary(
        exhibit
      )}`,
    },
  ];
}

function buildCuratorProjectSummary(exhibit) {
  const artifactLines = exhibit.artifacts.length
    ? exhibit.artifacts
        .map(
          (artifact) =>
            `- ${artifact.name} [${artifact.state}]: ${artifact.description}`
        )
        .join("\n")
    : "- No artifacts recovered.";

  const context = exhibit.curatorContext ?? {};
  const manifestSummary = context.manifestSnippets?.length
    ? context.manifestSnippets
        .map((manifest) => `${manifest.name}: ${manifest.excerpt}`)
        .join("\n")
    : "No manifest snippets available.";

  return [
    `Project: ${exhibit.name}`,
    `Owner: ${context.owner ?? "unknown"}`,
    `URL: ${context.htmlUrl ?? "unknown"}`,
    `Subtitle: ${exhibit.subtitle}`,
    `Description: ${exhibit.description}`,
    `Status: ${exhibit.status}`,
    `Death date: ${exhibit.deathDate}`,
    `Last commit token: ${exhibit.lastCommit}`,
    `Cause of death: ${exhibit.causeOfDeath}`,
    `LOC: ${exhibit.stats.linesOfCode}`,
    `Commits: ${exhibit.stats.commits}`,
    `Days abandoned: ${exhibit.stats.daysAlive}`,
    `Tags: ${exhibit.tags.join(", ") || "none"}`,
    `Primary language: ${context.primaryLanguage ?? "unknown"}`,
    `Languages: ${context.languages?.join(", ") || "unknown"}`,
    `Topics: ${context.topics?.join(", ") || "none"}`,
    `Last commit message: ${context.lastCommitMessage ?? "unknown"}`,
    `Last commit date: ${context.lastCommitDate ?? "unknown"}`,
    `Root items: ${context.rootItems?.join(", ") || "unknown"}`,
    `README excerpt: ${context.readmeExcerpt ?? "unavailable"}`,
    `Manifest snippets:\n${manifestSummary}`,
    `Copilot insight: ${exhibit.copilotInsight}`,
    `Copilot epitaph: ${exhibit.copilotEpitaph}`,
    `Fun fact: ${exhibit.funFact}`,
    `Revival context: ${exhibit.revivalContext ?? "none"}`,
    `Founder context: ${exhibit.founderContext ?? "none"}`,
    "Artifacts:",
    artifactLines,
  ].join("\n");
}

function buildCuratorMessages(exhibit, question, history) {
  const historyTranscript = history.length
    ? history
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n")
    : "No previous conversation.";

  return [
    {
      role: "system",
      content: [
        "You are Copilot Curator inside the Museum of Dead Dreams.",
        "You answer questions about one abandoned software project using only the provided evidence.",
        "Be concise, specific, and honest about uncertainty.",
        "Do not invent architecture, adoption, users, benchmarks, or file contents that are not grounded in the exhibit and repo evidence.",
        "Answer in 1 to 3 short paragraphs or a compact bullet list when it helps.",
        "Evidence items must be brief factual anchors from the provided context.",
        "Suggested follow-ups must be short and useful.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        "Project evidence:",
        buildCuratorProjectSummary(exhibit),
        "",
        "Conversation so far:",
        historyTranscript,
        "",
        `Current question: ${question}`,
      ].join("\n"),
    },
  ];
}

async function generateMuseumExhibits(username, repos) {
  const response = await openai.responses.parse({
    model: MUSEUM_MODEL,
    input: buildMuseumMessages(username, repos),
    max_output_tokens: 3200,
    text: {
      format: zodTextFormat(museumResponseSchema, "museum_exhibits"),
    },
  });

  const parsedResponse = response.output_parsed;
  if (!parsedResponse) {
    throw new Error("OpenAI returned no museum exhibit payload.");
  }

  const exhibitMap = new Map(
    parsedResponse.exhibits.map((exhibit) => [exhibit.repoId, exhibit])
  );

  return repos.map((repo) => {
    const exhibit = exhibitMap.get(repo.id);
    if (!exhibit) {
      throw new Error(`OpenAI omitted exhibit content for repo ${repo.name}.`);
    }
    return exhibit;
  });
}

async function generateRevivalReport(exhibit) {
  const response = await openai.responses.parse({
    model: REVIVAL_MODEL,
    input: buildRevivalMessages(exhibit),
    max_output_tokens: 1800,
    text: {
      format: zodTextFormat(reportSchema, "revival_report"),
    },
  });

  const parsedReport = response.output_parsed;
  if (!parsedReport) {
    throw new Error("OpenAI returned no structured report.");
  }

  const overall = calculateOverallScore(parsedReport.score);

  return {
    exhibitId: exhibit.id,
    projectType: exhibit.projectType,
    diagnosis: parsedReport.diagnosis,
    architecture: parsedReport.architecture,
    techStack: parsedReport.techStack,
    features: {
      mustHave: withPriority(parsedReport.features.mustHave, "must-have"),
      shouldHave: withPriority(parsedReport.features.shouldHave, "should-have"),
      niceToHave: withPriority(parsedReport.features.niceToHave, "nice-to-have"),
    },
    goToMarket: parsedReport.goToMarket,
    score: {
      overall,
      codebaseHealth: parsedReport.score.codebaseHealth,
      marketOpportunity: parsedReport.score.marketOpportunity,
      complexity: parsedReport.score.complexity,
      founderFit: parsedReport.score.founderFit,
      verdict: buildVerdict(overall),
    },
    meta: {
      source: "openai",
      model: REVIVAL_MODEL,
      generatedAt: new Date().toISOString(),
      cached: false,
      promptVersion: REVIVAL_PROMPT_VERSION,
    },
  };
}

async function generateCuratorReply(exhibit, question, history) {
  const response = await openai.responses.parse({
    model: CURATOR_MODEL,
    input: buildCuratorMessages(exhibit, question, history),
    max_output_tokens: 900,
    text: {
      format: zodTextFormat(curatorReplySchema, "curator_reply"),
    },
  });

  const parsedReply = response.output_parsed;
  if (!parsedReply) {
    throw new Error("OpenAI returned no structured curator reply.");
  }

  return {
    answer: parsedReply.answer,
    evidence: parsedReply.evidence,
    suggestedFollowUps: parsedReply.suggestedFollowUps,
    meta: {
      source: "openai",
      model: CURATOR_MODEL,
      generatedAt: new Date().toISOString(),
      cached: false,
      promptVersion: CURATOR_PROMPT_VERSION,
    },
  };
}

function applyCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  applyCors(response);
  response.end(JSON.stringify(payload));
}

function formatDuration(startedAt) {
  return `${Date.now() - startedAt}ms`;
}

function nextRequestId(scope) {
  requestCounter += 1;
  return `${scope}#${requestCounter}`;
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

async function handleMuseumRequest(request, response) {
  const startedAt = Date.now();
  const requestId = nextRequestId("museum");
  const parsedBody = museumRequestSchema.parse(await readJsonBody(request));
  console.log(
    `[${requestId}] request user=${parsedBody.username} repos=${parsedBody.repos.length}`
  );
  const cacheKey = getCacheKey(
    "museum",
    parsedBody,
    MUSEUM_MODEL,
    MUSEUM_PROMPT_VERSION
  );
  const cachedExhibits = readCachedPayload(cacheKey);

  if (cachedExhibits) {
    console.log(
      `[${requestId}] cache-hit user=${parsedBody.username} duration=${formatDuration(
        startedAt
      )}`
    );
    sendJson(response, 200, { exhibits: cachedExhibits });
    return;
  }

  console.log(
    `[${requestId}] openai:start model=${MUSEUM_MODEL} prompt=${MUSEUM_PROMPT_VERSION}`
  );
  const exhibits = await generateMuseumExhibits(
    parsedBody.username,
    parsedBody.repos
  );
  writeCachedPayload(cacheKey, exhibits);
  console.log(
    `[${requestId}] completed user=${parsedBody.username} duration=${formatDuration(
      startedAt
    )}`
  );
  sendJson(response, 200, { exhibits });
}

async function handleRevivalRequest(request, response) {
  const startedAt = Date.now();
  const requestId = nextRequestId("revival");
  const parsedBody = revivalRequestSchema.parse(await readJsonBody(request));
  console.log(
    `[${requestId}] request exhibit=${parsedBody.exhibit.name} projectType=${parsedBody.exhibit.projectType}`
  );
  const cacheKey = getCacheKey(
    "revival",
    parsedBody,
    REVIVAL_MODEL,
    REVIVAL_PROMPT_VERSION
  );
  const cachedReport = readCachedPayload(cacheKey);

  if (cachedReport) {
    console.log(
      `[${requestId}] cache-hit exhibit=${parsedBody.exhibit.name} duration=${formatDuration(
        startedAt
      )}`
    );
    sendJson(response, 200, {
      report: {
        ...cachedReport,
        meta: {
          ...cachedReport.meta,
          cached: true,
        },
      },
    });
    return;
  }

  console.log(
    `[${requestId}] openai:start model=${REVIVAL_MODEL} prompt=${REVIVAL_PROMPT_VERSION}`
  );
  const report = await generateRevivalReport(parsedBody.exhibit);
  writeCachedPayload(cacheKey, report);
  console.log(
    `[${requestId}] completed exhibit=${parsedBody.exhibit.name} duration=${formatDuration(
      startedAt
    )} source=${report.meta.source}`
  );
  sendJson(response, 200, { report });
}

async function handleCuratorRequest(request, response) {
  const startedAt = Date.now();
  const requestId = nextRequestId("curator");
  const parsedBody = curatorRequestSchema.parse(await readJsonBody(request));
  console.log(
    `[${requestId}] request exhibit=${parsedBody.exhibit.name} question=${JSON.stringify(
      parsedBody.question.slice(0, 120)
    )}`
  );
  const cacheKey = getCacheKey(
    "curator",
    parsedBody,
    CURATOR_MODEL,
    CURATOR_PROMPT_VERSION
  );
  const cachedReply = readCachedPayload(cacheKey);

  if (cachedReply) {
    console.log(
      `[${requestId}] cache-hit exhibit=${parsedBody.exhibit.name} duration=${formatDuration(
        startedAt
      )}`
    );
    sendJson(response, 200, {
      reply: {
        ...cachedReply,
        meta: {
          ...cachedReply.meta,
          cached: true,
        },
      },
    });
    return;
  }

  console.log(
    `[${requestId}] openai:start model=${CURATOR_MODEL} prompt=${CURATOR_PROMPT_VERSION}`
  );
  const reply = await generateCuratorReply(
    parsedBody.exhibit,
    parsedBody.question,
    parsedBody.history
  );
  writeCachedPayload(cacheKey, reply);
  console.log(
    `[${requestId}] completed exhibit=${parsedBody.exhibit.name} duration=${formatDuration(
      startedAt
    )} source=${reply.meta.source}`
  );
  sendJson(response, 200, { reply });
}

const server = http.createServer(async (request, response) => {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    console.log("[health] GET /api/health");
    sendJson(response, 200, {
      ok: true,
      museumModel: MUSEUM_MODEL,
      revivalModel: REVIVAL_MODEL,
      openaiConfigured: Boolean(openai),
      promptVersions: {
        museum: MUSEUM_PROMPT_VERSION,
        revival: REVIVAL_PROMPT_VERSION,
        curator: CURATOR_PROMPT_VERSION,
      },
      curatorModel: CURATOR_MODEL,
    });
    return;
  }

  if (!openai) {
    sendJson(response, 503, {
      error: "OPENAI_API_KEY is missing on the museum intelligence server.",
    });
    return;
  }

  try {
    if (request.method === "POST" && request.url === "/api/museum-exhibits") {
      await handleMuseumRequest(request, response);
      return;
    }

    if (request.method === "POST" && request.url === "/api/revival-plan") {
      await handleRevivalRequest(request, response);
      return;
    }

    if (request.method === "POST" && request.url === "/api/copilot-curator") {
      await handleCuratorRequest(request, response);
      return;
    }

    sendJson(response, 404, { error: "Route not found." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendJson(response, 400, {
        error: "Invalid museum intelligence payload.",
        details: error.flatten(),
      });
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Museum intelligence failed unexpectedly.";

    console.error(`[museum-intelligence] error: ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }

    sendJson(response, 500, { error: message });
  }
});

server.listen(API_PORT, API_HOST, () => {
  console.log(
    `[museum-intelligence] listening on http://${API_HOST}:${API_PORT} with museum=${MUSEUM_MODEL} revival=${REVIVAL_MODEL}`
  );
});

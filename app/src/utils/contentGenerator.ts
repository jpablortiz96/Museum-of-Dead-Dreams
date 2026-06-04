import {
  resurrectionExhibit,
  type Exhibit,
  type ProjectArtifact,
} from "@/data/exhibits";
import { type AnalyzedRepo } from "@/types/github";
import { type MuseumArtifactContent, type MuseumExhibitContent } from "@/types/museum";

type ExhibitPalette = Pick<Exhibit, "color" | "accentColor" | "status">;

interface ArtifactTemplate {
  name: string;
  icon: string;
  description: string;
  state: ProjectArtifact["state"];
}

const statusPalettes: Record<Exclude<Exhibit["status"], "buried">, ExhibitPalette> = {
  dead: { status: "dead", color: "#1a1a2e", accentColor: "#e94560" },
  zombie: { status: "zombie", color: "#22152f", accentColor: "#a855f7" },
  mummified: { status: "mummified", color: "#2a2112", accentColor: "#f59e0b" },
};

const ageBucketEpitaphs = {
  baby: [
    "{name} didn't even last a month. Some dreams die young.",
    "Here lies {name}. It came, it saw, it got distracted.",
  ],
  young: [
    "{name} tried. It really did. For {daysAlive} days, at least.",
    "Here lies {name}. Abandoned before its first birthday.",
  ],
  adult: [
    "{name} had potential. Then {primaryLanguage} happened.",
    "Here lies {name}. Rest in commits.",
  ],
  old: [
    "{name} survived {daysAlive} days. Then reality set in.",
    "Here lies {name}. It outlived its own ambition.",
  ],
  ancient: [
    "{name} has been dead for {daysAlive} days. Archaeologists are impressed.",
    "Here lies {name}. Older than most npm dependencies.",
    "{name}: born, coded, abandoned, forgotten. The developer circle of life.",
  ],
};

const subtitlesByLanguage: Record<string, string[]> = {
  JavaScript: [
    "React on the outside, abandoned on the inside",
    "npm install hope, npm run abandon",
    "Built with JavaScript. Died by JavaScript.",
  ],
  TypeScript: [
    "Strictly typed, loosely committed",
    "The types were safe. The project wasn't.",
    "Compile-time certainty. Runtime abandonment.",
  ],
  Python: [
    "It was a beautiful script. Then it became a project.",
    "import dreams; dreams.die()",
    "Whitespace intact. Motivation missing.",
  ],
  Java: [
    "FactoryAbstractBuilderBeanImpl: The Project",
    "Object-oriented, abandonment-oriented",
  ],
  Go: [
    "Fast to compile. Faster to abandon.",
    "Small binary. Large emotional baggage.",
  ],
  Rust: [
    "Memory safe, ambition unsafe.",
    "Borrow checker approved. Reality did not.",
  ],
  Unknown: [
    "No language. No witnesses. No closure.",
    "A repository of unanswered questions.",
  ],
};

const artifactTemplatesByKind: Record<string, ArtifactTemplate[]> = {
  react: [
    {
      name: "App.tsx",
      icon: "Code",
      description: "The ceremonial entry point. Still rendering unresolved ambition.",
      state: "working",
    },
    {
      name: "hooks/",
      icon: "GitBranch",
      description: "Custom hooks with custom regrets and at least one stale dependency array.",
      state: "unfinished",
    },
    {
      name: "styles.css",
      icon: "FileText",
      description: "Contains the exact shade of hope this repo used before launch day never came.",
      state: "broken",
    },
  ],
  javascript: [
    {
      name: "package.json",
      icon: "FileText",
      description: "Promised {stars} stars. Collected significantly more dependencies.",
      state: "broken",
    },
    {
      name: "node_modules",
      icon: "Folder",
      description: "Heavier than the original idea. Still impossible to move with dignity.",
      state: "rotten",
    },
    {
      name: "README.md",
      icon: "BookOpen",
      description: "Last updated around {lastUpdate}. Probably still says 'Work in Progress'.",
      state: "unfinished",
    },
  ],
  python: [
    {
      name: "requirements.txt",
      icon: "FileText",
      description: "Pinned to versions that no longer exist in polite society.",
      state: "rotten",
    },
    {
      name: "main.py",
      icon: "Code",
      description: "The heart of the project. Still beating, technically.",
      state: "working",
    },
    {
      name: "tests/",
      icon: "Beaker",
      description: "Contains at least one test that confirms the file system is alive.",
      state: "unfinished",
    },
  ],
  java: [
    {
      name: "pom.xml",
      icon: "FileText",
      description: "An XML monument to optimism and transitive dependencies.",
      state: "broken",
    },
    {
      name: "src/main",
      icon: "Folder",
      description: "So deeply nested the original intent may never be recovered.",
      state: "working",
    },
    {
      name: "src/test",
      icon: "Beaker",
      description: "A shrine to tests that were definitely planned for later.",
      state: "unfinished",
    },
  ],
  go: [
    {
      name: "go.mod",
      icon: "FileText",
      description: "Lean, tidy, and somehow still attached to a forgotten experiment.",
      state: "working",
    },
    {
      name: "main.go",
      icon: "Code",
      description: "Compiled cleanly. Product strategy did not.",
      state: "broken",
    },
    {
      name: "internal/",
      icon: "GitBranch",
      description: "Contains clever abstractions that only the author understood once.",
      state: "unfinished",
    },
  ],
  rust: [
    {
      name: "Cargo.toml",
      icon: "FileText",
      description: "Dependency graph immaculate. Roadmap extinct.",
      state: "working",
    },
    {
      name: "src/lib.rs",
      icon: "Code",
      description: "Borrow-checked into correctness, then abandoned into silence.",
      state: "unfinished",
    },
    {
      name: "benches/",
      icon: "Gauge",
      description: "Performance mattered. Shipping apparently did not.",
      state: "broken",
    },
  ],
  generic: [
    {
      name: "README.md",
      icon: "BookOpen",
      description: "The only part of the repo that still claims everything is under control.",
      state: "unfinished",
    },
    {
      name: "src/",
      icon: "Folder",
      description: "A collection of half-finished intentions and one surprisingly solid helper function.",
      state: "broken",
    },
    {
      name: "issues backlog",
      icon: "ShieldAlert",
      description: "Open questions, open loops, open wounds.",
      state: "rotten",
    },
  ],
};

function hashSeed(value: string): number {
  return value.split("").reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function pickDeterministically(options: string[], seed: string): string {
  return options[hashSeed(seed) % options.length];
}

function interpolate(template: string, repo: AnalyzedRepo, primaryLanguage: string): string {
  return template
    .replaceAll("{name}", repo.repo.name)
    .replaceAll("{daysAlive}", repo.daysAbandoned.toString())
    .replaceAll("{daysAbandoned}", repo.daysAbandoned.toString())
    .replaceAll("{primaryLanguage}", primaryLanguage)
    .replaceAll("{stars}", repo.repo.stargazers_count.toString())
    .replaceAll("{lastUpdate}", (repo.repo.pushed_at ?? repo.repo.created_at).slice(0, 10));
}

function getAgeBucket(daysAbandoned: number) {
  if (daysAbandoned < 30) return "baby";
  if (daysAbandoned < 90) return "young";
  if (daysAbandoned < 180) return "adult";
  if (daysAbandoned < 365) return "old";
  return "ancient";
}

function getPrimaryLanguage(repo: AnalyzedRepo): string {
  return repo.languages[0] ?? repo.repo.language ?? "Unknown";
}

function getRepoKind(repo: AnalyzedRepo): keyof typeof artifactTemplatesByKind {
  const primaryLanguage = getPrimaryLanguage(repo);
  const lowerDescription = repo.repo.description?.toLowerCase() ?? "";
  const hasReactTag = repo.repo.topics.some((topic) => topic.toLowerCase().includes("react"));
  const looksLikeReactProject =
    hasReactTag ||
    lowerDescription.includes("react") ||
    repo.languages.includes("TSX") ||
    repo.languages.includes("JSX");

  if (looksLikeReactProject || lowerDescription.includes("vite")) {
    return "react";
  }

  switch (primaryLanguage) {
    case "JavaScript":
    case "TypeScript":
      return "javascript";
    case "Python":
      return "python";
    case "Java":
      return "java";
    case "Go":
      return "go";
    case "Rust":
      return "rust";
    default:
      return "generic";
  }
}

function getExhibitPalette(repo: AnalyzedRepo): ExhibitPalette {
  if (repo.daysAbandoned >= 365) {
    return statusPalettes.dead;
  }

  if (repo.daysAbandoned >= 120) {
    return statusPalettes.mummified;
  }

  return statusPalettes.zombie;
}

export function generateSubtitle(repo: AnalyzedRepo): string {
  const primaryLanguage = getPrimaryLanguage(repo);
  const languageTemplates = subtitlesByLanguage[primaryLanguage] ?? subtitlesByLanguage.Unknown;
  const description = repo.repo.description?.trim();

  if (description) {
    const normalizedDescription = description.endsWith(".")
      ? description.slice(0, -1)
      : description;
    return `${normalizedDescription}. Built in ${primaryLanguage}, preserved in regret.`;
  }

  return pickDeterministically(languageTemplates, `${repo.repo.name}-subtitle`);
}

export function generateEpitaph(repo: AnalyzedRepo): string {
  const bucket = getAgeBucket(repo.daysAbandoned);
  const primaryLanguage = getPrimaryLanguage(repo);
  return interpolate(
    pickDeterministically(
      ageBucketEpitaphs[bucket],
      `${repo.repo.name}-${bucket}-epitaph`
    ),
    repo,
    primaryLanguage
  );
}

export function generateCauseOfDeath(repo: AnalyzedRepo): string {
  const primaryLanguage = getPrimaryLanguage(repo);

  if (!repo.repo.description) {
    return "Died of identity crisis. Never knew what it wanted to become.";
  }

  if (repo.repo.stargazers_count === 0) {
    return "Died in obscurity. Zero stars to light its way.";
  }

  if (repo.languages.length <= 1) {
    return `Died of monoculture. Only knew ${primaryLanguage}.`;
  }

  if (repo.repo.forks_count > repo.repo.stargazers_count) {
    return "Died of confusion. More forks than fans.";
  }

  if (repo.daysAbandoned >= 365) {
    return `Died of loneliness. ${repo.daysAbandoned} days without a single push.`;
  }

  if (repo.totalCommits <= 3) {
    return "Died of perfectionism. Never shipped because it was never ready.";
  }

  return "Died of scope creep. Started as a script. Became a narrative cautionary tale.";
}

export function generateCopilotInsight(repo: AnalyzedRepo): string {
  const primaryLanguage = getPrimaryLanguage(repo);
  const developerYears = Math.max(1, Math.round(repo.daysAbandoned / 30));

  return `Copilot analyzed ${repo.estimatedLOC.toLocaleString()} estimated lines of ${primaryLanguage} and found ${repo.totalCommits} commits worth of ambition. The last push was ${repo.daysAbandoned} days ago. That's roughly ${developerYears} developer-years in abandoned-project time.`;
}

export function generateCopilotEpitaph(repo: AnalyzedRepo): string {
  const primaryLanguage = getPrimaryLanguage(repo);
  return `In memory of ${repo.repo.name}, which gathered ${repo.totalCommits} commits and ${repo.repo.stargazers_count} stars before its ${primaryLanguage} era fell silent.`;
}

export function generateArtifacts(repo: AnalyzedRepo): ProjectArtifact[] {
  const primaryLanguage = getPrimaryLanguage(repo);
  const artifactTemplates = artifactTemplatesByKind[getRepoKind(repo)];

  return artifactTemplates.map((artifactTemplate, index) => ({
    id: `${repo.repo.id}-artifact-${index + 1}`,
    name: artifactTemplate.name,
    icon: artifactTemplate.icon,
    description: interpolate(artifactTemplate.description, repo, primaryLanguage),
    state: artifactTemplate.state,
  }));
}

function generateDescription(repo: AnalyzedRepo): string {
  const primaryLanguage = getPrimaryLanguage(repo);
  const languageList = repo.languages.slice(0, 3).join(", ") || primaryLanguage;
  const originalDescription = repo.repo.description?.trim();

  if (originalDescription) {
    return `${repo.repo.name} began as "${originalDescription}". It evolved into a ${primaryLanguage} repository with ${repo.totalCommits} commits and roughly ${repo.estimatedLOC.toLocaleString()} lines of code across ${languageList}. After ${repo.daysAbandoned} days without a push, it now rests here as one of ${repo.repo.owner.login}'s most abandoned dreams.`;
  }

  return `${repo.repo.name} never even wrote its own elevator pitch. What remains is a ${primaryLanguage} codebase with ${repo.totalCommits} commits, ${repo.repo.open_issues_count} open issues, and a silence that has lasted ${repo.daysAbandoned} days.`;
}

function generateFunFact(repo: AnalyzedRepo): string {
  const topics = repo.repo.topics.slice(0, 2);

  if (topics.length > 0) {
    return `GitHub still remembers this project by the topics ${topics.join(" and ")}. The author apparently does not.`;
  }

  if (repo.repo.open_issues_count > 0) {
    return `It still has ${repo.repo.open_issues_count} open issues, which is one way to keep a dream technically alive.`;
  }

  if (repo.repo.forks_count > 0) {
    return `It was forked ${repo.repo.forks_count} times. Abandonment, it turns out, is contagious.`;
  }

  return `Its estimated ${repo.estimatedLOC.toLocaleString()} lines of code are now part software, part archaeological site.`;
}

function generateTags(repo: AnalyzedRepo): string[] {
  const tags = [...repo.languages.slice(0, 3), ...repo.repo.topics.slice(0, 2)];
  return Array.from(new Set(tags.filter(Boolean))).slice(0, 5);
}

function buildExhibitId(repo: AnalyzedRepo) {
  return `repo-${repo.repo.id}`;
}

function buildExhibitSlug(repo: AnalyzedRepo) {
  return `repo-${repo.repo.owner.login}-${repo.repo.name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-");
}

function toArtifactContent(artifact: ProjectArtifact): MuseumArtifactContent {
  return {
    name: artifact.name,
    icon: artifact.icon as MuseumArtifactContent["icon"],
    description: artifact.description,
    state: artifact.state,
  };
}

export function buildExhibitFromGeneratedContent(
  repo: AnalyzedRepo,
  content: MuseumExhibitContent
): Exhibit {
  const palette = getExhibitPalette(repo);
  const primaryLanguage = getPrimaryLanguage(repo);

  return {
    id: buildExhibitId(repo),
    slug: buildExhibitSlug(repo),
    name: repo.repo.name,
    subtitle: content.subtitle,
    status: palette.status,
    deathDate: (repo.repo.pushed_at ?? repo.repo.created_at).slice(0, 10),
    lastCommit: repo.lastCommitSha.slice(0, 7).toUpperCase(),
    epitaph: content.epitaph,
    description: content.description,
    stats: {
      linesOfCode: repo.estimatedLOC,
      commits: repo.totalCommits,
      daysAlive: repo.daysAbandoned,
      causeOfDeath: content.causeOfDeath,
    },
    artifacts: content.artifacts.map((artifact, index) => ({
      id: `${repo.repo.id}-artifact-${index + 1}`,
      name: artifact.name,
      icon: artifact.icon,
      description: artifact.description,
      state: artifact.state,
    })),
    copilotInsight: content.copilotInsight,
    copilotEpitaph: content.copilotEpitaph,
    funFact: content.funFact,
    tags: generateTags(repo),
    revivalContext: content.revivalContext,
    founderContext:
      content.founderContext,
    curatorContext: {
      owner: repo.repo.owner.login,
      htmlUrl: repo.repo.html_url,
      primaryLanguage: primaryLanguage,
      languages: repo.languages.slice(0, 5),
      topics: repo.repo.topics.slice(0, 5),
      lastCommitMessage: repo.lastCommitMessage,
      lastCommitDate: repo.lastCommitDate,
      rootItems: repo.rootItems.slice(0, 8),
      readmeExcerpt: repo.readmeExcerpt,
      manifestSnippets: repo.manifestSnippets.slice(0, 2),
    },
    color: palette.color,
    accentColor: palette.accentColor,
    unlocked: true,
  };
}

export function generateExhibitFromRepo(repo: AnalyzedRepo): Exhibit {
  const primaryLanguage = getPrimaryLanguage(repo);

  return buildExhibitFromGeneratedContent(repo, {
    repoId: repo.repo.id,
    subtitle: generateSubtitle(repo),
    epitaph: generateEpitaph(repo),
    description: generateDescription(repo),
    causeOfDeath: generateCauseOfDeath(repo),
    artifacts: generateArtifacts(repo).map(toArtifactContent),
    copilotInsight: generateCopilotInsight(repo),
    copilotEpitaph: generateCopilotEpitaph(repo),
    funFact: generateFunFact(repo),
    revivalContext: `Originally shaped around ${primaryLanguage} and ${repo.languages
      .slice(1, 3)
      .join(", ") || "a single-track implementation"}. Its next life needs a clearer product wedge than the first one had.`,
    founderContext:
      "The original builder already shipped a first attempt, which means domain proximity exists. The real question is focus, not capability.",
  });
}

export function generateExhibitsFromAnalyzedRepos(repos: AnalyzedRepo[]): Exhibit[] {
  const generatedExhibits = repos.map(generateExhibitFromRepo);

  return [
    ...generatedExhibits,
    {
      ...resurrectionExhibit,
      unlocked: false,
    },
  ];
}

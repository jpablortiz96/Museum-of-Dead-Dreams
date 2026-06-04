import { type Exhibit } from "@/data/exhibits";
import { type RevivalFeature, type RevivalReport, type TechStackComparison } from "@/types/revival";
import { detectProjectType, type ProjectType } from "@/utils/projectClassifier";

interface FeatureSeed {
  name: string;
  description: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  techRecommendation: string;
}

interface TechStackSeed {
  component: string;
  before: string;
  after: string;
  reason: string;
}

interface RevivalTemplatePack {
  diagnosis: {
    technical: string[];
    market: string[];
  };
  architecture: string[];
  techStack: TechStackSeed[];
  features: {
    mustHave: FeatureSeed[];
    shouldHave: FeatureSeed[];
    niceToHave: FeatureSeed[];
  };
  goToMarket: {
    audiences: string[];
    pricingModels: string[];
    launchStrategies: string[];
    differentiators: string[];
  };
  scoreFactors: {
    codebaseHealth: number;
    marketOpportunity: number;
    complexity: number;
    founderFit: number;
  };
}

const TEMPLATE_PROMPT_VERSION = "template-v1";

const REVIVAL_TEMPLATES: Record<ProjectType, RevivalTemplatePack> = {
  trading: {
    diagnosis: {
      technical: [
        "The core system chased historical fit instead of live resilience. {causeOfDeath}. What should have been isolated as a risk service was buried inside strategy code, leaving no clean boundary between signal generation and capital preservation.",
        "{name} behaved like a prototype that accidentally touched a high-stakes domain. It lacked temporal validation, sane guardrails, and independent monitoring. {revivalContext}",
      ],
      market: [
        "The market moved from static heuristics to real-time intelligence. A project built around delayed data and manual interpretation could not compete once AI-native trading workflows became the default expectation.",
        "{name} solved the builder's curiosity better than it solved a painful buyer workflow. The commercial wedge was weak: users wanted confidence, automation, and paper-trading proof before trusting anything live.",
      ],
    },
    architecture: [
      "Realtime ingestion layer\n├─ market feeds over Kafka + WebSockets\n├─ feature stream persisted in TimescaleDB\n├─ strategy engine with plugin contracts\n├─ risk engine as an isolated policy service\n├─ execution adapters per broker\n└─ monitoring + replay pipeline for every trade decision",
      "Modular trading platform\n├─ data ingestion service\n├─ signal orchestration runtime\n├─ independent risk and compliance gate\n├─ execution layer with retry / circuit breaking\n├─ backtesting pipeline using walk-forward datasets\n└─ operator dashboard with alerts, metrics, and paper trading mode",
    ],
    techStack: [
      {
        component: "Core Runtime",
        before: "Python scripts with coupled signal and execution logic",
        after: "Python 3.12 + Rust modules for latency-sensitive execution paths",
        reason: "Keep iteration speed in Python while moving the dangerous hot path into predictable, testable performance boundaries.",
      },
      {
        component: "Data Pipeline",
        before: "Batch pulls and ad-hoc CSV analysis",
        after: "Kafka + TimescaleDB + real-time WebSocket feeds",
        reason: "Trading systems die when data is stale. Streaming architecture makes the decision loop observable and replayable.",
      },
      {
        component: "Intelligence Layer",
        before: "Statistical heuristics and manual tuning",
        after: "PyTorch, transformer sentiment pipelines, and retrieval over market context",
        reason: "Modern trading products win by combining quantitative signals with reasoning over news, filings, and social context.",
      },
      {
        component: "Interface",
        before: "No operational surface beyond notebooks and logs",
        after: "Next.js control plane with WebGL charts and live strategy telemetry",
        reason: "A serious operator needs visibility, not faith.",
      },
      {
        component: "Deployment",
        before: "Local execution with fragile cron-like rituals",
        after: "Kubernetes or Fargate with queue-backed workers and event audit trails",
        reason: "Capital-facing systems need reproducibility, separation of roles, and rollback safety.",
      },
      {
        component: "Testing",
        before: "Happy-path scripts and gut feeling",
        after: "pytest, property-based tests, simulation harnesses, and paper-trading replay suites",
        reason: "In trading, incorrect software is just a more expensive form of debugging.",
      },
    ],
    features: {
      mustHave: [
        {
          name: "Risk Engine Real",
          description: "Position sizing, drawdown limits, and portfolio-level kill switches that can veto any strategy output.",
          complexity: 3,
          techRecommendation: "Python domain layer + policy configuration + replayable event store",
        },
        {
          name: "Paper Trading Mode",
          description: "A zero-capital sandbox with the same event flow as production, including slippage and execution delays.",
          complexity: 2,
          techRecommendation: "Shared execution interface with simulation adapters",
        },
        {
          name: "Multi-Broker Support",
          description: "Execution adapters that keep one exchange outage from killing the whole product.",
          complexity: 4,
          techRecommendation: "Adapter pattern over broker APIs with queue-backed retries",
        },
      ],
      shouldHave: [
        {
          name: "Sentiment Analysis",
          description: "Blend structured market data with LLM-driven analysis of news, earnings, and community chatter.",
          complexity: 3,
          techRecommendation: "Transformer pipeline + vector retrieval over curated market sources",
        },
        {
          name: "Walk-Forward Backtesting",
          description: "Evaluation that respects time, regime shifts, and strategy drift instead of flattering the model with hindsight.",
          complexity: 4,
          techRecommendation: "Time-sliced datasets + reproducible experiment tracking",
        },
      ],
      niceToHave: [
        {
          name: "Strategy Marketplace",
          description: "A social layer for publishing, copying, and ranking community-built strategies.",
          complexity: 5,
          techRecommendation: "Multi-tenant permissions + leaderboard and billing layer",
        },
      ],
    },
    goToMarket: {
      audiences: [
        "Independent quants and technical retail traders who want a serious trading framework without building one from scratch.",
        "Developer-founders experimenting with algorithmic strategies but not ready to wire brokers, data feeds, and risk controls by hand.",
      ],
      pricingModels: [
        "Freemium: paper trading free, live trading and advanced automation at $29-$99 per month.",
        "Open-core: core engine open source, managed execution and monitoring sold as a hosted platform.",
      ],
      launchStrategies: [
        "Launch via Product Hunt, quantitative trading communities, and public teardown content showing why most retail trading bots fail.",
        "Ship with a public paper-trading leaderboard and a brutally honest benchmark against naive strategies to earn trust early.",
      ],
      differentiators: [
        "A trading platform that treats risk as a first-class product surface instead of an afterthought hidden in notebooks.",
        "The rare trading stack that fuses quantitative signals with modern reasoning models over live market context.",
      ],
    },
    scoreFactors: {
      codebaseHealth: 46,
      marketOpportunity: 82,
      complexity: 48,
      founderFit: 79,
    },
  },
  "ai-ml": {
    diagnosis: {
      technical: [
        "{name} reached for sophistication before operational clarity. The intelligence layer grew faster than the interfaces around it, so evaluation, observability, and fallback paths never matured enough to support the ambition.",
        "The system treated advanced AI orchestration as the product instead of as infrastructure. {causeOfDeath}. What it needed was sharper boundaries between model logic, workflow logic, and customer-facing outcomes.",
      ],
      market: [
        "The timing may have been directionally right, but the product framing was blurry. Buyers do not purchase 'agents' or 'models'; they buy faster decisions, reduced risk, or measurable revenue outcomes.",
        "{revivalContext} The market increasingly rewards teams that can compress complexity into a narrow wedge, then expand from there.",
      ],
    },
    architecture: [
      "AI product platform\n├─ ingestion + document processing pipeline\n├─ retrieval layer with governed embeddings\n├─ orchestrated reasoning service with evaluators\n├─ human review checkpoints for risky outputs\n├─ analytics + feedback loops for every workflow\n└─ enterprise API and admin console",
      "MLOps-first system\n├─ model registry + versioning\n├─ prompt / policy management layer\n├─ workflow orchestrator with typed contracts\n├─ evaluation harness and trace store\n├─ customer-facing API with audit trails\n└─ monitoring loop for drift, latency, and cost",
    ],
    techStack: [
      {
        component: "Model Layer",
        before: "Prompt chains and ad-hoc orchestration",
        after: "Reasoning models + structured output contracts + evaluators",
        reason: "Modern AI products need reliability, not clever demos. Typed outputs and evals are the new foundation.",
      },
      {
        component: "Orchestration",
        before: "Single-path orchestration with hidden state",
        after: "LangGraph or Temporal workflows with explicit checkpoints",
        reason: "If the workflow matters to the customer, it must be inspectable, recoverable, and measurable.",
      },
      {
        component: "Knowledge Layer",
        before: "Flat document blobs and manual retrieval",
        after: "Vector database + metadata filtering + permission-aware retrieval",
        reason: "Useful AI systems are as much about retrieval governance as they are about model power.",
      },
      {
        component: "Delivery Surface",
        before: "Demo-first output, little operator control",
        after: "Next.js app, admin review queues, and API access for enterprise workflows",
        reason: "Trust grows when users can inspect, override, and operationalize what the model is doing.",
      },
      {
        component: "Operations",
        before: "Logs and instinct",
        after: "Trace observability, cost telemetry, and evaluation dashboards",
        reason: "AI systems degrade in ways normal apps do not. You need visibility into output quality, not just uptime.",
      },
      {
        component: "Deployment",
        before: "Single environment with manual setup",
        after: "Containerized workloads, feature flags, and staged rollouts",
        reason: "Safer launches make it possible to iterate on model behavior without breaking trust.",
      },
    ],
    features: {
      mustHave: [
        {
          name: "Evaluation Harness",
          description: "A repeatable suite of benchmark tasks and regression checks for every important workflow.",
          complexity: 3,
          techRecommendation: "Trace capture + labeled benchmark set + CI gating",
        },
        {
          name: "Human Review Queue",
          description: "Escalate uncertain or high-stakes outputs before they affect users or regulators.",
          complexity: 2,
          techRecommendation: "Typed confidence scoring + operator review UI",
        },
        {
          name: "Customer Outcome Dashboard",
          description: "Translate model work into measurable business results instead of raw AI activity metrics.",
          complexity: 3,
          techRecommendation: "Analytics warehouse + domain-specific KPI layer",
        },
      ],
      shouldHave: [
        {
          name: "Fine-Tuning or Distillation Path",
          description: "Reduce cost and increase consistency on the highest-volume tasks.",
          complexity: 4,
          techRecommendation: "Prompt optimization pipeline + selective fine-tuning",
        },
        {
          name: "Explainability Layer",
          description: "Show evidence, reasoning traces, and fallback rules for trust-heavy use cases.",
          complexity: 3,
          techRecommendation: "Citation pipeline + structured rationale generation",
        },
      ],
      niceToHave: [
        {
          name: "Workflow Marketplace",
          description: "Reusable packs, templates, or automations tailored to vertical use cases.",
          complexity: 5,
          techRecommendation: "Template schema + tenant-safe packaging system",
        },
      ],
    },
    goToMarket: {
      audiences: [
        "Mid-market teams drowning in repetitive expert workflows that are too expensive to scale manually.",
        "Regulated or high-context teams who need AI assistance but still require reviewable outputs and traceability.",
      ],
      pricingModels: [
        "Usage-based platform fee with premium seats for reviewers and admins.",
        "Hybrid SaaS: base subscription plus workflow-volume tiers and enterprise governance add-ons.",
      ],
      launchStrategies: [
        "Lead with a narrow workflow and publish before/after case studies instead of broad 'AI agent' messaging.",
        "Target one pain-heavy vertical, ship a high-conviction wedge, and use benchmark transparency as the trust lever.",
      ],
      differentiators: [
        "Not another generic AI wrapper: a system that turns reasoning into operationally reviewable work.",
        "Enterprise-ready AI with observability, governance, and measurable workflow outcomes baked in from day one.",
      ],
    },
    scoreFactors: {
      codebaseHealth: 55,
      marketOpportunity: 74,
      complexity: 42,
      founderFit: 78,
    },
  },
  "web-app": {
    diagnosis: {
      technical: [
        "{name} likely died from a mismatch between interface ambition and product discipline. UI logic, state, and backend assumptions collapsed into one pile, making every new feature slower and riskier to ship.",
        "The product experience probably looked almost good enough while the foundations stayed fragile. {causeOfDeath}. The result: a project that was expensive to polish and easy to postpone.",
      ],
      market: [
        "The market for web apps is unforgiving: if the product does not create a 10-minute aha moment, users bounce before the architecture gets a chance to matter.",
        "{revivalContext} A relaunch would need sharper positioning, faster onboarding, and a more opinionated promise than the original version had.",
      ],
    },
    architecture: [
      "Modern web product\n├─ Next.js app router frontend\n├─ typed API layer with auth + rate limits\n├─ background jobs for expensive workflows\n├─ analytics + feature flags\n├─ billing and account lifecycle services\n└─ observability across client and server",
      "Platformized web stack\n├─ edge-rendered marketing + onboarding\n├─ application core with typed contracts\n├─ realtime event layer for collaborative or live experiences\n├─ domain services isolated from UI state\n└─ instrumentation, experiments, and retention analytics by default",
    ],
    techStack: [
      {
        component: "Frontend",
        before: "Single-page app with ad-hoc client state",
        after: "Next.js 15 + React 19 + TypeScript + Tailwind",
        reason: "Ship faster with a better default for routing, rendering, and full-stack contracts.",
      },
      {
        component: "API Layer",
        before: "Implicit fetches or no formal API boundary",
        after: "tRPC or FastAPI with typed contracts and background jobs",
        reason: "Clear contracts reduce entropy and make iteration safer.",
      },
      {
        component: "Data Layer",
        before: "Local state or lightweight persistence glued in later",
        after: "Postgres + Prisma/Drizzle + event tracking",
        reason: "Growth problems usually begin where data modeling was postponed.",
      },
      {
        component: "Realtime",
        before: "Polling or no live experience",
        after: "WebSockets, Supabase Realtime, or server-sent events",
        reason: "The products that feel alive earn retention faster.",
      },
      {
        component: "Operations",
        before: "Manual deploys and low visibility",
        after: "CI/CD, preview environments, analytics, and Sentry",
        reason: "Speed only matters if you can see regressions before users do.",
      },
      {
        component: "Growth Layer",
        before: "No instrumentation for user behavior",
        after: "PostHog or Amplitude plus onboarding experiments",
        reason: "Web apps win or lose on retention loops, not just feature count.",
      },
    ],
    features: {
      mustHave: [
        {
          name: "Opinionated Onboarding",
          description: "Guide the user to one fast win instead of exposing the full product surface immediately.",
          complexity: 2,
          techRecommendation: "Checklist-driven onboarding + event instrumentation",
        },
        {
          name: "Responsive Product Shell",
          description: "A layout and component system that works cleanly across desktop and mobile from day one.",
          complexity: 2,
          techRecommendation: "Design tokens + accessible component primitives",
        },
        {
          name: "Operational Analytics",
          description: "Track activation, retention, and drop-off so roadmap decisions stop being guesswork.",
          complexity: 2,
          techRecommendation: "PostHog + typed event schema",
        },
      ],
      shouldHave: [
        {
          name: "AI Copilot Layer",
          description: "Use AI where it compounds the workflow instead of stapling a chatbot onto the interface.",
          complexity: 3,
          techRecommendation: "Reasoning model + contextual retrieval + action guardrails",
        },
        {
          name: "PWA / Offline Mode",
          description: "Keep the product useful when network quality is bad or attention is fragmented.",
          complexity: 3,
          techRecommendation: "Service workers + cached critical flows",
        },
      ],
      niceToHave: [
        {
          name: "Collaboration Layer",
          description: "Shared views, comments, or multiplayer context that turns solo utility into team habit.",
          complexity: 4,
          techRecommendation: "Presence + websocket-driven shared state",
        },
      ],
    },
    goToMarket: {
      audiences: [
        "Creators, operators, or niche professional teams frustrated by bloated incumbents and generic workflow tools.",
        "Developers and power users who adopt products early if the user experience is opinionated and fast.",
      ],
      pricingModels: [
        "Freemium with paid collaboration, automation, or usage-heavy tiers.",
        "Low-friction SaaS: free solo usage, paid team seats, premium AI add-ons.",
      ],
      launchStrategies: [
        "Ship to one community with a strong taste profile, then iterate publicly with changelogs and teardown posts.",
        "Launch with a striking demo, measurable first-run value, and direct outreach to the exact niche that feels the pain today.",
      ],
      differentiators: [
        "A web product rebuilt around activation speed, not just a prettier version of the original idea.",
        "The rare relaunch that combines focused UX, measurable value, and AI only where it genuinely compounds leverage.",
      ],
    },
    scoreFactors: {
      codebaseHealth: 61,
      marketOpportunity: 69,
      complexity: 63,
      founderFit: 73,
    },
  },
  mobile: {
    diagnosis: {
      technical: [
        "The app probably suffered from fragmented delivery: UI, device behavior, release pipelines, and backend assumptions all coupled too tightly for a small team to maintain.",
        "{name} likely ran into the classic mobile trap: every small feature required touching too many surfaces, so iteration slowed down before product-market fit was clear.",
      ],
      market: [
        "Mobile users are brutal about quality. If onboarding, performance, or crash stability is weak, the uninstall happens before the core value gets a second chance.",
        "{revivalContext} A revival would need clearer retention loops and a narrower mobile-first promise.",
      ],
    },
    architecture: [
      "Cross-platform mobile platform\n├─ React Native or Flutter client\n├─ typed backend API layer\n├─ offline-safe sync engine\n├─ feature flags + staged release controls\n├─ analytics and push orchestration\n└─ crash reporting and performance traces",
      "Mobile growth stack\n├─ modular client features\n├─ backend-for-frontend API\n├─ notification and habit loop service\n├─ remote config / experiments\n└─ release automation with observability baked in",
    ],
    techStack: [
      {
        component: "Client",
        before: "Native or hybrid code with repeated logic",
        after: "React Native or Flutter with shared domain modules",
        reason: "Speed and consistency matter more than ideological purity for an early-stage rebuild.",
      },
      {
        component: "Backend",
        before: "Loose API assumptions or direct client coupling",
        after: "Backend-for-frontend with typed contracts and auth",
        reason: "Mobile teams move faster when the client depends on stable, purpose-built interfaces.",
      },
      {
        component: "Delivery",
        before: "Manual releases and fragile environment handling",
        after: "Fastlane, EAS, staged rollouts, and release health checks",
        reason: "Shipping velocity on mobile is mostly an operations problem.",
      },
      {
        component: "Data & Sync",
        before: "Network-only experience",
        after: "Offline queue + sync reconciliation",
        reason: "Apps that tolerate interruption get used more.",
      },
      {
        component: "Monitoring",
        before: "Crash reports discovered by users",
        after: "Sentry, performance traces, and cohort analytics",
        reason: "Mobile regressions are too expensive to discover late.",
      },
    ],
    features: {
      mustHave: [
        {
          name: "Crash-First Reliability Work",
          description: "Stabilize startup, auth, and primary workflows before expanding the feature set.",
          complexity: 2,
          techRecommendation: "Sentry + crash-free session targets + release gating",
        },
        {
          name: "Habit Loop Design",
          description: "A repeatable reason for users to come back within 24 hours.",
          complexity: 3,
          techRecommendation: "Push system + lifecycle analytics + personalized entry point",
        },
        {
          name: "Offline Tolerance",
          description: "Let users capture or review critical information even when the network is unreliable.",
          complexity: 3,
          techRecommendation: "Local persistence + sync queue",
        },
      ],
      shouldHave: [
        {
          name: "Feature Flags",
          description: "Roll features out gradually and recover from bad launches without waiting for store approval.",
          complexity: 2,
          techRecommendation: "Remote config service",
        },
        {
          name: "Embedded AI Assistant",
          description: "A narrow, contextual helper that accelerates the core job rather than distracting from it.",
          complexity: 3,
          techRecommendation: "On-device or cloud-backed reasoning model with tool access",
        },
      ],
      niceToHave: [
        {
          name: "Community / Sharing Layer",
          description: "Give users a reason to publish progress or invite others.",
          complexity: 4,
          techRecommendation: "Social graph primitives + activity feed",
        },
      ],
    },
    goToMarket: {
      audiences: [
        "Busy professionals who need one fast workflow on mobile, not a desktop product awkwardly squeezed into a phone.",
        "Consumer or prosumer users who form habits quickly if the app solves a recurring, emotional annoyance.",
      ],
      pricingModels: [
        "Freemium with premium workflow automation or advanced usage limits.",
        "Subscription with a clear daily or weekly habit loop tied to paid value.",
      ],
      launchStrategies: [
        "Launch into a niche creator or professional community and optimize for retention before broad acquisition.",
        "Use TikTok, X, and short product demos to show one mobile-first moment of delight, then iterate on the onboarding funnel relentlessly.",
      ],
      differentiators: [
        "A rebuilt mobile experience that is actually native to user behavior instead of being a compressed web app.",
        "Reliability, habit loops, and focused AI assistance packaged into one opinionated product.",
      ],
    },
    scoreFactors: {
      codebaseHealth: 44,
      marketOpportunity: 66,
      complexity: 52,
      founderFit: 68,
    },
  },
  "open-source-tool": {
    diagnosis: {
      technical: [
        "{name} likely accumulated value in the core logic but underinvested in packaging, docs, and extension points. That is how useful code becomes invisible code.",
        "The tool probably worked just well enough for the original author, but not well enough for contributors, integrators, or future maintainers. {causeOfDeath}.",
      ],
      market: [
        "Open-source tools do not win on code alone. They win when setup friction, docs quality, and community trust are dramatically better than the alternatives.",
        "{revivalContext} A modern relaunch would need to productize distribution, onboarding, and contributor experience.",
      ],
    },
    architecture: [
      "Tooling platform\n├─ core library with stable API surface\n├─ CLI / UI wrapper separated from core logic\n├─ plugin system for extensibility\n├─ docs site and examples repo\n├─ CI matrix + release automation\n└─ telemetry / optional analytics for learning from usage",
      "Developer tool ecosystem\n├─ typed core package\n├─ adapters for external services\n├─ examples and templates\n├─ generated docs + API reference\n└─ contribution workflow and automated release channels",
    ],
    techStack: [
      {
        component: "Distribution",
        before: "Single repo with unclear entry points",
        after: "Versioned package(s), CLI binary, and docs site",
        reason: "Adoption rises when the path from curiosity to successful use is obvious.",
      },
      {
        component: "Architecture",
        before: "Core logic and interface concerns mixed together",
        after: "Separation between core engine, adapters, and user-facing wrapper",
        reason: "Extension becomes practical only when boundaries are explicit.",
      },
      {
        component: "Quality Gate",
        before: "Manual testing and release rituals",
        after: "GitHub Actions, release pipelines, and compatibility matrices",
        reason: "Trust in tooling is mostly trust in not breaking.",
      },
      {
        component: "Docs",
        before: "Sparse README and tribal knowledge",
        after: "Documentation site, tutorials, recipes, and starter templates",
        reason: "Docs are the user interface of most developer tools.",
      },
      {
        component: "Community Layer",
        before: "No onboarding path for contributors",
        after: "Contributor guide, issue templates, and roadmap transparency",
        reason: "Tools survive when maintainership scales beyond one person.",
      },
    ],
    features: {
      mustHave: [
        {
          name: "Stable Public API",
          description: "Freeze the core abstraction and document what downstream users can depend on.",
          complexity: 3,
          techRecommendation: "Typed contracts + semantic versioning discipline",
        },
        {
          name: "Documentation Site",
          description: "A proper path from install to first useful outcome in under ten minutes.",
          complexity: 2,
          techRecommendation: "Docs framework + runnable examples",
        },
        {
          name: "Release Automation",
          description: "Cut predictable releases with changelogs and package publishing built in.",
          complexity: 2,
          techRecommendation: "GitHub Actions + Changesets or semantic-release",
        },
      ],
      shouldHave: [
        {
          name: "Plugin System",
          description: "Let the ecosystem extend the tool without forcing every variation into core.",
          complexity: 4,
          techRecommendation: "Adapter contracts + plugin discovery API",
        },
        {
          name: "Starter Templates",
          description: "Help users succeed by giving them working examples tailored to their environment.",
          complexity: 2,
          techRecommendation: "Template repo + scaffold CLI",
        },
      ],
      niceToHave: [
        {
          name: "Hosted Companion Service",
          description: "Offer optional cloud features that make the open-source core easier to adopt at scale.",
          complexity: 5,
          techRecommendation: "Managed config, analytics, or collaboration layer",
        },
      ],
    },
    goToMarket: {
      audiences: [
        "Developers and platform teams who value clarity, speed, and extensibility over buzzword-heavy frameworks.",
        "Open-source adopters searching for a maintained, well-documented replacement for something more cumbersome.",
      ],
      pricingModels: [
        "Open source core with paid cloud companion features or support.",
        "Community edition free, enterprise support and managed hosting paid.",
      ],
      launchStrategies: [
        "Relaunch with a clean docs experience, starter templates, and brutally honest migration guides.",
        "Use benchmark posts, example projects, and contributor-friendly issues to turn the relaunch into a community event.",
      ],
      differentiators: [
        "The revived tool is easier to adopt, easier to extend, and easier to trust than the first version ever was.",
        "A tooling relaunch grounded in documentation quality and extension design, not just a version bump.",
      ],
    },
    scoreFactors: {
      codebaseHealth: 64,
      marketOpportunity: 58,
      complexity: 68,
      founderFit: 71,
    },
  },
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hashSeed(seed: string) {
  return seed.split("").reduce((accumulator, character) => {
    return (accumulator * 33 + character.charCodeAt(0)) >>> 0;
  }, 17);
}

function pickDeterministically(options: string[], seed: string) {
  return options[hashSeed(seed) % options.length];
}

function primaryTag(exhibit: Exhibit) {
  return exhibit.tags[0] ?? "general-purpose code";
}

function secondaryTag(exhibit: Exhibit) {
  return exhibit.tags[1] ?? exhibit.tags[0] ?? "custom infrastructure";
}

function interpolate(template: string, exhibit: Exhibit) {
  return template
    .replaceAll("{name}", exhibit.name)
    .replaceAll("{primaryTag}", primaryTag(exhibit))
    .replaceAll("{secondaryTag}", secondaryTag(exhibit))
    .replaceAll("{causeOfDeath}", exhibit.stats.causeOfDeath)
    .replaceAll("{daysAlive}", String(exhibit.stats.daysAlive))
    .replaceAll("{commits}", String(exhibit.stats.commits))
    .replaceAll("{revivalContext}", exhibit.revivalContext ?? exhibit.description)
    .replaceAll("{founderContext}", exhibit.founderContext ?? "The original builder already has firsthand context from attempt one.");
}

function buildBeforeArchitecture(
  exhibit: Exhibit,
  projectType: ProjectType
): string {
  const defaultBefore = `Single repo / single flow\n├─ domain logic mixed together\n├─ little separation of concerns\n├─ limited observability\n└─ momentum dependent on one developer`;

  switch (projectType) {
    case "trading":
      return `Prototype trading stack\n├─ one dense ${primaryTag(exhibit)} core\n├─ data ingestion and signal logic coupled\n├─ risk handling embedded in strategy code\n└─ execution path with minimal guardrails`;
    case "ai-ml":
      return `AI prototype stack\n├─ model logic mixed with workflow orchestration\n├─ limited evaluation or traceability\n├─ outputs not strongly typed\n└─ operator review path missing or weak`;
    case "web-app":
      return `Frontend-heavy product\n├─ UI state and business logic intertwined\n├─ API assumptions buried in components\n├─ instrumentation added late or not at all\n└─ product growth loops unclear`;
    case "mobile":
      return `App-centric stack\n├─ client concerns tightly coupled\n├─ backend contracts unstable\n├─ release and crash handling manual\n└─ retention loops under-instrumented`;
    case "open-source-tool":
      return `Tooling-first repo\n├─ core library and interface logic mixed\n├─ docs and packaging underdeveloped\n├─ contribution path unclear\n└─ release process fragile`;
    default:
      return defaultBefore;
  }
}

function generateTechStack(
  techStack: TechStackSeed[],
  exhibit: Exhibit
): TechStackComparison[] {
  return techStack.map((row) => ({
    component: row.component,
    before: interpolate(row.before, exhibit),
    after: interpolate(row.after, exhibit),
    reason: interpolate(row.reason, exhibit),
  }));
}

function withPriority(
  features: FeatureSeed[],
  priority: RevivalFeature["priority"]
): RevivalFeature[] {
  return features.map((feature) => ({
    ...feature,
    priority,
  }));
}

function calculateScore(
  baseFactors: RevivalTemplatePack["scoreFactors"],
  exhibit: Exhibit,
  projectType: ProjectType
): RevivalReport["score"] {
  const scoreAdjustments = exhibit.revivalScoreAdjustments ?? {};
  const statusAdjustments: Record<Exhibit["status"], number> = {
    dead: -16,
    zombie: 6,
    mummified: 12,
    buried: 20,
  };

  const sizeAdjustment =
    exhibit.stats.linesOfCode > 10000
      ? -8
      : exhibit.stats.linesOfCode > 3000
      ? -2
      : 6;
  const commitAdjustment =
    exhibit.stats.commits > 100 ? 6 : exhibit.stats.commits > 20 ? 2 : -4;
  const complexityAdjustment =
    exhibit.stats.linesOfCode > 12000
      ? -14
      : exhibit.stats.linesOfCode > 5000
      ? -8
      : exhibit.stats.linesOfCode > 1500
      ? -2
      : 8;
  const trendAdjustment =
    exhibit.stats.daysAlive > 300
      ? 6
      : exhibit.stats.daysAlive > 120
      ? 2
      : -2;

  const codebaseHealth = clampScore(
    baseFactors.codebaseHealth +
      statusAdjustments[exhibit.status] +
      sizeAdjustment +
      commitAdjustment +
      (scoreAdjustments.codebaseHealth ?? 0)
  );

  let marketOpportunity = clampScore(
    baseFactors.marketOpportunity +
      (/ai|copilot|agent|trading|compliance/i.test(exhibit.tags.join(" "))
        ? 7
        : 0) +
      trendAdjustment +
      (scoreAdjustments.marketOpportunity ?? 0)
  );

  if (/obsolete|superseded|winner/i.test(exhibit.stats.causeOfDeath)) {
    marketOpportunity = clampScore(marketOpportunity - 8);
  }

  let complexity = clampScore(
    baseFactors.complexity +
      complexityAdjustment -
      (projectType === "trading" ? 6 : 0) +
      (scoreAdjustments.complexity ?? 0)
  );

  if (/6 Agents|EU AI Act|LangGraph/i.test(exhibit.tags.join(" "))) {
    complexity = clampScore(complexity - 14);
  }

  let founderFit = clampScore(
    baseFactors.founderFit +
      (/proved|already|strong|knows|capable/i.test(exhibit.founderContext ?? "")
        ? 6
        : 0) +
      (scoreAdjustments.founderFit ?? 0)
  );

  if (/weak commercial wedge|commercial|packaging/i.test(exhibit.revivalContext ?? "")) {
    founderFit = clampScore(founderFit - 4);
  }

  const overall = clampScore(
    codebaseHealth * 0.3 +
      marketOpportunity * 0.3 +
      complexity * 0.2 +
      founderFit * 0.2
  );

  const verdict =
    overall >= 85
      ? "Prime resurrection candidate. Rebuild aggressively."
      : overall >= 70
      ? "Worth the effort. The second attempt has a clear path."
      : overall >= 55
      ? "Promising, but only if the relaunch is much sharper than version one."
      : overall >= 40
      ? "Possible, but only with a radical rewrite and tighter go-to-market discipline."
      : "Miracle territory. Rebuild only if the core insight is too good to bury.";

  return {
    overall,
    codebaseHealth,
    marketOpportunity,
    complexity,
    founderFit,
    verdict,
  };
}

export function generateRevivalReport(exhibit: Exhibit): RevivalReport {
  const projectType = detectProjectType(exhibit);
  const template = REVIVAL_TEMPLATES[projectType];

  return {
    exhibitId: exhibit.id,
    projectType,
    diagnosis: {
      technical: interpolate(
        pickDeterministically(
          template.diagnosis.technical,
          `${exhibit.id}-diagnosis-technical`
        ),
        exhibit
      ),
      market: interpolate(
        pickDeterministically(
          template.diagnosis.market,
          `${exhibit.id}-diagnosis-market`
        ),
        exhibit
      ),
    },
    architecture: {
      before: buildBeforeArchitecture(exhibit, projectType),
      after: interpolate(
        pickDeterministically(
          template.architecture,
          `${exhibit.id}-architecture-after`
        ),
        exhibit
      ),
    },
    techStack: generateTechStack(template.techStack, exhibit),
    features: {
      mustHave: withPriority(template.features.mustHave, "must-have"),
      shouldHave: withPriority(template.features.shouldHave, "should-have"),
      niceToHave: withPriority(template.features.niceToHave, "nice-to-have"),
    },
    goToMarket: {
      audience: interpolate(
        pickDeterministically(
          template.goToMarket.audiences,
          `${exhibit.id}-audience`
        ),
        exhibit
      ),
      pricingModel: interpolate(
        pickDeterministically(
          template.goToMarket.pricingModels,
          `${exhibit.id}-pricing`
        ),
        exhibit
      ),
      launchStrategy: interpolate(
        pickDeterministically(
          template.goToMarket.launchStrategies,
          `${exhibit.id}-launch`
        ),
        exhibit
      ),
      differentiator: interpolate(
        pickDeterministically(
          template.goToMarket.differentiators,
          `${exhibit.id}-differentiator`
        ),
        exhibit
      ),
    },
    score: calculateScore(template.scoreFactors, exhibit, projectType),
    meta: {
      source: "template",
      model: null,
      generatedAt: new Date().toISOString(),
      cached: false,
      promptVersion: TEMPLATE_PROMPT_VERSION,
    },
  };
}

export function exportAsMarkdown(exhibit: Exhibit, report: RevivalReport): string {
  const rows = report.techStack
    .map(
      (row) =>
        `| ${row.component} | ${row.before} | ${row.after} | ${row.reason} |`
    )
    .join("\n");

  const featureLines = (features: RevivalFeature[]) =>
    features
      .map(
        (feature) =>
          `- **${feature.name}** — ${feature.description} (Complexity: ${feature.complexity}/5, Tech: ${feature.techRecommendation})`
      )
      .join("\n");

  return `# Revival Plan: ${exhibit.name}

_Source: ${report.meta.source === "openai" ? `OpenAI (${report.meta.model ?? "unknown model"})` : "Template fallback"}_

## Diagnosis
### Technical
${report.diagnosis.technical}

### Market
${report.diagnosis.market}

## Architecture Overhaul
### Before
${report.architecture.before}

### After
${report.architecture.after}

## Tech Stack 2026
| Component | Before | After | Why |
|---|---|---|---|
${rows}

## Feature Additions
### Must-Have
${featureLines(report.features.mustHave)}

### Should-Have
${featureLines(report.features.shouldHave)}

### Nice-to-Have
${featureLines(report.features.niceToHave)}

## Go-to-Market
- **Audience:** ${report.goToMarket.audience}
- **Pricing:** ${report.goToMarket.pricingModel}
- **Launch Strategy:** ${report.goToMarket.launchStrategy}
- **Differentiator:** ${report.goToMarket.differentiator}

## Resurrection Score: ${report.score.overall}/100
- Codebase Health: ${report.score.codebaseHealth}/100
- Market Opportunity: ${report.score.marketOpportunity}/100
- Complexity: ${report.score.complexity}/100
- Founder Fit: ${report.score.founderFit}/100

${report.score.verdict}
`;
}

import { type CuratorExhibitContext } from "@/types/curator";

export interface ProjectArtifact {
  id: string;
  name: string;
  icon: string;
  description: string;
  state: "rotten" | "broken" | "unfinished" | "working";
}

export interface Exhibit {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  status: "dead" | "zombie" | "mummified" | "buried";
  deathDate: string;
  lastCommit: string;
  epitaph: string;
  description: string;
  stats: {
    linesOfCode: number;
    commits: number;
    daysAlive: number;
    causeOfDeath: string;
  };
  artifacts: ProjectArtifact[];
  copilotInsight: string;
  copilotEpitaph: string;
  funFact: string;
  tags: string[];
  revivalContext?: string;
  founderContext?: string;
  curatorContext?: CuratorExhibitContext;
  revivalScoreAdjustments?: Partial<{
    codebaseHealth: number;
    marketOpportunity: number;
    complexity: number;
    founderFit: number;
  }>;
  color: string;
  accentColor: string;
  unlocked: boolean;
}

export const curatorExhibits: Exhibit[] = [
  {
    id: "cortex",
    slug: "cortex",
    name: "CORTEX Trading",
    subtitle: "The Prediction That Couldn't Predict Its Own Death",
    status: "dead",
    deathDate: "2025-11-14",
    lastCommit: "a3f91d",
    epitaph:
      "Here lies CORTEX. It tried to predict the market. The market predicted its demise.",
    description:
      "An algorithmic trading system that ranked top-31 in an AI trading challenge. Built with Python, pandas, and the naivety that historical data predicts the future. Died when the leaderboard algorithm proved smarter than the trading algorithm.",
    stats: {
      linesOfCode: 2847,
      commits: 47,
      daysAlive: 23,
      causeOfDeath: "Leaderboard algorithm outsmarted the trading algorithm",
    },
    artifacts: [
      {
        id: "cortex-1",
        name: "Trading Engine",
        icon: "TrendingDown",
        description:
          "A Python engine that lost virtual money with alarming efficiency",
        state: "broken",
      },
      {
        id: "cortex-2",
        name: "Backtester",
        icon: "BarChart3",
        description:
          "Tested on historical data. History didn't repeat itself.",
        state: "rotten",
      },
      {
        id: "cortex-3",
        name: "Risk Manager",
        icon: "ShieldAlert",
        description: "Didn't manage the risk of existing",
        state: "unfinished",
      },
    ],
    copilotInsight:
      "Copilot analyzed this codebase and found 14 instances of 'TODO: fix this later' and 0 instances of 'actually fixed it'. The most optimistic comment was '# This might work in a bull market'.",
    copilotEpitaph:
      "In memory of CORTEX, whose 'RiskManager.py' contained a function called calculate_safe_position() that returned 'all_in' 100% of the time.",
    funFact:
      "The backtest showed 340% returns. Live trading showed 340% of those returns disappearing.",
    tags: ["Python", "Pandas", "Naivety"],
    revivalContext:
      "Built for a competitive trading setting where technical rigor mattered, but product framing and real-world safeguards mattered even more.",
    founderContext:
      "The original builder has strong systems intuition and enough quantitative background to rebuild this properly with better constraints.",
    curatorContext: {
      primaryLanguage: "Python",
      languages: ["Python", "Pandas"],
      topics: ["trading", "backtesting", "risk"],
      lastCommitMessage: "Tune strategy weights before leaderboard submission",
      rootItems: ["TradingEngine.py", "Backtester.py", "RiskManager.py", "README.md"],
      readmeExcerpt:
        "Experimental trading system for challenge performance using historical data and lightweight risk heuristics.",
    },
    revivalScoreAdjustments: {
      marketOpportunity: 6,
      founderFit: 4,
    },
    color: "#1a1a2e",
    accentColor: "#e94560",
    unlocked: true,
  },
  {
    id: "conforma",
    slug: "conforma",
    name: "Conforma-AI",
    subtitle: "Technically Superior. Emotionally Devastated.",
    status: "zombie",
    deathDate: "2026-05-15",
    lastCommit: "d8e2b4",
    epitaph:
      "Here lies Conforma-AI. It prevented millions in fines. But preventing loss doesn't win hackathons. Generating revenue does.",
    description:
      "A 6-agent multi-agent system for EU AI Act compliance. Perfect timing with the Omnibus Deal. Technically deeper than the winner. Built with LangGraph, 6 specialized agents, and the belief that compliance matters. Lost to a B2B Sales OS built in Next.js + Supabase.",
    stats: {
      linesOfCode: 12543,
      commits: 132,
      daysAlive: 45,
      causeOfDeath:
        "Revenue generation > Risk avoidance in hackathon judging",
    },
    artifacts: [
      {
        id: "cf-1",
        name: "Compliance Auditor",
        icon: "Scale",
        description:
          "6 agents that audited EU AI Act compliance. The judges audited its lack of revenue.",
        state: "broken",
      },
      {
        id: "cf-2",
        name: "Confidence Scorer",
        icon: "Gauge",
        description:
          "Score 0-100 for compliance. Scored 0-100 on fun.",
        state: "working",
      },
      {
        id: "cf-3",
        name: "PDF Generator",
        icon: "FileText",
        description:
          "Generated 40-page compliance reports in 4 minutes. The judges needed 40 seconds to lose interest.",
        state: "working",
      },
      {
        id: "cf-4",
        name: "LangGraph Orchestrator",
        icon: "GitBranch",
        description:
          "7 nodes, 12 edges. Over-engineered for a world that wanted simple.",
        state: "unfinished",
      },
    ],
    copilotInsight:
      "Copilot's autopsy report: 'Conforma-AI had 6 agents, 43 tests, and 0 business model. Deals Machine had 1 sales pipeline and 1 winner badge. Sometimes less is more. Sometimes more is just more.'",
    copilotEpitaph:
      "Conforma-AI died so we could learn: in hackathons, 'Watch the brain learn' outperforms 'Audit your codebase' every single time.",
    funFact:
      "This project is immortalized in the PromptMaestro V4.0 autopsy section. It literally became a case study on how to lose.",
    tags: ["LangGraph", "6 Agents", "EU AI Act", "Milan"],
    revivalContext:
      "The product hit a real regulatory wave, but the storytelling around revenue and buyer urgency lagged behind the technical depth.",
    founderContext:
      "The original builder clearly knows how to orchestrate AI systems, but needs a tighter commercial wedge and faster packaging.",
    curatorContext: {
      primaryLanguage: "Python",
      languages: ["Python", "LangGraph", "TypeScript"],
      topics: ["compliance", "agents", "eu-ai-act"],
      lastCommitMessage: "Polish confidence scorer and PDF dossier flow",
      rootItems: [
        "auditor/",
        "langgraph_orchestrator.py",
        "confidence_scoring.py",
        "reporting/",
      ],
      readmeExcerpt:
        "Multi-agent compliance assistant for EU AI Act readiness with audit workflows and structured report generation.",
    },
    revivalScoreAdjustments: {
      codebaseHealth: -10,
      marketOpportunity: -35,
      complexity: -20,
      founderFit: -30,
    },
    color: "#16213e",
    accentColor: "#0f3460",
    unlocked: true,
  },
  {
    id: "codesonify-v1",
    slug: "codesonify-v1",
    name: "CodeSonify v1",
    subtitle: "The Precursor to Victory",
    status: "mummified",
    deathDate: "2025-12-01",
    lastCommit: "b1c3f0",
    epitaph: "Here lies CodeSonify v1. It dreamed of music. v2 learned to sing.",
    description:
      "The first attempt at sonifying code. Raw, buggy, but beautiful in concept. Had MIDI export, basic diff visualization, and the kernel of an idea that would later win Microsoft Agents League 2026. Abandoned when v2 rewrote everything from scratch.",
    stats: {
      linesOfCode: 3200,
      commits: 28,
      daysAlive: 14,
      causeOfDeath: "Superseded by v2, the winner",
    },
    artifacts: [
      {
        id: "cs-1",
        name: "MIDI Generator",
        icon: "Music",
        description:
          "Turned code changes into MIDI notes. Mostly turned them into noise.",
        state: "broken",
      },
      {
        id: "cs-2",
        name: "Diff Parser",
        icon: "Split",
        description: "Parsed git diffs. Sometimes parsed them correctly.",
        state: "working",
      },
      {
        id: "cs-3",
        name: "Tone.js Integration",
        icon: "AudioLines",
        description: "Connected to Tone.js. The connection was loose.",
        state: "unfinished",
      },
    ],
    copilotInsight:
      "Copilot found a comment in the source: '// This is stupid but it might work' next to the function that eventually won a hackathon. Stupid ideas that work are just called innovation.",
    copilotEpitaph:
      "v1 died so v2 could live. Every great product has a cemetery of versions. This is one of them.",
    funFact:
      "This v1 had a bug where every code change sounded like a C minor chord. The bug became a feature in v2.",
    tags: ["TypeScript", "Tone.js", "MIDI", "Prototype"],
    revivalContext:
      "The idea was stronger than the implementation, which is exactly the kind of failure mode that can become a breakout product on a second pass.",
    founderContext:
      "The original builder already proved this space can work by evolving the concept into a stronger v2, so founder fit is unusually high.",
    curatorContext: {
      primaryLanguage: "TypeScript",
      languages: ["TypeScript", "Tone.js", "MIDI"],
      topics: ["sonification", "music", "developer-tools"],
      lastCommitMessage: "Prototype diff-to-midi pipeline",
      rootItems: ["src/", "midi-generator.ts", "diff-parser.ts", "README.md"],
      readmeExcerpt:
        "Prototype that turns code changes into music to explore code review, diff emotion, and auditory debugging.",
    },
    revivalScoreAdjustments: {
      codebaseHealth: 10,
      marketOpportunity: 18,
      complexity: 30,
      founderFit: 10,
    },
    color: "#2d132c",
    accentColor: "#c72c41",
    unlocked: true,
  },
];

export const resurrectionExhibit: Exhibit = {
  id: "resurrection-bay",
  slug: "resurrection",
  name: "Resurrection Bay",
  subtitle: "Where Copilot Brings Dead Code Back to Life",
  status: "buried",
  deathDate: "2026-05-29",
  lastCommit: "LIVE",
  epitaph: "This is not a grave. This is a birthplace.",
  description:
    "The only room in the museum where projects don't stay dead. Pick an abandoned project, and watch Copilot analyze, refactor, and resurrect it in real-time. The phoenix room of the Museum of Dead Dreams.",
  stats: {
    linesOfCode: 0,
    commits: 0,
    daysAlive: 0,
    causeOfDeath: "Nothing dies here. Everything is reborn.",
  },
  artifacts: [
    {
      id: "rb-1",
      name: "Copilot Agent",
      icon: "Bot",
      description: "The resurrector. The rebuilder. The reviver.",
      state: "working",
    },
    {
      id: "rb-2",
      name: "Code Phoenix",
      icon: "Flame",
      description:
        "From the ashes of abandoned commits, new code rises.",
      state: "working",
    },
  ],
  copilotInsight:
    "Copilot doesn't just write code. It reads intent. It sees the abandoned dream and asks: 'What if we tried one more time?'",
  copilotEpitaph: "This room has no epitaph. Only welcomes.",
  funFact:
    "Every project in this museum was resurrected by Copilot to build this museum. Meta enough for you?",
  tags: ["Copilot Agent", "Resurrection", "Meta"],
  revivalContext:
    "This is already a meta-product: the value is not the original code, but the developer transformation it can trigger.",
  founderContext:
    "The original builder is already operating at the intersection of storytelling, AI tooling, and product experimentation.",
  curatorContext: {
    primaryLanguage: "TypeScript",
    languages: ["TypeScript", "React", "OpenAI"],
    topics: ["copilot", "museum", "resurrection"],
    lastCommitMessage: "Open the gates for reclaimed projects and Copilot kits",
    rootItems: ["src/", "server/", ".github/", "docs/"],
    readmeExcerpt:
      "Interactive museum of abandoned software projects with AI-generated revival plans and downloadable Copilot resurrection kits.",
  },
  revivalScoreAdjustments: {
    codebaseHealth: 10,
    marketOpportunity: 15,
    complexity: 20,
    founderFit: 10,
  },
  color: "#1b262c",
  accentColor: "#3282b8",
  unlocked: false,
};

export const exhibits: Exhibit[] = [...curatorExhibits, resurrectionExhibit];

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
}

export const achievements: Achievement[] = [
  {
    id: "first_visit",
    name: "First Steps",
    description: "Enter the Museum of Dead Dreams",
    icon: "Footprints",
    condition: "visit_museum",
    unlocked: false,
  },
  {
    id: "personalize_graveyard",
    name: "Summon the Graveyard",
    description: "Generate a museum from a GitHub username",
    icon: "Bot",
    condition: "generate_museum",
    unlocked: false,
  },
  {
    id: "visit_first_exhibit",
    name: "Fresh Footprints",
    description: "Enter any repository exhibit",
    icon: "TrendingDown",
    condition: "visit_any_exhibit",
    unlocked: false,
  },
  {
    id: "tour_the_graveyard",
    name: "Full Autopsy",
    description: "Visit every repository room in the current museum",
    icon: "Scale",
    condition: "visit_all_generated_exhibits",
    unlocked: false,
  },
  {
    id: "read_all_epitaphs",
    name: "Grave Reader",
    description: "Read every epitaph in the current museum",
    icon: "BookOpen",
    condition: "read_all_epitaphs",
    unlocked: false,
  },
  {
    id: "find_secret",
    name: "The Archaeologist",
    description: "Find a hidden easter egg",
    icon: "Search",
    condition: "find_secret",
    unlocked: false,
  },
  {
    id: "copilot_chat",
    name: "AI Whisperer",
    description: "Interact with the Copilot Curator",
    icon: "Bot",
    condition: "copilot_chat",
    unlocked: false,
  },
  {
    id: "resurrect",
    name: "Necromancer",
    description: "Witness a resurrection in the Resurrection Bay",
    icon: "Sparkles",
    condition: "resurrect",
    unlocked: false,
  },
  {
    id: "share_graveyard",
    name: "Public Mourning",
    description: "Share your personalized Museum of Dead Dreams",
    icon: "Flame",
    condition: "share_graveyard",
    unlocked: false,
  },
  {
    id: "view_revival_plan",
    name: "The Necromancer",
    description: "Open a Copilot-generated Revival Plan",
    icon: "Sparkles",
    condition: "view_revival_plan",
    unlocked: false,
  },
  {
    id: "export_revival_plan",
    name: "The Strategist",
    description: "Export a Revival Plan as markdown or PDF",
    icon: "BookOpen",
    condition: "export_revival_plan",
    unlocked: false,
  },
  {
    id: "serial_resurrector",
    name: "Serial Resurrector",
    description: "View every Revival Plan in the current museum",
    icon: "Bot",
    condition: "serial_resurrector",
    unlocked: false,
  },
  {
    id: "surgeon",
    name: "The Surgeon",
    description: "View a Revival Plan with a Resurrection Score above 80",
    icon: "Scale",
    condition: "surgeon",
    unlocked: false,
  },
  {
    id: "miracle_worker",
    name: "Miracle Worker",
    description: "View a Revival Plan with a Resurrection Score below 40",
    icon: "Flame",
    condition: "miracle_worker",
    unlocked: false,
  },
];

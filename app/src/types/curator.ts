export interface CuratorExhibitContext {
  owner?: string;
  htmlUrl?: string;
  primaryLanguage?: string;
  languages?: string[];
  topics?: string[];
  lastCommitMessage?: string;
  lastCommitDate?: string | null;
  rootItems?: string[];
  readmeExcerpt?: string | null;
  manifestSnippets?: {
    name: string;
    excerpt: string;
  }[];
}

export interface CuratorChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  evidence?: string[];
  suggestedFollowUps?: string[];
  meta?: CuratorReplyMeta;
}

export interface CuratorReplyMeta {
  source: "openai" | "fallback";
  model: string | null;
  generatedAt: string;
  cached: boolean;
  promptVersion: string;
  fallbackReason?: string;
}

export interface CuratorChatRequestExhibit {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: "dead" | "zombie" | "mummified" | "buried";
  deathDate: string;
  lastCommit: string;
  causeOfDeath: string;
  stats: {
    linesOfCode: number;
    commits: number;
    daysAlive: number;
  };
  tags: string[];
  artifacts: {
    name: string;
    description: string;
    state: "rotten" | "broken" | "unfinished" | "working";
  }[];
  copilotInsight: string;
  copilotEpitaph: string;
  funFact: string;
  revivalContext?: string;
  founderContext?: string;
  curatorContext?: CuratorExhibitContext;
}

export interface CuratorChatPayload {
  exhibit: CuratorChatRequestExhibit;
  question: string;
  history: {
    role: "user" | "assistant";
    content: string;
  }[];
}

export interface CuratorReply {
  answer: string;
  evidence: string[];
  suggestedFollowUps: string[];
  meta: CuratorReplyMeta;
}

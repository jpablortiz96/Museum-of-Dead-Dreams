import { type ProjectArtifact } from "@/data/exhibits";

export type MuseumArtifactIcon =
  | "TrendingDown"
  | "BarChart3"
  | "ShieldAlert"
  | "Scale"
  | "Gauge"
  | "Folder"
  | "Code"
  | "BookOpen"
  | "Beaker"
  | "FileText"
  | "GitBranch"
  | "Music"
  | "Split"
  | "AudioLines"
  | "Bot"
  | "Flame";

export interface MuseumArtifactContent {
  name: string;
  icon: MuseumArtifactIcon;
  description: string;
  state: ProjectArtifact["state"];
}

export interface MuseumRepoContext {
  id: number;
  name: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  primaryLanguage: string;
  languages: string[];
  topics: string[];
  daysAbandoned: number;
  estimatedLOC: number;
  totalCommits: number;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string | null;
  deathDate: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  rank: number;
  rootItems: string[];
  readmeExcerpt: string | null;
  manifestSnippets: {
    name: string;
    excerpt: string;
  }[];
}

export interface MuseumExhibitContent {
  repoId: number;
  subtitle: string;
  epitaph: string;
  description: string;
  causeOfDeath: string;
  artifacts: MuseumArtifactContent[];
  copilotInsight: string;
  copilotEpitaph: string;
  funFact: string;
  revivalContext: string;
  founderContext: string;
}

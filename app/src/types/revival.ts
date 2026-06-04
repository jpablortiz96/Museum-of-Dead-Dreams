export interface RevivalFeature {
  name: string;
  description: string;
  priority: "must-have" | "should-have" | "nice-to-have";
  complexity: 1 | 2 | 3 | 4 | 5;
  techRecommendation: string;
}

export interface TechStackComparison {
  component: string;
  before: string;
  after: string;
  reason: string;
}

export interface RevivalReportMeta {
  source: "openai" | "template";
  model: string | null;
  generatedAt: string;
  cached: boolean;
  promptVersion: string;
  fallbackReason?: string;
}

export interface RevivalArtifactSummary {
  name: string;
  description: string;
  state: "rotten" | "broken" | "unfinished" | "working";
}

export interface RevivalPlanRequestExhibit {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: "dead" | "zombie" | "mummified" | "buried";
  deathDate: string;
  lastCommit: string;
  tags: string[];
  projectType: string;
  stats: {
    linesOfCode: number;
    commits: number;
    daysAlive: number;
    causeOfDeath: string;
  };
  artifacts: RevivalArtifactSummary[];
  revivalContext: string;
  founderContext: string;
}

export interface RevivalReport {
  exhibitId: string;
  projectType: string;
  diagnosis: {
    technical: string;
    market: string;
  };
  architecture: {
    before: string;
    after: string;
  };
  techStack: TechStackComparison[];
  features: {
    mustHave: RevivalFeature[];
    shouldHave: RevivalFeature[];
    niceToHave: RevivalFeature[];
  };
  goToMarket: {
    audience: string;
    pricingModel: string;
    launchStrategy: string;
    differentiator: string;
  };
  score: {
    overall: number;
    codebaseHealth: number;
    marketOpportunity: number;
    complexity: number;
    founderFit: number;
    verdict: string;
  };
  meta: RevivalReportMeta;
}

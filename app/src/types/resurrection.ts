import { type Exhibit } from "@/data/exhibits";
import { type RevivalReport } from "@/types/revival";

export interface CopilotKitFile {
  path: string;
  label: string;
  description: string;
  content: string;
}

export interface CopilotResurrectionKit {
  title: string;
  slug: string;
  summary: string;
  quickstart: string[];
  files: CopilotKitFile[];
}

export interface ResurrectedProjectRecord {
  exhibitId: string;
  exhibitSlug: string;
  museumKey: string;
  exhibitSnapshot: Pick<
    Exhibit,
    | "id"
    | "slug"
    | "name"
    | "subtitle"
    | "status"
    | "deathDate"
    | "lastCommit"
    | "description"
    | "tags"
    | "color"
    | "accentColor"
    | "stats"
  >;
  report: RevivalReport;
  kit: CopilotResurrectionKit;
  resurrectedAt: string;
}

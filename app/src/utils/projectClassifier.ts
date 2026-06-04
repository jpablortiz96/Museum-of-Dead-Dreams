import { type Exhibit } from "@/data/exhibits";

export type ProjectType =
  | "trading"
  | "ai-ml"
  | "web-app"
  | "mobile"
  | "open-source-tool";

function normalizeSignals(exhibit: Exhibit): string[] {
  return [
    exhibit.name,
    exhibit.subtitle,
    exhibit.description,
    exhibit.stats.causeOfDeath,
    exhibit.revivalContext ?? "",
    ...exhibit.tags,
  ]
    .join(" ")
    .toLowerCase()
    .split(/[\s,./:+-]+/)
    .filter(Boolean);
}

export function detectProjectType(exhibit: Exhibit): ProjectType {
  const signals = normalizeSignals(exhibit);
  const signalText = signals.join(" ");

  if (/trade|trading|broker|quant|stock|crypto|portfolio/.test(signalText)) {
    return "trading";
  }

  if (
    /ai|ml|model|agent|copilot|gpt|llm|langgraph|compliance|predict/.test(
      signalText
    )
  ) {
    return "ai-ml";
  }

  if (/market|risk/.test(signalText)) {
    return "trading";
  }

  if (/mobile|ios|android|reactnative|flutter|kotlin|swift/.test(signalText)) {
    return "mobile";
  }

  if (
    /app|web|site|dashboard|react|next|frontend|ui|tone|midi|visual/.test(
      signalText
    )
  ) {
    return "web-app";
  }

  if (/api|sdk|tool|cli|library|lib|plugin|package/.test(signalText)) {
    return "open-source-tool";
  }

  if (
    exhibit.tags.includes("JavaScript") ||
    exhibit.tags.includes("TypeScript") ||
    exhibit.tags.includes("HTML") ||
    exhibit.tags.includes("CSS")
  ) {
    return "web-app";
  }

  if (exhibit.tags.includes("Python")) {
    return "ai-ml";
  }

  return "open-source-tool";
}

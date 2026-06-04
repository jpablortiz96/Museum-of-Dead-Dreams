import { type Exhibit } from "@/data/exhibits";
import { type ResurrectedProjectRecord, type CopilotKitFile, type CopilotResurrectionKit } from "@/types/resurrection";
import { type RevivalFeature, type RevivalReport } from "@/types/revival";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderFeatures(label: string, items: RevivalFeature[]) {
  return `## ${label}\n${items
    .map(
      (feature) =>
        `- **${feature.name}** (${feature.complexity}/5): ${feature.description} Tech recommendation: ${feature.techRecommendation}.`
    )
    .join("\n")}`;
}

function buildCopilotInstructions(exhibit: Exhibit, report: RevivalReport) {
  return `# Copilot instructions for reviving ${exhibit.name}

You are working on a resurrection of ${exhibit.name}. Treat the current repository as a rewrite-or-modernization effort guided by a validated revival plan, not as a cosmetic refactor.

## Product intent
- Ship a commercially viable second version of ${exhibit.name}.
- Preserve the strongest idea from the original project: ${exhibit.subtitle}
- Solve for the original failure mode: ${exhibit.stats.causeOfDeath}
- Optimize for fast feedback loops, observability, and production-grade guardrails.

## Non-negotiables
- Follow the target architecture and do not collapse independent concerns back into a single monolith.
- Prefer typed contracts, tests for critical paths, and explicit runtime validation.
- Keep changes incremental and explain tradeoffs before introducing major platform dependencies.
- Never optimize for novelty over shipping. Favor the narrowest useful implementation that proves the product wedge.

## Modern target
- Project type: ${report.projectType}
- Primary verdict: ${report.score.verdict}
- Resurrection score: ${report.score.overall}/100

## Architecture direction
${report.architecture.after}

## Commercial direction
- Audience: ${report.goToMarket.audience}
- Pricing: ${report.goToMarket.pricingModel}
- Launch: ${report.goToMarket.launchStrategy}
- Differentiator: ${report.goToMarket.differentiator}

## Execution rules
- Start by building the must-have features before touching nice-to-have scope.
- When uncertain, choose options that reduce deployment friction and make testing easier.
- Surface assumptions, missing env vars, schema changes, migration risks, and rollout risks clearly.
- Add or update documentation whenever you introduce new architecture boundaries or developer workflows.

## Must-have feature set
${bulletList(report.features.mustHave.map((feature) => `${feature.name}: ${feature.description}`))}
`;
}

function buildAgentsInstructions(exhibit: Exhibit, report: RevivalReport) {
  return `# AGENTS.md

This repository is being revived from the Museum of Dead Dreams as ${exhibit.name}.

## Mission
Transform the project into a shippable modern product using the attached revival plan as the source of truth for direction, scope, and commercial framing.

## Operating posture
- Think like a staff engineer plus product strategist.
- Minimize codebase thrash: prefer well-scoped changes that can be validated quickly.
- Keep architecture boundaries explicit.
- Maintain a running backlog of follow-up work instead of silently dropping ideas.

## Required workflow
1. Read .github/copilot-instructions.md before major code changes.
2. Read docs/revival-plan.md for product framing and architecture targets.
3. Use the skill at .github/skills/${toSlug(exhibit.name)}-resurrection/SKILL.md when asked to modernize, rebuild, or relaunch the product.
4. Implement must-have features before should-have and nice-to-have scope.
5. Always propose verification steps for each meaningful change.

## Primary failure modes to avoid
- Recreating the original monolith or prototype shortcuts.
- Shipping without observability or validation on critical flows.
- Expanding scope before the core wedge is usable.
- Ignoring the market diagnosis:
  - ${report.diagnosis.market}
`;
}

function buildSkillInstructions(exhibit: Exhibit, report: RevivalReport) {
  const skillName = `${toSlug(exhibit.name)}-resurrection`;

  return `---
name: ${skillName}
description: Use this when asked to revive, modernize, relaunch, or productionize ${exhibit.name}. It provides the architecture target, rollout priorities, and Copilot workflow for the rebuild.
---

# ${exhibit.name} resurrection skill

Use this skill when the task is about rebuilding ${exhibit.name}, implementing its revival roadmap, or packaging it for a market relaunch.

## Goals
- Turn the original project failure into a shippable product advantage.
- Respect the revival architecture and commercial wedge.
- Keep implementation grounded in the must-have roadmap before expanding scope.

## Process
1. Read ../../docs/revival-plan.md to understand the diagnosis, architecture, and go-to-market.
2. Read ../../docs/resurrection-backlog.md and pick the smallest meaningful slice from the must-have lane.
3. Before coding, identify which architecture boundary the task belongs to.
4. Implement with validation, tests where risk is real, and explicit notes for missing dependencies or infra.
5. Update docs if you change architecture boundaries, workflows, or setup expectations.

## Architecture target
${report.architecture.after}

## Priorities
${bulletList(report.features.mustHave.map((feature) => `${feature.name}: ${feature.description}`))}

## Guardrails
- Do not reintroduce the original failure mode: ${exhibit.stats.causeOfDeath}
- Prefer typed interfaces, validation, and observable flows.
- Defer speculative polish until the core loop is working.
`;
}

function buildPathSpecificInstructions(exhibit: Exhibit, report: RevivalReport) {
  const mustHaveNames = report.features.mustHave.map((feature) => feature.name).join(", ");

  return `---
applyTo: "**/*"
---

When changing this repository, you are inside the resurrection of ${exhibit.name}.

Focus on:
- preserving the new architecture boundaries instead of reintroducing monolithic shortcuts
- implementing the must-have roadmap first: ${mustHaveNames || "stabilize the core wedge"}
- adding validation, observability, and deployment-safe defaults
- documenting assumptions, migrations, and follow-up work

Avoid:
- rebuilding the original failure mode: ${exhibit.stats.causeOfDeath}
- expanding into nice-to-have scope before the must-have lane is stable
- hiding risky tradeoffs or infra assumptions
`;
}

function buildRevivalPlanDoc(exhibit: Exhibit, report: RevivalReport) {
  return `# Revival Plan - ${exhibit.name}

## Original project
- Name: ${exhibit.name}
- Subtitle: ${exhibit.subtitle}
- Last commit: ${exhibit.lastCommit}
- Cause of death: ${exhibit.stats.causeOfDeath}
- Resurrection score: ${report.score.overall}/100

## Technical diagnosis
${report.diagnosis.technical}

## Market diagnosis
${report.diagnosis.market}

## Architecture overhaul
### Before
${report.architecture.before}

### After
${report.architecture.after}

## Tech stack
| Component | Before | Now | Why |
| --- | --- | --- | --- |
${report.techStack
  .map((row) => `| ${row.component} | ${row.before} | ${row.after} | ${row.reason} |`)
  .join("\n")}

${renderFeatures("Must-have features", report.features.mustHave)}

${renderFeatures("Should-have features", report.features.shouldHave)}

${renderFeatures("Nice-to-have features", report.features.niceToHave)}

## Go-to-market
- Audience: ${report.goToMarket.audience}
- Pricing: ${report.goToMarket.pricingModel}
- Launch: ${report.goToMarket.launchStrategy}
- Differentiator: ${report.goToMarket.differentiator}
`;
}

function buildBacklogDoc(report: RevivalReport) {
  const renderChecklist = (label: string, items: RevivalFeature[]) =>
    `## ${label}\n${items
      .map(
        (feature, index) =>
          `${index + 1}. ${feature.name}\n   - Why: ${feature.description}\n   - Complexity: ${feature.complexity}/5\n   - Tech: ${feature.techRecommendation}`
      )
      .join("\n")}`;

  return `# Resurrection backlog

Ship in this order. Do not skip ahead before the current lane is stable.

${renderChecklist("Must-have", report.features.mustHave)}

${renderChecklist("Should-have", report.features.shouldHave)}

${renderChecklist("Nice-to-have", report.features.niceToHave)}
`;
}

function buildFileSet(exhibit: Exhibit, report: RevivalReport): CopilotKitFile[] {
  const skillSlug = `${toSlug(exhibit.name)}-resurrection`;

  return [
    {
      path: ".github/copilot-instructions.md",
      label: "Repository-wide Copilot instructions",
      description: "Global operating rules for Copilot Chat, code review, CLI, and agent workflows.",
      content: buildCopilotInstructions(exhibit, report),
    },
    {
      path: "AGENTS.md",
      label: "Agent instructions",
      description: "Nearest-agent instructions for Copilot cloud agent and agent mode.",
      content: buildAgentsInstructions(exhibit, report),
    },
    {
      path: ".github/instructions/resurrection.instructions.md",
      label: "Path-specific instructions",
      description: "Additional repository instructions for active implementation work.",
      content: buildPathSpecificInstructions(exhibit, report),
    },
    {
      path: `.github/skills/${skillSlug}/SKILL.md`,
      label: "Project skill",
      description: "Reusable Copilot skill focused on resurrecting this product.",
      content: buildSkillInstructions(exhibit, report),
    },
    {
      path: "docs/revival-plan.md",
      label: "Revival plan dossier",
      description: "Reference document with the full diagnosis, architecture, and market strategy.",
      content: buildRevivalPlanDoc(exhibit, report),
    },
    {
      path: "docs/resurrection-backlog.md",
      label: "Execution backlog",
      description: "Ordered implementation checklist derived from the revival report.",
      content: buildBacklogDoc(report),
    },
  ];
}

export function generateCopilotResurrectionKit(
  exhibit: Exhibit,
  report: RevivalReport
): CopilotResurrectionKit {
  const skillSlug = `${toSlug(exhibit.name)}-resurrection`;
  const files = buildFileSet(exhibit, report);

  return {
    title: `${exhibit.name} Copilot Resurrection Kit`,
    slug: skillSlug,
    summary:
      "A production-ready Copilot guidance pack with repository instructions, agent guidance, a project skill, and execution docs grounded in the revival plan.",
    quickstart: [
      "Unzip the kit into the root of the target repository.",
      "Commit .github/copilot-instructions.md, AGENTS.md, and the .github/skills folder.",
      "Open Copilot Chat or agent mode in the repository and ask it to follow the resurrection skill.",
      "Start with docs/resurrection-backlog.md and implement the must-have lane first.",
    ],
    files,
  };
}

export function createResurrectedProjectRecord(
  exhibit: Exhibit,
  report: RevivalReport,
  museumKey: string
): ResurrectedProjectRecord {
  return {
    exhibitId: exhibit.id,
    exhibitSlug: exhibit.slug,
    museumKey,
    exhibitSnapshot: {
      id: exhibit.id,
      slug: exhibit.slug,
      name: exhibit.name,
      subtitle: exhibit.subtitle,
      status: exhibit.status,
      deathDate: exhibit.deathDate,
      lastCommit: exhibit.lastCommit,
      description: exhibit.description,
      tags: exhibit.tags,
      color: exhibit.color,
      accentColor: exhibit.accentColor,
      stats: exhibit.stats,
    },
    report,
    kit: generateCopilotResurrectionKit(exhibit, report),
    resurrectedAt: new Date().toISOString(),
  };
}

function downloadBlob(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCopilotKitFile(file: CopilotKitFile) {
  const fileName =
    file.path.replaceAll("/", "__").replaceAll("\\", "__") || "copilot-kit.md";
  downloadBlob(file.content, fileName, "text/markdown;charset=utf-8");
}

export async function downloadCopilotKitArchive(record: ResurrectedProjectRecord) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  record.kit.files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  zip.file(
    "README-Museum-of-Dead-Dreams.txt",
    [
      `${record.kit.title}`,
      "",
      record.kit.summary,
      "",
      "Quickstart:",
      ...record.kit.quickstart.map((step, index) => `${index + 1}. ${step}`),
    ].join("\n")
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = `${record.kit.slug}.zip`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

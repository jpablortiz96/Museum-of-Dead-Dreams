import { forwardRef } from "react";
import {
  Bot,
  Flame,
  Gauge,
  GitBranch,
  Layers3,
  Rocket,
  Skull,
  Sparkles,
} from "lucide-react";
import { type Exhibit } from "@/data/exhibits";
import { type RevivalReport } from "@/types/revival";

interface RevivalReportPdfDocumentProps {
  exhibit: Exhibit;
  report: RevivalReport;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getScoreColor(value: number) {
  if (value >= 80) {
    return "#22c55e";
  }
  if (value >= 60) {
    return "#60a5fa";
  }
  if (value >= 40) {
    return "#f59e0b";
  }
  return "#e94560";
}

function formatGeneratedAt(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const statusConfig = {
  dead: { label: "DECEASED", color: "#e94560" },
  zombie: { label: "UNDEAD", color: "#a855f7" },
  mummified: { label: "MUMMIFIED", color: "#f59e0b" },
  buried: { label: "REBIRTH", color: "#3282b8" },
} as const;

export const RevivalReportPdfDocument = forwardRef<
  HTMLDivElement,
  RevivalReportPdfDocumentProps
>(function RevivalReportPdfDocument({ exhibit, report }, ref) {
  const status = statusConfig[exhibit.status];
  const featureGroups = [
    { label: "Must-Have", items: report.features.mustHave, tone: exhibit.accentColor },
    { label: "Should-Have", items: report.features.shouldHave, tone: "#f59e0b" },
    { label: "Nice-to-Have", items: report.features.niceToHave, tone: "#60a5fa" },
  ];
  const scoreRows = [
    { label: "Codebase Health", value: report.score.codebaseHealth },
    { label: "Market Opportunity", value: report.score.marketOpportunity },
    { label: "Complexity", value: report.score.complexity },
    { label: "Founder Fit", value: report.score.founderFit },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 z-[-1]"
      style={{ left: "-200vw" }}
    >
      <div
        ref={ref}
        className="relative w-[960px] overflow-hidden bg-[#090b12] text-white"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${exhibit.color} 0%, #101524 26%, #090b12 72%)`,
          }}
        />
        <div
          className="absolute left-[-8%] top-[-4%] h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: hexToRgba(exhibit.accentColor, 0.28) }}
        />
        <div
          className="absolute right-[-10%] top-[18%] h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: hexToRgba(status.color, 0.2) }}
        />
        <div
          className="absolute bottom-[-8%] left-[18%] h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(125, 184, 255, 0.16)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),repeating-linear-gradient(0deg,rgba(255,255,255,0.015),rgba(255,255,255,0.015)_1px,transparent_1px,transparent_3px)]" />

        <div className="relative px-12 py-12">
          <div className="rounded-[28px] border border-white/10 bg-black/22 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[600px]">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full border px-4 py-1.5 text-[11px] font-mono-code uppercase tracking-[0.32em]"
                    style={{
                      color: "#d8ebff",
                      borderColor: hexToRgba(exhibit.accentColor, 0.38),
                      backgroundColor: hexToRgba(exhibit.accentColor, 0.14),
                    }}
                  >
                    Museum of Dead Dreams
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-mono-code uppercase tracking-[0.28em] text-white/55">
                    Copilot Revival Report
                  </span>
                  <span
                    className="rounded-full border px-4 py-1.5 text-[11px] font-mono-code uppercase tracking-[0.28em]"
                    style={{
                      color: status.color,
                      borderColor: hexToRgba(status.color, 0.4),
                      backgroundColor: hexToRgba(status.color, 0.12),
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                <h1 className="font-display text-[42px] leading-tight tracking-[0.04em] text-white">
                  {exhibit.name}
                </h1>
                <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-white/70">
                  {exhibit.subtitle}
                </p>
                <p className="mt-5 max-w-[620px] text-sm leading-relaxed text-white/50">
                  Copilot is not refactoring this project. It is reimagining how it
                  should be rebuilt to win today, with a modern architecture, a sharper
                  commercial wedge, and a survivable execution plan.
                </p>
              </div>

              <div className="min-w-[220px] rounded-3xl border border-white/10 bg-white/6 p-6">
                <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.28em] text-white/45">
                  Resurrection Score
                </div>
                <div className="font-display text-6xl text-white">
                  {report.score.overall}
                  <span className="ml-1 text-2xl text-white/40">/100</span>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/58">
                  {report.score.verdict}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
              {[
                { label: "Project Type", value: report.projectType.replaceAll("-", " ") },
                { label: "Commits", value: exhibit.stats.commits.toLocaleString() },
                { label: "Last Commit", value: exhibit.lastCommit },
                { label: "Days Abandoned", value: `${exhibit.stats.daysAlive}d` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/18 p-4">
                  <div className="text-[11px] font-mono-code uppercase tracking-[0.24em] text-white/42">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-medium text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/8 bg-black/20 p-6">
              <div className="mb-3 flex items-center gap-3">
                <Flame className="h-4 w-4 text-amber-300" />
                <div className="text-xs font-mono-code uppercase tracking-[0.28em] text-amber-100/70">
                  Original Cause of Death
                </div>
              </div>
              <p className="text-base leading-relaxed text-white/76">
                {exhibit.stats.causeOfDeath}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {exhibit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Skull className="h-5 w-5 text-red-300" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  The Autopsy
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Diagnosis
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/6 p-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.26em] text-red-200/72">
                  Technical Diagnosis
                </div>
                <p className="text-sm leading-7 text-red-50/86">{report.diagnosis.technical}</p>
              </div>
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/6 p-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.26em] text-amber-100/72">
                  Market Diagnosis
                </div>
                <p className="text-sm leading-7 text-amber-50/84">{report.diagnosis.market}</p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  The Blueprint
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Architecture Overhaul
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-3xl border border-white/8 bg-black/18 p-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.26em] text-white/45">
                  Before
                </div>
                <pre className="font-mono-code whitespace-pre-wrap text-[13px] leading-7 text-white/70">
                  {report.architecture.before}
                </pre>
              </div>
              <div
                className="rounded-3xl border p-6"
                style={{
                  borderColor: hexToRgba(exhibit.accentColor, 0.26),
                  backgroundColor: hexToRgba(exhibit.accentColor, 0.08),
                }}
              >
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.26em] text-[#dbeeff]/78">
                  After
                </div>
                <pre className="font-mono-code whitespace-pre-wrap text-[13px] leading-7 text-[#eff7ff]/88">
                  {report.architecture.after}
                </pre>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  The Modern Stack
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Tech Stack 2026
                </h2>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/8 bg-black/18">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/8 bg-white/6">
                    <th className="px-4 py-4 text-[11px] font-mono-code uppercase tracking-[0.24em] text-white/45">
                      Component
                    </th>
                    <th className="px-4 py-4 text-[11px] font-mono-code uppercase tracking-[0.24em] text-white/45">
                      Before
                    </th>
                    <th className="px-4 py-4 text-[11px] font-mono-code uppercase tracking-[0.24em] text-white/45">
                      Now
                    </th>
                    <th className="px-4 py-4 text-[11px] font-mono-code uppercase tracking-[0.24em] text-white/45">
                      Why
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.techStack.map((row) => (
                    <tr key={row.component} className="border-b border-white/6 align-top last:border-b-0">
                      <td className="px-4 py-4 text-sm font-medium text-white">{row.component}</td>
                      <td className="px-4 py-4 text-sm text-white/52">{row.before}</td>
                      <td className="px-4 py-4 text-sm text-[#dbeeff]">{row.after}</td>
                      <td className="px-4 py-4 text-sm leading-6 text-white/65">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  What Was Missing
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Feature Additions
                </h2>
              </div>
            </div>
            <div className="space-y-5">
              {featureGroups.map((group) => (
                <div key={group.label} className="rounded-3xl border border-white/8 bg-black/18 p-6">
                  <div className="mb-4 text-xs font-mono-code uppercase tracking-[0.26em] text-white/50">
                    {group.label}
                  </div>
                  <div className="space-y-3">
                    {group.items.map((feature) => (
                      <div
                        key={feature.name}
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: hexToRgba(group.tone, 0.24),
                          backgroundColor: hexToRgba(group.tone, 0.08),
                        }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="text-base font-medium text-white">{feature.name}</div>
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-mono-code uppercase tracking-[0.18em] text-white/50">
                            Complexity {feature.complexity}/5
                          </span>
                        </div>
                        <p className="text-sm leading-7 text-white/70">{feature.description}</p>
                        <div className="mt-3 text-xs leading-relaxed text-[#dbeeff]/78">
                          Tech recommendation: {feature.techRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Rocket className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  From Repo to Revenue
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Go-to-Market
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: "Target Audience", value: report.goToMarket.audience },
                { label: "Pricing Model", value: report.goToMarket.pricingModel },
                { label: "Launch Strategy", value: report.goToMarket.launchStrategy },
                { label: "Differentiation", value: report.goToMarket.differentiator },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/8 bg-white/5 p-6">
                  <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.26em] text-white/45">
                    {item.label}
                  </div>
                  <p className="text-sm leading-7 text-white/72">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Gauge className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  The Verdict
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Resurrection Score
                </h2>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-black/18 p-6">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <div className="text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
                    Overall Score
                  </div>
                  <div className="mt-2 font-display text-6xl text-white">
                    {report.score.overall}
                    <span className="ml-1 text-2xl text-white/40">/100</span>
                  </div>
                  <div className="mt-3 text-sm text-white/58">{report.score.verdict}</div>
                </div>
                <div className="w-[360px]">
                  <div className="h-4 overflow-hidden rounded-full bg-white/7">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${report.score.overall}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(report.score.overall)}, ${exhibit.accentColor})`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {scoreRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="text-sm text-white/74">{row.label}</div>
                      <div className="text-sm font-mono-code text-white/48">{row.value}/100</div>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/7">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.value}%`,
                          backgroundColor: getScoreColor(row.value),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/22 p-10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <Bot className="h-5 w-5 text-[#7db8ff]" />
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/75">
                  Field Notes
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[0.04em] text-white">
                  Repo Evidence That Informed The Plan
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-3xl border border-white/8 bg-white/5 p-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
                  Original Story
                </div>
                <p className="text-sm leading-7 text-white/68">{exhibit.description}</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/5 p-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
                  Artifact Snapshot
                </div>
                <div className="space-y-3">
                  {exhibit.artifacts.map((artifact) => (
                    <div key={artifact.id} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                      <div className="text-sm font-medium text-white">{artifact.name}</div>
                      <div className="mt-1 text-sm leading-6 text-white/58">
                        {artifact.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-black/18 px-8 py-6 backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs font-mono-code uppercase tracking-[0.26em] text-white/40">
                  Generated
                </div>
                <div className="mt-2 text-sm leading-relaxed text-white/58">
                  {formatGeneratedAt(report.meta.generatedAt)}
                </div>
                <div className="mt-1 text-sm leading-relaxed text-white/40">
                  Source: {report.meta.source === "openai" ? "OpenAI structured analysis" : "Template fallback"}
                  {report.meta.model ? ` • ${report.meta.model}` : ""}
                </div>
              </div>
              <div className="max-w-[360px] text-right">
                <div className="text-xs font-mono-code uppercase tracking-[0.26em] text-white/40">
                  Prompt Version
                </div>
                <div className="mt-2 text-sm leading-relaxed text-white/58">
                  {report.meta.promptVersion}
                </div>
                {report.meta.fallbackReason && (
                  <div className="mt-3 text-xs leading-relaxed text-amber-100/58">
                    Fallback note: {report.meta.fallbackReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

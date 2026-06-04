import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ClipboardCopy,
  FileDown,
  Flame,
  Gauge,
  GitBranch,
  Layers3,
  LoaderCircle,
  Rocket,
  Skull,
  Sparkles,
} from "lucide-react";
import { type Exhibit } from "@/data/exhibits";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadRevivalReport } from "@/services/revivalApi";
import { type RevivalReport as RevivalReportType } from "@/types/revival";
import { exportRevivalPlanPdf } from "@/utils/revivalPdf";
import { exportAsMarkdown, generateRevivalReport } from "@/utils/revivalTemplates";
import { RevivalReportPdfDocument } from "./RevivalReportPdfDocument";
import { RevivalSection } from "./RevivalSection";
import { ScoreVisualization } from "./ScoreVisualization";

interface RevivalReportProps {
  exhibit: Exhibit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPlan: (payload: { exhibitId: string; overallScore: number }) => void;
  onExportPlan: (payload: { exhibitId: string; overallScore: number }) => void;
  onCommitToResurrectionBay: (payload: {
    exhibit: Exhibit;
    report: RevivalReportType;
  }) => void;
  isCommittedToResurrectionBay: boolean;
}

const sections = [
  { id: "diagnosis", label: "Diagnosis", icon: Skull },
  { id: "architecture", label: "Architecture", icon: GitBranch },
  { id: "stack", label: "Tech Stack", icon: Layers3 },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "market", label: "Go-to-Market", icon: Rocket },
  { id: "score", label: "Score", icon: Gauge },
] as const;

type SectionId = (typeof sections)[number]["id"];
const HARD_PANEL_DEADLINE_MS = 8000;
const loadingPhases = [
  "Contacting local museum intelligence server",
  "Classifying project type and failure mode",
  "Evaluating architecture, stack, and market angle",
  "Waiting for structured CTO memo",
  "Switching to offline fallback if live analysis stalls",
] as const;

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function wait(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function buildTimedFallbackReport(exhibit: Exhibit) {
  const fallbackReport = generateRevivalReport(exhibit);

  return {
    ...fallbackReport,
    meta: {
      ...fallbackReport.meta,
      fallbackReason:
        "Live AI analysis exceeded the panel deadline, so the offline report was used instead.",
    },
  };
}

function buildErrorFallbackReport(exhibit: Exhibit, reason: string) {
  const fallbackReport = generateRevivalReport(exhibit);

  return {
    ...fallbackReport,
    meta: {
      ...fallbackReport.meta,
      fallbackReason: reason,
    },
  };
}

export function RevivalReport({
  exhibit,
  open,
  onOpenChange,
  onViewPlan,
  onExportPlan,
  onCommitToResurrectionBay,
  isCommittedToResurrectionBay,
}: RevivalReportProps) {
  const exhibitRequestKey = [
    exhibit.id,
    exhibit.lastCommit,
    exhibit.stats.commits,
    exhibit.stats.linesOfCode,
    exhibit.stats.daysAlive,
  ].join(":");
  const [activeSection, setActiveSection] = useState<SectionId>("diagnosis");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  const [report, setReport] = useState<RevivalReportType | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [pdfState, setPdfState] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const fallbackActionRef = useRef<(() => void) | null>(null);
  const pdfDocumentRef = useRef<HTMLDivElement | null>(null);
  const reportViewed = useEffectEvent((nextReport: RevivalReportType) => {
    onViewPlan({
      exhibitId: exhibit.id,
      overallScore: nextReport.score.overall,
    });
  });

  useEffect(() => {
    if (!open) {
      setCopyState("idle");
      setPdfState("idle");
      return;
    }

    let isCancelled = false;
    let hasSettled = false;
    setIsLoading(true);
    setLoadingElapsedMs(0);
    setReport(null);
    setActiveSection("diagnosis");
    setCopyState("idle");
    setPdfState("idle");

    const settleReport = (nextReport: RevivalReportType) => {
      if (isCancelled || hasSettled) {
        return;
      }

      hasSettled = true;
      setReport(nextReport);
      setIsLoading(false);
      reportViewed(nextReport);
    };
    fallbackActionRef.current = () => {
      settleReport(
        buildErrorFallbackReport(
          exhibit,
          "Offline fallback triggered manually from the panel."
        )
      );
    };

    const deadlineId = window.setTimeout(() => {
      settleReport(buildTimedFallbackReport(exhibit));
    }, HARD_PANEL_DEADLINE_MS);

    void (async () => {
      try {
        const nextReport = await loadRevivalReport(exhibit);
        await wait(450);

        if (isCancelled || hasSettled) {
          return;
        }

        settleReport(nextReport);
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message
            : "Live AI analysis failed unexpectedly. Using offline fallback.";
        settleReport(buildErrorFallbackReport(exhibit, reason));
      }
    })();

    return () => {
      isCancelled = true;
      fallbackActionRef.current = null;
      window.clearTimeout(deadlineId);
    };
  }, [exhibitRequestKey, open]);

  useEffect(() => {
    if (!open || !isLoading) {
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setLoadingElapsedMs(Date.now() - startedAt);
    }, 200);

    return () => window.clearInterval(interval);
  }, [isLoading, open]);

  const currentSectionIndex = useMemo(
    () => sections.findIndex((section) => section.id === activeSection),
    [activeSection]
  );

  const handleExport = async () => {
    if (!report) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportAsMarkdown(exhibit, report));
      setCopyState("copied");
      onExportPlan({
        exhibitId: exhibit.id,
        overallScore: report.score.overall,
      });
    } catch {
      setCopyState("error");
    }
  };

  const handlePdfExport = async () => {
    if (!report || !pdfDocumentRef.current) {
      setPdfState("error");
      return;
    }

    try {
      setPdfState("exporting");
      await exportRevivalPlanPdf({
        element: pdfDocumentRef.current,
        exhibit,
      });
      setPdfState("done");
      onExportPlan({
        exhibitId: exhibit.id,
        overallScore: report.score.overall,
      });
    } catch {
      setPdfState("error");
    }
  };

  const handleCommitToBay = () => {
    if (!report) {
      return;
    }

    onCommitToResurrectionBay({
      exhibit,
      report,
    });
  };

  const nextSection = sections[currentSectionIndex + 1];
  const previousSection = sections[currentSectionIndex - 1];
  const loadingPhaseIndex = Math.min(
    loadingPhases.length - 1,
    Math.floor(loadingElapsedMs / 1600)
  );
  const secondsUntilFallback = Math.max(
    0,
    Math.ceil((HARD_PANEL_DEADLINE_MS - loadingElapsedMs) / 1000)
  );
  const elapsedSeconds = (loadingElapsedMs / 1000).toFixed(1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-white/10 bg-gradient-to-b from-[#13182a] via-[#0c0f18] to-[#090b12] p-0 text-white sm:max-w-5xl"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-white/8 px-6 py-5">
            <div className="pr-10">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#3282b8]/30 bg-[#3282b8]/10 px-3 py-1 text-xs font-mono-code uppercase tracking-[0.25em] text-[#7db8ff]">
                  Copilot Revival Report
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono-code uppercase tracking-[0.22em] text-white/50">
                  {report ? toTitleCase(report.projectType) : "Analyzing"}
                </span>
                {report && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-mono-code uppercase tracking-[0.22em] ${
                      report.meta.source === "openai"
                        ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200/80"
                        : "border-amber-400/20 bg-amber-400/8 text-amber-200/80"
                    }`}
                  >
                    {report.meta.source === "openai" ? "AI Generated" : "Template Fallback"}
                  </span>
                )}
                {report?.meta.cached && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono-code uppercase tracking-[0.22em] text-white/40">
                    Cached
                  </span>
                )}
              </div>
              <SheetTitle className="font-display text-3xl tracking-wide text-white">
                {exhibit.name} - Revival Plan
              </SheetTitle>
              <SheetDescription className="mt-2 max-w-3xl text-sm leading-relaxed text-white/45">
                Copilot is not refactoring this project. It is reimagining how it should be rebuilt to win today.
              </SheetDescription>
            </div>
          </SheetHeader>

          {isLoading && (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-12">
              <div className="mx-auto flex min-h-full max-w-2xl items-start justify-center pt-4">
                <div className="w-full text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#3282b8]/30 bg-[#3282b8]/10">
                  <Bot className="h-8 w-8 animate-pulse text-[#7db8ff]" />
                </div>
                <h3 className="font-display text-3xl text-white">
                  Copilot is analyzing resurrection strategies...
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/45">
                  Rethinking architecture, stack, product strategy, and what this project would need to become commercially viable in 2026.
                </p>
                <div className="mt-8 rounded-2xl border border-white/8 bg-white/5 p-5 text-left">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="text-xs font-mono-code uppercase tracking-[0.22em] text-[#7db8ff]/75">
                      Live analysis progress
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs font-mono-code text-white/45">
                      <span>Elapsed {elapsedSeconds}s</span>
                      <span>Offline fallback in {secondsUntilFallback}s</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {loadingPhases.map((phase, index) => {
                      const isDone = index < loadingPhaseIndex;
                      const isActive = index === loadingPhaseIndex;

                      return (
                        <div
                          key={phase}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                            isActive
                              ? "border-[#3282b8]/30 bg-[#3282b8]/10"
                              : isDone
                              ? "border-emerald-400/20 bg-emerald-400/8"
                              : "border-white/8 bg-black/15"
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20">
                            {isDone ? (
                              <Check className="h-4 w-4 text-emerald-300" />
                            ) : isActive ? (
                              <LoaderCircle className="h-4 w-4 animate-spin text-[#7db8ff]" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-white/20" />
                            )}
                          </div>
                          <div className="text-sm text-white/70">{phase}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-xs leading-relaxed text-white/45">
                      If the live report does not arrive quickly, switch to the offline plan immediately.
                    </div>
                    <button
                      onClick={() => fallbackActionRef.current?.()}
                      className="btn-museum inline-flex items-center gap-2"
                    >
                      Use Offline Fallback Now
                    </button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && report && (
            <Tabs
              value={activeSection}
              onValueChange={(value) => setActiveSection(value as SectionId)}
              className="flex min-h-0 flex-1 flex-col md:flex-row"
            >
              <div className="border-b border-white/8 px-4 py-4 md:w-64 md:border-b-0 md:border-r md:px-3">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-1">
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="justify-start rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-left text-white/55 data-[state=active]:border-[#3282b8]/30 data-[state=active]:bg-[#3282b8]/12 data-[state=active]:text-white"
                    >
                      <section.icon className="h-4 w-4" />
                      <span>{section.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <TabsContent value="diagnosis" className="mt-0">
                  <RevivalSection
                    eyebrow="The Autopsy"
                    title="Diagnosis"
                    description="Why this project died, technically and commercially."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                        <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.25em] text-red-300/70">
                          Technical Diagnosis
                        </div>
                        <p className="text-sm leading-relaxed text-red-100/78">
                          {report.diagnosis.technical}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.25em] text-amber-300/70">
                          Market Diagnosis
                        </div>
                        <p className="text-sm leading-relaxed text-amber-100/78">
                          {report.diagnosis.market}
                        </p>
                      </div>
                    </div>
                  </RevivalSection>
                </TabsContent>

                <TabsContent value="architecture" className="mt-0">
                  <RevivalSection
                    eyebrow="The Blueprint"
                    title="Architecture Overhaul"
                    description="What the old shape looked like, and how the rebuilt system should be partitioned now."
                  >
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-black/25 p-5">
                        <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
                          Before
                        </div>
                        <pre className="font-mono-code whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                          {report.architecture.before}
                        </pre>
                      </div>
                      <div className="rounded-2xl border border-[#3282b8]/20 bg-[#3282b8]/6 p-5">
                        <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-[#7db8ff]/75">
                          After
                        </div>
                        <pre className="font-mono-code whitespace-pre-wrap text-sm leading-relaxed text-[#d9ebff]/85">
                          {report.architecture.after}
                        </pre>
                      </div>
                    </div>
                  </RevivalSection>
                </TabsContent>

                <TabsContent value="stack" className="mt-0">
                  <RevivalSection
                    eyebrow="The Modern Stack"
                    title="Tech Stack 2026"
                    description="What changes in the stack, and why those changes matter now."
                  >
                    <div className="overflow-x-auto rounded-2xl border border-white/8 bg-black/20">
                      <table className="w-full min-w-[820px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/8 bg-white/5">
                            <th className="px-4 py-3 text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                              Component
                            </th>
                            <th className="px-4 py-3 text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                              Before
                            </th>
                            <th className="px-4 py-3 text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                              Now
                            </th>
                            <th className="px-4 py-3 text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                              Why
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.techStack.map((row) => (
                            <tr key={row.component} className="border-b border-white/6 align-top last:border-b-0">
                              <td className="px-4 py-4 text-sm font-medium text-white">
                                {row.component}
                              </td>
                              <td className="px-4 py-4 text-sm text-white/50">
                                {row.before}
                              </td>
                              <td className="px-4 py-4 text-sm text-[#dbeeff]">
                                {row.after}
                              </td>
                              <td className="px-4 py-4 text-sm text-white/62">
                                {row.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </RevivalSection>
                </TabsContent>

                <TabsContent value="features" className="mt-0">
                  <RevivalSection
                    eyebrow="What Was Missing"
                    title="Feature Additions"
                    description="The features that would make the reboot materially more viable than the original."
                  >
                    <div className="space-y-5">
                      {[
                        {
                          label: "Must-Have",
                          items: report.features.mustHave,
                          border: "border-red-500/20 bg-red-500/5",
                        },
                        {
                          label: "Should-Have",
                          items: report.features.shouldHave,
                          border: "border-amber-500/20 bg-amber-500/5",
                        },
                        {
                          label: "Nice-to-Have",
                          items: report.features.niceToHave,
                          border: "border-blue-500/20 bg-blue-500/5",
                        },
                      ].map((group) => (
                        <div key={group.label} className={`rounded-2xl border p-5 ${group.border}`}>
                          <div className="mb-4 text-xs font-mono-code uppercase tracking-[0.25em] text-white/55">
                            {group.label}
                          </div>
                          <div className="space-y-3">
                            {group.items.map((feature) => (
                              <div
                                key={feature.name}
                                className="rounded-xl border border-white/8 bg-black/18 p-4"
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <div className="text-base font-medium text-white">
                                    {feature.name}
                                  </div>
                                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-mono-code uppercase tracking-[0.18em] text-white/45">
                                    Complexity {feature.complexity}/5
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed text-white/62">
                                  {feature.description}
                                </p>
                                <div className="mt-3 text-xs text-[#7db8ff]/75">
                                  Tech recommendation: {feature.techRecommendation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RevivalSection>
                </TabsContent>

                <TabsContent value="market" className="mt-0">
                  <RevivalSection
                    eyebrow="From Repo to Revenue"
                    title="Go-to-Market"
                    description="How to launch this project now so the second life actually compounds into adoption."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      {[
                        {
                          title: "Target Audience",
                          value: report.goToMarket.audience,
                        },
                        {
                          title: "Pricing Model",
                          value: report.goToMarket.pricingModel,
                        },
                        {
                          title: "Launch Strategy",
                          value: report.goToMarket.launchStrategy,
                        },
                        {
                          title: "Differentiation",
                          value: report.goToMarket.differentiator,
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/8 bg-white/5 p-5"
                        >
                          <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
                            {item.title}
                          </div>
                          <p className="text-sm leading-relaxed text-white/72">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </RevivalSection>
                </TabsContent>

                <TabsContent value="score" className="mt-0">
                  <RevivalSection
                    eyebrow="The Verdict"
                    title="Resurrection Score"
                    description="How viable the reboot is when you balance code salvageability, market timing, execution burden, and founder fit."
                  >
                    <ScoreVisualization score={report.score} />
                  </RevivalSection>
                </TabsContent>
              </div>
            </Tabs>
          )}

          {!isLoading && report && (
            <div className="border-t border-white/8 px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => previousSection && setActiveSection(previousSection.id)}
                    disabled={!previousSection}
                    className="btn-museum inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous Section
                  </button>
                  <button
                    onClick={() => nextSection && setActiveSection(nextSection.id)}
                    disabled={!nextSection}
                    className="btn-museum inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCommitToBay}
                    disabled={!report}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                      isCommittedToResurrectionBay
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "btn-museum"
                    } disabled:cursor-not-allowed disabled:opacity-65`}
                  >
                    {isCommittedToResurrectionBay ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    {isCommittedToResurrectionBay
                      ? "Saved In Resurrection Bay"
                      : "Commit To Resurrection Bay"}
                  </button>
                  <button
                    onClick={handlePdfExport}
                    disabled={pdfState === "exporting" || !report}
                    className="btn-museum-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {pdfState === "exporting" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                    {pdfState === "exporting" ? "Rendering PDF..." : "Export Branded PDF"}
                  </button>
                  <button
                    onClick={handleExport}
                    className="btn-museum-primary inline-flex items-center gap-2"
                  >
                    {copyState === "copied" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    Copy Markdown
                  </button>
                  <div className="flex flex-col gap-1">
                    {pdfState !== "idle" && (
                      <span
                        className={`text-xs font-mono-code ${
                          pdfState === "done"
                            ? "text-green-300"
                            : pdfState === "error"
                            ? "text-red-300"
                            : "text-[#7db8ff]"
                        }`}
                      >
                        {pdfState === "done"
                          ? "Branded PDF downloaded"
                          : pdfState === "error"
                          ? "PDF rendering failed"
                          : "Rendering branded PDF"}
                      </span>
                    )}
                    {copyState !== "idle" && (
                      <span
                        className={`text-xs font-mono-code ${
                          copyState === "copied"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {copyState === "copied"
                          ? "Markdown copied to clipboard"
                          : "Clipboard access failed"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/40">
                <Flame className="mr-2 inline h-3.5 w-3.5 text-amber-300" />
                {report.meta.source === "openai"
                  ? `Generated with ${report.meta.model ?? "OpenAI"} using a structured resurrection prompt tuned for low-token strategy reports.`
                  : `Fell back to the local template engine. ${report.meta.fallbackReason ?? "The OpenAI-backed report was unavailable."}`}
              </div>
            </div>
          )}
        </div>

        {!isLoading && report && (
          <RevivalReportPdfDocument
            ref={pdfDocumentRef}
            exhibit={exhibit}
            report={report}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

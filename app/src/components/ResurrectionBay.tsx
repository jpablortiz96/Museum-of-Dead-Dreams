import { useEffect, useMemo, useRef, useState } from "react";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypewriterText } from "./TypewriterText";
import {
  Archive,
  ArrowLeft,
  Bot,
  Check,
  ClipboardCopy,
  Download,
  FileDown,
  Flame,
  GitBranch,
  LoaderCircle,
  Rocket,
  Sparkles,
  Wand2,
  Workflow,
} from "lucide-react";
import {
  downloadCopilotKitArchive,
  downloadCopilotKitFile,
} from "@/utils/copilotResurrectionKit";
import { type CopilotKitFile, type ResurrectedProjectRecord } from "@/types/resurrection";

interface ResurrectionStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: "waiting" | "running" | "done";
  codeBefore?: string;
  codeAfter?: string;
  copilotThought?: string;
}

interface ResurrectionBayProps {
  onBack: () => void;
  onResurrect: () => void;
  resurrectedProjects: ResurrectedProjectRecord[];
}

function buildInitialSteps(project: ResurrectedProjectRecord | null): ResurrectionStep[] {
  if (!project) {
    return [];
  }

  const primaryFeature = project.report.features.mustHave[0];
  const copilotInstructions = project.kit.files.find(
    (file) => file.path === ".github/copilot-instructions.md"
  );

  return [
    {
      id: "recall",
      label: "Autopsy Recall",
      description: "Reloading the original failure pattern and project intent...",
      icon: Archive,
      status: "waiting",
      codeBefore: [
        `// ${project.exhibitSnapshot.name}`,
        `// Cause of death: ${project.exhibitSnapshot.stats.causeOfDeath}`,
        `// Resurrection score: ${project.report.score.overall}/100`,
        "",
        `// Original subtitle: ${project.exhibitSnapshot.subtitle}`,
        `// Last commit: ${project.exhibitSnapshot.lastCommit}`,
      ].join("\n"),
      copilotThought: project.report.diagnosis.technical,
    },
    {
      id: "blueprint",
      label: "Blueprint Rewrite",
      description: "Projecting the new architecture into a production shape...",
      icon: GitBranch,
      status: "waiting",
      copilotThought: project.report.architecture.after,
    },
    {
      id: "imprint",
      label: "Copilot Skill Imprint",
      description: "Stamping the repo with instructions, skills, and agent guidance...",
      icon: Wand2,
      status: "waiting",
      codeAfter: copilotInstructions?.content ?? "",
      copilotThought: primaryFeature
        ? `Priority one is ${primaryFeature.name}. ${primaryFeature.description} Tech recommendation: ${primaryFeature.techRecommendation}.`
        : "No must-have feature was detected, so Copilot will prioritize the first stable delivery slice.",
    },
    {
      id: "launch",
      label: "Launch Readiness",
      description: "Validating the market wedge, rollout path, and shipping posture...",
      icon: Rocket,
      status: "waiting",
      copilotThought: `Audience: ${project.report.goToMarket.audience}. Launch: ${project.report.goToMarket.launchStrategy}. Verdict: ${project.report.score.verdict}`,
    },
  ];
}

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ResurrectionBay({
  onBack,
  onResurrect,
  resurrectedProjects,
}: ResurrectionBayProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    resurrectedProjects[0]?.exhibitId ?? null
  );
  const [steps, setSteps] = useState<ResurrectionStep[]>(() =>
    buildInitialSteps(resurrectedProjects[0] ?? null)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showThought, setShowThought] = useState(false);
  const [thoughtText, setThoughtText] = useState("");
  const [showHeavenGate, setShowHeavenGate] = useState(true);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [archiveState, setArchiveState] = useState<"idle" | "downloading" | "done" | "error">(
    "idle"
  );
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedProject = useMemo(
    () =>
      resurrectedProjects.find((project) => project.exhibitId === selectedProjectId) ??
      resurrectedProjects[0] ??
      null,
    [resurrectedProjects, selectedProjectId]
  );

  const totalResurrectedLoc = resurrectedProjects.reduce(
    (accumulator, project) => accumulator + project.exhibitSnapshot.stats.linesOfCode,
    0
  );
  const averageScore = resurrectedProjects.length
    ? Math.round(
        resurrectedProjects.reduce(
          (accumulator, project) => accumulator + project.report.score.overall,
          0
        ) / resurrectedProjects.length
      )
    : 0;

  const resetProtocol = (nextProject: ResurrectedProjectRecord | null) => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    setSteps(buildInitialSteps(nextProject));
    setIsRunning(false);
    setCurrentStep(0);
    setShowComplete(false);
    setShowThought(false);
    setThoughtText("");
  };

  useEffect(() => {
    if (!resurrectedProjects.length) {
      setSelectedProjectId(null);
      resetProtocol(null);
      return;
    }

    const nextProject =
      resurrectedProjects.find((project) => project.exhibitId === selectedProjectId) ??
      resurrectedProjects[0];

    setSelectedProjectId(nextProject.exhibitId);
    resetProtocol(nextProject);
  }, [resurrectedProjects, selectedProjectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHeavenGate(false), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  const runResurrection = () => {
    if (!selectedProject) {
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    setShowComplete(false);
    setShowThought(false);
    setThoughtText("");
    onResurrect();

    let stepIndex = 0;
    const protocolSteps = buildInitialSteps(selectedProject);
    setSteps(protocolSteps);

    const processStep = () => {
      if (stepIndex >= protocolSteps.length) {
        window.setTimeout(() => setShowComplete(true), 500);
        setIsRunning(false);
        return;
      }

      setCurrentStep(stepIndex);
      setSteps((previousSteps) =>
        previousSteps.map((step, index) =>
          index === stepIndex ? { ...step, status: "running" } : step
        )
      );
      setShowThought(true);
      setThoughtText(protocolSteps[stepIndex].copilotThought ?? "");

      intervalRef.current = setTimeout(() => {
        setSteps((previousSteps) =>
          previousSteps.map((step, index) =>
            index === stepIndex ? { ...step, status: "done" } : step
          )
        );
        stepIndex += 1;
        processStep();
      }, 2200 + stepIndex * 250);
    };

    processStep();
  };

  const handleProjectSelect = (project: ResurrectedProjectRecord) => {
    setSelectedProjectId(project.exhibitId);
    resetProtocol(project);
    setArchiveState("idle");
    setCopiedFile(null);
  };

  const handleCopyFile = async (file: CopilotKitFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(file.path);
    } catch {
      setCopiedFile("error");
    }
  };

  const handleDownloadArchive = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      setArchiveState("downloading");
      await downloadCopilotKitArchive(selectedProject);
      setArchiveState("done");
    } catch {
      setArchiveState("error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden room-transition-enter bg-gradient-to-b from-[#dcecff] via-[#13304d] to-[#090b12]">
      <ParticleCanvas color="229, 242, 255" count={120} />
      <div className="scanline absolute inset-0 z-10" />

      {showHeavenGate && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          <div className="heaven-door-glow absolute inset-0" />
          <div className="heaven-door-left absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#f7fbff] via-[#dcecff] to-transparent" />
          <div className="heaven-door-right absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#f7fbff] via-[#dcecff] to-transparent" />
          <div className="absolute inset-0 bg-white/25 animate-pulse" />
        </div>
      )}

      <div className="relative z-20 mx-auto max-w-7xl px-6 py-8">
        <button
          onClick={onBack}
          className="group mb-8 flex items-center gap-2 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-mono-code tracking-wider">BACK TO HALL</span>
        </button>

        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
            <Flame className="h-4 w-4 text-[#7db8ff]" />
            <span className="text-xs font-mono-code tracking-[0.28em] text-[#dff1ff]">
              RESURRECTION BAY
            </span>
          </div>

          <h1 className="glow-text font-display text-4xl font-bold tracking-wide text-white md:text-6xl">
            Through the Gates of Rebirth
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-white/60">
            This is the afterlife archive. Every project committed here keeps its
            revival dossier, Copilot execution kit, and a replayable resurrection
            protocol.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Projects Reclaimed",
              value: resurrectedProjects.length.toString(),
            },
            {
              label: "Lines Pulled Back",
              value: totalResurrectedLoc.toLocaleString(),
            },
            {
              label: "Average Resurrection Score",
              value: `${averageScore}/100`,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm">
              <div className="text-xs font-mono-code uppercase tracking-[0.26em] text-white/45">
                {item.label}
              </div>
              <div className="mt-3 font-display text-3xl text-white">{item.value}</div>
            </div>
          ))}
        </div>

        {selectedProject ? (
          <div className="grid gap-8 xl:grid-cols-[360px,1fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/22 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Archive className="h-4 w-4 text-[#7db8ff]" />
                  <div className="text-xs font-mono-code uppercase tracking-[0.26em] text-[#dff1ff]">
                    Resurrected Archive
                  </div>
                </div>

                <div className="space-y-3">
                  {resurrectedProjects.map((project) => {
                    const isSelected = project.exhibitId === selectedProject.exhibitId;

                    return (
                      <button
                        key={project.exhibitId}
                        onClick={() => handleProjectSelect(project)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#7db8ff]/35 bg-[#3282b8]/14"
                            : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-white">
                            {project.exhibitSnapshot.name}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] font-mono-code uppercase tracking-[0.18em] text-white/45">
                            {project.report.score.overall}/100
                          </span>
                        </div>
                        <div className="text-xs leading-relaxed text-white/45">
                          {project.exhibitSnapshot.subtitle}
                        </div>
                        <div className="mt-3 text-[11px] font-mono-code uppercase tracking-[0.18em] text-[#dff1ff]/60">
                          Saved {formatTimestamp(project.resurrectedAt)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/22 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-[#7db8ff]" />
                  <div className="text-xs font-mono-code uppercase tracking-[0.26em] text-[#dff1ff]">
                    Quickstart
                  </div>
                </div>
                <ol className="space-y-3 text-sm leading-relaxed text-white/62">
                  {selectedProject.kit.quickstart.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-mono-code text-white/60">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[28px] border border-white/10 bg-black/24 p-6 backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-[#7db8ff]/30 bg-[#3282b8]/14 px-3 py-1 text-xs font-mono-code uppercase tracking-[0.22em] text-[#dff1ff]">
                        Committed to afterlife
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                        {selectedProject.report.projectType}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl tracking-wide text-white">
                      {selectedProject.exhibitSnapshot.name}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">
                      {selectedProject.exhibitSnapshot.description}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                    <div className="text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                      Resurrection Score
                    </div>
                    <div className="mt-2 font-display text-4xl text-white">
                      {selectedProject.report.score.overall}
                      <span className="ml-1 text-xl text-white/40">/100</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Bot className="h-4 w-4 text-[#7db8ff]" />
                      Resurrection Protocol
                    </div>

                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          step.status === "done"
                            ? "border-emerald-400/20 bg-emerald-400/8"
                            : step.status === "running"
                            ? "border-[#7db8ff]/30 bg-[#3282b8]/12"
                            : "border-white/8 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              step.status === "done"
                                ? "bg-emerald-400/14"
                                : step.status === "running"
                                ? "bg-[#3282b8]/20"
                                : "bg-black/20"
                            }`}
                          >
                            {step.status === "done" ? (
                              <Check className="h-5 w-5 text-emerald-300" />
                            ) : step.status === "running" ? (
                              <step.icon className="h-5 w-5 animate-pulse text-[#7db8ff]" />
                            ) : (
                              <step.icon className="h-5 w-5 text-white/30" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-white">{step.label}</div>
                              {step.status === "running" && (
                                <span className="text-xs font-mono-code text-[#7db8ff]">
                                  running...
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-xs leading-relaxed text-white/45">
                              {step.description}
                            </div>
                          </div>
                          <div className="text-xs font-mono-code text-white/30">
                            {index + 1}/{steps.length}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {!isRunning && (
                        <button
                          onClick={runResurrection}
                          className="btn-museum-primary inline-flex items-center gap-2"
                          style={{ animation: "pulse-glow 2.3s infinite" }}
                        >
                          <Sparkles className="h-4 w-4" />
                          Run Heaven Gate Protocol
                        </button>
                      )}
                      {isRunning && (
                        <div className="inline-flex items-center gap-3 rounded-lg border border-[#7db8ff]/25 bg-[#3282b8]/10 px-4 py-3">
                          <LoaderCircle className="h-4 w-4 animate-spin text-[#7db8ff]" />
                          <span className="text-sm text-[#dff1ff]">
                            Copilot is reconstructing the second life...
                          </span>
                        </div>
                      )}
                    </div>

                    {showThought && thoughtText && (
                      <div className="copilot-panel p-4 fade-in-up">
                        <div className="mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4 text-[#7db8ff]" />
                          <span className="text-xs font-mono-code uppercase tracking-[0.22em] text-[#7db8ff]">
                            Copilot stream
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/72">
                          <TypewriterText text={thoughtText} speed={14} />
                        </p>
                      </div>
                    )}

                    {showComplete && (
                      <div
                        className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/10 to-[#3282b8]/12 p-5 fade-in-up"
                        style={{ animation: "pulse-glow 3s infinite" }}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <Flame className="h-5 w-5 text-emerald-300" />
                          <div className="font-display text-xl text-white">
                            Resurrection Complete
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-white/65">
                          {selectedProject.exhibitSnapshot.name} is now pinned to the
                          afterlife archive with a Copilot-ready execution kit and a
                          replayable resurrection protocol.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                      <div className="flex items-center justify-between border-b border-white/8 bg-white/5 px-4 py-3">
                        <div>
                          <div className="text-xs font-mono-code uppercase tracking-[0.22em] text-white/45">
                            Copilot patch preview
                          </div>
                          <div className="mt-1 text-sm text-white/65">
                            {showComplete ? ".github/copilot-instructions.md" : "autopsy.log"}
                          </div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] font-mono-code uppercase tracking-[0.18em] text-white/45">
                          {showComplete ? "RESURRECTED" : "ABANDONED"}
                        </span>
                      </div>
                      <div className="max-h-[420px] overflow-auto p-4 font-mono-code text-xs leading-relaxed">
                        {isRunning && currentStep === 2 ? (
                          <pre className="whitespace-pre-wrap text-green-200/90">
                            <TypewriterText text={steps[2]?.codeAfter || ""} speed={5} />
                          </pre>
                        ) : showComplete ? (
                          <pre className="whitespace-pre-wrap text-green-200/90">
                            {steps[2]?.codeAfter}
                          </pre>
                        ) : (
                          <pre className="whitespace-pre-wrap text-red-200/70">
                            {steps[0]?.codeBefore}
                          </pre>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-[#7db8ff]" />
                        <div className="text-xs font-mono-code uppercase tracking-[0.22em] text-[#dff1ff]">
                          Copilot Resurrection Kit
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-white/60">
                        {selectedProject.kit.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={handleDownloadArchive}
                          className="btn-museum-primary inline-flex items-center gap-2"
                        >
                          {archiveState === "downloading" ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileDown className="h-4 w-4" />
                          )}
                          {archiveState === "downloading"
                            ? "Packaging Kit..."
                            : "Download Copilot Kit"}
                        </button>
                        <button
                          onClick={() =>
                            handleCopyFile(
                              selectedProject.kit.files[0] ?? {
                                path: ".github/copilot-instructions.md",
                                label: "Repository-wide Copilot instructions",
                                description: "",
                                content: "",
                              }
                            )
                          }
                          className="btn-museum inline-flex items-center gap-2"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          Copy Copilot Instructions
                        </button>
                      </div>

                      {(archiveState !== "idle" || copiedFile) && (
                        <div className="mt-3 text-xs font-mono-code text-white/48">
                          {archiveState === "done" && "Kit archive downloaded."}
                          {archiveState === "error" && "Kit archive download failed."}
                          {copiedFile &&
                            copiedFile !== "error" &&
                            ` ${copiedFile} copied to clipboard.`}
                          {copiedFile === "error" && " Clipboard copy failed."}
                        </div>
                      )}

                      <div className="mt-5 space-y-3">
                        {selectedProject.kit.files.map((file) => (
                          <div
                            key={file.path}
                            className="rounded-xl border border-white/8 bg-white/5 p-4"
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {file.label}
                                </div>
                                <div className="mt-1 text-xs font-mono-code text-[#dff1ff]/62">
                                  {file.path}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleCopyFile(file)}
                                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55 transition-colors hover:text-white"
                                >
                                  <ClipboardCopy className="mr-2 inline h-3.5 w-3.5" />
                                  Copy
                                </button>
                                <button
                                  onClick={() => downloadCopilotKitFile(file)}
                                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55 transition-colors hover:text-white"
                                >
                                  <Download className="mr-2 inline h-3.5 w-3.5" />
                                  Download
                                </button>
                              </div>
                            </div>
                            <div className="text-sm leading-relaxed text-white/55">
                              {file.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-black/28 p-10 text-center backdrop-blur-sm">
            <Flame className="mx-auto h-10 w-10 text-[#7db8ff]" />
            <h2 className="mt-5 font-display text-3xl text-white">
              The gates are waiting
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              Commit a project from its Revival Plan and it will appear here with its
              full afterlife archive, Copilot instructions, and downloadable skill
              pack.
            </p>
          </div>
        )}

        <div className="pb-12 pt-10 text-center">
          <button onClick={onBack} className="btn-museum inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to the Hall
          </button>
        </div>
      </div>
    </div>
  );
}

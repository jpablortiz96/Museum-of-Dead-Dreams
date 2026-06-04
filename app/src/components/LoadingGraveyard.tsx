import { useEffect, useMemo, useState } from "react";
import { Bot, Check, Github, LoaderCircle, Sparkles } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";

interface LoadingGraveyardProps {
  username: string;
  progress: number;
  currentRepo: string;
  stageLabel?: string;
  completedRepos?: string[];
  totalRepos?: number;
}

const tips = [
  "Did you know? Most side projects die before their README reaches adulthood.",
  "Copilot is currently translating stale commits into dramatic museum lighting.",
  "No repos were harmed in the making of this graveyard. They were already abandoned.",
  "A commit older than 365 days counts as a fossil in developer years.",
];

export function LoadingGraveyard({
  username,
  progress,
  currentRepo,
  stageLabel,
  completedRepos = [],
  totalRepos = 4,
}: LoadingGraveyardProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % tips.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, []);

  const repoSlots = useMemo(() => {
    const visibleRepos = completedRepos.length > 0
      ? completedRepos
      : currentRepo
      ? [currentRepo]
      : [];

    return Array.from({ length: Math.max(totalRepos, visibleRepos.length, 1) }, (_, index) => {
      const repoName = visibleRepos[index] ?? (index === visibleRepos.length ? currentRepo : "");
      const isComplete = completedRepos.includes(repoName) && repoName.length > 0;
      const isActive = !isComplete && repoName.length > 0;

      return {
        id: `${repoName || "slot"}-${index}`,
        isActive,
        isComplete,
        name: repoName || "Awaiting excavation...",
      };
    });
  }, [completedRepos, currentRepo, totalRepos]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#150f25] via-[#0e1220] to-[#0a0a0f]">
      <ParticleCanvas color="168, 85, 247" count={110} />
      <div className="scanline absolute inset-0 z-10" />

      <div className="relative z-20 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl rounded-[2rem] border border-purple-400/15 bg-black/25 p-8 shadow-2xl backdrop-blur-md md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5">
              <Bot className="h-4 w-4 text-purple-300" />
              <span className="text-xs font-mono-code tracking-[0.28em] text-purple-200/75">
                ANALYZING ABANDONMENT
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-wide text-white md:text-6xl">
              Excavating {username}&apos;s repos
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 md:text-lg">
              Copilot is analyzing your graveyard and deciding which dreams deserve a wing in the museum.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-[#0f111a]/80 p-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Github className="h-4 w-4 text-white/45" />
                <span>
                  {stageLabel ?? (currentRepo ? `Inspecting ${currentRepo}` : "Contacting GitHub")}
                </span>
              </div>
              <span className="text-sm font-mono-code text-purple-200/70">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-blue-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-[#10131d]/85 p-6">
              <div className="mb-4 flex items-center gap-2 text-xs font-mono-code uppercase tracking-[0.28em] text-white/45">
                <Sparkles className="h-4 w-4 text-purple-300/80" />
                Recovered repositories
              </div>

              <div className="space-y-3">
                {repoSlots.map((repoSlot) => (
                  <div
                    key={repoSlot.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      repoSlot.isComplete
                        ? "border-green-500/25 bg-green-500/10"
                        : repoSlot.isActive
                        ? "border-purple-400/25 bg-purple-400/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        repoSlot.isComplete
                          ? "bg-green-500/20"
                          : repoSlot.isActive
                          ? "bg-purple-400/20"
                          : "bg-white/5"
                      }`}
                    >
                      {repoSlot.isComplete ? (
                        <Check className="h-4 w-4 text-green-300" />
                      ) : repoSlot.isActive ? (
                        <LoaderCircle className="h-4 w-4 animate-spin text-purple-200" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-white">
                        {repoSlot.name}
                      </div>
                      <div className="text-xs text-white/35">
                        {repoSlot.isComplete
                          ? "Autopsy complete"
                          : repoSlot.isActive
                          ? "Analyzing last rites"
                          : "Waiting for excavation"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#17142a] to-[#0d1120] p-6">
              <div className="mb-4 text-xs font-mono-code uppercase tracking-[0.28em] text-purple-200/65">
                Curator notes
              </div>
              <p className="min-h-[108px] text-sm leading-relaxed text-white/65">
                {tips[tipIndex]}
              </p>

              <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.2em] text-white/35">
                  Progress summary
                </div>
                <div className="space-y-2 text-sm text-white/60">
                  <div>{completedRepos.length} repos fully analyzed</div>
                  <div>{Math.max(totalRepos - completedRepos.length, 0)} repos still in the dirt</div>
                  <div>Primary suspect: abandoned side-project syndrome</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

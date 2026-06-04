import { useEffect, useMemo, useState } from "react";
import { type Exhibit } from "@/data/exhibits";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypewriterText } from "./TypewriterText";
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Bot,
  Code,
  FileText,
  Flame,
  Folder,
  Gauge,
  Github,
  GitBranch,
  Lock,
  Music,
  RefreshCcw,
  Scale,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingDown,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Beaker,
  BookOpen,
  Bot,
  Code,
  FileText,
  Flame,
  Folder,
  Gauge,
  GitBranch,
  Music,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingDown,
};

interface MuseumHallProps {
  exhibits: Exhibit[];
  onEnterExhibit: (slug: string) => void;
  visitedExhibits: string[];
  totalEpitaphsRead: number;
  museumOwner?: string | null;
  onShareMuseum?: () => void;
  onAnalyzeAnother?: () => void;
}

export function MuseumHall({
  exhibits,
  onEnterExhibit,
  visitedExhibits,
  totalEpitaphsRead,
  museumOwner,
  onShareMuseum,
  onAnalyzeAnother,
}: MuseumHallProps) {
  const [entered, setEntered] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const narrativeExhibits = useMemo(
    () => exhibits.filter((exhibit) => exhibit.slug !== "resurrection"),
    [exhibits]
  );

  useEffect(() => {
    const t1 = window.setTimeout(() => setEntered(true), 300);
    const t2 = window.setTimeout(() => setShowTitle(true), 800);
    const t3 = window.setTimeout(() => setShowRooms(true), 1600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const statusLabel = (status: Exhibit["status"]) => {
    switch (status) {
      case "dead":
        return {
          text: "DECEASED",
          color: "text-red-400 border-red-400/30 bg-red-400/5",
        };
      case "zombie":
        return {
          text: "UNDEAD",
          color: "text-purple-400 border-purple-400/30 bg-purple-400/5",
        };
      case "mummified":
        return {
          text: "MUMMIFIED",
          color: "text-amber-400 border-amber-400/30 bg-amber-400/5",
        };
      case "buried":
        return {
          text: "REBIRTH",
          color: "text-blue-400 border-blue-400/30 bg-blue-400/5",
        };
      default:
        return {
          text: "UNKNOWN",
          color: "text-gray-400 border-gray-400/30 bg-gray-400/5",
        };
    }
  };

  const isPersonalizedMuseum = Boolean(museumOwner);
  const totalLinesAbandoned = narrativeExhibits.reduce(
    (accumulator, exhibit) => accumulator + exhibit.stats.linesOfCode,
    0
  );
  const totalDaysAbandoned = narrativeExhibits.reduce(
    (accumulator, exhibit) => accumulator + exhibit.stats.daysAlive,
    0
  );

  return (
    <div className="relative min-h-screen overflow-hidden museum-gradient">
      <ParticleCanvas color="147, 197, 253" count={80} />
      <div className="scanline absolute inset-0 z-10" />

      <div className="relative z-20 mx-auto max-w-7xl px-6 py-16">
        <div
          className={`mb-20 text-center transition-all duration-1000 ${
            entered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <Bot className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono-code tracking-wider text-blue-300">
                POWERED BY GITHUB COPILOT
              </span>
            </div>
            {isPersonalizedMuseum && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                <Github className="h-4 w-4 text-white/70" />
                <span className="text-xs font-mono-code tracking-wider text-white/60">
                  CURATED FOR @{museumOwner}
                </span>
              </div>
            )}
          </div>

          {showTitle && (
            <div>
              <h1 className="mb-4 font-display text-5xl font-bold tracking-wider md:text-7xl">
                <span className="glow-text text-white">Museum of</span>
                <br />
                <span className="glow-text-red text-[#e94560]">Dead Dreams</span>
              </h1>
              <div className="mx-auto mb-6 h-0.5 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <p className="mx-auto max-w-2xl text-lg font-light text-white/50">
                <TypewriterText
                  text={
                    isPersonalizedMuseum
                      ? `Every abandoned repo has a story. These are ${museumOwner}'s forgotten experiments.`
                      : "Every abandoned project has a story. This is their final resting place."
                  }
                  speed={35}
                />
              </p>
            </div>
          )}

          {narrativeExhibits.length > 0 && totalEpitaphsRead > 0 && (
            <div className="mt-6 inline-flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
              <span className="text-sm text-white/40">Epitaphs Read</span>
              <span className="text-lg font-bold text-white">
                {totalEpitaphsRead} / {narrativeExhibits.length}
              </span>
            </div>
          )}
        </div>

        {showRooms && (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {exhibits.map((exhibit, idx) => {
              const Icon = iconMap[exhibit.artifacts[0]?.icon] ?? Bot;
              const status = statusLabel(exhibit.status);
              const isVisited = visitedExhibits.includes(exhibit.id);
              const isLocked = !exhibit.unlocked;
              const isResurrection = exhibit.id === "resurrection-bay";

              return (
                <button
                  key={exhibit.id}
                  onClick={() => {
                    if (!isLocked) {
                      onEnterExhibit(exhibit.slug);
                    }
                  }}
                  onMouseEnter={() => setHoveredRoom(exhibit.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className={`group relative cursor-pointer rounded-2xl border p-8 text-left transition-all duration-500 fade-in-up ${
                    isLocked ? "cursor-not-allowed opacity-60" : "card-hover"
                  }`}
                  style={{
                    animationDelay: `${idx * 0.15}s`,
                    background: isResurrection
                      ? "linear-gradient(135deg, rgba(50, 130, 184, 0.2) 0%, #0a0a12 100%)"
                      : `linear-gradient(135deg, ${exhibit.color}66 0%, #0a0a12 100%)`,
                    borderColor: isResurrection
                      ? "rgba(50, 130, 184, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                      hoveredRoom === exhibit.id ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${exhibit.accentColor}20 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono-code tracking-wider ${status.color}`}
                      >
                        {status.text}
                      </span>
                      {isVisited && (
                        <span className="text-xs font-mono-code text-white/30">
                          VISITED
                        </span>
                      )}
                      {isLocked && <Lock className="h-4 w-4 text-white/30" />}
                    </div>

                    <div
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${exhibit.accentColor}20` }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: exhibit.accentColor }}
                      />
                    </div>

                    <h2 className="mb-1 font-display text-2xl font-bold tracking-wide text-white">
                      {exhibit.name}
                    </h2>
                    <p className="mb-4 text-sm italic text-white/40">
                      {exhibit.subtitle}
                    </p>

                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-mono-code text-white/30">
                      <span>LOC: {exhibit.stats.linesOfCode.toLocaleString()}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>Commits: {exhibit.stats.commits}</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>{exhibit.stats.daysAlive}d silent</span>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {exhibit.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3">
                      <span style={{ color: exhibit.accentColor }}>
                        {isResurrection
                          ? isLocked
                            ? "Commit a Revival Plan to Open the Gates"
                            : "Enter Resurrection Bay"
                          : "Enter Exhibit"}
                      </span>
                      {!isLocked ? (
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          style={{ color: exhibit.accentColor }}
                        />
                      ) : (
                        <Lock className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showRooms && (
          <div className="mt-16 text-center fade-in-up stagger-6">
            <div className="inline-flex flex-wrap items-center justify-center gap-8 rounded-xl border border-white/10 bg-white/5 px-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {narrativeExhibits.length}
                </div>
                <div className="text-xs text-white/40">Repo Exhibits</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#e94560]">
                  {totalLinesAbandoned.toLocaleString()}
                </div>
                <div className="text-xs text-white/40">Lines Abandoned</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {totalDaysAbandoned}d
                </div>
                <div className="text-xs text-white/40">Total Silence</div>
              </div>
            </div>

            <p className="mt-6 text-xs font-mono-code text-white/20">
              <Sparkles className="mr-1 inline h-3 w-3" />
              Curated by GitHub Copilot from live GitHub repository analysis
            </p>

            {isPersonalizedMuseum && (
              <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-6 md:flex-row">
                <div className="text-center md:text-left">
                  <div className="text-sm text-white">
                    This is your Museum of Dead Dreams. Share it.
                  </div>
                  <div className="text-xs text-white/40">
                    Let other developers tour your forgotten experiments.
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {onShareMuseum && (
                    <button
                      onClick={onShareMuseum}
                      className="btn-museum-primary inline-flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share My Graveyard
                    </button>
                  )}
                  {onAnalyzeAnother && (
                    <button
                      onClick={onAnalyzeAnother}
                      className="btn-museum inline-flex items-center gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Analyze Another User
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { type Exhibit, type ProjectArtifact } from "@/data/exhibits";
import { askCopilotCurator } from "@/services/copilotCuratorApi";
import { type CuratorChatMessage } from "@/types/curator";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypewriterText } from "./TypewriterText";
import { RevivalButton } from "./RevivalButton";
import { RevivalReport } from "./RevivalReport";
import { type RevivalReport as RevivalReportType } from "@/types/revival";
import {
  ArrowLeft,
  Beaker,
  BookOpen,
  TrendingDown,
  BarChart3,
  ShieldAlert,
  Scale,
  Gauge,
  Folder,
  Code,
  FileText,
  GitBranch,
  Music,
  Split,
  AudioLines,
  Bot,
  Flame,
  Calendar,
  GitCommit,
  Clock,
  Skull,
  Sparkles,
  Eye,
  LoaderCircle,
  MessageSquare,
  SendHorizontal,
  ChevronRight,
} from "lucide-react";

const artifactIconMap: Record<string, React.ElementType> = {
  TrendingDown,
  BarChart3,
  ShieldAlert,
  Scale,
  Gauge,
  Folder,
  Code,
  BookOpen,
  Beaker,
  FileText,
  GitBranch,
  Music,
  Split,
  AudioLines,
  Bot,
  Flame,
};

interface ExhibitRoomProps {
  exhibit: Exhibit;
  onBack: () => void;
  onReadEpitaph: (exhibitId: string) => void;
  onFindSecret: () => void;
  onCopilotChat: () => void;
  onViewRevivalPlan: (payload: { exhibitId: string; overallScore: number }) => void;
  onExportRevivalPlan: (payload: { exhibitId: string; overallScore: number }) => void;
  onCommitToResurrectionBay: (payload: {
    exhibit: Exhibit;
    report: RevivalReportType;
  }) => void;
  isCommittedToResurrectionBay: boolean;
}

function ArtifactCard({
  artifact,
  accentColor,
  index,
}: {
  artifact: ProjectArtifact;
  accentColor: string;
  index: number;
}) {
  const Icon = artifactIconMap[artifact.icon] || Sparkles;
  const [flipped, setFlipped] = useState(false);

  const stateColors: Record<string, string> = {
    rotten: "text-red-400 border-red-400/20",
    broken: "text-orange-400 border-orange-400/20",
    unfinished: "text-yellow-400 border-yellow-400/20",
    working: "text-green-400 border-green-400/20",
  };

  const stateLabels: Record<string, string> = {
    rotten: "ROTTEN",
    broken: "BROKEN",
    unfinished: "UNFINISHED",
    working: "WORKING",
  };

  return (
    <button
      onClick={() => setFlipped(!flipped)}
      className={`artifact-card group text-left cursor-pointer fade-in-up stagger-${index + 1}`}
      style={{ animationDelay: `${0.5 + index * 0.15}s` }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">{artifact.name}</h4>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${stateColors[artifact.state]}`}
            >
              {stateLabels[artifact.state]}
            </span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">{artifact.description}</p>
        </div>
      </div>
    </button>
  );
}

export function ExhibitRoom({
  exhibit,
  onBack,
  onReadEpitaph,
  onFindSecret,
  onCopilotChat,
  onViewRevivalPlan,
  onExportRevivalPlan,
  onCommitToResurrectionBay,
  isCommittedToResurrectionBay,
}: ExhibitRoomProps) {
  const [showContent, setShowContent] = useState(false);
  const [epitaphRead, setEpitaphRead] = useState(false);
  const [showCopilotPanel, setShowCopilotPanel] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  const [secretFound, setSecretFound] = useState(false);
  const [copilotChatDone, setCopilotChatDone] = useState(false);
  const [showRevivalReport, setShowRevivalReport] = useState(false);
  const [curatorMessages, setCuratorMessages] = useState<CuratorChatMessage[]>([]);
  const [curatorQuestion, setCuratorQuestion] = useState("");
  const [curatorLoading, setCuratorLoading] = useState(false);
  const [curatorSuggestedQuestions, setCuratorSuggestedQuestions] = useState<string[]>([
    "Why did this project probably die?",
    "What stack clues do you see here?",
    "What would you fix first?",
  ]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setShowCopilotPanel(false);
    setCopilotChatDone(false);
    setCuratorMessages([]);
    setCuratorQuestion("");
    setCuratorLoading(false);
    setCuratorSuggestedQuestions([
      "Why did this project probably die?",
      "What stack clues do you see here?",
      "What would you fix first?",
    ]);
  }, [exhibit.id]);

  const handleEpitaphComplete = () => {
    if (!epitaphRead) {
      setEpitaphRead(true);
      onReadEpitaph(exhibit.id);
    }
  };

  const handleSecretClick = () => {
    if (!secretFound) {
      setSecretFound(true);
      onFindSecret();
    }
  };

  const handleCopilotChat = () => {
    setShowCopilotPanel(true);
    if (!copilotChatDone) {
      setCopilotChatDone(true);
      onCopilotChat();
    }
  };

  const submitCuratorQuestion = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? curatorQuestion).trim();
    if (!question || curatorLoading) {
      return;
    }

    handleCopilotChat();
    setCuratorLoading(true);

    const userMessage: CuratorChatMessage = {
      id: `${exhibit.id}-user-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    try {
      const reply = await askCopilotCurator({
        exhibit,
        question,
        messages: curatorMessages,
      });

      const assistantMessage: CuratorChatMessage = {
        id: `${exhibit.id}-assistant-${Date.now()}`,
        role: "assistant",
        content: reply.answer,
        createdAt: reply.meta.generatedAt,
        evidence: reply.evidence,
        suggestedFollowUps: reply.suggestedFollowUps,
        meta: reply.meta,
      };

      setCuratorMessages((previousMessages) => [
        ...previousMessages,
        userMessage,
        assistantMessage,
      ]);
      setCuratorSuggestedQuestions(reply.suggestedFollowUps);
      setCuratorQuestion("");
    } catch (error) {
      const fallbackMessage: CuratorChatMessage = {
        id: `${exhibit.id}-assistant-fallback-${Date.now()}`,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Copilot Curator could not answer just now. Try again in a moment.",
        createdAt: new Date().toISOString(),
        meta: {
          source: "fallback",
          model: null,
          generatedAt: new Date().toISOString(),
          cached: false,
          promptVersion: "client-fallback-curator-v1",
          fallbackReason: "Unexpected client-side curator failure.",
        },
      };

      setCuratorMessages((previousMessages) => [
        ...previousMessages,
        userMessage,
        fallbackMessage,
      ]);
    } finally {
      setCuratorLoading(false);
    }
  };

  const statusConfig = {
    dead: { label: "DECEASED", color: "#e94560", particleColor: "233, 69, 96" },
    zombie: { label: "UNDEAD", color: "#a855f7", particleColor: "168, 85, 247" },
    mummified: { label: "MUMMIFIED", color: "#f59e0b", particleColor: "245, 158, 11" },
    buried: { label: "REBIRTH", color: "#3282b8", particleColor: "50, 130, 184" },
  };

  const status = statusConfig[exhibit.status];

  return (
    <div
      className="relative min-h-screen overflow-hidden room-transition-enter"
      style={{ background: `linear-gradient(180deg, ${exhibit.color} 0%, #0a0a0f 50%)` }}
    >
      <ParticleCanvas color={status.particleColor} count={50} />
      <div className="scanline absolute inset-0 z-10" />

      <div className="relative z-20 max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono-code tracking-wider">BACK TO HALL</span>
        </button>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono-code tracking-wider border"
              style={{ color: status.color, borderColor: `${status.color}40`, backgroundColor: `${status.color}10` }}
            >
              {status.label}
            </span>
            <span className="text-xs text-white/30 font-mono-code">
              {exhibit.deathDate}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-2 tracking-wide">
            {exhibit.name}
          </h1>
          <p className="text-lg text-white/40 italic">{exhibit.subtitle}</p>
        </div>

        {/* Epitaph */}
        {showContent && (
          <div className="mb-10 fade-in-up stagger-1">
            <RevivalButton
              accentColor={exhibit.accentColor}
              onClick={() => setShowRevivalReport(true)}
            />
          </div>
        )}

        {showContent && (
          <div
            className="relative mb-12 p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm cursor-pointer fade-in-up"
            onClick={handleSecretClick}
          >
            <div
              className="absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-mono-code border"
              style={{ color: status.color, borderColor: `${status.color}40`, backgroundColor: `${exhibit.color}` }}
            >
              <Skull className="w-3 h-3 inline mr-1" />
              EPITAPH
            </div>
            <p className="epitaph-text text-xl md:text-2xl text-center leading-relaxed" style={{ color: status.color }}>
              <TypewriterText
                text={`"${exhibit.epitaph}"`}
                speed={30}
                onComplete={handleEpitaphComplete}
              />
            </p>
            {secretFound && (
              <div className="mt-4 text-center fade-in-up">
                <span className="text-xs text-amber-400 font-mono-code">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  SECRET FOUND: You clicked the epitaph and discovered a hidden message.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {showContent && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: FileText, label: "Lines of Code", value: exhibit.stats.linesOfCode.toLocaleString() },
              { icon: GitCommit, label: "Commits", value: exhibit.stats.commits.toString() },
              { icon: Clock, label: "Days Alive", value: `${exhibit.stats.daysAlive}d` },
              { icon: Calendar, label: "Last Commit", value: exhibit.lastCommit },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`stat-card fade-in-up stagger-${idx + 1}`}
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-white/30" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {showContent && (
          <div className="mb-12 fade-in-up stagger-2">
            <h3 className="font-display text-xl text-white mb-3 tracking-wide">The Story</h3>
            <p className="text-white/60 leading-relaxed max-w-3xl">{exhibit.description}</p>

            {/* Cause of Death */}
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <Skull className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-red-400/60 font-mono-code uppercase tracking-wider">
                  Cause of Death
                </div>
                <div className="text-sm text-red-300">{exhibit.stats.causeOfDeath}</div>
              </div>
            </div>
          </div>
        )}

        {/* Artifacts */}
        {showContent && (
          <div className="mb-12">
            <h3 className="font-display text-xl text-white mb-6 tracking-wide flex items-center gap-2">
              <Eye className="w-5 h-5 text-white/40" />
              Artifacts Recovered
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exhibit.artifacts.map((artifact, idx) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  accentColor={exhibit.accentColor}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fun Fact */}
        {showContent && (
          <div className="mb-12 fade-in-up stagger-5">
            <button
              onClick={() => setShowFunFact(!showFunFact)}
              className="flex items-center gap-2 text-amber-400/60 hover:text-amber-400 transition-colors group"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-mono-code">
                {showFunFact ? "Hide" : "Reveal"} Fun Fact
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showFunFact ? "rotate-90" : ""}`}
              />
            </button>
            {showFunFact && (
              <div className="mt-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 fade-in-up">
                <p className="text-amber-200/80 text-sm leading-relaxed">{exhibit.funFact}</p>
              </div>
            )}
          </div>
        )}

        {/* Copilot Curator Panel */}
        {showContent && (
          <div className="mb-12 fade-in-up stagger-4">
            <div className="copilot-panel w-full p-6 text-left">
              <button
                onClick={handleCopilotChat}
                className="w-full text-left"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3282b8]/20">
                    <Bot className="h-5 w-5 text-[#3282b8]" />
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-white font-medium">
                      Copilot Curator
                      <span className="rounded-full bg-[#3282b8]/20 px-2 py-0.5 text-xs font-mono-code text-[#3282b8]">
                        AI
                      </span>
                    </h3>
                    <p className="text-xs text-white/40">
                      Ask grounded questions about this project, its failure mode, and what the repo evidence suggests.
                    </p>
                  </div>
                </div>
              </button>

              {showCopilotPanel && (
                <div className="space-y-5 border-t border-white/5 pt-4">
                  <div>
                    <div className="mb-1 text-xs text-[#3282b8] font-mono-code uppercase tracking-wider">
                      Copilot Insight
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      <TypewriterText text={exhibit.copilotInsight} speed={20} />
                    </p>
                  </div>
                  <div className="divider-glow" />
                  <div>
                    <div className="mb-1 text-xs text-purple-400 font-mono-code uppercase tracking-wider">
                      Copilot Epitaph
                    </div>
                    <p className="epitaph-text text-white/60 text-sm">
                      <TypewriterText
                        text={`"${exhibit.copilotEpitaph}"`}
                        speed={25}
                        startDelay={2000}
                      />
                    </p>
                  </div>

                  <div className="divider-glow" />

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#7db8ff]" />
                      <span className="text-xs font-mono-code uppercase tracking-wider text-[#7db8ff]">
                        Ask The Curator
                      </span>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {curatorSuggestedQuestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            void submitCuratorQuestion(suggestion);
                          }}
                          disabled={curatorLoading}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-[#3282b8]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {curatorMessages.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {curatorMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-xl border p-4 ${
                              message.role === "user"
                                ? "border-white/8 bg-black/20"
                                : "border-[#3282b8]/20 bg-[#3282b8]/6"
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono-code uppercase tracking-[0.22em] ${
                                  message.role === "user"
                                    ? "text-white/40"
                                    : "text-[#7db8ff]"
                                }`}
                              >
                                {message.role === "user" ? "You Asked" : "Copilot Curator"}
                              </span>
                              {message.role === "assistant" && message.meta && (
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-mono-code uppercase tracking-[0.18em] ${
                                    message.meta.source === "openai"
                                      ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200/80"
                                      : "border-amber-400/20 bg-amber-400/8 text-amber-200/80"
                                  }`}
                                >
                                  {message.meta.source === "openai" ? "AI" : "Fallback"}
                                  {message.meta.cached ? " cached" : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed text-white/72">
                              {message.content}
                            </p>

                            {message.role === "assistant" &&
                              message.evidence &&
                              message.evidence.length > 0 && (
                                <div className="mt-3">
                                  <div className="mb-2 text-[11px] font-mono-code uppercase tracking-[0.2em] text-white/38">
                                    Evidence Used
                                  </div>
                                  <div className="space-y-2">
                                    {message.evidence.map((evidenceItem) => (
                                      <div
                                        key={evidenceItem}
                                        className="rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-xs leading-relaxed text-white/52"
                                      >
                                        {evidenceItem}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    {curatorLoading && (
                      <div className="mb-4 inline-flex items-center gap-3 rounded-lg border border-[#3282b8]/20 bg-[#3282b8]/8 px-4 py-3 text-sm text-[#dbeeff]">
                        <LoaderCircle className="h-4 w-4 animate-spin text-[#7db8ff]" />
                        Copilot Curator is inspecting the repo evidence...
                      </div>
                    )}

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void submitCuratorQuestion();
                      }}
                      className="space-y-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row">
                        <input
                          value={curatorQuestion}
                          onChange={(event) => setCuratorQuestion(event.target.value)}
                          placeholder="Ask about the stack, failure mode, blind spots, or what to fix first"
                          className="museum-input w-full px-4"
                          disabled={curatorLoading}
                        />
                        <button
                          type="submit"
                          disabled={curatorLoading || !curatorQuestion.trim()}
                          className="btn-museum-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {curatorLoading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <SendHorizontal className="h-4 w-4" />
                          )}
                          Ask Copilot
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-white/38">
                        Answers are grounded in the exhibit plus recovered repo evidence. If the AI server is unavailable, the curator falls back to local heuristics instead of breaking the panel.
                      </p>
                    </form>
                  </div>
                </div>
              )}

              {!showCopilotPanel && (
                <button
                  onClick={handleCopilotChat}
                  className="flex items-center gap-2 text-[#3282b8] text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Copilot about this project</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Back button bottom */}
        <div className="text-center pb-12 fade-in-up stagger-6">
          <button
            onClick={onBack}
            className="btn-museum inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to the Hall
          </button>
        </div>
      </div>

      <RevivalReport
        exhibit={exhibit}
        open={showRevivalReport}
        onOpenChange={setShowRevivalReport}
        onViewPlan={onViewRevivalPlan}
        onExportPlan={onExportRevivalPlan}
        onCommitToResurrectionBay={onCommitToResurrectionBay}
        isCommittedToResurrectionBay={isCommittedToResurrectionBay}
      />
    </div>
  );
}

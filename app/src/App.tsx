import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { achievements, exhibits } from "@/data/exhibits";
import { MuseumHall } from "@/components/MuseumHall";
import { ExhibitRoom } from "@/components/ExhibitRoom";
import { ResurrectionBay } from "@/components/ResurrectionBay";
import { AchievementToast } from "@/components/AchievementToast";
import { AchievementPanel } from "@/components/AchievementPanel";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { LoadingGraveyard } from "@/components/LoadingGraveyard";
import { generateMuseumExhibits } from "@/services/museumApi";
import { createResurrectedProjectRecord } from "@/utils/copilotResurrectionKit";
import {
  GitHubApiError,
  analyzeUserRepos,
  cacheExhibits,
  getCachedExhibits,
} from "@/services/githubApi";
import { type Exhibit } from "@/data/exhibits";
import { type ResurrectedProjectRecord } from "@/types/resurrection";
import { type RevivalReport } from "@/types/revival";

type View = "welcome" | "loading" | "hall" | "exhibit" | "resurrection";

interface ToastState {
  id: string;
  name: string;
  description: string;
}

function readStoredRecord(key: string): Record<string, number> {
  try {
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
      return {};
    }

    const parsedValue = JSON.parse(savedValue) as unknown;
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number"
      )
    );
  } catch {
    return {};
  }
}

function readStoredArray(key: string, validIds?: Set<string>): string[] {
  try {
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const normalizedValues = parsedValue.filter(
      (value): value is string => typeof value === "string"
    );

    return validIds
      ? normalizedValues.filter((value) => validIds.has(value))
      : normalizedValues;
  } catch {
    return [];
  }
}

function readStoredResurrectionMap(): Record<string, ResurrectedProjectRecord[]> {
  try {
    const savedValue = localStorage.getItem("modd-resurrection-bay-v1");
    if (!savedValue) {
      return {};
    }

    const parsedValue = JSON.parse(savedValue) as unknown;
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        (entry): entry is [string, ResurrectedProjectRecord[]] =>
          Array.isArray(entry[1])
      )
    );
  } catch {
    return {};
  }
}

function updateShareableUrl(username: string | null) {
  const url = new URL(window.location.href);

  if (username) {
    url.searchParams.set("user", username);
  } else {
    url.searchParams.delete("user");
  }

  window.history.replaceState({}, "", url.toString());
}

function wait(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof GitHubApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The museum curator got lost between commits. Try again.";
}

export default function App() {
  const achievementIds = useMemo(
    () => new Set(achievements.map((achievement) => achievement.id)),
    []
  );
  const [currentView, setCurrentView] = useState<View>("welcome");
  const [currentExhibitSlug, setCurrentExhibitSlug] = useState<string | null>(
    null
  );
  const [githubUsername, setGithubUsername] = useState("");
  const [generatedExhibits, setGeneratedExhibits] = useState<Exhibit[] | null>(
    null
  );
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingCurrentRepo, setLoadingCurrentRepo] = useState("");
  const [loadingStageLabel, setLoadingStageLabel] = useState<string | undefined>(
    undefined
  );
  const [loadingCompletedRepos, setLoadingCompletedRepos] = useState<string[]>(
    []
  );
  const [loadingTotalRepos, setLoadingTotalRepos] = useState(4);
  const [museumError, setMuseumError] = useState<string | null>(null);
  const [isLoadingMuseum, setIsLoadingMuseum] = useState(false);
  const [visitedExhibits, setVisitedExhibits] = useState<string[]>(() =>
    readStoredArray("modd-visited")
  );
  const [readEpitaphs, setReadEpitaphs] = useState<string[]>(() =>
    readStoredArray("modd-epitaphs")
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    () => readStoredArray("modd-achievements", achievementIds)
  );
  const [viewedRevivalPlans, setViewedRevivalPlans] = useState<string[]>(() =>
    readStoredArray("modd-revival-viewed")
  );
  const [exportedRevivalPlans, setExportedRevivalPlans] = useState<string[]>(() =>
    readStoredArray("modd-revival-exported")
  );
  const [revivalScores, setRevivalScores] = useState<Record<string, number>>(() =>
    readStoredRecord("modd-revival-scores")
  );
  const [resurrectionProjectsByMuseum, setResurrectionProjectsByMuseum] = useState<
    Record<string, ResurrectedProjectRecord[]>
  >(() => readStoredResurrectionMap());
  const [foundSecret, setFoundSecret] = useState(() => {
    return localStorage.getItem("modd-secret") === "true";
  });
  const [copilotChatted, setCopilotChatted] = useState(() => {
    return localStorage.getItem("modd-copilot") === "true";
  });
  const [hasResurrected, setHasResurrected] = useState(() => {
    return localStorage.getItem("modd-resurrect") === "true";
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentToast, setCurrentToast] = useState<ToastState | null>(null);
  const [showNavHint, setShowNavHint] = useState(false);
  const autoLoadHandledRef = useRef(false);
  const activeRequestRef = useRef(0);
  const currentMuseumKey = githubUsername
    ? `github:${githubUsername.trim().toLowerCase()}`
    : "curator-default";

  const activeMuseumExhibits = generatedExhibits ?? exhibits;
  const resurrectedProjects = resurrectionProjectsByMuseum[currentMuseumKey] ?? [];
  const narrativeExhibits = useMemo(
    () => activeMuseumExhibits.filter((exhibit) => exhibit.slug !== "resurrection"),
    [activeMuseumExhibits]
  );
  const currentMuseumExhibitIds = useMemo(
    () => new Set(narrativeExhibits.map((exhibit) => exhibit.id)),
    [narrativeExhibits]
  );
  const currentMuseumRevivalIds = useMemo(
    () => new Set(narrativeExhibits.map((exhibit) => exhibit.id)),
    [narrativeExhibits]
  );
  const currentMuseumVisitedCount = visitedExhibits.filter((exhibitId) =>
    currentMuseumExhibitIds.has(exhibitId)
  ).length;
  const currentMuseumReadCount = readEpitaphs.filter((exhibitId) =>
    currentMuseumExhibitIds.has(exhibitId)
  ).length;
  const currentMuseumViewedRevivalCount = viewedRevivalPlans.filter((exhibitId) =>
    currentMuseumRevivalIds.has(exhibitId)
  ).length;
  const totalResurrectedLoc = resurrectedProjects.reduce(
    (accumulator, project) => accumulator + project.exhibitSnapshot.stats.linesOfCode,
    0
  );
  const totalResurrectedCommits = resurrectedProjects.reduce(
    (accumulator, project) => accumulator + project.exhibitSnapshot.stats.commits,
    0
  );
  const resurrectionUnlocked = resurrectedProjects.length > 0 || hasResurrected;

  const hallExhibits = useMemo(() => {
    return activeMuseumExhibits.map((exhibit) =>
      exhibit.id === "resurrection-bay"
        ? {
            ...exhibit,
            unlocked: resurrectionUnlocked,
            subtitle: resurrectionUnlocked
              ? `${resurrectedProjects.length} reclaimed project${
                  resurrectedProjects.length === 1 ? "" : "s"
                } await Copilot's afterlife protocol`
              : "The gates open once a revival plan is committed to the afterlife",
            description: resurrectionUnlocked
              ? "The archive where resurrected projects keep their revival dossiers, Copilot skill packs, and launch instructions."
              : "A sealed chamber beyond the museum floor. Commit a revival plan from any exhibit and the gates will open.",
            stats: {
              linesOfCode: totalResurrectedLoc,
              commits: totalResurrectedCommits,
              daysAlive: resurrectedProjects.length,
              causeOfDeath: resurrectionUnlocked
                ? "These projects were reclaimed from the graveyard and promoted to active resurrection candidates."
                : "Awaiting the first committed resurrection.",
            },
            tags: resurrectionUnlocked
              ? [
                  `${resurrectedProjects.length} Reborn`,
                  "Copilot Kit",
                  "Afterlife Protocol",
                ]
              : ["Locked", "Awaiting Revival", "Copilot Kit"],
          }
        : exhibit
    );
  }, [
    activeMuseumExhibits,
    resurrectedProjects.length,
    resurrectionUnlocked,
    totalResurrectedCommits,
    totalResurrectedLoc,
  ]);

  const currentExhibit = currentExhibitSlug
    ? hallExhibits.find((exhibit) => exhibit.slug === currentExhibitSlug) ?? null
    : null;

  useEffect(() => {
    localStorage.setItem("modd-visited", JSON.stringify(visitedExhibits));
  }, [visitedExhibits]);

  useEffect(() => {
    localStorage.setItem("modd-epitaphs", JSON.stringify(readEpitaphs));
  }, [readEpitaphs]);

  useEffect(() => {
    localStorage.setItem(
      "modd-achievements",
      JSON.stringify(unlockedAchievements)
    );
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem(
      "modd-revival-viewed",
      JSON.stringify(viewedRevivalPlans)
    );
  }, [viewedRevivalPlans]);

  useEffect(() => {
    localStorage.setItem(
      "modd-revival-exported",
      JSON.stringify(exportedRevivalPlans)
    );
  }, [exportedRevivalPlans]);

  useEffect(() => {
    localStorage.setItem("modd-revival-scores", JSON.stringify(revivalScores));
  }, [revivalScores]);

  useEffect(() => {
    localStorage.setItem(
      "modd-resurrection-bay-v1",
      JSON.stringify(resurrectionProjectsByMuseum)
    );
  }, [resurrectionProjectsByMuseum]);

  useEffect(() => {
    localStorage.setItem("modd-secret", foundSecret ? "true" : "false");
  }, [foundSecret]);

  useEffect(() => {
    localStorage.setItem("modd-copilot", copilotChatted ? "true" : "false");
  }, [copilotChatted]);

  useEffect(() => {
    localStorage.setItem("modd-resurrect", hasResurrected ? "true" : "false");
  }, [hasResurrected]);

  const checkAchievement = useCallback(
    (id: string) => {
      if (unlockedAchievements.includes(id)) {
        return;
      }

      const achievement = achievements.find(
        (candidateAchievement) => candidateAchievement.id === id
      );
      if (!achievement) {
        return;
      }

      setUnlockedAchievements((previousAchievements) => [
        ...previousAchievements,
        id,
      ]);
      setCurrentToast({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
      });
    },
    [unlockedAchievements]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => checkAchievement("first_visit"), 1500);
    return () => window.clearTimeout(timer);
  }, [checkAchievement]);

  useEffect(() => {
    if (generatedExhibits) {
      checkAchievement("personalize_graveyard");
    }
  }, [generatedExhibits, checkAchievement]);

  useEffect(() => {
    if (currentMuseumVisitedCount > 0) {
      checkAchievement("visit_first_exhibit");
    }
  }, [currentMuseumVisitedCount, checkAchievement]);

  useEffect(() => {
    if (
      narrativeExhibits.length > 0 &&
      currentMuseumVisitedCount >= narrativeExhibits.length
    ) {
      checkAchievement("tour_the_graveyard");
    }
  }, [currentMuseumVisitedCount, narrativeExhibits.length, checkAchievement]);

  useEffect(() => {
    if (
      narrativeExhibits.length > 0 &&
      currentMuseumReadCount >= narrativeExhibits.length
    ) {
      checkAchievement("read_all_epitaphs");
    }
  }, [currentMuseumReadCount, narrativeExhibits.length, checkAchievement]);

  useEffect(() => {
    if (viewedRevivalPlans.length > 0) {
      checkAchievement("view_revival_plan");
    }
  }, [viewedRevivalPlans, checkAchievement]);

  useEffect(() => {
    if (exportedRevivalPlans.length > 0) {
      checkAchievement("export_revival_plan");
    }
  }, [exportedRevivalPlans, checkAchievement]);

  useEffect(() => {
    if (
      narrativeExhibits.length > 0 &&
      currentMuseumViewedRevivalCount >= narrativeExhibits.length
    ) {
      checkAchievement("serial_resurrector");
    }
  }, [
    narrativeExhibits.length,
    currentMuseumViewedRevivalCount,
    checkAchievement,
  ]);

  useEffect(() => {
    const allScores = Object.values(revivalScores);
    if (allScores.some((score) => score > 80)) {
      checkAchievement("surgeon");
    }
    if (allScores.some((score) => score < 40)) {
      checkAchievement("miracle_worker");
    }
  }, [revivalScores, checkAchievement]);

  const handleUsernameSubmit = useCallback(
    async (username: string) => {
      const normalizedUsername = username.trim();
      if (!normalizedUsername) {
        return;
      }

      activeRequestRef.current += 1;
      const requestId = activeRequestRef.current;

      setMuseumError(null);
      setGithubUsername(normalizedUsername);
      setCurrentExhibitSlug(null);
      setCurrentView("loading");
      setIsLoadingMuseum(true);
      setLoadingProgress(8);
      setLoadingCurrentRepo("");
      setLoadingStageLabel("Contacting GitHub");
      setLoadingCompletedRepos([]);
      setLoadingTotalRepos(4);
      setShowNavHint(false);

      const cachedMuseum = getCachedExhibits(normalizedUsername);
      if (cachedMuseum) {
        setLoadingCurrentRepo("Opening cached graveyard");
        setLoadingStageLabel("Opening cached graveyard");
        setLoadingCompletedRepos(
          cachedMuseum
            .filter((exhibit) => exhibit.slug !== "resurrection")
            .map((exhibit) => exhibit.name)
        );
        setLoadingTotalRepos(
          cachedMuseum.filter((exhibit) => exhibit.slug !== "resurrection").length
        );
        setLoadingProgress(100);
        await wait(250);

        if (requestId !== activeRequestRef.current) {
          return;
        }

        setGeneratedExhibits(cachedMuseum);
        setCurrentView("hall");
        setIsLoadingMuseum(false);
        setShowNavHint(true);
        updateShareableUrl(normalizedUsername);
        return;
      }

      try {
        const analyzedRepos = await analyzeUserRepos(
          normalizedUsername,
          ({ completedRepos, currentRepo, progress, totalRepos }) => {
            if (requestId !== activeRequestRef.current) {
              return;
            }

            setLoadingCompletedRepos(completedRepos);
            setLoadingCurrentRepo(currentRepo);
            setLoadingStageLabel(
              currentRepo ? `Inspecting ${currentRepo}` : "Contacting GitHub"
            );
            setLoadingProgress(Math.max(progress, 15));
            setLoadingTotalRepos(totalRepos);
          }
        );

        if (requestId !== activeRequestRef.current) {
          return;
        }

        setLoadingProgress(92);
        setLoadingStageLabel("Copilot is writing epitaphs and curator notes");

        const personalizedExhibits = await generateMuseumExhibits(
          normalizedUsername,
          analyzedRepos
        );

        cacheExhibits(normalizedUsername, personalizedExhibits);
        setLoadingCompletedRepos(
          analyzedRepos.map((analyzedRepo) => analyzedRepo.repo.name)
        );
        setLoadingCurrentRepo(
          analyzedRepos[analyzedRepos.length - 1]?.repo.name ?? ""
        );
        setLoadingStageLabel("Finalizing your personalized museum");
        setLoadingProgress(100);
        await wait(350);

        if (requestId !== activeRequestRef.current) {
          return;
        }

        setGeneratedExhibits(personalizedExhibits);
        setCurrentView("hall");
        setIsLoadingMuseum(false);
        setShowNavHint(true);
        updateShareableUrl(normalizedUsername);
      } catch (error) {
        if (requestId !== activeRequestRef.current) {
          return;
        }

        setGeneratedExhibits(null);
        setCurrentView("welcome");
        setIsLoadingMuseum(false);
        setLoadingProgress(0);
        setLoadingCurrentRepo("");
        setLoadingStageLabel(undefined);
        setLoadingCompletedRepos([]);
        setLoadingTotalRepos(4);
        setMuseumError(getErrorMessage(error));
        updateShareableUrl(null);
      }
    },
    []
  );

  useEffect(() => {
    if (autoLoadHandledRef.current) {
      return;
    }

    autoLoadHandledRef.current = true;
    const requestedUser = new URLSearchParams(window.location.search).get("user");

    if (requestedUser) {
      void handleUsernameSubmit(requestedUser);
    }
  }, [handleUsernameSubmit]);

  const handleEnterExhibit = (slug: string) => {
    setCurrentExhibitSlug(slug);

    if (slug === "resurrection") {
      setCurrentView("resurrection");
      setShowNavHint(false);
      return;
    }

    const exhibit = hallExhibits.find(
      (candidateExhibit) => candidateExhibit.slug === slug
    );
    if (!exhibit) {
      return;
    }

    setVisitedExhibits((previousVisited) =>
      previousVisited.includes(exhibit.id)
        ? previousVisited
        : [...previousVisited, exhibit.id]
    );
    setCurrentView("exhibit");
    setShowNavHint(false);
  };

  const handleBackToHall = () => {
    setCurrentView("hall");
    setCurrentExhibitSlug(null);
  };

  const handleReadEpitaph = (exhibitId: string) => {
    setReadEpitaphs((previousRead) =>
      previousRead.includes(exhibitId)
        ? previousRead
        : [...previousRead, exhibitId]
    );
  };

  const handleFindSecret = () => {
    if (!foundSecret) {
      setFoundSecret(true);
      checkAchievement("find_secret");
    }
  };

  const handleCopilotChat = () => {
    if (!copilotChatted) {
      setCopilotChatted(true);
      checkAchievement("copilot_chat");
    }
  };

  const handleResurrect = () => {
    if (!hasResurrected) {
      setHasResurrected(true);
      checkAchievement("resurrect");
    }
  };

  const handleCommitToResurrectionBay = (payload: {
    exhibit: Exhibit;
    report: RevivalReport;
  }) => {
    const record = createResurrectedProjectRecord(
      payload.exhibit,
      payload.report,
      currentMuseumKey
    );

    setResurrectionProjectsByMuseum((previousProjects) => {
      const currentProjects = previousProjects[currentMuseumKey] ?? [];
      const nextProjects = [
        record,
        ...currentProjects.filter(
          (project) => project.exhibitId !== payload.exhibit.id
        ),
      ];

      return {
        ...previousProjects,
        [currentMuseumKey]: nextProjects,
      };
    });

    if (!hasResurrected) {
      setHasResurrected(true);
      checkAchievement("resurrect");
    }
  };

  const handleViewRevivalPlan = (payload: {
    exhibitId: string;
    overallScore: number;
  }) => {
    setViewedRevivalPlans((previousViewed) =>
      previousViewed.includes(payload.exhibitId)
        ? previousViewed
        : [...previousViewed, payload.exhibitId]
    );
    setRevivalScores((previousScores) => ({
      ...previousScores,
      [payload.exhibitId]: payload.overallScore,
    }));
  };

  const handleExportRevivalPlan = (payload: {
    exhibitId: string;
    overallScore: number;
  }) => {
    setExportedRevivalPlans((previousExported) =>
      previousExported.includes(payload.exhibitId)
        ? previousExported
        : [...previousExported, payload.exhibitId]
    );
    setRevivalScores((previousScores) => ({
      ...previousScores,
      [payload.exhibitId]: payload.overallScore,
    }));
  };

  const handleAnalyzeAnother = () => {
    activeRequestRef.current += 1;
    setCurrentView("welcome");
    setCurrentExhibitSlug(null);
    setGithubUsername("");
    setGeneratedExhibits(null);
    setMuseumError(null);
    setLoadingProgress(0);
    setLoadingCurrentRepo("");
    setLoadingStageLabel(undefined);
    setLoadingCompletedRepos([]);
    setLoadingTotalRepos(4);
    setShowNavHint(false);
    updateShareableUrl(null);
  };

  const handleShareMuseum = () => {
    if (!githubUsername) {
      return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(
      githubUsername
    )}`;
    const message = `This is my Museum of Dead Dreams: a graveyard of my abandoned GitHub repos. Tour it here: ${shareUrl}`;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      message
    )}`;

    window.open(intentUrl, "_blank", "noopener,noreferrer");
    checkAchievement("share_graveyard");
  };

  const showMuseumChrome =
    currentView === "hall" ||
    currentView === "exhibit" ||
    currentView === "resurrection";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {showMuseumChrome && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setShowAchievements(true)}
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all hover:bg-white/10"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-mono-code text-white/60 group-hover:text-white/80">
              {unlockedAchievements.length}/{achievements.length}
            </span>
          </button>
        </div>
      )}

      {showNavHint && currentView === "hall" && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 animate-pulse rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono-code text-white/40">
          Click on an exhibit to enter
        </div>
      )}

      {currentView === "welcome" && (
        <WelcomeScreen
          onSubmit={(username) => {
            void handleUsernameSubmit(username);
          }}
          isLoading={isLoadingMuseum}
          error={museumError}
          initialUsername={githubUsername}
        />
      )}

      {currentView === "loading" && (
        <LoadingGraveyard
          username={githubUsername}
          progress={loadingProgress}
          currentRepo={loadingCurrentRepo}
          stageLabel={loadingStageLabel}
          completedRepos={loadingCompletedRepos}
          totalRepos={loadingTotalRepos}
        />
      )}

      {currentView === "hall" && (
        <MuseumHall
          exhibits={hallExhibits}
          onEnterExhibit={handleEnterExhibit}
          visitedExhibits={visitedExhibits}
          totalEpitaphsRead={currentMuseumReadCount}
          museumOwner={githubUsername || null}
          onShareMuseum={githubUsername ? handleShareMuseum : undefined}
          onAnalyzeAnother={handleAnalyzeAnother}
        />
      )}

      {currentView === "exhibit" && currentExhibit && (
        <ExhibitRoom
          exhibit={currentExhibit}
          onBack={handleBackToHall}
          onReadEpitaph={handleReadEpitaph}
          onFindSecret={handleFindSecret}
          onCopilotChat={handleCopilotChat}
          onViewRevivalPlan={handleViewRevivalPlan}
          onExportRevivalPlan={handleExportRevivalPlan}
          onCommitToResurrectionBay={handleCommitToResurrectionBay}
          isCommittedToResurrectionBay={resurrectedProjects.some(
            (project) => project.exhibitId === currentExhibit.id
          )}
        />
      )}

      {currentView === "resurrection" && (
        <ResurrectionBay
          onBack={handleBackToHall}
          onResurrect={handleResurrect}
          resurrectedProjects={resurrectedProjects}
        />
      )}

      <AchievementToast
        achievement={currentToast}
        onClose={() => setCurrentToast(null)}
      />

      {showAchievements && (
        <AchievementPanel
          unlockedAchievements={unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}

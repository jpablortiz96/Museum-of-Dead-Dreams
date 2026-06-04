import { achievements as allAchievements, type Achievement } from "@/data/exhibits";
import {
  Trophy,
  Lock,
  Footprints,
  TrendingDown,
  Scale,
  Music,
  BookOpen,
  Search,
  Bot,
  Flame,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Footprints,
  TrendingDown,
  Scale,
  Music,
  BookOpen,
  Search,
  Bot,
  Flame,
  Sparkles,
};

interface AchievementPanelProps {
  unlockedAchievements: string[];
  onClose: () => void;
}

export function AchievementPanel({ unlockedAchievements, onClose }: AchievementPanelProps) {
  const achievementList: Achievement[] = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedAchievements.includes(a.id),
  }));

  const unlockedCount = achievementList.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[80vh] overflow-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0f] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10 bg-[#1a1a2e]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-xl text-white tracking-wide">
                  Achievements
                </h2>
                <p className="text-xs text-white/40 font-mono-code">
                  {unlockedCount} / {achievementList.length} unlocked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors text-sm font-mono-code"
            >
              CLOSE
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${(unlockedCount / achievementList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* List */}
        <div className="p-6 space-y-3">
          {achievementList.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  achievement.unlocked
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-white/5 border-white/5 opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked
                      ? "bg-amber-500/20"
                      : "bg-white/5"
                  }`}
                >
                  {achievement.unlocked ? (
                    <Icon className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-white/20" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium ${
                      achievement.unlocked ? "text-white" : "text-white/40"
                    }`}
                  >
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-white/30 mt-0.5">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <span className="text-xs text-amber-400 font-mono-code flex-shrink-0">
                    UNLOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

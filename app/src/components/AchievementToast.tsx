import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return p + 2;
        });
      }, 80);

      const closeTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500);
      }, 5000);

      return () => {
        clearTimeout(closeTimer);
        clearInterval(progressInterval);
      };
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="relative w-80 rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
          style={{ width: `${progress}%` }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-0.5">
                Achievement Unlocked
              </div>
              <h4 className="text-white font-medium text-sm truncate">
                {achievement.name}
              </h4>
              <p className="text-xs text-white/50 mt-0.5">{achievement.description}</p>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 500);
              }}
              className="text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowRight, Sparkles } from "lucide-react";

interface RevivalButtonProps {
  accentColor: string;
  onClick: () => void;
}

export function RevivalButton({ accentColor, onClick }: RevivalButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl p-[1px] text-left"
      style={{
        background: `linear-gradient(135deg, ${accentColor}, #3282b8, ${accentColor})`,
        animation: "pulse-glow 2.8s infinite",
      }}
    >
      <div className="relative rounded-[15px] bg-[#0d1119]/95 px-6 py-5 transition-all duration-300 group-hover:bg-[#121726]">
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at top right, ${accentColor}20 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono-code text-xs uppercase tracking-[0.25em] text-white/50">
                Revival Report
              </span>
            </div>
            <div className="font-display text-2xl tracking-wide text-white">
              View Revival Plan
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
              See how Copilot would bring this back from the dead in 2026.
            </p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
    </button>
  );
}

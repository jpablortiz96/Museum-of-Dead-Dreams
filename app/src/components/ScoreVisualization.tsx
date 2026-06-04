import { useEffect, useState } from "react";
import { type RevivalReport } from "@/types/revival";

interface ScoreVisualizationProps {
  score: RevivalReport["score"];
}

function getBarColor(value: number) {
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

export function ScoreVisualization({ score }: ScoreVisualizationProps) {
  const [animatedValues, setAnimatedValues] = useState({
    overall: 0,
    codebaseHealth: 0,
    marketOpportunity: 0,
    complexity: 0,
    founderFit: 0,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnimatedValues({
        overall: score.overall,
        codebaseHealth: score.codebaseHealth,
        marketOpportunity: score.marketOpportunity,
        complexity: score.complexity,
        founderFit: score.founderFit,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  const rows = [
    {
      label: "Codebase Health",
      value: animatedValues.codebaseHealth,
      displayValue: score.codebaseHealth,
    },
    {
      label: "Market Opportunity",
      value: animatedValues.marketOpportunity,
      displayValue: score.marketOpportunity,
    },
    {
      label: "Complexity",
      value: animatedValues.complexity,
      displayValue: score.complexity,
    },
    {
      label: "Founder Fit",
      value: animatedValues.founderFit,
      displayValue: score.founderFit,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/45">
          Resurrection Score
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-5xl text-white">
              {animatedValues.overall}
              <span className="ml-2 text-2xl text-white/35">/100</span>
            </div>
            <div className="mt-2 text-sm text-white/55">{score.verdict}</div>
          </div>
          <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${animatedValues.overall}%`,
                background: `linear-gradient(90deg, ${getBarColor(
                  score.overall
                )}, #7db8ff)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-white/8 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="text-sm text-white">{row.label}</div>
              <div className="text-sm font-mono-code text-white/50">
                {row.displayValue}/100
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${row.value}%`,
                  backgroundColor: getBarColor(row.displayValue),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { type ReactNode } from "react";

interface RevivalSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function RevivalSection({
  eyebrow,
  title,
  description,
  children,
}: RevivalSectionProps) {
  return (
    <section className="space-y-5">
      <div>
        <div className="mb-2 text-xs font-mono-code uppercase tracking-[0.3em] text-[#7db8ff]/70">
          {eyebrow}
        </div>
        <h3 className="font-display text-2xl tracking-wide text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/50">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

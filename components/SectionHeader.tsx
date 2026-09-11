import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  right?: ReactNode;
  accent?: "green" | "gold";
};

export function SectionHeader({ kicker, title, right, accent = "green" }: Props) {
  return (
    <header className="border border-line bg-navy-900">
      <div
        className={`h-1 w-full ${
          accent === "green" ? "bg-green" : "bg-gold"
        }`}
      />
      <div className="relative flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-green" fill="currentColor">
            <path d="M12 2 22 12 12 22 2 12Z" />
          </svg>
          <div>
            <p
              className={`font-display text-xs font-semibold uppercase tracking-[0.3em] ${
                accent === "green" ? "text-green" : "text-gold"
              }`}
            >
              {kicker}
            </p>
            <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-white sm:text-3xl">
              {title}
            </h2>
          </div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}
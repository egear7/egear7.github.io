import { SquareCheckbox } from "./SquareCheckbox";
import { StatusBadge } from "./StatusBadge";
import { normalizeMilestoneStates, parseMilestones } from "@/lib/challenges";
import type { Challenge, MilestoneState } from "@/lib/types";

const MILESTONE_CHIP_CLASS: Record<
  MilestoneState,
  { chip: string; label: string }
> = {
  completed: {
    chip: "border-green/60 bg-green-dim text-green",
    label: "Tamamlandı",
  },
  "in-progress": {
    chip: "border-gold/60 bg-gold-dim text-gold",
    label: "Devam Ediyor",
  },
  pending: {
    chip: "border-white/15 bg-white/5 text-white/40",
    label: "Başlanmadı",
  },
};

export function ChallengeBoard({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="border border-line bg-navy-900/60">
      {challenges.map((ch, i) => (
        <article
          key={ch.id}
          className={`relative flex flex-col gap-3 border-b border-line-soft px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 ${
            i === challenges.length - 1 ? "border-b-0" : ""
          } ${ch.active ? "row-active" : ""}`}
        >
          <div className="flex items-center gap-4">
            <span className="w-8 shrink-0 font-display text-sm font-bold tracking-widest text-gold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <SquareCheckbox
              checked={ch.status === "completed"}
              variant="dark"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display text-lg font-bold uppercase tracking-[0.08em] sm:text-xl ${
                ch.active ? "text-green" : "text-white"
              }`}
            >
              {ch.title}
            </h3>
            {ch.milestones ? (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-sm font-semibold tracking-[0.15em]">
                <span className="text-white/50">HEDEF:</span>
                {parseMilestones(ch.milestones).map((value, i) => {
                  const state = normalizeMilestoneStates(ch)[i] ?? "pending";
                  const s = MILESTONE_CHIP_CLASS[state];
                  return (
                    <span
                      key={`${value}-${i}`}
                      title={s.label}
                      className={`border px-2 py-0.5 ${s.chip}`}
                    >
                      {value}
                    </span>
                  );
                })}
              </p>
            ) : (
              <p className="mt-0.5 font-display text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                Özel Challenge
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 sm:shrink-0">
            {ch.active ? (
              <span className="hidden items-center gap-2 border border-green/60 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-green sm:inline-flex">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                  <path d="M12 2 22 12 12 22 2 12Z" />
                </svg>
                Aktif
              </span>
            ) : null}
            <StatusBadge status={ch.status} />
          </div>
        </article>
      ))}
    </div>
  );
}
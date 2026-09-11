import type { ChallengeStatus } from "@/lib/types";

const MAP: Record<
  ChallengeStatus,
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: "TAMAMLANDI",
    className: "bg-green text-navy-950",
    dot: "bg-navy-950",
  },
  "in-progress": {
    label: "DEVAM EDİYOR",
    className: "border border-red text-red",
    dot: "bg-red",
  },
  failed: {
    label: "BAŞARISIZ",
    className: "bg-red text-white",
    dot: "bg-white",
  },
};

export function StatusBadge({ status }: { status: ChallengeStatus }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] ${
        s.className
      }`}
    >
      <span className={`h-1.5 w-1.5 ${s.dot}`} />
      {s.label}
    </span>
  );
}
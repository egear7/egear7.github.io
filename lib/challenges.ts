import type { Challenge, MilestoneState } from "@/lib/types";

export const MILESTONE_STATE_LABELS: Record<MilestoneState, string> = {
  completed: "Tamamlandı",
  "in-progress": "Devam Ediyor",
  pending: "Başlanmadı",
};

export const MILESTONE_STATES: MilestoneState[] = [
  "completed",
  "in-progress",
  "pending",
];

export function parseMilestones(milestones: string): string[] {
  return milestones
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidState(s: unknown): s is MilestoneState {
  return s === "completed" || s === "in-progress" || s === "pending";
}

export function normalizeMilestoneStates(
  challenge: Challenge,
): MilestoneState[] {
  const count = parseMilestones(challenge.milestones).length;
  if (count === 0) return [];
  const fallback: MilestoneState =
    challenge.status === "completed" ? "completed" : "pending";
  const raw = Array.isArray(challenge.milestoneStates)
    ? challenge.milestoneStates
    : [];
  return Array.from({ length: count }, (_, i) =>
    isValidState(raw[i]) ? raw[i] : fallback,
  );
}
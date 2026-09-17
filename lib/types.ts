export type ChallengeStatus = "completed" | "in-progress" | "failed";

export type MilestoneState = "completed" | "in-progress" | "pending";

export type Challenge = {
  id: string;
  title: string;
  milestones: string;
  milestoneStates?: MilestoneState[];
  status: ChallengeStatus;
  active: boolean;
};

export type Guest = {
  id: string;
  name: string;
};

export type SiteData = {
  challenges: Challenge[];
  guests: Guest[];
  updatedAt: string;
};

export type SaveResult =
  | { ok: true; commitUrl: string }
  | { ok: false; message: string };
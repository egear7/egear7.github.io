export type ChallengeStatus = "completed" | "in-progress" | "failed";

export type Challenge = {
  id: string;
  title: string;
  milestones: string;
  status: ChallengeStatus;
  active: boolean;
};

export type Guest = {
  id: string;
  name: string;
  host: string;
  approved: boolean;
  coming: boolean;
  date: string;
};

export type SiteData = {
  challenges: Challenge[];
  guests: Guest[];
  updatedAt: string;
};

export type SaveResult =
  | { ok: true; commitUrl: string }
  | { ok: false; message: string };
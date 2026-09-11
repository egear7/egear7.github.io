export const DATA_PATH = "public/data.json";

export function getRepoName(): string {
  if (typeof window === "undefined") return "USERNAME.github.io";
  const host = window.location.hostname;
  if (host.endsWith(".github.io") || host.endsWith(".github.com")) return host;
  const fromEnv = process.env.NEXT_PUBLIC_GITHUB_REPO;
  return fromEnv || "USERNAME.github.io";
}

export function getRepoOwner(): string {
  const repo = getRepoName();
  return repo.replace(/\.github\.io$/, "");
}

export function getDataUrl(): string {
  const repo = getRepoName();
  const owner = repo.replace(/\.github\.io$/, "");
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/public/data.json`;
}

export function getRawDataUrl(): string {
  const repo = getRepoName();
  const owner = repo.replace(/\.github\.io$/, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/public/data.json`;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const ADMIN_PASSWORD_HASH =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH ??
  "e88f74ecca4f098be31448a58dda385945eb2e09bdc1ae84933615bb9e3d21d8";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
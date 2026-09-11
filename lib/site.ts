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

const PASSWORD_SECRET =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH ?? "";

export const DEFAULT_PASSWORD_HASH =
  "0bf4d633541cc621888519d27cb90e9231a0c860bcbf27eb278cf37e8181c732";

export async function verifyAdminPassword(input: string): Promise<boolean> {
  if (!PASSWORD_SECRET) {
    return (await sha256Hex(input)) === DEFAULT_PASSWORD_HASH;
  }
  if (/^[0-9a-f]{64}$/i.test(PASSWORD_SECRET)) {
    return (await sha256Hex(input)) === PASSWORD_SECRET;
  }
  return input === PASSWORD_SECRET;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
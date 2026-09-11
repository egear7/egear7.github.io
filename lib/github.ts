import { DATA_PATH, getRepoName } from "./site";
import type { SaveResult, SiteData } from "./types";

const API = "https://api.github.com";

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

type ContentsResponse = {
  sha: string;
  content: string;
};

export async function fetchDataJson(): Promise<SiteData | null> {
  try {
    const res = await fetch(`/data.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SiteData;
  } catch {
    return null;
  }
}

export async function fetchLatestFileSha(token: string): Promise<string> {
  const repo = getRepoName();
  const res = await fetch(
    `${API}/repos/${repo}/contents/${DATA_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(await apiErrorMessage(res, "Dosya bilgisi alınamadı"));
  }
  const body = (await res.json()) as ContentsResponse;
  return body.sha;
}

export async function saveDataJson(
  token: string,
  data: SiteData,
): Promise<SaveResult> {
  const repo = getRepoName();
  try {
    const sha = await fetchLatestFileSha(token);
    const content = utf8ToBase64(JSON.stringify(data, null, 2));
    const res = await fetch(`${API}/repos/${repo}/contents/${DATA_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "FC27 yayın takip güncellemesi",
        content,
        sha,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        message: await apiErrorMessage(res, "Commit oluşturulamadı"),
      };
    }
    const body = (await res.json()) as { commit?: { html_url?: string } };
    return {
      ok: true,
      commitUrl: body.commit?.html_url ?? `https://github.com/${repo}/commits`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Beklenmeyen hata",
    };
  }
}

export type TokenValidation = {
  ok: boolean;
  message: string;
};

export async function validateToken(token: string): Promise<TokenValidation> {
  const repo = getRepoName();
  try {
    const userRes = await fetch(`${API}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (userRes.status === 401) {
      return {
        ok: false,
        message:
          "Token geçersiz (401). Token'ı eksiksiz kopyaladığınızdan ve github_pat_ ile başladığından emin olun.",
      };
    }
    if (!userRes.ok) {
      return {
        ok: false,
        message: await apiErrorMessage(userRes, "Kullanıcı doğrulanamadı"),
      };
    }

    const repoRes = await fetch(`${API}/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });
    if (repoRes.status === 404) {
      return {
        ok: false,
        message:
          "Token bu repoya erişime sahip değil (404). Fine-grained token ayarlarında 'Repository access' altında egear7.github.io seçili olduğundan emin olun.",
      };
    }
    if (!repoRes.ok) {
      return {
        ok: false,
        message: await apiErrorMessage(repoRes, "Repo erişimi kontrol edilemedi"),
      };
    }

    return { ok: true, message: "Token doğrulandı, commit yapılabilir." };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Ağ hatası — bağlantınızı kontrol edin.",
    };
  }
}

async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as {
      message?: string;
      documention_url?: string;
    };
    const base = body.message ?? fallback;
    if (res.status === 401)
      return "Token geçersiz veya yetkisiz (401). Token'ı kontrol edin.";
    if (res.status === 403)
      return `${base} — Rate limit veya izin sorunu. Token'ın bu repoda "Contents: Read and write" yetkisi olduğundan emin olun.`;
    if (res.status === 404) return `${base} (404) — Repo adını kontrol edin.`;
    return `${base} (${res.status})`;
  } catch {
    return `${fallback} (${res.status})`;
  }
}
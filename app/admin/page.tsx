"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { saveDataJson, validateToken } from "@/lib/github";
import { verifyAdminPassword } from "@/lib/site";
import { useSiteData } from "@/lib/useSiteData";
import {
  MILESTONE_STATE_LABELS,
  MILESTONE_STATES,
  normalizeMilestoneStates,
  parseMilestones,
} from "@/lib/challenges";
import type {
  Challenge,
  ChallengeStatus,
  Guest,
  MilestoneState,
  SiteData,
} from "@/lib/types";

const AUTH_KEY = "fc27_admin_auth";
const TOKEN_KEY = "fc27_gh_token";

type SessionStore = {
  get: () => string;
  set: (next: string) => void;
  subscribe: (listener: () => void) => () => void;
};

function createSessionStore(key: string): SessionStore {
  let value =
    typeof window !== "undefined" ? sessionStorage.getItem(key) ?? "" : "";
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      if (next) sessionStorage.setItem(key, next);
      else sessionStorage.removeItem(key);
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const authStore = createSessionStore(AUTH_KEY);
const tokenStore = createSessionStore(TOKEN_KEY);

function useSession(store: SessionStore): string {
  return useSyncExternalStore(store.subscribe, store.get, () => "");
}

const STATUS_OPTIONS: { value: ChallengeStatus; label: string }[] = [
  { value: "in-progress", label: "Devam Ediyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "failed", label: "Başarısız" },
];

function StatusSelect({
  value,
  onChange,
}: {
  value: ChallengeStatus;
  onChange: (v: ChallengeStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ChallengeStatus)}
      className="cursor-pointer border border-line bg-navy-800 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-white outline-none focus:border-green"
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function AdminEditor({ data }: { data: SiteData }) {
  const [challenges, setChallenges] = useState<Challenge[]>(data.challenges);
  const [guests, setGuests] = useState<Guest[]>(data.guests);
  const token = useSession(tokenStore);
  const [tokenStatus, setTokenStatus] = useState<
    "idle" | "testing" | "ok" | "fail"
  >("idle");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  async function handleTokenSave() {
    const t = token.trim();
    if (!t) return;
    setTokenStatus("testing");
    const result = await validateToken(t);
    if (result.ok) {
      tokenStore.set(t);
      setTokenStatus("ok");
      setMessage({ kind: "ok", text: result.message });
    } else {
      setTokenStatus("fail");
      setMessage({ kind: "err", text: result.message });
    }
  }

  async function handleSave() {
    const t = token.trim();
    if (!t) {
      setMessage({
        kind: "err",
        text: "Önce GitHub token'ı girip doğrulayın.",
      });
      return;
    }
    setSaving(true);
    setMessage(null);
    setCommitUrl(null);
    const payload: SiteData = {
      challenges: challenges.map((c) => {
        const states = normalizeMilestoneStates(c);
        return states.length > 0 ? { ...c, milestoneStates: states } : c;
      }),
      guests,
      updatedAt: new Date().toISOString(),
    };
    const result = await saveDataJson(t, payload);
    setSaving(false);
    if (result.ok) {
      setCommitUrl(result.commitUrl);
      setMessage({
        kind: "ok",
        text: "Değişiklikler GitHub'a gönderildi. Site ~1 dakika içinde güncellenecek.",
      });
    } else {
      setMessage({ kind: "err", text: result.message });
    }
  }

  function updateChallenge(id: string, patch: Partial<Challenge>) {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function setMilestoneState(
    id: string,
    index: number,
    state: MilestoneState,
  ) {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const states = normalizeMilestoneStates(c);
        states[index] = state;
        return { ...c, milestoneStates: states };
      }),
    );
  }

  function updateGuest(id: string, patch: Partial<Guest>) {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  }

  function addGuest() {
    setGuests((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `guest-${Date.now()}`,
        name: "",
      },
    ]);
  }

  function removeGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="border border-line bg-navy-900/60">
        <div className="border-b border-line-soft px-4 py-3 sm:px-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em] text-white">
            GitHub Token
          </h2>
          <p className="mt-1 font-body text-sm text-white/50">
            Fine-grained PAT — yalnızca bu repoya{" "}
            <span className="text-gold">Contents: Read and write</span>{" "}
            yetkisi vermeniz yeterli. Token tarayıcıda yalnızca bu oturum için
            saklanır, asla koda yazılmaz.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:px-6">
          <input
            type="password"
            value={token}
            onChange={(e) => {
              tokenStore.set(e.target.value);
              setTokenStatus("idle");
            }}
            placeholder="github_pat_…"
            className="flex-1 border border-line bg-navy-800 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-white/30 focus:border-green"
          />
          <button
            onClick={handleTokenSave}
            disabled={tokenStatus === "testing" || !token.trim()}
            className="border border-green px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-green transition-colors hover:bg-green hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {tokenStatus === "testing"
              ? "Doğrulanıyor…"
              : tokenStatus === "ok"
                ? "✓ Doğrulandı"
                : tokenStatus === "fail"
                  ? "Tekrar Dene"
                  : "Token'ı Doğrula"}
          </button>
        </div>
      </section>

      <section className="border border-line bg-navy-900/60">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 sm:px-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em] text-white">
            Challenge Durumları
          </h2>
        </div>
        <div className="flex flex-col">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold uppercase tracking-[0.08em] text-white">
                  {ch.title}
                </p>
                {parseMilestones(ch.milestones).length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-display text-xs font-semibold tracking-[0.15em] text-white/40">
                      HEDEF:
                    </span>
                    {parseMilestones(ch.milestones).map((value, i) => {
                      const state =
                        normalizeMilestoneStates(ch)[i] ?? "pending";
                      return (
                        <div
                          key={`${value}-${i}`}
                          className="flex items-center gap-1.5"
                        >
                          <span className="font-display text-xs font-bold tracking-[0.15em] text-white/60">
                            {value}
                          </span>
                          <div className="flex">
                            {MILESTONE_STATES.map((s) => {
                              const selected = s === state;
                              const filled =
                                s === "completed"
                                  ? "border-green bg-green"
                                  : s === "in-progress"
                                    ? "border-gold bg-gold"
                                    : "border-gray-400 bg-gray-400";
                              const outline =
                                s === "completed"
                                  ? "border-green/40 bg-transparent"
                                  : s === "in-progress"
                                    ? "border-gold/40 bg-transparent"
                                    : "border-white/20 bg-transparent";
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  title={`${value}: ${MILESTONE_STATE_LABELS[s]}`}
                                  aria-label={`${value}: ${MILESTONE_STATE_LABELS[s]}`}
                                  onClick={() =>
                                    setMilestoneState(ch.id, i, s)
                                  }
                                  className={`h-5 w-5 border ${
                                    selected ? filled : outline
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                  <input
                    type="checkbox"
                    checked={ch.active}
                    onChange={(e) =>
                      updateChallenge(ch.id, { active: e.target.checked })
                    }
                    className="h-4 w-4 accent-green"
                  />
                  Aktif
                </label>
                <StatusSelect
                  value={ch.status}
                  onChange={(v) => updateChallenge(ch.id, { status: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-line bg-navy-900/60">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 sm:px-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em] text-white">
            Konuk Listesi
          </h2>
          <button
            onClick={addGuest}
            className="border border-gold px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-navy-950"
          >
            + Konuk Ekle
          </button>
        </div>
        <div className="flex flex-col">
          {guests.map((g) => (
            <div
              key={g.id}
              className="grid grid-cols-1 gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
            >
              <input
                value={g.name}
                onChange={(e) => updateGuest(g.id, { name: e.target.value })}
                placeholder="Konuk adı"
                className="border border-line bg-navy-800 px-3 py-2 font-body text-sm text-white outline-none placeholder:text-white/30 focus:border-green"
              />
              <button
                onClick={() => removeGuest(g.id)}
                aria-label="Konuğu sil"
                className="border border-red/50 px-3 py-2 font-display text-xs font-bold text-red transition-colors hover:bg-red hover:text-white"
              >
                Sil
              </button>
            </div>
          ))}
          {guests.length === 0 ? (
            <p className="px-4 py-6 text-center font-display text-xs font-bold uppercase tracking-[0.3em] text-white/40">
              Konuk yok
            </p>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        {message ? (
          <div
            className={`border px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.15em] ${
              message.kind === "ok"
                ? "border-green/50 bg-green-dim text-green"
                : "border-red/50 bg-red-dim text-red"
            }`}
          >
            {message.text}
          </div>
        ) : null}
        {commitUrl ? (
          <Link
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xs font-bold uppercase tracking-[0.2em] text-green underline"
          >
            Commit&apos;i görüntüle →
          </Link>
        ) : null}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green px-4 py-4 font-display text-sm font-bold uppercase tracking-[0.3em] text-navy-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving
            ? "Gönderiliyor…"
            : "Değişiklikleri Yayınla (GitHub'a Commit)"}
        </button>
        <p className="font-body text-xs text-white/40">
          Değişiklikler{" "}
          <code className="text-gold">public/data.json</code> dosyasına commit
          edilir; site izleyicileri ~1 dakika içinde güncel veriyi görür.
        </p>
      </section>
    </div>
  );
}

export default function AdminPage() {
  const { data, loading } = useSiteData();
  const authed = useSession(authStore) === "1";
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const ok = await verifyAdminPassword(password);
    if (ok) {
      authStore.set("1");
      setAuthError(null);
    } else {
      setAuthError("Hatalı şifre");
      setPassword("");
    }
  }

  function handleLogout() {
    authStore.set("");
    tokenStore.set("");
  }

  if (!authed) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-line bg-navy-900"
        >
          <div className="h-1 bg-green" />
          <div className="flex flex-col gap-4 p-6">
            <h1 className="font-display text-2xl font-bold uppercase tracking-[0.12em] text-white">
              Admin Paneli
            </h1>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Devam etmek için şifre girin
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              autoFocus
              className="border border-line bg-navy-800 px-4 py-3 font-body text-base text-white outline-none placeholder:text-white/30 focus:border-green"
            />
            {authError ? (
              <p className="font-display text-sm font-bold uppercase tracking-[0.15em] text-red">
                {authError}
              </p>
            ) : null}
            <button
              type="submit"
              className="bg-green px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-navy-950 transition-opacity hover:opacity-90"
            >
              Giriş Yap
            </button>
            <Link
              href="/"
              className="text-center font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white"
            >
              ← Ana siteye dön
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <header className="border-b border-line bg-navy-900">
        <div className="h-1 bg-green" />
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-green">
              Yönetim
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-[0.1em] text-white">
              Admin Paneli
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="border border-line px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white hover:text-white"
            >
              Ana Site
            </Link>
            <button
              onClick={handleLogout}
              className="border border-red/60 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-red transition-colors hover:bg-red hover:text-white"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
          <div className="border border-line bg-navy-900/60 px-6 py-10 text-center font-display text-sm font-bold uppercase tracking-[0.3em] text-white/40">
            Veri yükleniyor…
          </div>
        </div>
      ) : (
        <AdminEditor key={data.updatedAt || "initial"} data={data} />
      )}
    </main>
  );
}
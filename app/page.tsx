"use client";

import { ChallengeBoard } from "@/components/ChallengeBoard";
import { GuestTable } from "@/components/GuestTable";
import { SectionHeader } from "@/components/SectionHeader";
import { useSiteData } from "@/lib/useSiteData";

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function CornerAccents() {
  return (
    <>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-0 top-0 h-6 w-6 text-line"
        fill="currentColor"
      >
        <path d="M24 0v24L0 0Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 rotate-180 text-line"
        fill="currentColor"
      >
        <path d="M24 0v24L0 0Z" />
      </svg>
    </>
  );
}

export default function HomePage() {
  const { data, loading, error } = useSiteData();

  return (
    <main className="flex-1">
      <section className="relative border-b border-line bg-navy-900">
        <CornerAccents />
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-5 pt-6 sm:px-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-white/50">
            FC27 Subathon • Yayın Takip
          </p>
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-[0.1em] text-white sm:text-6xl">
            Ege&apos;nin{" "}
            <span className="text-green">Challengeları</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="h-[3px] w-14 bg-green" />
            <p className="font-display text-sm font-bold uppercase tracking-[0.4em] text-gold">
              Main Challenge
            </p>
            {data.updatedAt ? (
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Son Güncelleme: {formatDate(data.updatedAt)}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6">
        {!loading && error ? (
          <div className="border border-red/50 bg-red-dim px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-red">
            {error} — Yerel önbellek verisi gösteriliyor.
          </div>
        ) : null}

        <section className="relative">
          <CornerAccents />
          <div className="mb-3">
            <SectionHeader
              kicker="Main Challenge"
              title="Ege'nin Challengeları"
              right={
                <span className="hidden font-display text-xs font-bold uppercase tracking-[0.25em] text-white/40 sm:block">
                  8 Challenge
                </span>
              }
            />
          </div>
          {loading ? (
            <div className="border border-line bg-navy-900/60 px-6 py-10 text-center font-display text-sm font-bold uppercase tracking-[0.3em] text-white/40">
              Yükleniyor…
            </div>
          ) : (
            <ChallengeBoard challenges={data.challenges} />
          )}
        </section>

        <section className="relative">
          <CornerAccents />
          <div className="mb-3">
            <SectionHeader
              kicker="Konuk Listesi"
              title="Gelecek Konuklar"
              accent="gold"
              right={
                <span className="hidden font-display text-xs font-bold uppercase tracking-[0.25em] text-white/40 sm:block">
                  {data.guests.length} Konuk
                </span>
              }
            />
          </div>
          {loading ? (
            <div className="border border-line bg-navy-900/60 px-6 py-10 text-center font-display text-sm font-bold uppercase tracking-[0.3em] text-white/40">
              Yükleniyor…
            </div>
          ) : (
            <GuestTable guests={data.guests} />
          )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-line-soft pt-6 sm:flex-row">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-white/40">
            FC27 Subathon • Ege Yayın Takip
          </p>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-white/25">
            © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
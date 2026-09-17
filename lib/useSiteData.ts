"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDataUrl, getRawDataUrl } from "@/lib/site";
import type { SiteData } from "@/lib/types";

const POLL_MS = 30_000;

const EMPTY: SiteData = {
  challenges: [],
  guests: [],
  updatedAt: "",
};

export function useSiteData() {
  const [data, setData] = useState<SiteData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async (): Promise<SiteData | null> => {
    const t = Date.now();
    const urls = [
      `${getRawDataUrl()}?t=${t}`,
      `${getDataUrl()}?t=${t}`,
      `/data.json?t=${t}`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as SiteData;
          if (Array.isArray(json.challenges)) return json;
        }
      } catch {
        // next source
      }
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    const next = await fetchAll();
    if (next) {
      setData(next);
      setIsLive(true);
      setError(null);
    } else {
      setIsLive(false);
      setError("Canlı veriye ulaşılamıyor");
    }
    setLoading(false);
  }, [fetchAll]);

  useEffect(() => {
    const run = () => {
      void refresh();
    };
    const initial = setTimeout(run, 0);
    timer.current = setInterval(run, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initial);
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { data, loading, error, isLive, refresh };
}
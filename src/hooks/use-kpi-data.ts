"use client";

import { useState, useEffect, useCallback } from "react";
import { getKpisByYears, getNoteByYear, getAvailableYears } from "@/lib/supabase/queries";
import {
  calculateSocialMediaTotal,
  calculateSocialMediaReachTotal,
  calculateSocialMediaInteractionsTotal,
} from "@/lib/calculations/social-media-total";
import { fetchReplyStatsViaProxy } from "@/lib/reply-stats-client";
import { METRIC_NOT_COLLECTED } from "@/lib/constants";
import type { StatsRepliesResponse } from "@/lib/stats-api-types";
import type { YearKpiData } from "@/types";

interface KpiDataResult {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  availableYears: number[];
}

function mergeReplyStats(
  entries: Record<string, number | null>,
  stats: StatsRepliesResponse | null
) {
  if (!stats) {
    entries["total_comments_answered"] = null;
    entries["tiktok_comments_answered"] = null;
    entries["instagram_comments_answered"] = null;
    entries["facebook_comments_answered"] = null;
    return;
  }
  // range.from === null heisst: in diesem Jahr existieren keine Reply-Daten
  // (Bot startete Februar 2026). Sentinel-Wert sorgt fuer "Nicht erhoben"-
  // Anzeige statt einer irrefuehrenden 0.
  const value = (n: number) =>
    stats.range.from === null ? METRIC_NOT_COLLECTED : n;

  entries["total_comments_answered"] = value(stats.uniqueInteractions);
  entries["tiktok_comments_answered"] = value(
    stats.byPlatform.tiktok.interactions
  );
  entries["instagram_comments_answered"] = value(
    stats.byPlatform.instagram.interactions
  );
  entries["facebook_comments_answered"] = value(
    stats.byPlatform.facebook.interactions
  );
}

export function useKpiData(year: number) {
  const [data, setData] = useState<KpiDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // Hard-Timeout damit die UI nicht ewig im Skeleton haengt, falls
      // der supabase-js Refresh-Flow bei toten Tokens blockiert.
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase-Anfrage Timeout")), 10000)
      );

      const [entries, note, years, replyCurrent, replyPrevious] =
        await Promise.race([
          Promise.all([
            getKpisByYears([year, year - 1]),
            getNoteByYear(year),
            getAvailableYears(),
            fetchReplyStatsViaProxy(year),
            fetchReplyStatsViaProxy(year - 1),
          ]),
          timeout,
        ]);

      // Einträge nach Jahr aufteilen
      const currentEntries: Record<string, number | null> = {};
      const previousEntries: Record<string, number | null> = {};

      for (const entry of entries) {
        if (entry.year === year) {
          currentEntries[entry.metric_key] = entry.value;
        } else if (entry.year === year - 1) {
          previousEntries[entry.metric_key] = entry.value;
        }
      }

      // Social Media Totals berechnen
      currentEntries["social_media_followers_total"] =
        calculateSocialMediaTotal(currentEntries);
      previousEntries["social_media_followers_total"] =
        calculateSocialMediaTotal(previousEntries);
      currentEntries["social_media_reach_total"] =
        calculateSocialMediaReachTotal(currentEntries);
      previousEntries["social_media_reach_total"] =
        calculateSocialMediaReachTotal(previousEntries);
      currentEntries["social_media_interactions_total"] =
        calculateSocialMediaInteractionsTotal(currentEntries);
      previousEntries["social_media_interactions_total"] =
        calculateSocialMediaInteractionsTotal(previousEntries);

      // Reply-Stats von der Stats-API mergen (null bei Fehler)
      mergeReplyStats(currentEntries, replyCurrent);
      mergeReplyStats(previousEntries, replyPrevious);

      const currentYear: YearKpiData = {
        year,
        entries: currentEntries,
        note,
      };

      const computedKeys = new Set([
        "social_media_followers_total",
        "social_media_reach_total",
        "social_media_interactions_total",
        "total_comments_answered",
        "tiktok_comments_answered",
        "instagram_comments_answered",
        "facebook_comments_answered",
      ]);
      const hasPreviousData = Object.keys(previousEntries).some(
        (k) => !computedKeys.has(k) && previousEntries[k] !== null
      );

      const previousYear: YearKpiData | null = hasPreviousData
        ? { year: year - 1, entries: previousEntries, note: null }
        : null;

      setData({ currentYear, previousYear, availableYears: years });
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

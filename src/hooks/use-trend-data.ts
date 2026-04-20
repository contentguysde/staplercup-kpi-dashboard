"use client";

import { useState, useEffect, useCallback } from "react";
import { getKpisByYears } from "@/lib/supabase/queries";
import {
  calculateSocialMediaTotal,
  calculateSocialMediaReachTotal,
  calculateSocialMediaInteractionsTotal,
} from "@/lib/calculations/social-media-total";
import { fetchReplyStatsViaProxy } from "@/lib/reply-stats-client";
import { METRICS, FIRST_YEAR, CHANNEL_NOT_EXISTED, METRIC_NOT_COLLECTED } from "@/lib/constants";

export interface TrendDataPoint {
  year: number;
  [metricKey: string]: number | null;
}

export function useTrendData() {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];
      for (let y = FIRST_YEAR; y <= currentYear; y++) {
        years.push(y);
      }

      const [entries, ...replyStatsByYear] = await Promise.all([
        getKpisByYears(years),
        ...years.map((y) => fetchReplyStatsViaProxy(y)),
      ]);

      // Daten nach Jahr gruppieren
      const byYear: Record<number, Record<string, number | null>> = {};
      for (const y of years) {
        byYear[y] = {};
      }

      for (const entry of entries) {
        if (byYear[entry.year]) {
          // Sentinel-Werte als null behandeln
          byYear[entry.year][entry.metric_key] =
            entry.value === CHANNEL_NOT_EXISTED || entry.value === METRIC_NOT_COLLECTED
              ? null
              : entry.value;
        }
      }

      // Social Media Totals + Reply-Stats pro Jahr mergen
      years.forEach((y, idx) => {
        byYear[y]["social_media_followers_total"] =
          calculateSocialMediaTotal(byYear[y]);
        byYear[y]["social_media_reach_total"] =
          calculateSocialMediaReachTotal(byYear[y]);
        byYear[y]["social_media_interactions_total"] =
          calculateSocialMediaInteractionsTotal(byYear[y]);

        const stats = replyStatsByYear[idx];
        // Bei API-Fehler oder Jahr ohne Reply-Daten (range.from === null):
        // null im Chart -> Luecke statt irrefuehrender 0-Linie.
        const noData = !stats || stats.range.from === null;
        byYear[y]["total_comments_answered"] = noData
          ? null
          : stats.uniqueInteractions;
        byYear[y]["tiktok_comments_answered"] = noData
          ? null
          : stats.byPlatform.tiktok.interactions;
        byYear[y]["instagram_comments_answered"] = noData
          ? null
          : stats.byPlatform.instagram.interactions;
        byYear[y]["facebook_comments_answered"] = noData
          ? null
          : stats.byPlatform.facebook.interactions;
      });

      // In Array umwandeln
      const trendData: TrendDataPoint[] = years.map((y) => ({
        year: y,
        ...byYear[y],
      }));

      setData(trendData);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, metrics: METRICS, isLoading, isError, refetch: fetchData };
}

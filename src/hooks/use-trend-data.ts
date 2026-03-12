"use client";

import { useState, useEffect, useCallback } from "react";
import { getKpisByYears } from "@/lib/supabase/queries";
import {
  calculateSocialMediaTotal,
  calculateSocialMediaReachTotal,
  calculateSocialMediaInteractionsTotal,
} from "@/lib/calculations/social-media-total";
import { METRICS, FIRST_YEAR, CHANNEL_NOT_EXISTED } from "@/lib/constants";

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

      const entries = await getKpisByYears(years);

      // Daten nach Jahr gruppieren
      const byYear: Record<number, Record<string, number | null>> = {};
      for (const y of years) {
        byYear[y] = {};
      }

      for (const entry of entries) {
        if (byYear[entry.year]) {
          // Sentinel-Werte als null behandeln
          byYear[entry.year][entry.metric_key] =
            entry.value === CHANNEL_NOT_EXISTED ? null : entry.value;
        }
      }

      // Social Media Totals pro Jahr berechnen
      for (const y of years) {
        byYear[y]["social_media_followers_total"] =
          calculateSocialMediaTotal(byYear[y]);
        byYear[y]["social_media_reach_total"] =
          calculateSocialMediaReachTotal(byYear[y]);
        byYear[y]["social_media_interactions_total"] =
          calculateSocialMediaInteractionsTotal(byYear[y]);
      }

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

"use client";

import { useState, useEffect, useCallback } from "react";
import { getKpisByYears, getNoteByYear, getAvailableYears } from "@/lib/supabase/queries";
import {
  calculateSocialMediaTotal,
  calculateSocialMediaReachTotal,
  calculateSocialMediaInteractionsTotal,
} from "@/lib/calculations/social-media-total";
import type { YearKpiData } from "@/types";

interface KpiDataResult {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  availableYears: number[];
}

export function useKpiData(year: number) {
  const [data, setData] = useState<KpiDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [entries, note, years] = await Promise.all([
        getKpisByYears([year, year - 1]),
        getNoteByYear(year),
        getAvailableYears(),
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

      const currentYear: YearKpiData = {
        year,
        entries: currentEntries,
        note,
      };

      const computedKeys = new Set([
        "social_media_followers_total",
        "social_media_reach_total",
        "social_media_interactions_total",
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

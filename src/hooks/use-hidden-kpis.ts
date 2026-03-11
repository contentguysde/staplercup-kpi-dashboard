"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS } from "@/lib/constants";
import { getHiddenKpiKeys, saveHiddenKpiKeys } from "@/lib/supabase/queries";

export function useHiddenKpis() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [hiddenKpiKeys, setHiddenKpiKeys] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aus Supabase laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const keys = await getHiddenKpiKeys(userId);
        if (cancelled) return;
        const validKeys = new Set(METRICS.map((m) => m.key));
        setHiddenKpiKeys(keys.filter((k) => validKeys.has(k)));
      } catch {
        // Fehler beim Laden — mit leerer Liste starten
      }
      if (!cancelled) setInitialized(true);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Änderungen in Supabase persistieren (debounced)
  useEffect(() => {
    if (!userId || !initialized) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveHiddenKpiKeys(userId, hiddenKpiKeys).catch(() => {
        // Fehler beim Speichern — still ignorieren
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, hiddenKpiKeys, initialized]);

  const hideKpi = useCallback((key: string) => {
    setHiddenKpiKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const showKpi = useCallback((key: string) => {
    setHiddenKpiKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const isHidden = useCallback(
    (key: string) => hiddenKpiKeys.includes(key),
    [hiddenKpiKeys]
  );

  return { hiddenKpiKeys, hideKpi, showKpi, isHidden };
}

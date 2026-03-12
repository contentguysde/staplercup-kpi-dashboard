"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS, DEFAULT_HIDDEN_KEYS } from "@/lib/constants";
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
        if (keys === null) {
          // Neuer User ohne gespeicherte Einstellung → Defaults anwenden
          setHiddenKpiKeys(DEFAULT_HIDDEN_KEYS);
        } else {
          const validKeys = new Set(METRICS.map((m) => m.key));
          const savedKeys = keys.filter((k) => validKeys.has(k));
          // Neue defaultHidden-Metriken automatisch verstecken,
          // wenn sie noch nicht in den gespeicherten Keys enthalten sind
          // (d.h. der User hat sie noch nie bewusst ein-/ausgeblendet)
          const knownKeys = new Set(keys);
          const newDefaults = DEFAULT_HIDDEN_KEYS.filter((k) => !knownKeys.has(k));
          setHiddenKpiKeys([...savedKeys, ...newDefaults]);
        }
      } catch {
        // Fehler beim Laden — mit Defaults starten
        setHiddenKpiKeys(DEFAULT_HIDDEN_KEYS);
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

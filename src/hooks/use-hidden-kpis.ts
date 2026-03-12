"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS, DEFAULT_HIDDEN_KEYS } from "@/lib/constants";
import { getHiddenKpiPrefs, saveHiddenKpiPrefs } from "@/lib/supabase/queries";

export function useHiddenKpis() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [hiddenKpiKeys, setHiddenKpiKeys] = useState<string[]>([]);
  const [seenDefaults, setSeenDefaults] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aus Supabase laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const prefs = await getHiddenKpiPrefs(userId);
        if (cancelled) return;
        if (prefs === null) {
          // Neuer User ohne gespeicherte Einstellung → Defaults anwenden
          setHiddenKpiKeys(DEFAULT_HIDDEN_KEYS);
          setSeenDefaults(DEFAULT_HIDDEN_KEYS);
        } else {
          const validKeys = new Set(METRICS.map((m) => m.key));
          const savedKeys = prefs.hiddenKeys.filter((k) => validKeys.has(k));
          // Neue defaultHidden-Metriken automatisch verstecken,
          // aber nur wenn der User sie noch nie gesehen hat
          const seen = new Set(prefs.seenDefaults);
          const newDefaults = DEFAULT_HIDDEN_KEYS.filter((k) => !seen.has(k));
          setHiddenKpiKeys([...savedKeys, ...newDefaults]);
          setSeenDefaults([...prefs.seenDefaults, ...newDefaults]);
        }
      } catch {
        // Fehler beim Laden — mit Defaults starten
        setHiddenKpiKeys(DEFAULT_HIDDEN_KEYS);
        setSeenDefaults(DEFAULT_HIDDEN_KEYS);
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
      saveHiddenKpiPrefs(userId, hiddenKpiKeys, seenDefaults).catch(() => {
        // Fehler beim Speichern — still ignorieren
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, hiddenKpiKeys, seenDefaults, initialized]);

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

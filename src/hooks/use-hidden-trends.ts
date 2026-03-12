"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS, DEFAULT_HIDDEN_KEYS } from "@/lib/constants";
import { getHiddenTrendPrefs, saveHiddenTrendPrefs } from "@/lib/supabase/queries";

export function useHiddenTrends() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [hiddenTrendKeys, setHiddenTrendKeys] = useState<string[]>([]);
  const [seenDefaults, setSeenDefaults] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aus Supabase laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const prefs = await getHiddenTrendPrefs(userId);
        if (cancelled) return;
        if (prefs === null) {
          // Neuer User ohne gespeicherte Einstellung → Defaults anwenden
          setHiddenTrendKeys(DEFAULT_HIDDEN_KEYS);
          setSeenDefaults(DEFAULT_HIDDEN_KEYS);
        } else {
          const validKeys = new Set(METRICS.map((m) => m.key));
          const savedKeys = prefs.hiddenKeys.filter((k) => validKeys.has(k));
          // Neue defaultHidden-Metriken automatisch verstecken,
          // aber nur wenn der User sie noch nie gesehen hat
          const seen = new Set(prefs.seenDefaults);
          const newDefaults = DEFAULT_HIDDEN_KEYS.filter((k) => !seen.has(k));
          setHiddenTrendKeys([...savedKeys, ...newDefaults]);
          setSeenDefaults([...prefs.seenDefaults, ...newDefaults]);
        }
      } catch {
        // Fehler beim Laden — mit Defaults starten
        setHiddenTrendKeys(DEFAULT_HIDDEN_KEYS);
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
      saveHiddenTrendPrefs(userId, hiddenTrendKeys, seenDefaults).catch(() => {
        // Fehler beim Speichern — still ignorieren
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, hiddenTrendKeys, seenDefaults, initialized]);

  const hideChart = useCallback((key: string) => {
    setHiddenTrendKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const showChart = useCallback((key: string) => {
    setHiddenTrendKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const isHidden = useCallback(
    (key: string) => hiddenTrendKeys.includes(key),
    [hiddenTrendKeys]
  );

  return { hiddenTrendKeys, hideChart, showChart, isHidden, initialized };
}

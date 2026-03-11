"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS } from "@/lib/constants";
import { getMajorKpiKeys, saveMajorKpiKeys } from "@/lib/supabase/queries";
import { toast } from "sonner";

const MAX_MAJOR_KPIS = 5;

export function useMajorKpis() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [majorKpiKeys, setMajorKpiKeys] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aus Supabase laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const keys = await getMajorKpiKeys(userId);
        if (cancelled) return;
        const validKeys = new Set(METRICS.map((m) => m.key));
        setMajorKpiKeys(keys.filter((k) => validKeys.has(k)));
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
      saveMajorKpiKeys(userId, majorKpiKeys).catch(() => {
        // Fehler beim Speichern — still ignorieren
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, majorKpiKeys, initialized]);

  const addMajorKpi = useCallback(
    (key: string, insertAtIndex?: number) => {
      setMajorKpiKeys((prev) => {
        if (prev.includes(key)) return prev;
        if (prev.length >= MAX_MAJOR_KPIS) {
          toast.error(`Maximal ${MAX_MAJOR_KPIS} wichtige KPIs erlaubt`);
          return prev;
        }
        if (insertAtIndex !== undefined) {
          const next = [...prev];
          next.splice(insertAtIndex, 0, key);
          return next;
        }
        return [...prev, key];
      });
    },
    []
  );

  const removeMajorKpi = useCallback((key: string) => {
    setMajorKpiKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const reorderMajorKpi = useCallback((draggedKey: string, targetKey: string, position: "before" | "after") => {
    setMajorKpiKeys((prev) => {
      if (draggedKey === targetKey) return prev;
      const next = prev.filter((k) => k !== draggedKey);
      const targetIdx = next.indexOf(targetKey);
      if (targetIdx === -1) return prev;
      const insertIdx = position === "after" ? targetIdx + 1 : targetIdx;
      next.splice(insertIdx, 0, draggedKey);
      return next;
    });
  }, []);

  const isMajorKpi = useCallback(
    (key: string) => majorKpiKeys.includes(key),
    [majorKpiKeys]
  );

  return { majorKpiKeys, addMajorKpi, removeMajorKpi, reorderMajorKpi, isMajorKpi };
}

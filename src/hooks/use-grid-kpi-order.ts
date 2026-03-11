"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS } from "@/lib/constants";
import { getGridKpiOrder, saveGridKpiOrder } from "@/lib/supabase/queries";

export function useGridKpiOrder() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [gridKpiOrder, setGridKpiOrder] = useState<string[] | null>(null);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Aus Supabase laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const order = await getGridKpiOrder(userId);
        if (cancelled) return;
        if (order) {
          const validKeys = new Set(METRICS.map((m) => m.key));
          const filtered = order.filter((k) => validKeys.has(k));
          // Neue Metriken anfügen die nicht in der gespeicherten Reihenfolge sind
          const missing = METRICS.map((m) => m.key).filter((k) => !filtered.includes(k));
          setGridKpiOrder([...filtered, ...missing]);
        }
      } catch {
        // Fehler beim Laden — Standard-Reihenfolge verwenden
      }
      if (!cancelled) setInitialized(true);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Änderungen in Supabase persistieren (debounced)
  useEffect(() => {
    if (!userId || !initialized || !gridKpiOrder) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGridKpiOrder(userId, gridKpiOrder).catch(() => {
        // Fehler beim Speichern — still ignorieren
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, gridKpiOrder, initialized]);

  const reorderGridKpi = useCallback((fromIndex: number, toIndex: number) => {
    setGridKpiOrder((prev) => {
      // Beim ersten Reorder: Standard-Reihenfolge initialisieren
      const current = prev ?? METRICS.map((m) => m.key);
      if (fromIndex === toIndex) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return { gridKpiOrder, reorderGridKpi };
}

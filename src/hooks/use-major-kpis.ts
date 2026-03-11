"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { METRICS } from "@/lib/constants";
import { toast } from "sonner";

const MAX_MAJOR_KPIS = 5;
const STORAGE_PREFIX = "staplercup_major_kpis_";

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function loadFromStorage(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const validKeys = new Set(METRICS.map((m) => m.key));
    return parsed.filter((k): k is string => typeof k === "string" && validKeys.has(k));
  } catch {
    return [];
  }
}

function saveToStorage(userId: string, keys: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(keys));
  } catch {
    // Storage voll oder nicht verfügbar — still ignorieren
  }
}

export function useMajorKpis() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [majorKpiKeys, setMajorKpiKeys] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Aus localStorage laden wenn User bekannt
  useEffect(() => {
    if (!userId) return;
    setMajorKpiKeys(loadFromStorage(userId));
    setInitialized(true);
  }, [userId]);

  // Änderungen in localStorage persistieren
  useEffect(() => {
    if (!userId || !initialized) return;
    saveToStorage(userId, majorKpiKeys);
  }, [userId, majorKpiKeys, initialized]);

  const addMajorKpi = useCallback(
    (key: string) => {
      setMajorKpiKeys((prev) => {
        if (prev.includes(key)) return prev;
        if (prev.length >= MAX_MAJOR_KPIS) {
          toast.error(`Maximal ${MAX_MAJOR_KPIS} wichtige KPIs erlaubt`);
          return prev;
        }
        return [...prev, key];
      });
    },
    []
  );

  const removeMajorKpi = useCallback((key: string) => {
    setMajorKpiKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const isMajorKpi = useCallback(
    (key: string) => majorKpiKeys.includes(key),
    [majorKpiKeys]
  );

  return { majorKpiKeys, addMajorKpi, removeMajorKpi, isMajorKpi };
}

import { supabase } from "./client";
import type { KpiEntry, UpsertEntry } from "@/types";

/** Alle KPI-Einträge für bestimmte Jahre laden */
export async function getKpisByYears(years: number[]): Promise<KpiEntry[]> {
  const { data, error } = await supabase
    .from("kpi_entries")
    .select("*")
    .in("year", years);

  if (error) throw error;
  return data ?? [];
}

/** Notiz für ein Jahr laden */
export async function getNoteByYear(year: number): Promise<string | null> {
  const { data, error } = await supabase
    .from("year_notes")
    .select("note")
    .eq("year", year)
    .maybeSingle();

  if (error) throw error;
  return data?.note ?? null;
}

/** Alle verfügbaren Jahre laden (für Tabs) */
export async function getAvailableYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from("kpi_entries")
    .select("year")
    .order("year", { ascending: false });

  if (error) throw error;

  const years = [...new Set((data ?? []).map((row) => row.year))];
  return years.sort((a, b) => b - a);
}

/** KPI-Werte für ein Jahr upserten (Batch) */
export async function upsertKpis(entries: UpsertEntry[]): Promise<void> {
  if (entries.length === 0) return;

  const { error } = await supabase
    .from("kpi_entries")
    .upsert(entries, { onConflict: "year,metric_key" });

  if (error) throw error;
}

/** KPI-Werte löschen (geleerte Felder) */
export async function deleteKpis(
  year: number,
  metricKeys: string[]
): Promise<void> {
  if (metricKeys.length === 0) return;

  const { error } = await supabase
    .from("kpi_entries")
    .delete()
    .eq("year", year)
    .in("metric_key", metricKeys);

  if (error) throw error;
}

/** Notiz für ein Jahr upserten */
export async function upsertNote(year: number, note: string): Promise<void> {
  const { error } = await supabase
    .from("year_notes")
    .upsert({ year, note }, { onConflict: "year" });

  if (error) throw error;
}

/** Major-KPI-Keys des aktuellen Users laden */
export async function getMajorKpiKeys(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("major_kpi_keys")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];

  const keys = data.major_kpi_keys;
  return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === "string") : [];
}

/** Major-KPI-Keys des aktuellen Users speichern */
export async function saveMajorKpiKeys(userId: string, keys: string[]): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, major_kpi_keys: keys },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

/** Ausgeblendete KPI-Keys des aktuellen Users laden */
export async function getHiddenKpiKeys(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("hidden_kpi_keys")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];

  const keys = data.hidden_kpi_keys;
  return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === "string") : [];
}

/** Ausgeblendete KPI-Keys des aktuellen Users speichern */
export async function saveHiddenKpiKeys(userId: string, keys: string[]): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, hidden_kpi_keys: keys },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

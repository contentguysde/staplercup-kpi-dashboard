/** Datenbank-Zeile aus kpi_entries */
export interface KpiEntry {
  id: string;
  year: number;
  metric_key: string;
  value: number;
  created_at: string;
  updated_at: string;
}

/** Datenbank-Zeile aus year_notes */
export interface YearNote {
  id: string;
  year: number;
  note: string;
  created_at: string;
  updated_at: string;
}

/** KPI-Daten für ein Jahr (aufbereitet für das Dashboard) */
export interface YearKpiData {
  year: number;
  entries: Record<string, number | null>;
  note: string | null;
}

/** Year-over-Year Berechnung */
export interface YoYResult {
  absolute: number | null;
  percentage: number | null;
}

/** Metrik-Konfiguration (für UI-Rendering) */
export interface MetricConfig {
  key: string;
  label: string;
  sublabel?: string;
  icon: string;
  category: MetricCategory;
  isComputed?: boolean;
}

/** Metrik-Kategorien */
export type MetricCategory = "social_media" | "reichweite" | "events";

/** Kanal-Definition (für Kanäle-Ansicht) */
export interface ChannelDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  metricKeys: string[];
  primaryMetricKey: string;
  secondaryMetricKey?: string;
}

/** Upsert-Payload für Supabase */
export interface UpsertEntry {
  year: number;
  metric_key: string;
  value: number;
}

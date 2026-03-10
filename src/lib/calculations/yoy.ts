import type { YoYResult } from "@/types";

/** Berechnet die Year-over-Year Veraenderung */
export function calculateYoY(
  currentValue: number | null,
  previousValue: number | null
): YoYResult {
  if (currentValue === null || previousValue === null) {
    return { absolute: null, percentage: null };
  }

  const absolute = currentValue - previousValue;

  // Division durch 0: wenn Vorjahreswert 0 ist
  const percentage =
    previousValue === 0 ? null : (absolute / previousValue) * 100;

  return { absolute, percentage };
}

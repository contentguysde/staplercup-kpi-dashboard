/** Formatiert eine Zahl im deutschen Format (1.234.567) */
export function formatNumber(value: number | null): string {
  if (value === null) return "–";
  return value.toLocaleString("de-DE");
}

/** Formatiert eine prozentuale Veränderung (+12,3% oder -8,2%) */
export function formatPercentage(value: number | null): string {
  if (value === null) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/** Formatiert eine absolute Veränderung (+1.200 oder -500) */
export function formatChange(value: number | null): string {
  if (value === null) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("de-DE")}`;
}

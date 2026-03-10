"use client";

import { KpiCard } from "./kpi-card";
import { METRICS } from "@/lib/constants";
import type { YearKpiData } from "@/types";

interface KpiGridProps {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
}

export function KpiGrid({ currentYear, previousYear }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS.map((metric) => (
        <KpiCard
          key={metric.key}
          metric={metric}
          currentValue={currentYear.entries[metric.key] ?? null}
          previousValue={previousYear?.entries[metric.key] ?? null}
        />
      ))}
    </div>
  );
}

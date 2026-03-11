"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableKpiCard } from "./draggable-kpi-card";
import { METRICS } from "@/lib/constants";
import type { YearKpiData } from "@/types";

interface KpiGridProps {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  majorKpiKeys?: string[];
}

export function KpiGrid({ currentYear, previousYear, majorKpiKeys = [] }: KpiGridProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "main-grid-zone" });
  const filteredMetrics = METRICS.filter((m) => !majorKpiKeys.includes(m.key));

  return (
    <div
      ref={setNodeRef}
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-lg transition-colors ${
        isOver ? "ring-2 ring-primary/30 bg-primary/[0.02]" : ""
      }`}
    >
      {filteredMetrics.map((metric) => (
        <DraggableKpiCard
          key={metric.key}
          metric={metric}
          currentValue={currentYear.entries[metric.key] ?? null}
          previousValue={previousYear?.entries[metric.key] ?? null}
          source="grid"
        />
      ))}
    </div>
  );
}

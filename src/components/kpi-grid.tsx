"use client";

import { useState } from "react";
import { DraggableKpiCard, type DragData } from "./draggable-kpi-card";
import { METRICS } from "@/lib/constants";
import type { YearKpiData } from "@/types";

interface KpiGridProps {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  majorKpiKeys?: string[];
  onDrop?: (data: DragData) => void;
}

export function KpiGrid({ currentYear, previousYear, majorKpiKeys = [], onDrop }: KpiGridProps) {
  const [isOver, setIsOver] = useState(false);
  const filteredMetrics = METRICS.filter((m) => !majorKpiKeys.includes(m.key));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
      onDrop?.(data);
    } catch {
      // Ungültige Drag-Daten ignorieren
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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

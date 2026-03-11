"use client";

import { useState } from "react";
import { KpiCard } from "./kpi-card";
import type { MetricConfig } from "@/types";

export interface DragData {
  metricKey: string;
  source: "grid" | "major";
}

interface DraggableKpiCardProps {
  metric: MetricConfig;
  currentValue: number | null;
  previousValue: number | null;
  source: "grid" | "major";
  onRemove?: () => void;
}

export function DraggableKpiCard({
  metric,
  currentValue,
  previousValue,
  source,
  onRemove,
}: DraggableKpiCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    const data: DragData = { metricKey: metric.key, source };
    e.dataTransfer.setData("application/json", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <KpiCard
        metric={metric}
        currentValue={currentValue}
        previousValue={previousValue}
        isDragging={isDragging}
        showDragHandle
        onRemove={onRemove}
      />
    </div>
  );
}

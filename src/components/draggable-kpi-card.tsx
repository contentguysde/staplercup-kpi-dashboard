"use client";

import { useDraggable } from "@dnd-kit/core";
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${source}-${metric.key}`,
    data: { metricKey: metric.key, source } satisfies DragData,
  });

  return (
    <div ref={setNodeRef} {...attributes}>
      <KpiCard
        metric={metric}
        currentValue={currentValue}
        previousValue={previousValue}
        isDragging={isDragging}
        showDragHandle
        dragHandleProps={listeners}
        onRemove={onRemove}
      />
    </div>
  );
}

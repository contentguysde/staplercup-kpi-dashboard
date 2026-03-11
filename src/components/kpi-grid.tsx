"use client";

import { useState } from "react";
import { DraggableKpiCard, type DragData } from "./draggable-kpi-card";
import { DroppableKpiSlot } from "./droppable-kpi-slot";
import { METRICS } from "@/lib/constants";
import { Plus } from "lucide-react";
import type { YearKpiData } from "@/types";

interface KpiGridProps {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  majorKpiKeys?: string[];
  hiddenKpiKeys?: string[];
  gridKpiOrder?: string[] | null;
  onDrop?: (data: DragData) => void;
  onRemove?: (key: string) => void;
  onAddClick?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function KpiGrid({
  currentYear,
  previousYear,
  majorKpiKeys = [],
  hiddenKpiKeys = [],
  gridKpiOrder,
  onDrop,
  onRemove,
  onAddClick,
  onReorder,
}: KpiGridProps) {
  const [isOver, setIsOver] = useState(false);

  // Reihenfolge: benutzerdefiniert oder Standard
  const baseOrder = gridKpiOrder ?? METRICS.map((m) => m.key);
  const filteredKeys = baseOrder.filter(
    (key) => !majorKpiKeys.includes(key) && !hiddenKpiKeys.includes(key)
  );

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

  const handleSlotDrop = (data: DragData, targetIndex: number) => {
    if (data.source === "grid") {
      onReorder?.(data.sourceIndex, targetIndex);
    } else {
      onDrop?.(data);
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
      {filteredKeys.map((key, idx) => {
        const metric = METRICS.find((m) => m.key === key);
        if (!metric) return null;
        return (
          <DroppableKpiSlot
            key={key}
            index={idx}
            section="grid"
            onReorder={handleSlotDrop}
          >
            <DraggableKpiCard
              metric={metric}
              currentValue={currentYear.entries[key] ?? null}
              previousValue={previousYear?.entries[key] ?? null}
              source="grid"
              index={idx}
              onRemove={onRemove ? () => onRemove(key) : undefined}
            />
          </DroppableKpiSlot>
        );
      })}

      {onAddClick && hiddenKpiKeys.length > 0 && (
        <button
          onClick={onAddClick}
          className="flex min-h-[140px] items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <span className="text-sm">KPI hinzufügen</span>
          </div>
        </button>
      )}
    </div>
  );
}

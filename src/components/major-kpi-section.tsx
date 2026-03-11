"use client";

import { useState } from "react";
import { METRICS } from "@/lib/constants";
import { DraggableKpiCard, type DragData } from "./draggable-kpi-card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import type { YearKpiData } from "@/types";

interface MajorKpiSectionProps {
  majorKpiKeys: string[];
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
  onRemove: (key: string) => void;
  onDrop?: (data: DragData) => void;
  isDragActive?: boolean;
}

export function MajorKpiSection({
  majorKpiKeys,
  currentYear,
  previousYear,
  onRemove,
  onDrop,
  isDragActive = false,
}: MajorKpiSectionProps) {
  const [isOver, setIsOver] = useState(false);

  const hasMajorKpis = majorKpiKeys.length > 0;
  const showSection = hasMajorKpis || isDragActive;

  if (!showSection) return null;

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
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 p-4 transition-colors ${
          isOver
            ? "border-primary bg-primary/5"
            : hasMajorKpis
              ? "border-primary/20 bg-primary/[0.02]"
              : "border-dashed border-muted-foreground/30"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Wichtige KPIs</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Per Drag & Drop verwalten
          </p>
        </div>

        {hasMajorKpis ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {majorKpiKeys.map((key) => {
              const metric = METRICS.find((m) => m.key === key);
              if (!metric) return null;
              return (
                <DraggableKpiCard
                  key={key}
                  metric={metric}
                  currentValue={currentYear.entries[key] ?? null}
                  previousValue={previousYear?.entries[key] ?? null}
                  source="major"
                  onRemove={() => onRemove(key)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 p-8">
            <p className="text-sm text-muted-foreground">
              Hierher ziehen, um als wichtig zu markieren
            </p>
          </div>
        )}
      </div>
      {hasMajorKpis && <Separator />}
    </>
  );
}

"use client";

import { useState, useCallback, useRef } from "react";
import type { DragData } from "./draggable-kpi-card";

interface DroppableKpiSlotProps {
  metricKey: string;
  section: "grid" | "major";
  onReorder: (data: DragData, targetKey: string, position: "before" | "after") => void;
  children: React.ReactNode;
}

export function DroppableKpiSlot({
  metricKey,
  section,
  onReorder,
  children,
}: DroppableKpiSlotProps) {
  const [insertPosition, setInsertPosition] = useState<"before" | "after" | null>(null);
  const positionRef = useRef<"before" | "after">("before");

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const pos = e.clientX < midX ? "before" : "after";
      positionRef.current = pos;
      setInsertPosition(pos);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setInsertPosition(null);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = positionRef.current;
      setInsertPosition(null);

      try {
        const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));

        // Auf sich selbst droppen ignorieren
        if (data.metricKey === metricKey) return;

        onReorder(data, metricKey, pos);
      } catch {
        // Ungültige Drag-Daten ignorieren
      }
    },
    [metricKey, onReorder]
  );

  return (
    <div
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {insertPosition === "before" && (
        <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-primary z-10" />
      )}
      {children}
      {insertPosition === "after" && (
        <div className="absolute -right-2 top-0 bottom-0 w-1 rounded-full bg-primary z-10" />
      )}
    </div>
  );
}

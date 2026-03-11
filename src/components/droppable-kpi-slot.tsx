"use client";

import { useState, useCallback } from "react";
import type { DragData } from "./draggable-kpi-card";

interface DroppableKpiSlotProps {
  index: number;
  section: "grid" | "major";
  onReorder: (data: DragData, targetIndex: number) => void;
  children: React.ReactNode;
}

export function DroppableKpiSlot({
  index,
  section,
  onReorder,
  children,
}: DroppableKpiSlotProps) {
  const [insertPosition, setInsertPosition] = useState<"before" | "after" | null>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      setInsertPosition(e.clientX < midX ? "before" : "after");
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
      setInsertPosition(null);

      try {
        const data: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
        const targetIndex = insertPosition === "after" ? index + 1 : index;

        // Gleiche Sektion → Reorder, nur wenn Position sich ändert
        if (data.source === section) {
          const adjustedTarget = data.sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
          if (adjustedTarget !== data.sourceIndex) {
            onReorder(data, adjustedTarget);
          }
        } else {
          // Cross-Section → an bestimmter Position einfügen
          onReorder(data, targetIndex);
        }
      } catch {
        // Ungültige Drag-Daten ignorieren
      }
    },
    [index, section, insertPosition, onReorder]
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

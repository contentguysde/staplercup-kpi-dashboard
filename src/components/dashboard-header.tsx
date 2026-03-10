"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface DashboardHeaderProps {
  onEditClick: () => void;
}

export function DashboardHeader({ onEditClick }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          StaplerCup KPI-Dashboard
        </h1>
        <p className="text-muted-foreground">
          Marketing-Metriken im Jahresvergleich
        </p>
      </div>
      <Button onClick={onEditClick} variant="outline">
        <Pencil className="mr-2 h-4 w-4" />
        Daten bearbeiten
      </Button>
    </div>
  );
}

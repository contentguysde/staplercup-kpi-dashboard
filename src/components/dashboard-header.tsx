"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface DashboardHeaderProps {
  onEditClick: () => void;
}

export function DashboardHeader({ onEditClick }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/staplercup-logo.svg"
          alt="StaplerCup Logo"
          width={160}
          height={125}
          priority
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            KPI-Dashboard
          </h1>
          <p className="text-muted-foreground">
            Marketing-Metriken im Jahresvergleich
          </p>
        </div>
      </div>
      <Button onClick={onEditClick} variant="outline">
        <Pencil className="mr-2 h-4 w-4" />
        Daten bearbeiten
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useKpiData } from "@/hooks/use-kpi-data";
import { DashboardHeader } from "./dashboard-header";
import { YearSelector } from "./year-selector";
import { KpiGrid } from "./kpi-grid";
import { KpiCharts } from "./kpi-charts";
import { YearNotes } from "./year-notes";
import { DataEntryDialog } from "./data-entry-dialog";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, LayoutDashboard, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "dashboard" | "charts";

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const { data, isLoading, isError, refetch } = useKpiData(selectedYear);

  const hasData =
    data &&
    Object.keys(data.currentYear.entries).some(
      (k) =>
        k !== "social_media_followers_total" &&
        data.currentYear.entries[k] !== null
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <DashboardHeader onEditClick={() => setIsDialogOpen(true)} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {viewMode === "dashboard" ? (
          <YearSelector
            selectedYear={selectedYear}
            availableYears={data?.availableYears ?? []}
            onYearChange={setSelectedYear}
          />
        ) : (
          <div />
        )}

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1.5">
              <LineChart className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "dashboard" && (
        <>
          {isLoading && <DashboardSkeleton />}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive font-medium">
                Fehler beim Laden der Daten.
              </p>
              <Button variant="outline" onClick={refetch}>
                Erneut versuchen
              </Button>
            </div>
          )}

          {!isLoading && !isError && !hasData && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
              <p className="text-lg font-medium text-muted-foreground">
                Keine Daten für {selectedYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Klicke auf &quot;Daten bearbeiten&quot;, um KPIs zu erfassen.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Daten erfassen
              </Button>
            </div>
          )}

          {!isLoading && !isError && hasData && data && (
            <>
              <KpiGrid
                currentYear={data.currentYear}
                previousYear={data.previousYear}
              />
              <YearNotes year={selectedYear} note={data.currentYear.note} />
            </>
          )}
        </>
      )}

      {viewMode === "charts" && <KpiCharts />}

      <DataEntryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        year={selectedYear}
        currentData={data?.currentYear ?? null}
        onSaved={refetch}
      />
    </div>
  );
}

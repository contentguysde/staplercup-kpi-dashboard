"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useKpiData } from "@/hooks/use-kpi-data";
import { useMajorKpis } from "@/hooks/use-major-kpis";
import { useHiddenKpis } from "@/hooks/use-hidden-kpis";
import { DashboardHeader } from "./dashboard-header";
import { YearSelector } from "./year-selector";
import { KpiGrid } from "./kpi-grid";
import { KpiCharts } from "./kpi-charts";
import { ChannelGrid } from "./channel-grid";
import { MajorKpiSection } from "./major-kpi-section";
import { KpiVisibilityDialog } from "./kpi-visibility-dialog";
import { YearNotes } from "./year-notes";
import { DataEntryDialog } from "./data-entry-dialog";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, LayoutDashboard, Layers, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DragData } from "./draggable-kpi-card";

type ViewMode = "dashboard" | "channels" | "charts";

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const { data, isLoading, isError, refetch } = useKpiData(selectedYear);
  const { user, role, signOut } = useAuth();
  const { majorKpiKeys, addMajorKpi, removeMajorKpi } = useMajorKpis();
  const { hiddenKpiKeys, hideKpi, showKpi } = useHiddenKpis();
  const router = useRouter();

  const isAdmin = role === "admin";
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragStartCapture = useCallback(() => {
    setIsDragActive(true);
  }, []);

  const handleDragEndCapture = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleMajorDrop = (dragData: DragData) => {
    setIsDragActive(false);
    if (dragData.source === "grid") {
      addMajorKpi(dragData.metricKey);
    }
  };

  const handleGridDrop = (dragData: DragData) => {
    setIsDragActive(false);
    if (dragData.source === "major") {
      removeMajorKpi(dragData.metricKey);
    }
  };

  const handleHideKpi = useCallback(
    (key: string) => {
      hideKpi(key);
      if (majorKpiKeys.includes(key)) {
        removeMajorKpi(key);
      }
    },
    [hideKpi, majorKpiKeys, removeMajorKpi]
  );

  const handleVisibilityToggle = useCallback(
    (key: string) => {
      if (hiddenKpiKeys.includes(key)) {
        showKpi(key);
      } else {
        hideKpi(key);
        if (majorKpiKeys.includes(key)) {
          removeMajorKpi(key);
        }
      }
    },
    [hiddenKpiKeys, hideKpi, showKpi, majorKpiKeys, removeMajorKpi]
  );

  const hasData =
    data &&
    Object.keys(data.currentYear.entries).some(
      (k) =>
        k !== "social_media_followers_total" &&
        data.currentYear.entries[k] !== null
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <DashboardHeader
        onEditClick={() => setIsDialogOpen(true)}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        userEmail={user?.email ?? ""}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {viewMode !== "charts" ? (
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
            <TabsTrigger value="channels" className="gap-1.5">
              <Layers className="h-4 w-4" />
              Kanäle
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
              {isAdmin && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Klicke auf &quot;Daten bearbeiten&quot;, um KPIs zu erfassen.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Daten erfassen
                  </Button>
                </>
              )}
            </div>
          )}

          {!isLoading && !isError && hasData && data && (
            <div
              onDragStartCapture={handleDragStartCapture}
              onDragEndCapture={handleDragEndCapture}
              className="space-y-6"
            >
              <MajorKpiSection
                majorKpiKeys={majorKpiKeys}
                hiddenKpiKeys={hiddenKpiKeys}
                currentYear={data.currentYear}
                previousYear={data.previousYear}
                onRemove={removeMajorKpi}
                onDrop={handleMajorDrop}
                isDragActive={isDragActive}
              />
              <KpiGrid
                currentYear={data.currentYear}
                previousYear={data.previousYear}
                majorKpiKeys={majorKpiKeys}
                hiddenKpiKeys={hiddenKpiKeys}
                onDrop={handleGridDrop}
                onRemove={handleHideKpi}
                onAddClick={() => setIsVisibilityDialogOpen(true)}
              />
              <YearNotes year={selectedYear} note={data.currentYear.note} />
            </div>
          )}
        </>
      )}

      {viewMode === "channels" && (
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
            </div>
          )}

          {!isLoading && !isError && hasData && data && (
            <ChannelGrid
              currentYear={data.currentYear}
              previousYear={data.previousYear}
            />
          )}
        </>
      )}

      {viewMode === "charts" && <KpiCharts />}

      {isAdmin && (
        <DataEntryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          year={selectedYear}
          currentData={data?.currentYear ?? null}
          onSaved={refetch}
        />
      )}

      <KpiVisibilityDialog
        open={isVisibilityDialogOpen}
        onOpenChange={setIsVisibilityDialogOpen}
        hiddenKpiKeys={hiddenKpiKeys}
        onToggle={handleVisibilityToggle}
      />
    </div>
  );
}

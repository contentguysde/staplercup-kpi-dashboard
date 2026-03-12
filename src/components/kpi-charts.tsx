"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTrendData, type TrendDataPoint } from "@/hooks/use-trend-data";
import { useHiddenTrends } from "@/hooks/use-hidden-trends";
import { METRICS, CHANNELS } from "@/lib/constants";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { TrendVisibilityDialog } from "./trend-visibility-dialog";
import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MetricConfig } from "@/types";

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

interface MetricGroup {
  id: string;
  label: string;
  metrics: MetricConfig[];
}

function useMetricGroups(): MetricGroup[] {
  return useMemo(() => {
    const channelMetricKeys = new Set(CHANNELS.flatMap((c) => c.metricKeys));
    const groups: MetricGroup[] = [];

    // Übergreifende Metriken (nicht in einem Kanal)
    const general = METRICS.filter((m) => !channelMetricKeys.has(m.key));
    if (general.length > 0) {
      groups.push({ id: "general", label: "Übergreifend", metrics: general });
    }

    // Pro Kanal
    for (const channel of CHANNELS) {
      const metrics = channel.metricKeys
        .map((key) => METRICS.find((m) => m.key === key))
        .filter((m): m is MetricConfig => m !== undefined);
      if (metrics.length > 0) {
        groups.push({ id: channel.id, label: channel.label, metrics });
      }
    }

    return groups;
  }, []);
}

function KpiChart({
  metric,
  data,
  onRemove,
}: {
  metric: MetricConfig;
  data: TrendDataPoint[];
  onRemove?: () => void;
}) {
  const chartConfig: ChartConfig = {
    [metric.key]: {
      label: metric.label,
      color: "var(--primary)",
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground truncate">
            {metric.label}
          </CardTitle>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
              aria-label="Graph entfernen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatYAxis}
              width={45}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString("de-DE")
                      : "–"
                  }
                />
              }
            />
            <Line
              type="monotone"
              dataKey={metric.key}
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-primary)" }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AddChartCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="flex items-center justify-center cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors min-h-[232px]"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Graph hinzufügen</span>
      </div>
    </Card>
  );
}

export function KpiCharts() {
  const { data, isLoading, isError, refetch } = useTrendData();
  const { hiddenTrendKeys, hideChart, showChart, isHidden, initialized } = useHiddenTrends();
  const groups = useMetricGroups();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Prüfe ob Daten für eine Metrik vorhanden sind
  const hasData = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const metric of METRICS) {
      map.set(
        metric.key,
        data.some((d) => d[metric.key] !== null && d[metric.key] !== undefined)
      );
    }
    return map;
  }, [data]);

  if (isLoading || !initialized) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive font-medium">
          Fehler beim Laden der Trend-Daten.
        </p>
        <Button variant="outline" onClick={refetch}>
          Erneut versuchen
        </Button>
      </div>
    );
  }

  const handleToggle = (key: string) => {
    if (isHidden(key)) {
      showChart(key);
    } else {
      hideChart(key);
    }
  };

  // Prüfe ob es insgesamt versteckte Charts gibt
  const totalHidden = METRICS.filter((m) => isHidden(m.key)).length;

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => {
          const visibleCharts = group.metrics.filter(
            (m) => !isHidden(m.key) && hasData.get(m.key)
          );
          const hiddenInGroup = group.metrics.filter(
            (m) => isHidden(m.key) || !hasData.get(m.key)
          );

          // Gruppe ganz ausblenden wenn keine Charts sichtbar und keine versteckten
          if (visibleCharts.length === 0 && hiddenInGroup.length === 0) return null;

          return (
            <section key={group.id}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleCharts.map((m) => (
                  <KpiChart
                    key={m.key}
                    metric={m}
                    data={data}
                    onRemove={() => hideChart(m.key)}
                  />
                ))}
                {hiddenInGroup.length > 0 && (
                  <AddChartCard onClick={() => setDialogOpen(true)} />
                )}
              </div>
            </section>
          );
        })}

        {/* Globaler Hinzufügen-Button wenn alle Gruppen leer */}
        {totalHidden > 0 && groups.every((g) => g.metrics.every((m) => isHidden(m.key) || !hasData.get(m.key))) && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Graphen hinzufügen
            </Button>
          </div>
        )}
      </div>

      <TrendVisibilityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hiddenTrendKeys={hiddenTrendKeys}
        onToggle={handleToggle}
      />
    </>
  );
}

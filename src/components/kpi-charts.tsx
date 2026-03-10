"use client";

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
import { DashboardSkeleton } from "./dashboard-skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MetricConfig } from "@/types";

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

function KpiChart({
  metric,
  data,
}: {
  metric: MetricConfig;
  data: TrendDataPoint[];
}) {
  const chartConfig: ChartConfig = {
    [metric.key]: {
      label: metric.label,
      color: "var(--primary)",
    },
  };

  // Prüfe ob überhaupt Daten für diese Metrik vorhanden sind
  const hasData = data.some(
    (d) => d[metric.key] !== null && d[metric.key] !== undefined
  );

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
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

export function KpiCharts() {
  const { data, metrics, isLoading, isError, refetch } = useTrendData();

  if (isLoading) return <DashboardSkeleton />;

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {metrics.map((metric) => (
        <KpiChart key={metric.key} metric={metric} data={data} />
      ))}
    </div>
  );
}

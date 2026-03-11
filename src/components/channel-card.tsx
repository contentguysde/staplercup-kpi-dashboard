"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateYoY } from "@/lib/calculations/yoy";
import {
  formatNumber,
  formatChange,
  formatPercentage,
} from "@/lib/formatting/numbers";
import { CHANNEL_NOT_EXISTED, METRICS } from "@/lib/constants";
import type { ChannelDefinition, YearKpiData } from "@/types";
import {
  Users,
  Music,
  Camera,
  ThumbsUp,
  Play,
  Globe,
  Megaphone,
  Newspaper,
  Monitor,
  Mail,
  Eye,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Music,
  Camera,
  ThumbsUp,
  Play,
  Globe,
  Megaphone,
  Newspaper,
  Monitor,
  Mail,
  Eye,
  Share2,
};

interface ChannelCardProps {
  channel: ChannelDefinition;
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
}

function getValue(entries: Record<string, number | null>, key: string): number | null {
  const val = entries[key] ?? null;
  return val === CHANNEL_NOT_EXISTED ? null : val;
}

function isChannelNotExisted(entries: Record<string, number | null>, metricKeys: string[]): boolean {
  return metricKeys.every((key) => {
    const val = entries[key];
    return val === null || val === undefined || val === CHANNEL_NOT_EXISTED;
  });
}

function YoYBadge({ current, previous }: { current: number | null; previous: number | null }) {
  const yoy = calculateYoY(current, previous);
  if (yoy.absolute === null) return null;

  const isPositive = yoy.absolute > 0;
  const isNegative = yoy.absolute < 0;

  if (isPositive) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
        <span className="text-green-600 font-medium">
          {formatChange(yoy.absolute)}
        </span>
        {yoy.percentage !== null && (
          <span className="text-green-600">
            ({formatPercentage(yoy.percentage)})
          </span>
        )}
        <span className="text-muted-foreground ml-1">gg. Vorjahr</span>
      </div>
    );
  }

  if (isNegative) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
        <span className="text-red-600 font-medium">
          {formatChange(yoy.absolute)}
        </span>
        {yoy.percentage !== null && (
          <span className="text-red-600">
            ({formatPercentage(yoy.percentage)})
          </span>
        )}
        <span className="text-muted-foreground ml-1">gg. Vorjahr</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">Keine Veränderung</span>
    </div>
  );
}

function SubMetric({
  metricKey,
  currentEntries,
  previousEntries,
}: {
  metricKey: string;
  currentEntries: Record<string, number | null>;
  previousEntries: Record<string, number | null> | null;
}) {
  const metric = METRICS.find((m) => m.key === metricKey);
  if (!metric) return null;

  const Icon = ICON_MAP[metric.icon] ?? Users;
  const current = getValue(currentEntries, metricKey);
  const previous = previousEntries ? getValue(previousEntries, metricKey) : null;
  const yoy = calculateYoY(current, previous);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
        <p className="text-lg font-semibold tracking-tight">
          {current !== null ? formatNumber(current) : "—"}
        </p>
        {yoy.percentage !== null && (
          <p className={`text-xs font-medium ${yoy.absolute! > 0 ? "text-green-600" : yoy.absolute! < 0 ? "text-red-600" : "text-muted-foreground"}`}>
            {formatPercentage(yoy.percentage)}
          </p>
        )}
      </div>
    </div>
  );
}

export function ChannelCard({ channel, currentYear, previousYear }: ChannelCardProps) {
  const Icon = ICON_MAP[channel.icon] ?? Users;
  const notExisted = isChannelNotExisted(currentYear.entries, channel.metricKeys);

  const primaryMetric = METRICS.find((m) => m.key === channel.primaryMetricKey);
  const primaryCurrent = getValue(currentYear.entries, channel.primaryMetricKey);
  const primaryPrevious = previousYear
    ? getValue(previousYear.entries, channel.primaryMetricKey)
    : null;

  const secondaryMetric = channel.secondaryMetricKey
    ? METRICS.find((m) => m.key === channel.secondaryMetricKey)
    : null;
  const secondaryCurrent = channel.secondaryMetricKey
    ? getValue(currentYear.entries, channel.secondaryMetricKey)
    : null;
  const secondaryPrevious = channel.secondaryMetricKey && previousYear
    ? getValue(previousYear.entries, channel.secondaryMetricKey)
    : null;

  // Sub-Metriken: alle außer Primär- und Sekundär-Metrik
  const highlightedKeys = [channel.primaryMetricKey, channel.secondaryMetricKey].filter(Boolean);
  const subMetricKeys = channel.metricKeys.filter((k) => !highlightedKeys.includes(k));
  const hasSubMetrics = subMetricKeys.length > 0;

  return (
    <Card className={notExisted ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{channel.label}</CardTitle>
              <p className="text-xs text-muted-foreground">{channel.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notExisted ? (
          <div>
            <div className="text-3xl font-bold tracking-tight text-muted-foreground">—</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Kanal existierte noch nicht
            </Badge>
          </div>
        ) : (
          <>
            {/* Primär- und Sekundär-KPI */}
            <div className={secondaryMetric ? "grid grid-cols-2 gap-6" : ""}>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {primaryMetric?.label ?? channel.primaryMetricKey}
                </p>
                <div className="text-3xl font-bold tracking-tight">
                  {formatNumber(primaryCurrent)}
                </div>
                <div className="mt-1">
                  <YoYBadge current={primaryCurrent} previous={primaryPrevious} />
                </div>
              </div>
              {secondaryMetric && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {secondaryMetric.label}
                  </p>
                  <div className="text-3xl font-bold tracking-tight">
                    {formatNumber(secondaryCurrent)}
                  </div>
                  <div className="mt-1">
                    <YoYBadge current={secondaryCurrent} previous={secondaryPrevious} />
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Metriken */}
            {hasSubMetrics && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  {subMetricKeys.map((key) => (
                    <SubMetric
                      key={key}
                      metricKey={key}
                      currentEntries={currentYear.entries}
                      previousEntries={previousYear?.entries ?? null}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

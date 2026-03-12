"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateYoY } from "@/lib/calculations/yoy";
import {
  formatNumber,
  formatChange,
  formatPercentage,
} from "@/lib/formatting/numbers";
import { CHANNEL_NOT_EXISTED, METRIC_NOT_COLLECTED } from "@/lib/constants";
import type { MetricConfig } from "@/types";
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
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  GripVertical,
  X,
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
  Heart,
};

const SUBLABEL_COLORS: Record<string, string> = {
  "Aggregierte Kanal-Reichweiten": "border-blue-200 bg-blue-50/50 text-blue-700",
  "Aggregierte Impressions": "border-violet-200 bg-violet-50/50 text-violet-700",
  "Kanal-Einzelreichweite": "border-emerald-200 bg-emerald-50/50 text-emerald-700",
  "Aggregierte Reichweite (Mediadaten)": "border-amber-200 bg-amber-50/50 text-amber-700",
  "Absolute Anzahl": "border-slate-200 bg-slate-50/50 text-slate-700",
};

interface KpiCardProps {
  metric: MetricConfig;
  currentValue: number | null;
  previousValue: number | null;
  isDragging?: boolean;
  showDragHandle?: boolean;
  onRemove?: () => void;
}

export function KpiCard({
  metric,
  currentValue,
  previousValue,
  isDragging,
  showDragHandle,
  onRemove,
}: KpiCardProps) {
  const Icon = ICON_MAP[metric.icon] ?? Users;
  const channelNotExisted = currentValue === CHANNEL_NOT_EXISTED;
  const metricNotCollected = currentValue === METRIC_NOT_COLLECTED;
  const notRecorded = metric.isComputed && currentValue === null;

  // Für Berechnung: Sentinel-Werte wie null behandeln
  const isSentinel = channelNotExisted || metricNotCollected;
  const displayValue = isSentinel ? null : currentValue;
  const prevDisplayValue =
    previousValue === CHANNEL_NOT_EXISTED || previousValue === METRIC_NOT_COLLECTED
      ? null
      : previousValue;
  const yoy = calculateYoY(displayValue, prevDisplayValue);

  const hasYoY = yoy.absolute !== null;
  const isPositive = hasYoY && yoy.absolute! > 0;
  const isNegative = hasYoY && yoy.absolute! < 0;
  const isNeutral = hasYoY && yoy.absolute === 0;

  return (
    <Card className={`h-full ${channelNotExisted || metricNotCollected || notRecorded ? "opacity-60" : ""} ${isDragging ? "opacity-30" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {showDragHandle && (
            <span className="shrink-0 cursor-grab text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          <CardTitle className="text-sm font-medium text-muted-foreground truncate">
            {metric.label}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-foreground"
              aria-label="KPI entfernen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {channelNotExisted ? (
          <>
            <div className="text-3xl font-bold tracking-tight text-muted-foreground">
              —
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Kanal existierte noch nicht
            </Badge>
          </>
        ) : metricNotCollected ? (
          <>
            <div className="text-3xl font-bold tracking-tight text-muted-foreground">
              —
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Wurde noch nicht erhoben
            </Badge>
          </>
        ) : notRecorded ? (
          <>
            <div className="text-3xl font-bold tracking-tight text-muted-foreground">
              —
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Wurde nicht erfasst
            </Badge>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight">
              {formatNumber(displayValue)}
            </div>

            {metric.sublabel && (
              <Badge variant="outline" className={`mt-1 text-xs font-normal ${SUBLABEL_COLORS[metric.sublabel] ?? ""}`}>
                {metric.sublabel}
              </Badge>
            )}

            {hasYoY && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {isPositive && (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {formatChange(yoy.absolute)}
                    </span>
                    {yoy.percentage !== null && (
                      <span className="text-green-600">
                        ({formatPercentage(yoy.percentage)})
                      </span>
                    )}
                  </>
                )}
                {isNegative && (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">
                      {formatChange(yoy.absolute)}
                    </span>
                    {yoy.percentage !== null && (
                      <span className="text-red-600">
                        ({formatPercentage(yoy.percentage)})
                      </span>
                    )}
                  </>
                )}
                {isNeutral && (
                  <>
                    <Minus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Keine Veränderung</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">gg. Vorjahr</span>
              </div>
            )}

            {!hasYoY && previousValue === null && displayValue !== null && (
              <p className="mt-2 text-sm text-muted-foreground">
                Kein Vorjahresvergleich
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

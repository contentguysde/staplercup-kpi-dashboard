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
import { CHANNEL_NOT_EXISTED } from "@/lib/constants";
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

  // Für Berechnung: Sentinel-Wert wie null behandeln
  const displayValue = channelNotExisted ? null : currentValue;
  const prevDisplayValue =
    previousValue === CHANNEL_NOT_EXISTED ? null : previousValue;
  const yoy = calculateYoY(displayValue, prevDisplayValue);

  const hasYoY = yoy.absolute !== null;
  const isPositive = hasYoY && yoy.absolute! > 0;
  const isNegative = hasYoY && yoy.absolute! < 0;
  const isNeutral = hasYoY && yoy.absolute === 0;

  return (
    <Card className={`h-full ${channelNotExisted ? "opacity-60" : ""} ${isDragging ? "opacity-30" : ""}`}>
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
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight">
              {formatNumber(displayValue)}
            </div>

            {metric.sublabel && (
              <Badge variant="secondary" className="mt-1 text-xs">
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

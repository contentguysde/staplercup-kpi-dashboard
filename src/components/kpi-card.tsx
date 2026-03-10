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
};

interface KpiCardProps {
  metric: MetricConfig;
  currentValue: number | null;
  previousValue: number | null;
}

export function KpiCard({ metric, currentValue, previousValue }: KpiCardProps) {
  const Icon = ICON_MAP[metric.icon] ?? Users;
  const yoy = calculateYoY(currentValue, previousValue);

  const hasYoY = yoy.absolute !== null;
  const isPositive = hasYoY && yoy.absolute! > 0;
  const isNegative = hasYoY && yoy.absolute! < 0;
  const isNeutral = hasYoY && yoy.absolute === 0;

  return (
    <Card
      className={
        metric.isComputed
          ? "border-primary/20 bg-primary/5"
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {formatNumber(currentValue)}
        </div>

        {metric.isComputed && (
          <Badge variant="secondary" className="mt-1 text-xs">
            Automatisch berechnet
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
                <span className="text-muted-foreground">Keine Veraenderung</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">gg. Vorjahr</span>
          </div>
        )}

        {!hasYoY && previousValue === null && currentValue !== null && (
          <p className="mt-2 text-sm text-muted-foreground">
            Kein Vorjahresvergleich
          </p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { METRICS, CHANNELS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
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
  FileText,
  Layers,
  MessageCircle,
  Clock,
} from "lucide-react";
import type { MetricConfig } from "@/types";

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
  FileText,
  Layers,
  MessageCircle,
  Clock,
};

function useMetricGroups() {
  return useMemo(() => {
    const channelMetricKeys = new Set(CHANNELS.flatMap((c) => c.metricKeys));
    const groups: { label: string; metrics: MetricConfig[] }[] = [];

    // Übergreifende Metriken (nicht in einem Kanal)
    const general = METRICS.filter((m) => !channelMetricKeys.has(m.key));
    if (general.length > 0) {
      groups.push({ label: "Übergreifend", metrics: general });
    }

    // Pro Kanal
    for (const channel of CHANNELS) {
      const metrics = channel.metricKeys
        .map((key) => METRICS.find((m) => m.key === key))
        .filter((m): m is MetricConfig => m !== undefined);
      if (metrics.length > 0) {
        groups.push({ label: channel.label, metrics });
      }
    }

    return groups;
  }, []);
}

interface KpiVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hiddenKpiKeys: string[];
  onToggle: (key: string) => void;
}

export function KpiVisibilityDialog({
  open,
  onOpenChange,
  hiddenKpiKeys,
  onToggle,
}: KpiVisibilityDialogProps) {
  const groups = useMetricGroups();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KPI-Karten verwalten</DialogTitle>
          <DialogDescription>
            Wähle aus, welche KPIs im Dashboard angezeigt werden.
          </DialogDescription>
        </DialogHeader>

        <Accordion
          defaultValue={[groups[0]?.label]}
          className="w-full"
        >
          {groups.map((group) => (
            <AccordionItem key={group.label} value={group.label}>
              <AccordionTrigger className="text-sm font-semibold">
                {group.label}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({group.metrics.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y">
                  {group.metrics.map((metric) => {
                    const Icon = ICON_MAP[metric.icon] ?? Users;
                    const isVisible = !hiddenKpiKeys.includes(metric.key);

                    return (
                      <label
                        key={metric.key}
                        className="flex cursor-pointer items-center justify-between py-3 hover:bg-muted/50 transition-colors px-1 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <Switch
                          checked={isVisible}
                          onCheckedChange={() => onToggle(metric.key)}
                        />
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { METRICS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KPI-Karten verwalten</DialogTitle>
          <DialogDescription>
            Wähle aus, welche KPIs im Dashboard angezeigt werden.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 divide-y">
          {METRICS.map((metric) => {
            const Icon = ICON_MAP[metric.icon] ?? Users;
            const isVisible = !hiddenKpiKeys.includes(metric.key);

            return (
              <label
                key={metric.key}
                className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
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
      </DialogContent>
    </Dialog>
  );
}

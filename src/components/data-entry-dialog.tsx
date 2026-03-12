"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { upsertKpis, deleteKpis, upsertNote } from "@/lib/supabase/queries";
import {
  STORABLE_METRICS,
  CHANNELS,
  CHANNEL_NOT_EXISTED,
  METRIC_NOT_COLLECTED,
} from "@/lib/constants";
import { toast } from "sonner";
import type { MetricConfig, YearKpiData } from "@/types";

interface DataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  currentData: YearKpiData | null;
  onSaved: () => void;
}

interface MetricGroup {
  id: string;
  label: string;
  icon: string;
  metrics: MetricConfig[];
  isChannel: boolean;
}

/** Metriken nach Kanal gruppieren */
function useMetricGroups(): MetricGroup[] {
  return useMemo(() => {
    const channelMetricKeys = new Set(CHANNELS.flatMap((c) => c.metricKeys));
    const groups: MetricGroup[] = [];

    // Übergreifende Metriken (nicht in einem Kanal)
    const general = STORABLE_METRICS.filter((m) => !channelMetricKeys.has(m.key));
    if (general.length > 0) {
      groups.push({
        id: "general",
        label: "Übergreifend",
        icon: "Eye",
        metrics: general,
        isChannel: false,
      });
    }

    // Pro Kanal
    for (const channel of CHANNELS) {
      const metrics = channel.metricKeys
        .map((key) => STORABLE_METRICS.find((m) => m.key === key))
        .filter((m): m is MetricConfig => m !== undefined);
      if (metrics.length > 0) {
        groups.push({
          id: channel.id,
          label: channel.label,
          icon: channel.icon,
          metrics,
          isChannel: true,
        });
      }
    }

    return groups;
  }, []);
}

function MetricField({
  metric,
  isCollected,
  channelInactive,
  value,
  year,
  onValueChange,
  onToggleCollected,
}: {
  metric: MetricConfig;
  isCollected: boolean;
  channelInactive: boolean;
  value: string;
  year: number;
  onValueChange: (key: string, value: string) => void;
  onToggleCollected: (key: string, checked: boolean) => void;
}) {
  const disabled = channelInactive;
  const showInput = !channelInactive && isCollected;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={metric.key}
          className={disabled || !isCollected ? "text-muted-foreground" : ""}
        >
          {metric.label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {channelInactive
              ? "Kanal existierte nicht"
              : isCollected
                ? "Erhoben"
                : "Nicht erhoben"}
          </span>
          <Switch
            checked={!channelInactive && isCollected}
            disabled={channelInactive}
            onCheckedChange={(checked) => onToggleCollected(metric.key, checked)}
          />
        </div>
      </div>
      {showInput ? (
        <Input
          id={metric.key}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={value}
          onChange={(e) => onValueChange(metric.key, e.target.value)}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic py-2">
          {channelInactive
            ? `Kanal existierte in ${year} noch nicht`
            : `Wurde in ${year} noch nicht erhoben`}
        </p>
      )}
    </div>
  );
}

export function DataEntryDialog({
  open,
  onOpenChange,
  year,
  currentData,
  onSaved,
}: DataEntryDialogProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [channelActive, setChannelActive] = useState<Record<string, boolean>>({});
  const [metricCollected, setMetricCollected] = useState<Record<string, boolean>>({});
  const [noteValue, setNoteValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const groups = useMetricGroups();

  // Formular mit aktuellen Werten vorausfüllen
  useEffect(() => {
    if (!open) return;

    const values: Record<string, string> = {};
    const collected: Record<string, boolean> = {};
    const active: Record<string, boolean> = {};

    // Zuerst Channel-Aktiv-Status bestimmen
    for (const group of groups) {
      if (!group.isChannel) {
        active[group.id] = true;
        continue;
      }
      // Kanal ist inaktiv wenn ALLE Metriken CHANNEL_NOT_EXISTED sind
      const allNotExisted = group.metrics.every((m) => {
        const val = currentData?.entries[m.key];
        return val === CHANNEL_NOT_EXISTED;
      });
      // Kanal ist auch inaktiv wenn KEINE Metrik Daten hat
      const hasAnyData = group.metrics.some((m) => {
        const val = currentData?.entries[m.key];
        return val !== null && val !== undefined;
      });
      active[group.id] = hasAnyData ? !allNotExisted : true;
    }

    // Dann pro Metrik
    for (const metric of STORABLE_METRICS) {
      const val = currentData?.entries[metric.key];
      if (val === CHANNEL_NOT_EXISTED) {
        values[metric.key] = "";
        collected[metric.key] = false;
      } else if (val === METRIC_NOT_COLLECTED) {
        values[metric.key] = "";
        collected[metric.key] = false;
      } else {
        values[metric.key] = val !== null && val !== undefined ? String(val) : "";
        collected[metric.key] = true;
      }
    }

    setFormValues(values);
    setChannelActive(active);
    setMetricCollected(collected);
    setNoteValue(currentData?.note ?? "");
  }, [open, currentData, groups]);

  const handleValueChange = (key: string, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setFormValues((prev) => ({ ...prev, [key]: cleaned }));
  };

  const handleChannelToggle = (groupId: string, checked: boolean, metrics: MetricConfig[]) => {
    setChannelActive((prev) => ({ ...prev, [groupId]: checked }));
    if (!checked) {
      // Alle Metriken des Kanals leeren
      const newValues: Record<string, string> = {};
      const newCollected: Record<string, boolean> = {};
      for (const m of metrics) {
        newValues[m.key] = "";
        newCollected[m.key] = false;
      }
      setFormValues((prev) => ({ ...prev, ...newValues }));
      setMetricCollected((prev) => ({ ...prev, ...newCollected }));
    }
  };

  const handleCollectedToggle = (key: string, checked: boolean) => {
    setMetricCollected((prev) => ({ ...prev, [key]: checked }));
    if (!checked) {
      setFormValues((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toUpsert: { year: number; metric_key: string; value: number }[] = [];
      const toDelete: string[] = [];

      // Mapping: metric key → group id
      const metricToGroup = new Map<string, string>();
      for (const group of groups) {
        for (const m of group.metrics) {
          metricToGroup.set(m.key, group.id);
        }
      }

      for (const metric of STORABLE_METRICS) {
        const groupId = metricToGroup.get(metric.key);
        const isChannelActive = groupId ? (channelActive[groupId] ?? true) : true;

        if (!isChannelActive) {
          // Kanal existierte nicht
          toUpsert.push({
            year,
            metric_key: metric.key,
            value: CHANNEL_NOT_EXISTED,
          });
        } else if (!metricCollected[metric.key]) {
          // Metrik wurde nicht erhoben
          toUpsert.push({
            year,
            metric_key: metric.key,
            value: METRIC_NOT_COLLECTED,
          });
        } else {
          const val = formValues[metric.key];
          if (val && val.trim() !== "") {
            const numVal = parseInt(val, 10);
            if (!isNaN(numVal) && numVal >= 0) {
              toUpsert.push({
                year,
                metric_key: metric.key,
                value: numVal,
              });
            }
          } else {
            if (
              currentData?.entries[metric.key] !== null &&
              currentData?.entries[metric.key] !== undefined
            ) {
              toDelete.push(metric.key);
            }
          }
        }
      }

      await Promise.all([
        upsertKpis(toUpsert),
        deleteKpis(year, toDelete),
        upsertNote(year, noteValue),
      ]);

      toast.success(`Daten für ${year} gespeichert.`);
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setIsSaving(false);
    }
  };

  // Erste Gruppe (Übergreifend) standardmäßig geöffnet
  const defaultOpen = groups.length > 0 ? [groups[0].label] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daten bearbeiten — {year}</DialogTitle>
          <DialogDescription>
            KPI-Werte für das Jahr {year} eingeben oder bearbeiten. Leere
            Felder werden entfernt.
          </DialogDescription>
        </DialogHeader>

        <Accordion
          defaultValue={defaultOpen}
          className="w-full"
        >
          {groups.map((group) => {
            const isActive = channelActive[group.id] ?? true;

            return (
              <AccordionItem key={group.label} value={group.label}>
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex flex-1 items-center justify-between pr-2">
                    <div className="flex items-center gap-2">
                      {group.label}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({group.metrics.length})
                      </span>
                    </div>
                    {group.isChannel && (
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") e.stopPropagation();
                        }}
                      >
                        <span className="text-xs font-normal text-muted-foreground">
                          {isActive ? "Aktiv" : "Existierte nicht"}
                        </span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            handleChannelToggle(group.id, checked, group.metrics)
                          }
                        />
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {group.metrics.map((metric) => (
                      <MetricField
                        key={metric.key}
                        metric={metric}
                        isCollected={metricCollected[metric.key] ?? true}
                        channelInactive={group.isChannel && !isActive}
                        value={formValues[metric.key] ?? ""}
                        year={year}
                        onValueChange={handleValueChange}
                        onToggleCollected={handleCollectedToggle}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <Separator />

        <div className="space-y-1">
          <Label htmlFor="note">Notizen</Label>
          <Textarea
            id="note"
            placeholder="Notizen zu diesem Jahr..."
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Speichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

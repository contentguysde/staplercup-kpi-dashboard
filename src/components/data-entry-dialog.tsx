"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { upsertKpis, deleteKpis, upsertNote } from "@/lib/supabase/queries";
import { STORABLE_METRICS, CHANNEL_NOT_EXISTED } from "@/lib/constants";
import { toast } from "sonner";
import type { YearKpiData } from "@/types";

interface DataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  currentData: YearKpiData | null;
  onSaved: () => void;
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
  const [noteValue, setNoteValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Formular mit aktuellen Werten vorausfuellen
  useEffect(() => {
    if (!open) return;

    const values: Record<string, string> = {};
    const active: Record<string, boolean> = {};
    for (const metric of STORABLE_METRICS) {
      const val = currentData?.entries[metric.key];
      if (val === CHANNEL_NOT_EXISTED) {
        values[metric.key] = "";
        active[metric.key] = false;
      } else {
        values[metric.key] = val !== null && val !== undefined ? String(val) : "";
        active[metric.key] = true;
      }
    }
    setFormValues(values);
    setChannelActive(active);
    setNoteValue(currentData?.note ?? "");
  }, [open, currentData]);

  const handleValueChange = (key: string, value: string) => {
    // Nur Ziffern erlauben
    const cleaned = value.replace(/[^0-9]/g, "");
    setFormValues((prev) => ({ ...prev, [key]: cleaned }));
  };

  const handleToggle = (key: string, checked: boolean) => {
    setChannelActive((prev) => ({ ...prev, [key]: checked }));
    if (!checked) {
      setFormValues((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toUpsert: { year: number; metric_key: string; value: number }[] =
        [];
      const toDelete: string[] = [];

      for (const metric of STORABLE_METRICS) {
        if (!channelActive[metric.key]) {
          // Kanal existierte noch nicht — Sentinel-Wert speichern
          toUpsert.push({
            year,
            metric_key: metric.key,
            value: CHANNEL_NOT_EXISTED,
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
            // Feld ist leer — wenn vorher ein Wert da war, loeschen
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

      toast.success(`Daten fuer ${year} gespeichert.`);
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daten bearbeiten — {year}</DialogTitle>
          <DialogDescription>
            KPI-Werte fuer das Jahr {year} eingeben oder bearbeiten. Leere
            Felder werden entfernt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {STORABLE_METRICS.map((metric) => {
            const isActive = channelActive[metric.key] ?? true;
            return (
              <div key={metric.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={metric.key}
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {metric.label}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isActive ? "Aktiv" : "Existierte nicht"}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        handleToggle(metric.key, checked)
                      }
                    />
                  </div>
                </div>
                {isActive ? (
                  <Input
                    id={metric.key}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={formValues[metric.key] ?? ""}
                    onChange={(e) =>
                      handleValueChange(metric.key, e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Kanal existierte in {year} noch nicht
                  </p>
                )}
              </div>
            );
          })}

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

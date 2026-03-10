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
import { upsertKpis, deleteKpis, upsertNote } from "@/lib/supabase/queries";
import { STORABLE_METRICS } from "@/lib/constants";
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
  const [noteValue, setNoteValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Formular mit aktuellen Werten vorausfuellen
  useEffect(() => {
    if (!open) return;

    const values: Record<string, string> = {};
    for (const metric of STORABLE_METRICS) {
      const val = currentData?.entries[metric.key];
      values[metric.key] = val !== null && val !== undefined ? String(val) : "";
    }
    setFormValues(values);
    setNoteValue(currentData?.note ?? "");
  }, [open, currentData]);

  const handleValueChange = (key: string, value: string) => {
    // Nur Ziffern erlauben
    const cleaned = value.replace(/[^0-9]/g, "");
    setFormValues((prev) => ({ ...prev, [key]: cleaned }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toUpsert: { year: number; metric_key: string; value: number }[] =
        [];
      const toDelete: string[] = [];

      for (const metric of STORABLE_METRICS) {
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
          {STORABLE_METRICS.map((metric) => (
            <div key={metric.key} className="space-y-1">
              <Label htmlFor={metric.key}>{metric.label}</Label>
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
            </div>
          ))}

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

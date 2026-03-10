"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { upsertNote } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { StickyNote } from "lucide-react";

interface YearNotesProps {
  year: number;
  note: string | null;
}

export function YearNotes({ year, note }: YearNotesProps) {
  const [value, setValue] = useState(note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(note ?? "");

  // Reset wenn sich das Jahr aendert
  useEffect(() => {
    setValue(note ?? "");
    lastSavedRef.current = note ?? "";
  }, [year, note]);

  const saveNote = useCallback(
    async (text: string) => {
      if (text === lastSavedRef.current) return;
      setIsSaving(true);
      try {
        await upsertNote(year, text);
        lastSavedRef.current = text;
      } catch {
        toast.error("Notiz konnte nicht gespeichert werden.");
      } finally {
        setIsSaving(false);
      }
    },
    [year]
  );

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNote(newValue), 2000);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Notizen fuer {year}
        </CardTitle>
        {isSaving && (
          <span className="text-xs text-muted-foreground">Speichert...</span>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Notizen zu diesem Jahr hinzufuegen..."
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}

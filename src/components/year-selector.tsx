"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FIRST_YEAR } from "@/lib/constants";

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

export function YearSelector({
  selectedYear,
  availableYears,
  onYearChange,
}: YearSelectorProps) {
  // Zeige alle Jahre von FIRST_YEAR bis zum aktuellen oder hoechsten verfuegbaren Jahr
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(currentYear, ...availableYears);
  const years: number[] = [];
  for (let y = FIRST_YEAR; y <= maxYear; y++) {
    years.push(y);
  }

  return (
    <Tabs
      value={String(selectedYear)}
      onValueChange={(v) => onYearChange(Number(v))}
    >
      <TabsList>
        {years.map((year) => (
          <TabsTrigger key={year} value={String(year)}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

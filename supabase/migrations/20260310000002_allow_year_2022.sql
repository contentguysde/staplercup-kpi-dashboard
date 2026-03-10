-- Migration 002: Erlaube Jahr 2022 als Baseline-Jahr

ALTER TABLE kpi_entries DROP CONSTRAINT chk_kpi_entries_year;
ALTER TABLE kpi_entries ADD CONSTRAINT chk_kpi_entries_year CHECK (year >= 2022);

ALTER TABLE year_notes DROP CONSTRAINT chk_year_notes_year;
ALTER TABLE year_notes ADD CONSTRAINT chk_year_notes_year CHECK (year >= 2022);

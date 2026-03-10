-- Migration 003: Erlaube Sentinel-Wert -1 fuer "Kanal existierte noch nicht"

ALTER TABLE kpi_entries DROP CONSTRAINT chk_kpi_entries_value;
ALTER TABLE kpi_entries ADD CONSTRAINT chk_kpi_entries_value CHECK (value >= -1);

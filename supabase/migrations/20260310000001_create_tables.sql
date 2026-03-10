-- Migration 001: Create kpi_entries and year_notes tables

-- KPI-Eintraege: Ein Wert pro Metrik und Jahr
CREATE TABLE kpi_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER NOT NULL,
  metric_key  VARCHAR(100) NOT NULL,
  value       BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_kpi_entries_year_metric UNIQUE (year, metric_key),
  CONSTRAINT chk_kpi_entries_year CHECK (year >= 2023),
  CONSTRAINT chk_kpi_entries_value CHECK (value >= 0)
);

-- Notizen pro Jahr: Freitextfeld
CREATE TABLE year_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_year_notes_year UNIQUE (year),
  CONSTRAINT chk_year_notes_year CHECK (year >= 2023)
);

-- Trigger: updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kpi_entries_updated_at
  BEFORE UPDATE ON kpi_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_year_notes_updated_at
  BEFORE UPDATE ON year_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index fuer Trend-Charts (Phase 2)
CREATE INDEX idx_kpi_entries_metric_key ON kpi_entries (metric_key, year);

-- RLS aktivieren
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_notes ENABLE ROW LEVEL SECURITY;

-- MVP-Policies: Oeffentlicher Zugriff
CREATE POLICY "kpi_entries_select_public" ON kpi_entries FOR SELECT USING (true);
CREATE POLICY "kpi_entries_insert_public" ON kpi_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "kpi_entries_update_public" ON kpi_entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "kpi_entries_delete_public" ON kpi_entries FOR DELETE USING (true);

CREATE POLICY "year_notes_select_public" ON year_notes FOR SELECT USING (true);
CREATE POLICY "year_notes_insert_public" ON year_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "year_notes_update_public" ON year_notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "year_notes_delete_public" ON year_notes FOR DELETE USING (true);

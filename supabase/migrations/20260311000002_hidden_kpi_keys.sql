-- Migration 006: Spalte für ausgeblendete KPI-Karten
-- Ermöglicht es Usern, einzelne KPI-Karten vom Dashboard auszublenden

ALTER TABLE user_preferences
ADD COLUMN hidden_kpi_keys JSONB NOT NULL DEFAULT '[]'::jsonb;

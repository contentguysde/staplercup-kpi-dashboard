-- Migration 007: Spalte für benutzerdefinierte KPI-Grid-Reihenfolge
-- NULL = Standard-Reihenfolge aus METRICS-Array

ALTER TABLE user_preferences
ADD COLUMN grid_kpi_order JSONB DEFAULT NULL;

-- Spalten für Trend-Ansicht Sichtbarkeits-Präferenzen
ALTER TABLE user_preferences
  ADD COLUMN hidden_trend_keys JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN seen_trend_defaults JSONB DEFAULT '[]'::jsonb;

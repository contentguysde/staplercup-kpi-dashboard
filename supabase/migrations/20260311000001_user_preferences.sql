-- Migration 005: User Preferences für persistente Benutzereinstellungen
-- Speichert z.B. welche KPIs als "wichtig" markiert sind

CREATE TABLE user_preferences (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  major_kpi_keys  JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-Update für updated_at
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS aktivieren
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Jeder authentifizierte User darf seine eigenen Preferences lesen
CREATE POLICY "user_preferences_select_own"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Jeder authentifizierte User darf seine eigenen Preferences erstellen
CREATE POLICY "user_preferences_insert_own"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Jeder authentifizierte User darf seine eigenen Preferences aktualisieren
CREATE POLICY "user_preferences_update_own"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

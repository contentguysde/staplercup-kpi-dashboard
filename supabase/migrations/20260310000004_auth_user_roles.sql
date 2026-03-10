-- Migration 004: Benutzerrollen für Auth und rollenbasierte Zugriffskontrolle
-- Erstellt user_roles Tabelle und passt bestehende RLS-Policies an

-- ============================================================================
-- 1. Tabelle user_roles erstellen
-- ============================================================================

CREATE TABLE user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_roles_user_id UNIQUE (user_id),
  CONSTRAINT chk_user_roles_role CHECK (role IN ('admin', 'user'))
);

-- Index für schnelle Rollenabfragen
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

-- RLS aktivieren
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Jeder authentifizierte User kann seine eigene Rolle lesen
CREATE POLICY "user_roles_select_own"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Nur Service-Role darf Rollen schreiben (INSERT/UPDATE/DELETE)
-- Kein Policy für authenticated = kein Schreibzugriff über Client
-- Service-Role umgeht RLS automatisch

-- ============================================================================
-- 2. Hilfsfunktion: Prüft ob der aktuelle User ein Admin ist
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 3. Alte öffentliche Policies auf kpi_entries entfernen
-- ============================================================================

DROP POLICY IF EXISTS "kpi_entries_select_public" ON kpi_entries;
DROP POLICY IF EXISTS "kpi_entries_insert_public" ON kpi_entries;
DROP POLICY IF EXISTS "kpi_entries_update_public" ON kpi_entries;
DROP POLICY IF EXISTS "kpi_entries_delete_public" ON kpi_entries;

-- ============================================================================
-- 4. Neue Policies auf kpi_entries: Lesen für alle Auth-User, Schreiben nur Admins
-- ============================================================================

-- SELECT: Alle authentifizierten User dürfen lesen
CREATE POLICY "kpi_entries_select_authenticated"
  ON kpi_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Nur Admins
CREATE POLICY "kpi_entries_insert_admin"
  ON kpi_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: Nur Admins
CREATE POLICY "kpi_entries_update_admin"
  ON kpi_entries
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: Nur Admins
CREATE POLICY "kpi_entries_delete_admin"
  ON kpi_entries
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 5. Alte öffentliche Policies auf year_notes entfernen
-- ============================================================================

DROP POLICY IF EXISTS "year_notes_select_public" ON year_notes;
DROP POLICY IF EXISTS "year_notes_insert_public" ON year_notes;
DROP POLICY IF EXISTS "year_notes_update_public" ON year_notes;
DROP POLICY IF EXISTS "year_notes_delete_public" ON year_notes;

-- ============================================================================
-- 6. Neue Policies auf year_notes: Alle Auth-User dürfen lesen und schreiben
-- ============================================================================

-- SELECT: Alle authentifizierten User dürfen lesen
CREATE POLICY "year_notes_select_authenticated"
  ON year_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Alle authentifizierten User
CREATE POLICY "year_notes_insert_authenticated"
  ON year_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Alle authentifizierten User
CREATE POLICY "year_notes_update_authenticated"
  ON year_notes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Alle authentifizierten User
CREATE POLICY "year_notes_delete_authenticated"
  ON year_notes
  FOR DELETE
  TO authenticated
  USING (true);

# Datenbank-Schema: StaplerCup KPI-Dashboard

## 1. Datenbank-Wahl: Supabase (PostgreSQL)

Supabase mit PostgreSQL ist die richtige Wahl fuer dieses Projekt:

- **Managed PostgreSQL**: Kein DB-Admin noetig, automatische Backups, Monitoring im Dashboard
- **REST-API out of the box**: Supabase generiert automatisch eine REST-API (PostgREST) fuer alle Tabellen — kein separates Backend noetig
- **Row Level Security (RLS)**: Feingranulare Zugriffskontrolle direkt in der DB, vorbereitet fuer Phase 3 (Login/Auth)
- **Realtime**: Aenderungen koennen live an den Client gepusht werden (spaeter nuetzlich)
- **JS-Client**: `@supabase/supabase-js` integriert sich nahtlos mit Next.js/React
- **Free Tier**: 500 MB Speicher, 2 GB Transfer — mehr als ausreichend fuer diesen Use Case
- **PostgreSQL-Features**: BIGINT fuer grosse Zahlen, CHECK-Constraints, Indizes, JSONB falls spaeter noetig
- **Skalierbarkeit**: Nahtloser Upgrade-Pfad wenn das Projekt waechst

## 2. Schema-Design

### Design-Entscheidung: EAV (Entity-Attribute-Value) vs. breite Tabelle

Wir verwenden ein **EAV-aehnliches Modell** mit einer `kpi_entries`-Tabelle, in der jede Zeile eine einzelne Metrik fuer ein Jahr darstellt. Gruende:

- **Erweiterbarkeit**: Neue Metriken koennen ohne Schema-Migration hinzugefuegt werden
- **Flexibilitaet**: Nicht jede Metrik muss fuer jedes Jahr einen Wert haben
- **Einfache Queries**: `SELECT * FROM kpi_entries WHERE year = 2024` liefert alle KPIs eines Jahres
- **Keine Spalten-Explosion**: Bei einer breiten Tabelle wuerde jede neue Metrik eine ALTER TABLE erfordern

### Tabellen-Uebersicht

```
kpi_entries          year_notes
+--------------+     +--------------+
| id (UUID)    |     | id (UUID)    |
| year (INT)   |     | year (INT)   |
| metric_key   |     | note (TEXT)   |
| value (BIGINT)|    | created_at   |
| created_at   |     | updated_at   |
| updated_at   |     +--------------+
+--------------+
```

### Tabelle: `kpi_entries`

Speichert einen einzelnen KPI-Wert pro Metrik und Jahr.

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID | Primaerschluessel |
| `year` | INTEGER | Berichtsjahr (z.B. 2023, 2024) |
| `metric_key` | VARCHAR(100) | Metrik-Bezeichner (z.B. `tiktok_followers`) |
| `value` | BIGINT | Metrik-Wert (grosse Zahlen moeglich) |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |
| `updated_at` | TIMESTAMPTZ | Letzter Aenderungszeitpunkt |

**Constraints:**
- `UNIQUE(year, metric_key)` — maximal ein Wert pro Metrik und Jahr
- `CHECK(year >= 2023)` — keine Daten vor 2023
- `CHECK(value >= 0)` — keine negativen Werte

### Tabelle: `year_notes`

Speichert eine optionale Freitext-Notiz pro Jahr.

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID | Primaerschluessel |
| `year` | INTEGER | Berichtsjahr |
| `note` | TEXT | Freitext-Notiz zum Jahr |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |
| `updated_at` | TIMESTAMPTZ | Letzter Aenderungszeitpunkt |

**Constraints:**
- `UNIQUE(year)` — maximal eine Notiz pro Jahr
- `CHECK(year >= 2023)` — keine Daten vor 2023

### Gueltige `metric_key`-Werte (MVP)

| metric_key | Beschreibung |
|-----------|-------------|
| `tiktok_followers` | TikTok Follower |
| `instagram_followers` | Instagram Follower |
| `facebook_followers` | Facebook Follower |
| `youtube_subscribers` | YouTube Abonnenten |
| `website_visitors` | Website-Besucher (pro Jahr) |
| `social_media_ad_impressions` | Social Media Ad-Impressions |
| `pr_reach` | PR-Reichweite |
| `live_viewers` | Live-Zuschauer (Halle + Livestream) |
| `newsletter_subscribers` | Newsletter-Abonnenten |

> **Hinweis:** `social_media_followers_total` wird NICHT in der DB gespeichert. Dieser Wert wird clientseitig berechnet aus `tiktok_followers + instagram_followers + facebook_followers + youtube_subscribers`.

## 3. SQL-Migrationen

### Migration 001: Tabellen erstellen

```sql
-- ============================================
-- Migration 001: Create kpi_entries and year_notes tables
-- ============================================

-- UP

-- KPI-Eintraege: Ein Wert pro Metrik und Jahr
CREATE TABLE kpi_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER NOT NULL,
  metric_key  VARCHAR(100) NOT NULL,
  value       BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ein Wert pro Metrik und Jahr
  CONSTRAINT uq_kpi_entries_year_metric UNIQUE (year, metric_key),

  -- Keine Daten vor 2023
  CONSTRAINT chk_kpi_entries_year CHECK (year >= 2023),

  -- Keine negativen Werte
  CONSTRAINT chk_kpi_entries_value CHECK (value >= 0)
);

-- Notizen pro Jahr: Freitextfeld
CREATE TABLE year_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INTEGER NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Maximal eine Notiz pro Jahr
  CONSTRAINT uq_year_notes_year UNIQUE (year),

  -- Keine Daten vor 2023
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

-- DOWN

DROP TRIGGER IF EXISTS trg_year_notes_updated_at ON year_notes;
DROP TRIGGER IF EXISTS trg_kpi_entries_updated_at ON kpi_entries;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP TABLE IF EXISTS year_notes;
DROP TABLE IF EXISTS kpi_entries;
```

## 4. Indizes

```sql
-- ============================================
-- Indizes
-- ============================================

-- Primaerer Zugriffspfad: Alle KPIs eines Jahres laden
-- Der UNIQUE-Constraint auf (year, metric_key) erzeugt automatisch einen Index.
-- Dieser deckt die haeufigste Query ab:
--   SELECT * FROM kpi_entries WHERE year = 2024;
-- Kein zusaetzlicher Index noetig.

-- Lookup nach metric_key ueber alle Jahre (fuer Trend-Charts in Phase 2)
CREATE INDEX idx_kpi_entries_metric_key ON kpi_entries (metric_key, year);

-- year_notes: Der UNIQUE-Constraint auf (year) erzeugt automatisch einen Index.
-- Kein zusaetzlicher Index noetig.
```

### Index-Begruendung

| Index | Query-Pattern | Erstellt durch |
|-------|--------------|----------------|
| `uq_kpi_entries_year_metric` | `WHERE year = ?` und `WHERE year = ? AND metric_key = ?` | UNIQUE constraint (automatisch) |
| `idx_kpi_entries_metric_key` | `WHERE metric_key = ? ORDER BY year` (Trend-Charts) | Manuell |
| `uq_year_notes_year` | `WHERE year = ?` | UNIQUE constraint (automatisch) |

> **Hinweis:** Bei aktuell ~9 Metriken x ~3 Jahre = ~27 Zeilen in `kpi_entries` sind Indizes fuer Performance irrelevant. Sie sind dennoch angelegt, damit das Schema von Anfang an korrekt ist und bei wachsenden Datenmengen keine Migration noetig wird.

## 5. Row Level Security (RLS)

### MVP: Kein Auth — oeffentlicher Zugriff

Im MVP gibt es keine Authentifizierung. Supabase erfordert dennoch, dass RLS entweder deaktiviert oder eine Policy fuer den Zugriff definiert ist.

**Empfehlung:** RLS aktivieren, aber eine Policy fuer oeffentlichen Zugriff anlegen. So ist das Schema bereits vorbereitet fuer Phase 3 (Login), und die Policy muss nur angepasst (nicht nachgeruestet) werden.

```sql
-- ============================================
-- RLS: Row Level Security
-- ============================================

-- RLS aktivieren
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_notes ENABLE ROW LEVEL SECURITY;

-- MVP-Policy: Oeffentlicher Lese- und Schreibzugriff (anon + authenticated)
-- Diese Policies werden in Phase 3 durch rollenbasierte Policies ersetzt.

-- kpi_entries: Lesen
CREATE POLICY "kpi_entries_select_public"
  ON kpi_entries FOR SELECT
  USING (true);

-- kpi_entries: Einfuegen
CREATE POLICY "kpi_entries_insert_public"
  ON kpi_entries FOR INSERT
  WITH CHECK (true);

-- kpi_entries: Aktualisieren
CREATE POLICY "kpi_entries_update_public"
  ON kpi_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- kpi_entries: Loeschen
CREATE POLICY "kpi_entries_delete_public"
  ON kpi_entries FOR DELETE
  USING (true);

-- year_notes: Lesen
CREATE POLICY "year_notes_select_public"
  ON year_notes FOR SELECT
  USING (true);

-- year_notes: Einfuegen
CREATE POLICY "year_notes_insert_public"
  ON year_notes FOR INSERT
  WITH CHECK (true);

-- year_notes: Aktualisieren
CREATE POLICY "year_notes_update_public"
  ON year_notes FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- year_notes: Loeschen
CREATE POLICY "year_notes_delete_public"
  ON year_notes FOR DELETE
  USING (true);
```

### Spaeter (Phase 3 — mit Auth)

```sql
-- Beispiel: Nur authentifizierte Nutzer duerfen schreiben
-- DROP bestehende public Policies, dann:
CREATE POLICY "kpi_entries_select_authenticated"
  ON kpi_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "kpi_entries_modify_authenticated"
  ON kpi_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## 6. Seed-Daten

### Beispieldaten fuer 2023 und 2024

```sql
-- ============================================
-- Seed-Daten: Beispielwerte fuer Entwicklung und Demo
-- ============================================

-- 2023
INSERT INTO kpi_entries (year, metric_key, value) VALUES
  (2023, 'tiktok_followers',            0),          -- TikTok-Kanal gab es 2023 noch nicht
  (2023, 'instagram_followers',         8500),
  (2023, 'facebook_followers',          12000),
  (2023, 'youtube_subscribers',         3200),
  (2023, 'website_visitors',            45000),
  (2023, 'social_media_ad_impressions', 1200000),
  (2023, 'pr_reach',                    5000000),
  (2023, 'live_viewers',                15000),
  (2023, 'newsletter_subscribers',      2800);

-- 2024
INSERT INTO kpi_entries (year, metric_key, value) VALUES
  (2024, 'tiktok_followers',            4200),       -- TikTok-Kanal 2024 gestartet
  (2024, 'instagram_followers',         11300),
  (2024, 'facebook_followers',          12800),
  (2024, 'youtube_subscribers',         4100),
  (2024, 'website_visitors',            62000),
  (2024, 'social_media_ad_impressions', 1850000),
  (2024, 'pr_reach',                    7500000),
  (2024, 'live_viewers',                18500),
  (2024, 'newsletter_subscribers',      3400);

-- Notizen
INSERT INTO year_notes (year, note) VALUES
  (2023, 'Baseline-Jahr. Erste systematische Erfassung aller Marketing-KPIs. TikTok-Kanal existierte noch nicht.'),
  (2024, 'TikTok-Kanal im Maerz 2024 gestartet. Deutliches Wachstum bei Website-Besuchern durch neue SEO-Strategie. PR-Reichweite gestiegen durch Medienpartnerschaft mit Fachmagazin.');
```

### Berechnete Werte (zur Veranschaulichung)

| Metrik | 2023 | 2024 | Veraenderung | Prozent |
|--------|------|------|-------------|---------|
| Social Media Follower gesamt* | 23.700 | 32.400 | +8.700 | +36,7% |
| TikTok Follower | 0 | 4.200 | +4.200 | — |
| Instagram Follower | 8.500 | 11.300 | +2.800 | +32,9% |
| Facebook Follower | 12.000 | 12.800 | +800 | +6,7% |
| YouTube Abonnenten | 3.200 | 4.100 | +900 | +28,1% |
| Website-Besucher | 45.000 | 62.000 | +17.000 | +37,8% |
| Social Media Ad-Impressions | 1.200.000 | 1.850.000 | +650.000 | +54,2% |
| PR-Reichweite | 5.000.000 | 7.500.000 | +2.500.000 | +50,0% |
| Live-Zuschauer | 15.000 | 18.500 | +3.500 | +23,3% |
| Newsletter-Abonnenten | 2.800 | 3.400 | +600 | +21,4% |

*\*Clientseitig berechnet: TikTok + Instagram + Facebook + YouTube*

## Anhang: Haeufige Queries

### Alle KPIs eines Jahres laden (Dashboard)

```sql
SELECT metric_key, value
FROM kpi_entries
WHERE year = :year
ORDER BY metric_key;
```

### KPIs zweier Jahre laden (Jahresvergleich)

```sql
SELECT metric_key, year, value
FROM kpi_entries
WHERE year IN (:selected_year, :selected_year - 1)
ORDER BY metric_key, year;
```

### Notiz eines Jahres laden

```sql
SELECT note
FROM year_notes
WHERE year = :year;
```

### KPI upserten (Eingabeformular speichern)

```sql
INSERT INTO kpi_entries (year, metric_key, value)
VALUES (:year, :metric_key, :value)
ON CONFLICT (year, metric_key)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

### Notiz upserten

```sql
INSERT INTO year_notes (year, note)
VALUES (:year, :note)
ON CONFLICT (year)
DO UPDATE SET note = EXCLUDED.note, updated_at = NOW();
```

### Alle verfuegbaren Jahre laden (Jahresauswahl)

```sql
SELECT DISTINCT year
FROM kpi_entries
ORDER BY year DESC;
```

### Trend-Daten fuer eine Metrik (Phase 2: Charts)

```sql
SELECT year, value
FROM kpi_entries
WHERE metric_key = :metric_key
ORDER BY year ASC;
```

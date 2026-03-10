# ADR-002: Datenmodell

## Status
AKZEPTIERT

## Datum
2026-03-09

## Kontext

Das StaplerCup KPI-Dashboard speichert jaehrliche Marketing-Metriken (aktuell 9 Stueck) und Notizen pro Jahr. Die Datenstruktur muss:
- Neue Metriken ohne Schema-Migration unterstuetzen (Scope Creep ist laut PRD wahrscheinlich)
- Lueckenhafte Daten erlauben (nicht jede Metrik muss fuer jedes Jahr vorhanden sein)
- UPSERT-Operationen unterstuetzen (Daten koennen nachtraeglich geaendert werden)
- Eine automatisch berechnete Summe (Social Media Follower gesamt) ermoeglichen

## Entscheidung

### EAV-Pattern (Entity-Attribute-Value) mit zwei Tabellen

Wir verwenden ein EAV-aehnliches Modell mit `kpi_entries` und `year_notes`.

### Alternativen

#### Option A: Breite Tabelle (eine Spalte pro Metrik)
```
kpi_data(year, tiktok_followers, instagram_followers, facebook_followers, ...)
```
- Vorteile: Einfache Queries (`SELECT * FROM kpi_data WHERE year = 2024`), starke Typisierung pro Spalte
- Nachteile: Jede neue Metrik erfordert `ALTER TABLE`, bei 20+ Metriken wird die Tabelle unuebersichtlich, NULL-Werte fuer nicht-erfasste Metriken
- Aufwand: niedrig

#### Option B: EAV-Modell (gewaehlt)
```
kpi_entries(year, metric_key, value)
```
- Vorteile: Neue Metriken ohne Schema-Migration, flexible Luecken, einfaches UPSERT, erweiterbar
- Nachteile: Etwas komplexere Queries (Pivot noetig fuer Gesamtansicht), kein DB-Level-Typ pro Metrik
- Aufwand: niedrig

#### Option C: JSONB-Spalte
```
kpi_data(year, metrics JSONB)
```
- Vorteile: Maximale Flexibilitaet, ein Row pro Jahr
- Nachteile: Kein DB-Level-Constraint auf einzelne Werte, schwieriger zu indizieren, Supabase-Filterung weniger intuitiv
- Aufwand: niedrig

### Begruendung fuer EAV

Das PRD identifiziert "Scope Creep: Wunsch nach mehr Metriken" als Risiko mit hoher Wahrscheinlichkeit. Das EAV-Modell macht das Hinzufuegen neuer Metriken zu einer reinen Code-Aenderung (neuer `metric_key` im Frontend), ohne DB-Migration. Bei nur ~9 Metriken x ~5 Jahre = ~45 Zeilen ist die Performance-Differenz zu einer breiten Tabelle nicht messbar.

## Tabellen-Design

### Tabelle: `kpi_entries`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID (PK) | Primaerschluessel, automatisch generiert |
| `year` | INTEGER NOT NULL | Berichtsjahr (>= 2023) |
| `metric_key` | VARCHAR(100) NOT NULL | Metrik-Bezeichner (snake_case) |
| `value` | BIGINT NOT NULL | Metrik-Wert (>= 0) |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |
| `updated_at` | TIMESTAMPTZ | Letzter Aenderungszeitpunkt (Trigger) |

**Constraints:**
- `UNIQUE(year, metric_key)` — maximal ein Wert pro Metrik und Jahr
- `CHECK(year >= 2023)` — keine historischen Daten vor 2023
- `CHECK(value >= 0)` — keine negativen Werte

### Tabelle: `year_notes`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID (PK) | Primaerschluessel, automatisch generiert |
| `year` | INTEGER NOT NULL | Berichtsjahr (>= 2023) |
| `note` | TEXT NOT NULL DEFAULT '' | Freitext-Notiz |
| `created_at` | TIMESTAMPTZ | Erstellungszeitpunkt |
| `updated_at` | TIMESTAMPTZ | Letzter Aenderungszeitpunkt (Trigger) |

**Constraints:**
- `UNIQUE(year)` — maximal eine Notiz pro Jahr
- `CHECK(year >= 2023)` — konsistent mit `kpi_entries`

## Metric Keys — Konventionen

### Namensgebung
- Format: `snake_case`, englisch
- Muster: `[plattform]_[metrik]` (z.B. `tiktok_followers`)
- Maximal 100 Zeichen

### Gueltige Keys im MVP

| metric_key | UI-Label | Kategorie |
|-----------|----------|-----------|
| `tiktok_followers` | TikTok Follower | Social Media |
| `instagram_followers` | Instagram Follower | Social Media |
| `facebook_followers` | Facebook Follower | Social Media |
| `youtube_subscribers` | YouTube Abonnenten | Social Media |
| `website_visitors` | Website-Besucher | Reichweite |
| `social_media_ad_impressions` | Social Media Ad-Impressions | Reichweite |
| `pr_reach` | PR-Reichweite | Reichweite |
| `live_viewers` | Live-Zuschauer (Halle + Livestream) | Events |
| `newsletter_subscribers` | Newsletter-Abonnenten | Reichweite |

### Reservierter Key (NICHT in DB gespeichert)

| Key | Berechnung |
|-----|-----------|
| `social_media_followers_total` | Clientseitige Summe aus `tiktok_followers` + `instagram_followers` + `facebook_followers` + `youtube_subscribers` |

### Neue Metriken hinzufuegen (Anleitung)

Um eine neue Metrik hinzuzufuegen, ist KEINE DB-Migration noetig. Schritte:
1. Neuen `metric_key` in `src/lib/constants.ts` (METRIC_KEYS Array) definieren
2. UI-Label und Icon in der Metrik-Konfiguration ergaenzen
3. Eingabeformular erweitern (wird automatisch aus Konfiguration generiert)
4. Fertig — die DB akzeptiert jeden neuen `metric_key` automatisch

## Automatische Berechnung: social_media_followers_total

Die Gesamtzahl der Social-Media-Follower wird **clientseitig** berechnet und **nicht** in der Datenbank gespeichert.

### Begruendung
- Vermeidet Inkonsistenzen (berechneter Wert kann nicht von Einzelwerten abweichen)
- Kein Sync-Problem bei Aenderung einzelner Plattform-Werte
- Einfache Logik: `total = (tiktok ?? 0) + (instagram ?? 0) + (facebook ?? 0) + (youtube ?? 0)`
- `null`-Werte werden als `0` behandelt (ein fehlender Kanal reduziert nicht die Summe)

### TypeScript-Implementierung

```typescript
// src/lib/calculations/social-media-total.ts

const SOCIAL_MEDIA_KEYS = [
  'tiktok_followers',
  'instagram_followers',
  'facebook_followers',
  'youtube_subscribers',
] as const;

export function calculateSocialMediaTotal(
  entries: Record<string, number | null>
): number {
  return SOCIAL_MEDIA_KEYS.reduce((sum, key) => sum + (entries[key] ?? 0), 0);
}
```

## UPSERT-Strategie

Beim Speichern von KPI-Daten wird ein UPSERT verwendet: Wenn fuer `(year, metric_key)` bereits ein Eintrag existiert, wird der `value` aktualisiert. Andernfalls wird ein neuer Eintrag erstellt.

### Supabase-Client Implementierung

```typescript
// UPSERT fuer einen einzelnen KPI-Wert
const { error } = await supabase
  .from('kpi_entries')
  .upsert(
    { year, metric_key: metricKey, value },
    { onConflict: 'year,metric_key' }
  );

// UPSERT fuer eine Notiz
const { error } = await supabase
  .from('year_notes')
  .upsert(
    { year, note },
    { onConflict: 'year' }
  );
```

### Batch-UPSERT (Formular speichern)

Beim Speichern des Eingabeformulars werden alle Metriken eines Jahres gleichzeitig geupsertet:

```typescript
// Alle Metriken eines Jahres als Array
const entries = Object.entries(formData)
  .filter(([key]) => METRIC_KEYS.includes(key))
  .filter(([_, value]) => value !== null && value !== undefined)
  .map(([metric_key, value]) => ({
    year,
    metric_key,
    value: Number(value),
  }));

const { error } = await supabase
  .from('kpi_entries')
  .upsert(entries, { onConflict: 'year,metric_key' });
```

### Leere Felder

Wenn ein Feld im Formular geleert wird (Metrik entfernen), wird der entsprechende Eintrag aus der DB geloescht:

```typescript
const emptyKeys = Object.entries(formData)
  .filter(([_, value]) => value === null || value === '')
  .map(([key]) => key);

if (emptyKeys.length > 0) {
  await supabase
    .from('kpi_entries')
    .delete()
    .eq('year', year)
    .in('metric_key', emptyKeys);
}
```

## Konsequenzen

### Positiv
- Neue Metriken ohne DB-Migration hinzufuegbar
- Lueckenhafte Daten sind natuerlich abgebildet (kein NULL in breiter Tabelle)
- UPSERT-Pattern ist einfach und robust
- Social Media Total kann nie inkonsistent zur DB sein (da berechnet)
- Schema ist vorbereitet fuer Phase-2-Features (Trend-Charts, Filter nach Kategorie)

### Negativ
- Pivot-Query noetig um alle Metriken eines Jahres als "flaches Objekt" zu bekommen
- Kein DB-Level-Constraint welche `metric_key`-Werte gueltig sind (Validierung im Code)
- BIGINT fuer alle Werte — keine Dezimalzahlen auf DB-Ebene (lt. PRD nur Ganzzahlen)

### Risiken
- Tippfehler in `metric_key` fuehren zu verwaisten Eintraegen → Mitigation: Konstanten-Array im Code, Zod-Validierung
- Bei sehr vielen Metriken (>50) wuerde die EAV-Abfrage langsamer → Irrelevant fuer diesen Use Case

# Architektur: StaplerCup KPI-Dashboard

## 1. System-Uebersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js App (React)                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │  │Dashboard│  │Jahres-   │  │Dateneingabe-Dialog  │  │  │
│  │  │  Page   │  │auswahl   │  │(Modal)              │  │  │
│  │  │(Server) │  │(Client)  │  │(Client)             │  │  │
│  │  └────┬────┘  └────┬─────┘  └──────────┬──────────┘  │  │
│  │       │             │                   │              │  │
│  │  ┌────▼─────────────▼───────────────────▼──────────┐  │  │
│  │  │           Supabase Client SDK                   │  │  │
│  │  │        (@supabase/supabase-js)                  │  │  │
│  │  └─────────────────────┬───────────────────────────┘  │  │
│  └────────────────────────┼──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS (REST API)
                            │ Anon Key + RLS
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    Supabase Cloud                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  PostgREST   │  │  PostgreSQL  │  │  Row Level Security  │ │
│  │  (Auto-API)  │──│  Datenbank   │──│  (RLS Policies)      │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│                    │ kpi_entries  │                            │
│                    │ year_notes   │                            │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                       Vercel                                  │
│  ┌────────────┐  ┌──────────┐  ┌───────────────────────────┐ │
│  │  CDN/Edge   │  │  Build   │  │  Git Integration          │ │
│  │  (Assets)   │  │  (Next)  │  │  (auto-deploy on push)    │ │
│  └────────────┘  └──────────┘  └───────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Architektur-Pattern: Monolith (Client-Heavy)

Die Anwendung ist ein Next.js Monolith, der direkt mit Supabase kommuniziert — ohne eigenes Backend. Supabase dient als "Backend-as-a-Service" und stellt sowohl die Datenbank als auch die REST-API bereit.

**Begruendung:**
- Kein eigenes Backend noetig: Supabase PostgREST generiert die API automatisch
- RLS schuetzt die Daten auf DB-Ebene (kein Middleware-Layer noetig)
- Minimaler Infrastruktur-Aufwand fuer ein kleines internes Tool
- Spaeter erweiterbar: Next.js API Routes koennen bei Bedarf hinzugefuegt werden (z.B. fuer Export-Logik)

---

## 2. Modul-Grenzen

Das Projekt ist in fuenf logische Module aufgeteilt:

### Modul: Dashboard (Anzeige)
- **Verantwortlichkeit:** KPI-Karten rendern, Jahresvergleich berechnen und anzeigen, Leerzustaende darstellen
- **Dateien:** `src/app/page.tsx`, `src/components/kpi-card.tsx`, `src/components/kpi-grid.tsx`, `src/components/dashboard-empty-state.tsx`
- **Abhaengigkeiten:** Daten-Modul, Berechnungs-Modul

### Modul: Dateneingabe (Mutation)
- **Verantwortlichkeit:** Formular fuer KPI-Eingabe/Bearbeitung, Validierung, Speichern
- **Dateien:** `src/components/data-entry-dialog.tsx`, `src/lib/validation/kpi-input.ts`
- **Abhaengigkeiten:** Daten-Modul

### Modul: Daten-Layer (Supabase)
- **Verantwortlichkeit:** Supabase-Client, Queries, UPSERT-Logik, Fehlerbehandlung
- **Dateien:** `src/lib/supabase/client.ts`, `src/lib/supabase/queries.ts`
- **Abhaengigkeiten:** Keine (Infrastruktur-Layer)

### Modul: Berechnungen (Business-Logik)
- **Verantwortlichkeit:** YoY-Berechnung, Social-Media-Summe, Zahlenformatierung
- **Dateien:** `src/lib/calculations/yoy.ts`, `src/lib/calculations/social-media-total.ts`, `src/lib/formatting/numbers.ts`
- **Abhaengigkeiten:** Keine (Pure Functions)

### Modul: Notizen
- **Verantwortlichkeit:** Notizen-Textarea auf dem Dashboard, Auto-Save, UPSERT
- **Dateien:** `src/components/year-notes.tsx`
- **Abhaengigkeiten:** Daten-Modul

### Abhaengigkeits-Matrix

|              | Dashboard | Dateneingabe | Daten-Layer | Berechnungen | Notizen |
|-------------|-----------|-------------|-------------|-------------|---------|
| Dashboard    | —         | —           | liest       | nutzt       | —       |
| Dateneingabe | —         | —           | schreibt    | —           | —       |
| Daten-Layer  | —         | —           | —           | —           | —       |
| Berechnungen | —         | —           | —           | —           | —       |
| Notizen      | —         | —           | schreibt    | —           | —       |

---

## 3. Ordnerstruktur

```
staplercup-kpi-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions: Lint, Type Check, Test, Build
├── .claude/
│   ├── roles/                              # Agent-Rollen
│   ├── memory/                             # Agent-Memory
│   └── references/                         # Referenz-Dokumente
├── docs/
│   ├── prd.md                              # Product Requirements Document
│   ├── user-stories.md                     # User Stories
│   ├── design-spec.md                      # UX/UI-Spezifikation
│   ├── db-schema.md                        # Datenbank-Schema
│   ├── security-spec.md                    # Security-Spezifikation
│   ├── test-strategy.md                    # Test-Strategie
│   ├── devops-spec.md                      # DevOps-Spezifikation
│   ├── architecture.md                     # Diese Datei
│   └── adr/
│       ├── 001-tech-stack.md               # ADR: Tech Stack
│       └── 002-data-model.md               # ADR: Datenmodell
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root Layout (Inter Font, Metadata)
│   │   ├── page.tsx                        # Dashboard-Seite (Startseite)
│   │   └── globals.css                     # Tailwind-Direktiven + Custom Properties
│   ├── components/
│   │   ├── ui/                             # ShadCN/UI Basis-Komponenten (generiert)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── sonner.tsx
│   │   ├── kpi-card.tsx                    # KPI-Karten-Komponente
│   │   ├── kpi-card.test.tsx               # Tests fuer KPI-Karte
│   │   ├── kpi-grid.tsx                    # Grid-Layout fuer alle KPI-Karten
│   │   ├── year-selector.tsx               # Jahresauswahl (Tabs)
│   │   ├── year-selector.test.tsx          # Tests fuer Jahresauswahl
│   │   ├── data-entry-dialog.tsx           # Dateneingabe-Dialog (Modal)
│   │   ├── data-entry-dialog.test.tsx      # Tests fuer Dateneingabe
│   │   ├── year-notes.tsx                  # Notizen-Bereich
│   │   ├── dashboard-header.tsx            # Header mit Titel + Bearbeiten-Button
│   │   ├── dashboard-empty-state.tsx       # Leerzustand
│   │   ├── dashboard-error-state.tsx       # Fehlerzustand
│   │   └── dashboard-skeleton.tsx          # Ladezustand (Skeleton)
│   ├── hooks/
│   │   ├── use-kpi-data.ts                 # Custom Hook: KPI-Daten laden
│   │   └── use-kpi-data.test.ts            # Tests fuer Daten-Hook
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Supabase Client Initialisierung
│   │   │   └── queries.ts                  # Alle DB-Queries (getKpisByYear, upsertKpis, etc.)
│   │   ├── calculations/
│   │   │   ├── yoy.ts                      # Year-over-Year Berechnung
│   │   │   ├── yoy.test.ts                 # Tests (alle Edge Cases)
│   │   │   ├── social-media-total.ts       # Social Media Summenberechnung
│   │   │   └── social-media-total.test.ts  # Tests
│   │   ├── formatting/
│   │   │   ├── numbers.ts                  # Deutsches Zahlenformat (1.234, +12,3%)
│   │   │   └── numbers.test.ts             # Tests
│   │   ├── validation/
│   │   │   ├── kpi-input.ts                # Zod-Schema fuer Eingabevalidierung
│   │   │   └── kpi-input.test.ts           # Tests
│   │   ├── constants.ts                    # METRIC_KEYS, Metrik-Konfiguration (Labels, Icons)
│   │   └── utils.ts                        # cn() Helper (Tailwind Merge)
│   ├── types/
│   │   └── index.ts                        # TypeScript Types und Interfaces
│   └── test/
│       ├── setup.ts                        # Vitest Setup (jest-dom)
│       ├── mocks/
│       │   ├── supabase.ts                 # Supabase-Client Mock
│       │   └── kpi-data.ts                 # Test-Datensaetze (Fixtures)
│       └── helpers/
│           └── render.tsx                  # Custom Render mit Providern
├── tests/
│   └── e2e/
│       ├── dashboard-view.test.ts          # E2E: Dashboard laden
│       ├── data-entry.test.ts              # E2E: Daten eingeben
│       └── year-comparison.test.ts         # E2E: Jahreswechsel
├── supabase/
│   └── migrations/
│       └── 001_create_tables.sql           # Initiale DB-Migration
├── .env.example                            # Env-Template (wird committet)
├── .gitignore
├── CLAUDE.md                               # Projekt-Konfiguration
├── components.json                         # ShadCN/UI Konfiguration
├── eslint.config.mjs                       # ESLint Konfiguration
├── next.config.ts                          # Next.js Konfiguration (Security Headers)
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs                      # PostCSS (Tailwind)
├── tailwind.config.ts                      # Tailwind Konfiguration (Design Tokens)
├── tsconfig.json
├── vitest.config.ts                        # Vitest Konfiguration
└── playwright.config.ts                    # Playwright Konfiguration
```

---

## 4. Datenfluss

### 4.1 Dashboard laden (Read-Flow)

```
1. Browser ruft "/" auf
   │
2. Next.js rendert page.tsx (Server Component)
   │
3. page.tsx rendert Client-Wrapper mit year-State
   │
4. Client-Komponente ruft useKpiData(year) Hook auf
   │
5. Hook ruft Supabase-Queries auf:
   │  ├── getKpisByYear(year)          → SELECT * FROM kpi_entries WHERE year IN (year, year-1)
   │  └── getNoteByYear(year)          → SELECT note FROM year_notes WHERE year = year
   │
6. Hook gibt zurueck: { currentYear: Map<key,value>, previousYear: Map<key,value>, note: string }
   │
7. Dashboard-Komponente:
   │  ├── Berechnet social_media_followers_total (clientseitig)
   │  ├── Berechnet YoY fuer jede Metrik (calculateYoY)
   │  ├── Formatiert Zahlen deutsch (formatNumber)
   │  └── Rendert 10 KPI-Cards + Notizen-Bereich
```

### 4.2 Daten speichern (Write-Flow)

```
1. User klickt "Daten bearbeiten"
   │
2. Dialog oeffnet sich, vorausgefuellt mit aktuellen Werten
   │
3. User aendert Werte, klickt "Speichern"
   │
4. Frontend-Validierung (Zod-Schema):
   │  ├── Alle Werte: Ganzzahl >= 0 oder leer
   │  ├── Notiz: String, max 2000 Zeichen
   │  └── Bei Fehler: Inline-Fehlermeldung, kein Submit
   │
5. upsertKpis(year, entries) aufrufen:
   │  ├── Gefuellte Felder: UPSERT in kpi_entries
   │  ├── Geleerte Felder: DELETE aus kpi_entries
   │  └── Notiz: UPSERT in year_notes
   │
6. Supabase fuehrt UPSERT/DELETE aus (RLS prueft Policies)
   │
7. Bei Erfolg:
   │  ├── Dialog schliesst
   │  ├── Toast: "Daten fuer [Jahr] gespeichert"
   │  └── useKpiData Hook revalidiert (refetch)
   │
8. Bei Fehler:
   │  ├── Dialog bleibt offen
   │  └── Toast: "Fehler beim Speichern. Bitte erneut versuchen."
```

### 4.3 Jahreswechsel

```
1. User klickt auf Tab (z.B. "2023")
   │
2. year-State aendert sich → useKpiData(2023) wird aufgerufen
   │
3. Waehrend Laden: Skeleton-State auf den KPI-Cards
   │
4. Daten geladen → Dashboard rendert neu mit 2023er Werten
   │
5. YoY-Vergleich bezieht sich auf 2022 (kein Eintrag → "Kein Vorjahr")
```

---

## 5. API-Contracts

Die Anwendung nutzt KEINE eigenen API-Routes im MVP. Alle Datenzugriffe erfolgen direkt ueber den Supabase Client SDK. Die "API" ist die Supabase PostgREST API, die automatisch aus dem DB-Schema generiert wird.

### 5.1 Supabase-Queries (Query-Layer)

```typescript
// src/lib/supabase/queries.ts

// --- READ ---

/** Alle KPI-Eintraege fuer ein oder zwei Jahre laden */
async function getKpisByYears(years: number[]): Promise<KpiEntry[]>
// Supabase: supabase.from('kpi_entries').select('*').in('year', years)
// Response: KpiEntry[] = { id, year, metric_key, value, created_at, updated_at }[]

/** Notiz fuer ein Jahr laden */
async function getNoteByYear(year: number): Promise<string | null>
// Supabase: supabase.from('year_notes').select('note').eq('year', year).single()
// Response: string | null

/** Alle verfuegbaren Jahre laden (fuer Tabs) */
async function getAvailableYears(): Promise<number[]>
// Supabase: supabase.from('kpi_entries').select('year').order('year', { ascending: false })
// Response: number[] (dedupliziert)

// --- WRITE ---

/** KPI-Werte fuer ein Jahr upserten (Batch) */
async function upsertKpis(year: number, entries: UpsertEntry[]): Promise<void>
// Supabase: supabase.from('kpi_entries').upsert(entries, { onConflict: 'year,metric_key' })
// Input: UpsertEntry = { year, metric_key, value }[]

/** KPI-Werte loeschen (geleerte Felder) */
async function deleteKpis(year: number, metricKeys: string[]): Promise<void>
// Supabase: supabase.from('kpi_entries').delete().eq('year', year).in('metric_key', metricKeys)

/** Notiz fuer ein Jahr upserten */
async function upsertNote(year: number, note: string): Promise<void>
// Supabase: supabase.from('year_notes').upsert({ year, note }, { onConflict: 'year' })
```

### 5.2 TypeScript Interfaces

```typescript
// src/types/index.ts

/** Datenbank-Zeile aus kpi_entries */
export interface KpiEntry {
  id: string;
  year: number;
  metric_key: string;
  value: number;
  created_at: string;
  updated_at: string;
}

/** Datenbank-Zeile aus year_notes */
export interface YearNote {
  id: string;
  year: number;
  note: string;
  created_at: string;
  updated_at: string;
}

/** KPI-Daten fuer ein Jahr (aufbereitet fuer das Dashboard) */
export interface YearKpiData {
  year: number;
  entries: Record<string, number | null>;  // metric_key → value
  note: string | null;
}

/** Year-over-Year Berechnung */
export interface YoYResult {
  absolute: number | null;    // z.B. +1200 oder -500
  percentage: number | null;  // z.B. 12.0 oder -15.0 (null bei Division durch 0)
}

/** Metrik-Konfiguration (fuer UI-Rendering) */
export interface MetricConfig {
  key: string;                // z.B. 'tiktok_followers'
  label: string;              // z.B. 'TikTok Follower'
  icon: string;               // Lucide Icon Name, z.B. 'Music'
  category: MetricCategory;   // Gruppierung
  isComputed?: boolean;       // true fuer social_media_followers_total
}

/** Metrik-Kategorien (fuer spaetere Filterung, Phase 2) */
export type MetricCategory = 'social_media' | 'reichweite' | 'events';

/** Eingabe fuer das Formular (vor Validierung) */
export interface KpiFormData {
  [metricKey: string]: string;  // String weil HTML-Input, wird zu number validiert
  note: string;
}

/** Validiertes Formular-Ergebnis */
export interface ValidatedKpiData {
  entries: { metric_key: string; value: number }[];
  emptyKeys: string[];        // Felder die geleert wurden (fuer DELETE)
  note: string;
}

/** Upsert-Payload fuer Supabase */
export interface UpsertEntry {
  year: number;
  metric_key: string;
  value: number;
}
```

---

## 6. Komponenten-Hierarchie

```
app/layout.tsx (Server Component)
│  ├── Inter Font laden
│  ├── <html> + <body>
│  └── Toaster (Sonner)
│
└── app/page.tsx (Server Component)
    │
    └── <DashboardPage> (Client Component — "use client")
        │
        ├── <DashboardHeader>
        │   ├── Titel: "StaplerCup KPI-Dashboard"
        │   └── <Button> "Daten bearbeiten" → oeffnet Dialog
        │
        ├── <YearSelector>                    (Tabs)
        │   ├── <TabsList>
        │   │   └── <TabsTrigger> pro Jahr (2023, 2024, 2025, ...)
        │   └── year-State wird nach oben geliftet
        │
        ├── {isLoading && <DashboardSkeleton>}  (10 Skeleton-Cards)
        │
        ├── {isError && <DashboardErrorState>}  (Alert + Retry-Button)
        │
        ├── {isEmpty && <DashboardEmptyState>}  (Keine Daten + CTA)
        │
        ├── {hasData && <KpiGrid>}
        │   │
        │   ├── <KpiCard>                     (Social Media gesamt — hervorgehoben)
        │   │   ├── Icon (Users) + Label
        │   │   ├── Hauptzahl (formatiert)
        │   │   ├── Badge "Automatisch berechnet"
        │   │   └── YoY-Anzeige (absolut + prozentual + Farbe + Icon)
        │   │
        │   ├── <KpiCard>                     (TikTok Follower)
        │   ├── <KpiCard>                     (Instagram Follower)
        │   ├── <KpiCard>                     (Facebook Follower)
        │   ├── <KpiCard>                     (YouTube Abonnenten)
        │   ├── <KpiCard>                     (Website-Besucher)
        │   ├── <KpiCard>                     (Ad-Impressions)
        │   ├── <KpiCard>                     (PR-Reichweite)
        │   ├── <KpiCard>                     (Live-Zuschauer)
        │   └── <KpiCard>                     (Newsletter-Abonnenten)
        │
        ├── {hasData && <YearNotes>}
        │   ├── <Card> mit Titel "Notizen fuer [Jahr]"
        │   └── <Textarea> mit Auto-Save (Debounce 2s)
        │
        └── <DataEntryDialog>                 (Modal, conditional render)
            ├── <DialogHeader> "Daten bearbeiten — [Jahr]"
            ├── <ScrollArea>
            │   ├── <Input> TikTok Follower       (type="number", min=0)
            │   ├── <Input> Instagram Follower
            │   ├── <Input> Facebook Follower
            │   ├── <Input> YouTube Abonnenten
            │   ├── <Input> Website-Besucher
            │   ├── <Input> Ad-Impressions
            │   ├── <Input> PR-Reichweite
            │   ├── <Input> Live-Zuschauer
            │   ├── <Input> Newsletter-Abonnenten
            │   └── <Textarea> Notizen
            └── <DialogFooter>
                ├── <Button variant="ghost"> Abbrechen
                └── <Button variant="default"> Speichern
```

---

## 7. State Management

### Prinzip: Server Components wo moeglich, Client Components nur wo noetig

| Komponente | Server/Client | Begruendung |
|-----------|---------------|-------------|
| `app/layout.tsx` | Server | Statisches Layout, Font-Loading |
| `app/page.tsx` | Server | Shell-Rendering, Metadata |
| `DashboardPage` | **Client** | Braucht State (year, data), Interaktivitaet |
| `DashboardHeader` | Client | Button-Interaktion |
| `YearSelector` | Client | Tab-Interaktion, State-Aenderung |
| `KpiGrid` | Client | Abhaengig von year-State |
| `KpiCard` | Client | Berechnet YoY, dynamische Farben |
| `DataEntryDialog` | Client | Formular, Validierung, Submit |
| `YearNotes` | Client | Textarea, Auto-Save |

### State-Architektur

```typescript
// Zentraler State in DashboardPage:

// 1. Ausgewaehltes Jahr
const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

// 2. KPI-Daten (Custom Hook)
const { data, isLoading, isError, refetch } = useKpiData(selectedYear);
// data = { currentYear: YearKpiData, previousYear: YearKpiData | null }

// 3. Dialog-State
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

### Kein globaler State-Manager noetig

Die Anwendung ist klein genug, dass React-State (useState/useReducer) und ein Custom Hook ausreichen. Kein Redux, Zustand oder Jotai noetig.

**Begruendung:**
- Nur eine Seite (Dashboard)
- Nur ein relevanter State (selectedYear)
- Daten werden per Hook geladen, nicht global gecached
- Bei Bedarf (Phase 2: mehrere Seiten): React Context oder URL-State (`?year=2024`) reicht

### Data Fetching Strategie

Der `useKpiData` Hook nutzt einen einfachen `useEffect` + `useState` Pattern:

```typescript
// src/hooks/use-kpi-data.ts (vereinfacht)

export function useKpiData(year: number) {
  const [data, setData] = useState<KpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [entries, note] = await Promise.all([
        getKpisByYears([year, year - 1]),
        getNoteByYear(year),
      ]);
      // Daten aufbereiten...
      setData(/* ... */);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}
```

**Bewusste Entscheidung gegen React Query / SWR:**
- Nur eine Datenquelle, nur ein Query-Pattern
- Kein Caching zwischen Tabs noetig (Daten sind winzig, Refetch ist schnell)
- Weniger Dependencies = weniger Komplexitaet
- Kann in Phase 2 bei Bedarf nachgeruestet werden

---

## 8. Konflikte und Entscheidungen

### 8.1 DELETE-Policy: Security vs. Data-Schema

**Konflikt:** Die Security-Spezifikation empfiehlt, KEINE DELETE-Policy fuer `anon` zu definieren (Schutz vor Datenverlust). Das DB-Schema definiert jedoch eine `kpi_entries_delete_public` Policy.

**Entscheidung:** DELETE ist erlaubt, aber nur fuer spezifische Zeilen (beim Leeren eines Formularfelds). Die RLS-Policy erlaubt DELETE, da es ein bewusster User-Flow ist (Metrik-Wert entfernen). Der Schutz vor versehentlichem Datenverlust erfolgt auf UI-Ebene (kein "Alle Daten loeschen"-Button, keine Bulk-Operationen).

**Begruendung:** Ohne DELETE-Moeglichkeit koennte ein User einen versehentlich eingegebenen Wert nicht entfernen (nur auf 0 setzen, was semantisch anders ist als "keine Daten").

### 8.2 Separate Eingabe-Seite vs. Dialog

**Konflikt:** Die DevOps-Spezifikation definiert eine separate Route `src/app/eingabe/page.tsx`. Die Design-Spezifikation beschreibt einen Dialog (Modal) auf der Dashboard-Seite.

**Entscheidung:** Dialog (Modal) auf der Dashboard-Seite. Keine separate Eingabe-Route.

**Begruendung:**
- Die Design-Spec ist detaillierter und beschreibt den kompletten Interaktionsflow
- Ein Dialog vermeidet Navigation und haelt den Kontext (User sieht Dashboard im Hintergrund)
- Weniger Code (keine separate Seite mit eigenem Daten-Laden)
- Bei Bedarf kann spaeter eine eigene Seite ergaenzt werden

### 8.3 Tabellen-Namen: Security-Spec vs. DB-Schema

**Konflikt:** Die Security-Spezifikation referenziert `kpi_data` und `years` als Tabellennamen. Das DB-Schema definiert `kpi_entries` und `year_notes`.

**Entscheidung:** Die Tabellennamen aus dem DB-Schema gelten: `kpi_entries` und `year_notes`.

**Begruendung:** Das DB-Schema ist die spezialisierte Quelle fuer Datenbank-Entscheidungen. `kpi_entries` ist praeziser (EAV-Pattern) und `year_notes` beschreibt den Inhalt besser als `years`.

### 8.4 Server Components vs. Client Components

**Konflikt:** Next.js 15 bevorzugt Server Components, aber das Dashboard ist hochgradig interaktiv (Jahreswechsel, Formular, Auto-Save).

**Entscheidung:** Die Dashboard-Seite (`page.tsx`) ist ein Server Component, das eine Client-Wrapper-Komponente (`DashboardPage`) rendert. Alle interaktiven Teile sind Client Components.

**Begruendung:**
- Server Component fuer `page.tsx` ermoeglicht Metadata-Export und statische Shell
- Die gesamte Dashboard-Logik erfordert Client-State (year, data, dialog)
- Ein Versuch, einzelne Cards als Server Components zu rendern, wuerde die Architektur verkomplizieren ohne messbaren Vorteil (die Datenmengen sind winzig)

### 8.5 Caching-Strategie

**Entscheidung:** Kein explizites Caching im MVP.

**Begruendung:**
- Datenmenge: ~45 Zeilen in `kpi_entries`, ~3 Zeilen in `year_notes`
- Query-Dauer: < 50ms fuer alle Daten
- Wenige User (1-3 Personen gleichzeitig)
- Vercel CDN cached statische Assets automatisch
- Bei Bedarf (Phase 2): `Cache-Control` Header auf Supabase-Responses oder SWR/React Query

### 8.6 Zahlenformat im Eingabefeld

**Konflikt:** Die Design-Spec zeigt vorformatierte Zahlen in Eingabefeldern (z.B. "12.500"). HTML `type="number"` unterstuetzt kein deutsches Format.

**Entscheidung:** Eingabefelder verwenden `type="text"` mit `inputMode="numeric"` und `pattern="[0-9]*"`. Die Anzeige im Feld ist unformatiert (z.B. "12500"). Die formatierte Anzeige (12.500) erfolgt nur auf den KPI-Karten.

**Begruendung:**
- `type="number"` mit deutschem Format fuehrt zu Browser-Inkompatibilitaeten
- Unformatierte Eingabe ist eindeutig und fehlerresistent
- Die Validierung (Zod) parst den String zu einer Ganzzahl

---

## 9. Nicht-funktionale Anforderungen

### Performance
- Dashboard-Ladezeit: < 2 Sekunden (LCP)
- Supabase-Query: < 200ms (p95)
- Jahreswechsel (Tab-Klick bis Daten sichtbar): < 500ms
- Bundle-Groesse: < 200 KB (gzipped, First Load JS)

### Skalierbarkeit
- Horizontal skalierbar: Ja (Vercel Serverless, Supabase Cloud)
- Datenvolumen: ~100 Zeilen in 5 Jahren (irrelevant)
- Concurrent Users: 1-5 (internes Tool)
- Traffic-Muster: Gleichmaessig, sehr niedrig

### Verfuegbarkeit
- Uptime-Ziel: Best Effort (Vercel + Supabase Free Tier)
- Geplante Downtime: Akzeptabel (internes Tool)
- Recovery Time: Nicht definiert (Supabase hat automatische Backups)

### Sicherheit
- Authentifizierung: Keine (MVP), Supabase Auth (Phase 3)
- Autorisierung: RLS Policies (oeffentlich im MVP)
- Datenverschluesselung: HTTPS (Vercel + Supabase automatisch)
- Input-Validierung: Zod auf allen Eingaben

### Wartbarkeit
- Deployment-Frequenz: Bei Bedarf (Push auf main)
- Monitoring: Vercel Analytics (Basic), Supabase Dashboard
- Logging: Vercel Logs (Standard), kein Custom Logging

# Test-Strategie: StaplerCup KPI-Dashboard

## 1. Test-Framework & Tooling

| Zweck | Tool | Begruendung |
|-------|------|-------------|
| Unit & Integration Tests | **Vitest** | Schnell, ESM-nativ, gute Next.js-Kompatibilitaet |
| Komponenten-Tests | **React Testing Library** | User-zentriertes Testing, de-facto Standard |
| E2E Tests | **Playwright** | Cross-Browser, stabil, gute DX |
| Mocking | **Vitest (vi.mock / vi.fn)** | Built-in, kein Extra-Tool noetig |
| Coverage | **Vitest (v8 Provider)** | Integriert, kein Setup noetig |

### Konfiguration

```bash
# Installation
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "src/test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

---

## 2. Test-Typen

### Unit Tests

**Was**: Einzelne Funktionen, Berechnungslogik, Utility-Funktionen, Hooks.
**Wo**: Neben dem Quellcode (`*.test.ts` / `*.test.tsx`).
**Ausfuehrung**: `npm run test` (schnell, bei jedem Save moeglich).

Typische Kandidaten:
- YoY-Berechnungsfunktionen (absolut + prozentual)
- Social-Media-Summenberechnung
- Formatierungsfunktionen (Zahlen, Prozente)
- Validierungslogik fuer Eingabefelder

### Integration Tests

**Was**: Zusammenspiel von Komponenten mit Datenlogik, Supabase-Client-Mocking, Formular-Flows.
**Wo**: Neben dem Quellcode (`*.test.tsx`).
**Ausfuehrung**: `npm run test` (zusammen mit Unit Tests).

Typische Kandidaten:
- KPI-Karte rendert korrekt mit verschiedenen Datenzustaenden
- Dateneingabe-Formular: Eingabe, Validierung, Submit
- Dashboard rendert alle 10 Metriken
- Jahresauswahl aendert angezeigte Daten

### E2E Tests

**Was**: Kritische User Flows end-to-end im echten Browser.
**Wo**: `tests/e2e/` (separates Verzeichnis).
**Ausfuehrung**: `npm run test:e2e` (vor Deployment, in CI).

Typische Kandidaten:
- Kompletter Dateneingabe-Flow (Formular oeffnen, ausfuellen, speichern, Ergebnis auf Dashboard sehen)
- Jahresauswahl wechseln und YoY-Werte pruefen
- Leerzustand: Dashboard ohne Daten zeigt sinnvolle Meldung

---

## 3. Coverage-Schwellen (MVP)

| Bereich | Schwelle | Begruendung |
|---------|----------|-------------|
| **Gesamt** | 70% Statements | Pragmatischer MVP-Wert, verhindert grosse Luecken |
| **Berechnungslogik** (`lib/calculations/`) | 95% | Kernlogik, Fehler hier sind geschaeftskritisch |
| **UI-Komponenten** | 60% | Fokus auf Verhalten, nicht auf Render-Details |
| **API/Daten-Layer** | 80% | Datenintegritaet ist wichtig |

```typescript
// vitest.config.ts — Coverage-Thresholds
coverage: {
  thresholds: {
    statements: 70,
    branches: 65,
    functions: 70,
    lines: 70,
  },
}
```

Nach dem MVP koennen die Schwellen schrittweise auf 80% angehoben werden.

---

## 4. Kritische Test-Szenarien

### 4.1 YoY-Berechnung (absolut + prozentual)

Das ist die **wichtigste Berechnungslogik** im Projekt. Fehler hier fuehren zu falschen Geschaeftsentscheidungen.

| Szenario | Input (aktuell / Vorjahr) | Erwartet (absolut / prozentual) |
|----------|--------------------------|----------------------------------|
| Normales Wachstum | 11.200 / 10.000 | +1.200 / +12,0% |
| Rueckgang | 8.500 / 10.000 | -1.500 / -15,0% |
| Keine Veraenderung | 10.000 / 10.000 | 0 / 0,0% |
| Kein Vorjahr vorhanden | 10.000 / null | null / null (kein Vergleich moeglich) |
| Vorjahr war 0 | 500 / 0 | +500 / null (Division durch 0 abfangen) |
| Beides 0 | 0 / 0 | 0 / 0,0% oder null (je nach Definition) |
| Sehr grosse Zahlen | 1.500.000 / 1.200.000 | +300.000 / +25,0% |

```typescript
// Beispiel-Test
describe("calculateYoY", () => {
  it("should return positive change when current > previous", () => {
    const result = calculateYoY(11200, 10000);
    expect(result.absolute).toBe(1200);
    expect(result.percentage).toBeCloseTo(12.0);
  });

  it("should return null percentage when previous is 0", () => {
    const result = calculateYoY(500, 0);
    expect(result.absolute).toBe(500);
    expect(result.percentage).toBeNull();
  });

  it("should return null when previous year data is missing", () => {
    const result = calculateYoY(10000, null);
    expect(result.absolute).toBeNull();
    expect(result.percentage).toBeNull();
  });
});
```

### 4.2 Dateneingabe und Validierung

| Szenario | Eingabe | Erwartet |
|----------|---------|----------|
| Gueltige Zahl | "12500" | Akzeptiert, gespeichert |
| Leeres Feld | "" | Fehlermeldung oder 0 (je nach Feld) |
| Negative Zahl | "-100" | Abgelehnt (Follower/Besucher koennen nicht negativ sein) |
| Dezimalzahl | "12.5" | Abgelehnt oder gerundet (Follower sind ganzzahlig) |
| Text statt Zahl | "abc" | Abgelehnt, Fehlermeldung |
| Extrem grosse Zahl | "999999999999" | Akzeptiert (kein kuenstliches Limit) |
| Sonderzeichen | "1.200" (mit Punkt) | Korrekt parsen oder ablehnen |
| Notizen: Leer | "" | Akzeptiert (optional) |
| Notizen: Sehr lang | 5000+ Zeichen | Akzeptiert oder Limit anzeigen |
| Speichern ohne Aenderung | Submit ohne Eingabe | Kein unnuetiger DB-Write |

```typescript
describe("KpiInputForm", () => {
  it("should show error when negative value is entered", async () => {
    const user = userEvent.setup();
    render(<KpiInputForm year={2025} />);

    const input = screen.getByLabelText(/instagram follower/i);
    await user.clear(input);
    await user.type(input, "-100");
    await user.click(screen.getByRole("button", { name: /speichern/i }));

    expect(screen.getByText(/positiv/i)).toBeInTheDocument();
  });
});
```

### 4.3 Automatische Summenberechnung Social Media

Social Media Follower gesamt = TikTok + Instagram + Facebook + YouTube.

| Szenario | TikTok / Insta / FB / YT | Erwartet |
|----------|--------------------------|----------|
| Alle gefuellt | 5000 / 3000 / 2000 / 1000 | 11.000 |
| Ein Kanal ist 0 | 5000 / 0 / 2000 / 1000 | 8.000 |
| Alle 0 | 0 / 0 / 0 / 0 | 0 |
| Ein Kanal fehlt (null) | 5000 / null / 2000 / 1000 | 8.000 (null als 0 behandeln) |
| Werte aendern sich live | Eingabe aendern | Summe aktualisiert sofort |

```typescript
describe("calculateTotalSocialMedia", () => {
  it("should sum all channels", () => {
    expect(calculateTotalSocialMedia({
      tiktok: 5000, instagram: 3000, facebook: 2000, youtube: 1000,
    })).toBe(11000);
  });

  it("should treat null as 0", () => {
    expect(calculateTotalSocialMedia({
      tiktok: 5000, instagram: null, facebook: 2000, youtube: 1000,
    })).toBe(8000);
  });
});
```

### 4.4 Leerzustaende (keine Daten vorhanden)

| Szenario | Erwartet |
|----------|----------|
| Kein Datensatz fuer gewahltes Jahr | Meldung "Noch keine Daten fuer [Jahr]" + Link zur Dateneingabe |
| Kein Datensatz fuer Vorjahr (kein YoY) | YoY-Anzeige zeigt "—" oder "Kein Vorjahr" |
| Komplett leere Datenbank | Hinweis mit Aufforderung zur ersten Dateneingabe |
| Einzelne Metrik ist null | Karte zeigt "—" statt 0 oder NaN |

```typescript
describe("KpiCard", () => {
  it("should show dash when current value is null", () => {
    render(<KpiCard label="TikTok Follower" value={null} previousValue={1000} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should show 'Kein Vorjahr' when previous value is missing", () => {
    render(<KpiCard label="TikTok Follower" value={5000} previousValue={null} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });
});
```

### 4.5 Weitere kritische Szenarien

| Bereich | Szenario |
|---------|----------|
| **Jahresauswahl** | Wechsel zwischen Jahren laedt korrekte Daten |
| **Jahresauswahl** | Erstes verfuegbares Jahr (2023) hat kein Vorjahr |
| **Farbkodierung** | Gruen bei positivem YoY, Rot bei negativem |
| **Farbkodierung** | Neutral bei 0% Veraenderung |
| **Zahlenformatierung** | Deutsche Formatierung (1.200 statt 1,200) |
| **Persistenz** | Daten bleiben nach Reload erhalten |
| **Fehlerbehandlung** | Supabase-Timeout zeigt Fehlermeldung |
| **Fehlerbehandlung** | Netzwerkfehler beim Speichern zeigt Retry-Option |

---

## 5. Test-Struktur

```
src/
├── lib/
│   ├── calculations/
│   │   ├── yoy.ts
│   │   ├── yoy.test.ts                  ← Unit: YoY-Berechnungen
│   │   ├── social-media-total.ts
│   │   └── social-media-total.test.ts   ← Unit: Summenberechnung
│   ├── formatting/
│   │   ├── numbers.ts
│   │   └── numbers.test.ts              ← Unit: Zahlenformatierung
│   └── validation/
│       ├── kpi-input.ts
│       └── kpi-input.test.ts            ← Unit: Eingabevalidierung
├── components/
│   ├── kpi-card/
│   │   ├── kpi-card.tsx
│   │   └── kpi-card.test.tsx            ← Integration: Rendering + Logik
│   ├── kpi-input-form/
│   │   ├── kpi-input-form.tsx
│   │   └── kpi-input-form.test.tsx      ← Integration: Formular-Flow
│   ├── year-selector/
│   │   ├── year-selector.tsx
│   │   └── year-selector.test.tsx       ← Unit: Auswahl-Verhalten
│   └── dashboard/
│       ├── dashboard.tsx
│       └── dashboard.test.tsx           ← Integration: Gesamtansicht
├── hooks/
│   ├── use-kpi-data.ts
│   └── use-kpi-data.test.ts            ← Unit: Daten-Hook
├── test/
│   ├── setup.ts                         ← Test-Setup (jest-dom, etc.)
│   ├── mocks/
│   │   ├── supabase.ts                  ← Supabase-Client Mock
│   │   └── kpi-data.ts                  ← Test-Datensaetze
│   └── helpers/
│       └── render.tsx                   ← Custom Render mit Providern
tests/
└── e2e/
    ├── dashboard-view.test.ts           ← E2E: Dashboard laden, Daten sehen
    ├── data-entry.test.ts               ← E2E: Daten eingeben und speichern
    └── year-comparison.test.ts          ← E2E: Jahr wechseln, YoY pruefen
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 6. Testdaten

### Fixture: Standard-Testdatensatz

```typescript
// src/test/mocks/kpi-data.ts
export const mockKpiData2024 = {
  year: 2024,
  tiktok_followers: 5200,
  instagram_followers: 12800,
  facebook_followers: 8500,
  youtube_subscribers: 3100,
  // social_media_total: berechnet (29.600)
  website_visitors: 145000,
  ad_impressions: 2300000,
  pr_reach: 5800000,
  live_viewers: 42000,
  newsletter_subscribers: 1850,
  notes: "Erstmals TikTok-Kampagne gestartet",
};

export const mockKpiData2023 = {
  year: 2023,
  tiktok_followers: 1200,
  instagram_followers: 11000,
  facebook_followers: 8200,
  youtube_subscribers: 2800,
  website_visitors: 120000,
  ad_impressions: 1800000,
  pr_reach: 4200000,
  live_viewers: 38000,
  newsletter_subscribers: 1500,
  notes: null,
};

export const mockKpiDataEmpty = {
  year: 2025,
  tiktok_followers: null,
  instagram_followers: null,
  facebook_followers: null,
  youtube_subscribers: null,
  website_visitors: null,
  ad_impressions: null,
  pr_reach: null,
  live_viewers: null,
  newsletter_subscribers: null,
  notes: null,
};
```

---

## 7. Prioritaeten fuer MVP

**Muss (vor Release):**
1. Unit Tests fuer YoY-Berechnung (alle Edge Cases)
2. Unit Tests fuer Social-Media-Summenberechnung
3. Integration Tests fuer KPI-Karte (alle Zustaende)
4. Integration Tests fuer Dateneingabe-Formular (Validierung)
5. Mindestens 1 E2E Test fuer den kompletten Eingabe-Flow

**Sollte (kurz nach Release):**
6. E2E Tests fuer Jahreswechsel
7. Integration Tests fuer Leerzustaende
8. Fehlerbehandlungs-Tests (Netzwerk, Supabase-Fehler)

**Kann (spaeter):**
9. Performance-Tests (Ladezeit < 2s)
10. Accessibility-Tests (Kontraste, Screenreader)
11. Visual Regression Tests

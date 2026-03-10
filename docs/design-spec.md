# Design-Spec: StaplerCup KPI-Dashboard

## 1. Design Framework Empfehlung

**Framework:** ShadCN/UI mit Tailwind CSS
**Schrift:** Inter (via Google Fonts oder `next/font`)
**Icons:** Lucide React (Standard bei ShadCN)

### Empfohlene ShadCN-Komponenten pro Bereich

| Bereich | ShadCN-Komponenten |
|---------|-------------------|
| KPI-Karten | Card, CardHeader, CardTitle, CardDescription, CardContent |
| Jahresauswahl | Tabs (TabsList, TabsTrigger, TabsContent) |
| Dateneingabe | Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter |
| Formularfelder | Input, Label, Field, Textarea, Button |
| Notizen | Textarea (innerhalb Dialog oder inline) |
| Erfolgsmeldung | Sonner (toast()) |
| Leer-Zustand | Empty |
| Lade-Zustand | Skeleton |
| Validierungsfehler | Inline via Field-Komponente |
| Tooltips | Tooltip, TooltipTrigger, TooltipContent |

---

## 2. Design Tokens

### Farbschema

```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    // Primaerfarbe: Markenblau (StaplerCup/Linde-nahe)
    primary: {
      50:  "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a5f",
    },
    // Neutraltoene
    neutral: {
      50:  "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      500: "#737373",
      700: "#404040",
      900: "#171717",
    },
    // Semantische Farben
    success: "#16a34a",     // Gruen — Wachstum / positive Veraenderung
    successBg: "#f0fdf4",   // Hintergrund fuer positive KPI-Badges
    successLight: "#dcfce7",
    error: "#dc2626",       // Rot — Rueckgang / negative Veraenderung
    errorBg: "#fef2f2",     // Hintergrund fuer negative KPI-Badges
    errorLight: "#fee2e2",
    warning: "#f59e0b",
    warningBg: "#fffbeb",
    muted: "#6b7280",       // Grau — unveraendert (0%)
  },
  spacing: {
    xs:   "0.25rem",  // 4px
    sm:   "0.5rem",   // 8px
    md:   "1rem",     // 16px
    lg:   "1.5rem",   // 24px
    xl:   "2rem",     // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
  },
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    fontSize: {
      xs:   "0.75rem",   // 12px — Hilfstexte
      sm:   "0.875rem",  // 14px — Labels, Badges
      base: "1rem",      // 16px — Body
      lg:   "1.125rem",  // 18px — Card-Titel
      xl:   "1.25rem",   // 20px — Sektions-Ueberschriften
      "2xl": "1.5rem",   // 24px — Seiten-Titel
      "3xl": "2.25rem",  // 36px — KPI-Hauptzahl
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.07)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  },
};
```

### KPI-Veraenderungs-Farben — Anwendungsregeln

| Veraenderung | Textfarbe | Hintergrund | Icon |
|-------------|-----------|-------------|------|
| Positiv (> 0%) | `success` (#16a34a) | `successBg` (#f0fdf4) | TrendingUp (Lucide) |
| Negativ (< 0%) | `error` (#dc2626) | `errorBg` (#fef2f2) | TrendingDown (Lucide) |
| Unveraendert (0%) | `muted` (#6b7280) | `neutral.100` (#f5f5f5) | Minus (Lucide) |
| Kein Vorjahr vorhanden | `muted` (#6b7280) | — | — (Text: "Kein Vorjahr") |

---

## 3. Layout-Konzept

### Seitenstruktur

```
+---------------------------------------------------------------+
|  Header: Logo/Titel + Jahresauswahl (Tabs)                    |
+---------------------------------------------------------------+
|                                                                |
|  KPI-Grid (responsive)                                        |
|                                                                |
|  +-------------+  +-------------+  +-------------+            |
|  | SM Follower  |  | TikTok      |  | Instagram   |           |
|  | gesamt       |  | Follower    |  | Follower    |           |
|  | (berechnet)  |  |             |  |             |           |
|  +-------------+  +-------------+  +-------------+            |
|                                                                |
|  +-------------+  +-------------+  +-------------+            |
|  | Facebook    |  | YouTube     |  | Website-    |            |
|  | Follower    |  | Abonnenten  |  | Besucher    |            |
|  +-------------+  +-------------+  +-------------+            |
|                                                                |
|  +-------------+  +-------------+  +-------------+            |
|  | Ad-         |  | PR-         |  | Live-       |            |
|  | Impressions |  | Reichweite  |  | Zuschauer   |            |
|  +-------------+  +-------------+  +-------------+            |
|                                                                |
|  +-------------+                                               |
|  | Newsletter- |                                               |
|  | Abonnenten  |                                               |
|  +-------------+                                               |
|                                                                |
|  +-------------------------------------------------------+    |
|  | Notizen fuer [Jahr]                                    |    |
|  | Textarea (inline editierbar)                           |    |
|  +-------------------------------------------------------+    |
|                                                                |
|  [Daten bearbeiten] Button                                     |
+---------------------------------------------------------------+
```

### Grid-System

```css
/* KPI-Grid */
.kpi-grid {
  display: grid;
  gap: 1.5rem; /* spacing.lg */
}
```

### Responsive Breakpoints

| Breakpoint | Spalten | Verhalten |
|-----------|---------|-----------|
| < 640px (Mobile) | 1 Spalte | Cards gestapelt, Tabs werden zu Select |
| 640px - 1023px (Tablet) | 2 Spalten | Kompaktere Cards |
| >= 1024px (Desktop) | 3 Spalten | Volle Darstellung — **primaerer Viewport** |
| >= 1280px (Wide) | 4 Spalten | Mehr Cards pro Zeile, groessere Abstaende |

**Primaer-Fokus:** Desktop (>= 1024px). Mobile/Tablet als Fallback, nicht als Design-Ausgangspunkt (Abweichung von Mobile-First, da internes Desktop-Tool).

### Header-Layout

- Links: Seitentitel "StaplerCup KPI-Dashboard"
- Rechts: Button "Daten bearbeiten" (oeffnet Dialog)
- Darunter: Tabs-Leiste fuer Jahresauswahl (2023, 2024, 2025, ...)
- Der aktive Tab ist visuell hervorgehoben

---

## 4. Komponenten-Mapping

### 4.1 KPI-Card

**ShadCN-Basis:** Card (Card, CardHeader, CardTitle, CardContent)
**Anpassungen:** Eigene Sub-Komponente `KpiCard` die Card erweitert

```
+------------------------------------------+
|  [Icon]  Metrik-Name              sm/muted|
|                                           |
|  42.500                           3xl/bold|
|                                           |
|  [TrendingUp] +5.200 (+13,9%)    sm/gruen |
+------------------------------------------+
```

**Struktur:**
- `CardHeader`: Icon (Lucide) + Metrik-Name (CardTitle, fontSize sm, text-muted)
- `CardContent`:
  - Hauptzahl: fontSize 3xl, fontWeight bold, color neutral.900
  - Veraenderungszeile: Badge-artig mit Icon + absolut + prozentual
  - Zahlenformat: deutsches Format (Punkt als Tausender-Trenner, Komma als Dezimal)
- Sonderfall "Social Media gesamt": Visuell leicht abgehoben (z.B. primary-Rahmen oder leichter primary-Hintergrund), Label "Automatisch berechnet" als Badge

**Groesse:** Mindestbreite 280px, flexible Breite im Grid

### 4.2 Jahresauswahl

**ShadCN-Basis:** Tabs (Tabs, TabsList, TabsTrigger, TabsContent)
**Anpassungen:** Keine — Standard-ShadCN-Tabs reichen aus

- Jedes Jahr (2023, 2024, 2025, ...) ist ein TabsTrigger
- Aktiver Tab zeigt das Dashboard fuer dieses Jahr
- Dynamisch: Neue Jahre werden automatisch hinzugefuegt wenn Daten vorhanden
- Auf Mobile (< 640px): Fallback auf Select-Komponente statt Tabs

### 4.3 Dateneingabe-Formular

**ShadCN-Basis:** Dialog (DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter) + Input + Label + Field + Button
**Anpassungen:** Scrollbarer Content bei vielen Feldern (ScrollArea)

**Aufbau:**
```
+------------------------------------------+
|  Daten bearbeiten — [Jahr]        [X]    |
|  Erfasse die KPI-Werte fuer [Jahr]       |
|------------------------------------------|
|                                           |
|  TikTok Follower                         |
|  [ 12.500                           ]    |
|                                           |
|  Instagram Follower                      |
|  [ 28.300                           ]    |
|                                           |
|  Facebook Follower                       |
|  [ 8.700                            ]    |
|                                           |
|  YouTube Abonnenten                      |
|  [ 3.200                            ]    |
|                                           |
|  Website-Besucher                        |
|  [ 145.000                           ]   |
|                                           |
|  Social Media Ad-Impressions             |
|  [ 2.500.000                         ]   |
|                                           |
|  PR-Reichweite                           |
|  [ 15.000.000                        ]   |
|                                           |
|  Live-Zuschauer (Halle + Livestream)     |
|  [ 85.000                            ]   |
|                                           |
|  Newsletter-Abonnenten                   |
|  [ 4.200                             ]   |
|                                           |
|  Notizen                                 |
|  [ Freitextfeld...                   ]   |
|                                           |
|------------------------------------------|
|  [Abbrechen]              [Speichern]    |
+------------------------------------------+
```

**Regeln:**
- "Social Media Follower gesamt" wird NICHT als Eingabefeld angezeigt (automatisch berechnet)
- Eingabefelder: type="number", min=0, ganzzahlig (keine Dezimalstellen)
- Validierung: On Blur, nur positive Ganzzahlen erlaubt
- Labels UEBER dem Input
- Fehler UNTER dem Input (rot, inline)
- "Speichern" ist Primary-Button, "Abbrechen" ist Ghost-Button
- Dialog ist scrollbar bei kleinen Viewports (ScrollArea)
- Nach erfolgreichem Speichern: Dialog schliesst, Sonner-Toast "Daten gespeichert"

### 4.4 Notizen-Bereich

**ShadCN-Basis:** Textarea + Card + Button
**Anpassungen:** Inline-Bearbeitung auf der Dashboard-Seite

- Unterhalb des KPI-Grids als eigene Card
- CardTitle: "Notizen fuer [Jahr]"
- CardContent: Textarea (3-4 Zeilen sichtbar, resizable)
- Auto-Save nach Blur oder per "Speichern"-Button
- Placeholder: "Kommentare zum Jahr [Jahr] hinzufuegen..."
- Auch im Dateneingabe-Dialog als letztes Feld enthalten

### 4.5 Erfolgsmeldungen

**ShadCN-Basis:** Sonner (toast())
**Anpassungen:** Keine

- Position: Unten rechts (Standard)
- Dauer: 3 Sekunden
- Anwendungsfaelle:
  - "Daten fuer [Jahr] gespeichert" (Erfolg)
  - "Notiz gespeichert" (Erfolg)
  - "Fehler beim Speichern. Bitte erneut versuchen." (Fehler)

---

## 5. States

### 5.1 Leer-Zustand (Keine Daten fuer ein Jahr)

**ShadCN-Basis:** Empty

**Darstellung:**
- Zentriert im Content-Bereich (unterhalb der Tabs)
- Icon: ClipboardList (Lucide), 48px, text-muted
- Titel: "Noch keine Daten fuer [Jahr]"
- Beschreibung: "Erfasse die KPI-Werte fuer dieses Jahr, um das Dashboard zu fuellen."
- CTA-Button: "Daten erfassen" (Primary) — oeffnet den Dateneingabe-Dialog

### 5.2 Lade-Zustand

**ShadCN-Basis:** Skeleton

**Darstellung:**
- KPI-Grid zeigt 10 Skeleton-Cards (gleiche Grid-Anordnung wie echte Cards)
- Jede Skeleton-Card:
  - Skeleton-Linie fuer Titel (Breite 60%, Hoehe 16px)
  - Skeleton-Block fuer Hauptzahl (Breite 40%, Hoehe 36px)
  - Skeleton-Linie fuer Veraenderung (Breite 50%, Hoehe 14px)
- Tabs-Leiste: Skeleton-Bloecke fuer Tab-Triggers
- Kein Spinner — Skeleton Screens sind bevorzugt

### 5.3 Fehler-Zustand

**ShadCN-Basis:** Alert (AlertTitle, AlertDescription) + Button

**Darstellung:**
- Alert-Box mit variant="destructive"
- Icon: AlertCircle (Lucide)
- Titel: "Daten konnten nicht geladen werden"
- Beschreibung: "Bitte pruefe deine Internetverbindung und versuche es erneut."
- Button: "Erneut laden" (Secondary)

### 5.4 Kein Vorjahr vorhanden

- KPI-Cards zeigen die Hauptzahl, aber statt Veraenderung:
- Text: "Kein Vorjahr" in text-muted, fontSize xs
- Kein Trend-Icon, kein farbiger Badge

### 5.5 Teilweise Daten

- Wenn eine einzelne Metrik keinen Wert hat (null): Card zeigt "—" statt Zahl
- Veraenderung wird nicht berechnet wenn aktueller ODER Vorjahreswert fehlt

---

## 6. Barrierefreiheit (a11y)

### Farbkontraste

- Alle Texte erfuellen WCAG AA (mindestens 4.5:1 Kontrastverhaltnis)
- Success-Gruen (#16a34a) auf Weiss: 4.6:1 — knapp AA, auf successBg (#f0fdf4): besteht
- Error-Rot (#dc2626) auf Weiss: 4.6:1 — besteht AA
- Farbe ist NIE das einzige Unterscheidungsmerkmal:
  - Positive Veraenderung: Gruen + TrendingUp-Icon + Pluszeichen
  - Negative Veraenderung: Rot + TrendingDown-Icon + Minuszeichen

### Keyboard-Navigation

- Tab-Reihenfolge: Header -> Jahresauswahl-Tabs -> KPI-Cards -> Notizen -> Daten-bearbeiten-Button
- Tabs: Arrow Left/Right wechselt Jahre
- Dialog: Fokus-Trap aktiv, Escape schliesst, Tab innerhalb des Dialogs
- Alle interaktiven Elemente haben sichtbaren Fokus-Ring (2px solid primary.500, offset 2px)

### ARIA-Attribute

- KPI-Cards: `role="region"` mit `aria-label="[Metrik-Name]"`
- Veraenderungswerte: `aria-label="Veraenderung zum Vorjahr: plus 5.200, plus 13,9 Prozent"`
- Jahresauswahl-Tabs: Standardmaessig korrekt durch ShadCN Tabs (role="tablist")
- Dialog: Standardmaessig korrekt durch ShadCN Dialog (role="dialog", aria-modal)
- Toast/Sonner: `aria-live="polite"` (Standard bei ShadCN)
- Lade-Zustand: `aria-busy="true"` auf dem Grid-Container

### Schriftgroessen

- Mindestgroesse fuer Body-Text: 16px (1rem)
- Mindestgroesse fuer Labels/Hilfstexte: 12px (0.75rem)
- KPI-Hauptzahlen: 36px (2.25rem) — gut lesbar auch aus Distanz

### Touch Targets

- Alle klickbaren Elemente: Mindestens 44x44px
- Tab-Triggers: Ausreichend Padding (12px 16px)
- Buttons: Mindesthoehe 40px (md-Groesse)

---

## 7. Interaktionsdetails

### Jahreswechsel

1. User klickt auf Tab fuer anderes Jahr
2. Dashboard-Inhalt wird sofort gewechselt (kein Seitenreload)
3. Wenn Daten bereits geladen: sofortige Anzeige (gecached)
4. Wenn Daten noch nicht geladen: Skeleton-State fuer 0-2 Sekunden
5. URL-Parameter optional: `?year=2024` fuer Direktlinks

### Daten bearbeiten

1. User klickt "Daten bearbeiten"
2. Dialog oeffnet sich mit Werten des aktuell ausgewaehlten Jahres
3. Bestehende Werte sind vorausgefuellt, leere Felder sind leer
4. User aendert Werte
5. User klickt "Speichern"
6. Validierung laeuft (alle Felder pruefen)
7. Bei Fehler: Inline-Fehlermeldung unter dem betroffenen Feld
8. Bei Erfolg: Dialog schliesst, Toast "Daten gespeichert", Dashboard aktualisiert sich
9. "Social Media gesamt"-Card aktualisiert sich automatisch

### Notizen speichern

1. User tippt in Textarea auf dem Dashboard
2. Auto-Save nach 2 Sekunden Inaktivitaet (Debounce) ODER bei Blur
3. Subtiler Hinweis "Gespeichert" (kleiner Text unter Textarea, verschwindet nach 2s)
4. Alternativ: Expliziter "Speichern"-Button neben der Textarea

---

## 8. Empfohlene Lucide-Icons pro KPI

| KPI | Icon |
|-----|------|
| Social Media gesamt | Users |
| TikTok | Music (oder custom TikTok-SVG) |
| Instagram | Camera |
| Facebook | ThumbsUp |
| YouTube | Play |
| Website-Besucher | Globe |
| Ad-Impressions | Eye |
| PR-Reichweite | Newspaper |
| Live-Zuschauer | MonitorPlay |
| Newsletter | Mail |

---

## 9. Checkliste

- [x] Design Tokens definiert (Farben, Spacing, Typo, Radii, Shadows)
- [x] Alle Komponenten spezifiziert mit ShadCN-Mapping
- [x] Responsive Verhalten beschrieben (1-4 Spalten)
- [x] Empty / Loading / Error States definiert
- [x] Accessibility-Anforderungen dokumentiert
- [x] KPI-Veraenderungsfarben mit Icon + Vorzeichen (nicht nur Farbe)
- [x] Interaktionsflows beschrieben (Jahreswechsel, Dateneingabe, Notizen)
- [x] Zahlenformat: deutsches Format (Tausender-Punkt, Dezimal-Komma)

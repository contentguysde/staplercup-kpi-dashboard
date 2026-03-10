# ADR-001: Tech Stack

## Status
AKZEPTIERT

## Datum
2026-03-09

## Kontext

Das StaplerCup KPI-Dashboard ist ein internes Marketing-Tool zur Erfassung und Visualisierung von Reichweiten-KPIs. Das Team ist klein (1-3 Personen), die Datenmengen gering (~30-100 DB-Zeilen), und der Fokus liegt auf schneller Umsetzung eines MVPs mit spaeterer Erweiterbarkeit.

Anforderungen:
- Schnelles Deployment ohne Server-Management
- Persistente Datenhaltung mit PostgreSQL
- Responsive UI mit Dashboard-Karten und Formularen
- Deutsches Zahlenformat
- Keine Authentifizierung im MVP
- Erweiterbar fuer Charts, Export und Auth in spaeteren Phasen

## Entscheidung

### Frontend-Framework: Next.js 15 (App Router) + TypeScript

### Alternativen

#### Option A: Next.js 15 (App Router) + TypeScript (gewaehlt)
- Vorteile: Server Components fuer schnelle Ladezeiten, App Router mit Layouts, Vercel-native Integration, grosse Community, TypeScript-first
- Nachteile: App Router ist relativ neu, Server/Client-Grenze erfordert bewusstes Design
- Aufwand: niedrig

#### Option B: Vite + React (SPA)
- Vorteile: Einfacher, schneller Dev-Server, kein SSR-Overhead
- Nachteile: Kein SSR/SSG, separate API-Schicht noetig, kein Vercel-native Routing
- Aufwand: niedrig

#### Option C: Remix
- Vorteile: Gutes Datenlade-Modell, progressive Enhancement
- Nachteile: Kleinere Community, weniger Supabase-Integrationen, Vercel-Support weniger ausgereift
- Aufwand: mittel

### Datenbank: Supabase (PostgreSQL)

#### Option A: Supabase Cloud (gewaehlt)
- Vorteile: Managed PostgreSQL, REST-API automatisch generiert, RLS fuer spaetere Auth, JS-Client, Free Tier reicht, Realtime-Faehigkeit
- Nachteile: Vendor Lock-in (migrierbar da Standard-PostgreSQL), Free Tier Limits
- Aufwand: niedrig

#### Option B: PlanetScale (MySQL)
- Vorteile: Serverless, branching, gute DX
- Nachteile: MySQL statt PostgreSQL, kein eingebauter Auth-Service, Free Tier eingeschraenkt
- Aufwand: niedrig

#### Option C: SQLite (lokal/Turso)
- Vorteile: Kein externer Service, extrem schnell
- Nachteile: Kein Multi-User-Zugriff ohne Server, keine RLS, kein Auth-Service
- Aufwand: mittel

### UI-Framework: ShadCN/UI + Tailwind CSS

#### Option A: ShadCN/UI + Tailwind CSS (gewaehlt)
- Vorteile: Copy-Paste-Komponenten (kein Lock-in), vollstaendig anpassbar, Tailwind-nativ, Accessibility eingebaut, Lucide Icons integriert, Chart-Komponenten via Recharts
- Nachteile: Kein "installieren und fertig" — Komponenten muessen einzeln hinzugefuegt werden
- Aufwand: niedrig

#### Option B: Material UI (MUI)
- Vorteile: Grosse Komponentenbibliothek, Enterprise-ready
- Nachteile: Schwer anpassbar, grosses Bundle, eigene Styling-Engine (Emotion), nicht Tailwind-nativ
- Aufwand: mittel

#### Option C: Ant Design
- Vorteile: Umfangreiche Enterprise-Komponenten
- Nachteile: Chinesische Dokumentation als Primaerquelle, schwer anpassbar, grosses Bundle
- Aufwand: mittel

### Charting: Recharts (via ShadCN Chart)

#### Option A: Recharts via ShadCN Chart (gewaehlt)
- Vorteile: Nativer ShadCN-Support, React-Komponenten, responsive, gut dokumentiert
- Nachteile: Performance bei sehr vielen Datenpunkten (irrelevant fuer unseren Use Case)
- Aufwand: niedrig

#### Option B: Chart.js + react-chartjs-2
- Vorteile: Weit verbreitet, leichtgewichtig
- Nachteile: Kein ShadCN-Integration, Canvas-basiert (kein SSR)
- Aufwand: niedrig

### Hosting: Vercel

#### Option A: Vercel (gewaehlt)
- Vorteile: Zero-Config fuer Next.js, automatische Preview Deployments, Edge Functions, eingebautes CDN, Git-Integration
- Nachteile: Vendor Lock-in (aber Next.js laeuft auch anderswo), Kosten bei hohem Traffic (irrelevant)
- Aufwand: niedrig

#### Option B: Netlify
- Vorteile: Aehnlich wie Vercel, gute DX
- Nachteile: Next.js-Support weniger nativ als Vercel, langsamere Builds
- Aufwand: niedrig

### Package Manager: pnpm

#### Option A: pnpm (gewaehlt)
- Vorteile: Schnellste Installationszeiten, effizientes node_modules (Content-addressable Store), strenge Dependency-Resolution, Vercel-kompatibel
- Nachteile: Manchmal Kompatibilitaetsprobleme mit aelteren Packages (selten)
- Aufwand: niedrig

### Testing: Vitest + React Testing Library + Playwright

#### Option A: Vitest + RTL + Playwright (gewaehlt)
- Vorteile: Vitest ist schnell und ESM-nativ, RTL foerdert User-zentriertes Testing, Playwright fuer Cross-Browser E2E, alles TypeScript-first
- Nachteile: Playwright erfordert Browser-Installation in CI
- Aufwand: niedrig

#### Option B: Jest + RTL + Cypress
- Vorteile: Ausgereifteres Oekosystem, mehr Stack Overflow Antworten
- Nachteile: Jest ist langsamer, ESM-Support schwierig, Cypress hat teureres Cloud-Angebot
- Aufwand: niedrig

### Input-Validierung: Zod

Zod wird fuer die Validierung aller Eingaben verwendet (Formulare und API-Routes). Zod ist TypeScript-first und erzeugt automatisch Typen aus Schemas.

## Konsequenzen

### Positiv
- Einheitlicher Stack: TypeScript durchgaengig (Frontend, Backend-Logik, Tests, Validierung)
- Minimaler Infrastruktur-Aufwand: Vercel + Supabase = kein Server-Management
- Schnelle Iterationszyklen: Preview Deployments, Hot Reload, schnelle Tests
- Erweiterbar: Supabase Auth fuer spaeteres Login, Recharts fuer Charts, alles vorbereitet
- Geringe Kosten: Free Tiers von Vercel und Supabase reichen fuer diesen Use Case

### Negativ
- Abhaengigkeit von zwei Cloud-Diensten (Vercel + Supabase)
- App Router erfordert bewusstes Denken ueber Server/Client-Grenze
- ShadCN-Komponenten muessen einzeln installiert werden (kein "alles auf einmal")

### Risiken
- Supabase Free Tier Limits: Unwahrscheinlich bei diesem Datenvolumen, aber monitorbar
- Vercel Pricing bei Wachstum: Aktuell Hobby-Plan ausreichend, Pro-Plan bei Bedarf ($20/Monat)

## Vollstaendiger Tech Stack

| Kategorie | Technologie | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| Sprache | TypeScript (strict) | 5.x |
| UI-Bibliothek | ShadCN/UI | latest |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| Schrift | Inter (next/font) | — |
| Charts | Recharts (via ShadCN Chart) | latest |
| Datenbank | Supabase (PostgreSQL) | Cloud |
| DB-Client | @supabase/supabase-js | 2.x |
| Validierung | Zod | 3.x |
| Unit/Integration Tests | Vitest + React Testing Library | latest |
| E2E Tests | Playwright | latest |
| Hosting | Vercel | — |
| CI/CD | Vercel Git Integration + GitHub Actions | — |
| Package Manager | pnpm | 9.x |
| Node.js | 22.x | LTS |
| Linting | ESLint | 9.x |
| Formatting | Prettier | 3.x |

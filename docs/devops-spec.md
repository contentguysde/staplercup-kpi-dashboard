# DevOps-Spezifikation: StaplerCup KPI-Dashboard

## Uebersicht

| Aspekt | Entscheidung |
|--------|-------------|
| Hosting | Vercel (Hobby/Pro) |
| Framework | Next.js 15 (App Router) |
| Datenbank | Supabase Cloud (PostgreSQL) |
| Package Manager | pnpm |
| CI/CD | Vercel Git Integration + GitHub Actions (Lint/Test) |
| Container | Keiner (Vercel managed) |

---

## 1. Vercel-Setup

### Projekt-Konfiguration

- **Framework Preset**: Next.js (automatisch erkannt)
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next` (Standard)
- **Node.js Version**: 22.x

### Deployment-Verhalten

| Branch | Environment | URL |
|--------|------------|-----|
| `main` | Production | staplercup-dashboard.vercel.app |
| Feature-Branches | Preview | automatisch generierte Preview-URL |

- Jeder Push auf `main` triggert ein Production Deployment
- Jeder Push auf einen Feature-Branch erstellt ein Preview Deployment
- Preview Deployments erhalten eine eigene URL zum Testen

### vercel.json (optional, im Projekt-Root)

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build"
}
```

In den meisten Faellen wird diese Datei nicht benoetigt, da Vercel Next.js automatisch erkennt. Nur erstellen, wenn Overrides noetig sind.

---

## 2. CI/CD

### Strategie: Vercel Git Integration + GitHub Actions

Vercel uebernimmt das Deployment. GitHub Actions uebernimmt die Qualitaetssicherung.

### GitHub Actions Pipeline

Datei: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm tsc --noEmit

      - name: Tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

### Branch Protection Rules (GitHub)

Fuer den `main`-Branch:
- **Require pull request reviews**: 0 (kleines Team, optional 1)
- **Require status checks to pass**: `quality` Job muss gruen sein
- **Require branches to be up to date**: Ja

---

## 3. Branch-Strategie

### Trunk-Based Development (vereinfacht)

```
main (Production)
  └── feature/dashboard-layout
  └── feature/data-entry-form
  └── fix/kpi-calculation
```

### Regeln

- `main` ist immer deploybar (Production)
- Feature-Branches werden von `main` abgezweigt
- Naming: `feature/<beschreibung>`, `fix/<beschreibung>`, `chore/<beschreibung>`
- Merge via Pull Request (Squash Merge bevorzugt)
- Feature-Branches nach Merge loeschen
- Keine `develop`- oder `staging`-Branches noetig (Vercel Preview reicht)

### Workflow

1. Issue erstellen (GitHub)
2. Branch erstellen: `git checkout -b feature/dashboard-layout`
3. Entwickeln, committen, pushen
4. Pull Request erstellen → Vercel Preview + CI laufen automatisch
5. Review (optional bei kleinem Team) → Merge in `main`
6. Vercel deployed automatisch nach Production

---

## 4. Environment Variables

### Benoetigte Variablen

| Variable | Wert-Typ | Wo setzen | Beschreibung |
|----------|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Vercel + `.env.local` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | Vercel + `.env.local` | Supabase Anonymous/Public Key |

### Hinweise

- `NEXT_PUBLIC_`-Prefix: Diese Werte sind im Browser sichtbar. Das ist gewollt — der Anon Key ist durch Supabase Row Level Security (RLS) geschuetzt.
- Fuer Phase 3 (Auth) wird zusaetzlich ein `SUPABASE_SERVICE_ROLE_KEY` benoetigt (OHNE `NEXT_PUBLIC_`-Prefix, nur serverseitig).

### .env.local (lokale Entwicklung, wird NICHT committed)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### .env.example (Template, wird committed)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Environment Variables

In den Vercel Project Settings unter "Environment Variables" setzen:
- `NEXT_PUBLIC_SUPABASE_URL` → fuer alle Environments (Production, Preview)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → fuer alle Environments

---

## 5. Repo-Struktur

```
staplercup-kpi-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions Pipeline
├── .claude/
│   ├── roles/                      # Agent-Rollen (bestehend)
│   ├── memory/                     # Agent-Memory
│   └── references/                 # Referenz-Dokumente
├── docs/
│   ├── prd.md                      # Produkt-Anforderungen
│   ├── user-stories.md             # User Stories
│   ├── devops-spec.md              # Diese Datei
│   └── adr/                        # Architecture Decision Records
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root Layout
│   │   ├── page.tsx                # Dashboard (Startseite)
│   │   ├── globals.css             # Globale Styles (Tailwind)
│   │   └── eingabe/
│   │       └── page.tsx            # Dateneingabe-Seite
│   ├── components/
│   │   ├── ui/                     # ShadCN/UI Komponenten
│   │   ├── kpi-card.tsx            # KPI-Karten-Komponente
│   │   ├── year-selector.tsx       # Jahresauswahl
│   │   └── data-entry-form.tsx     # Eingabeformular
│   ├── lib/
│   │   ├── supabase.ts             # Supabase Client
│   │   └── utils.ts                # Hilfsfunktionen (cn, Formatierung)
│   └── types/
│       └── index.ts                # TypeScript Types/Interfaces
├── .env.example                    # Env-Template
├── .env.local                      # Lokale Env (gitignored)
├── .gitignore
├── CLAUDE.md
├── components.json                 # ShadCN/UI Konfiguration
├── next.config.ts                  # Next.js Konfiguration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs              # PostCSS (Tailwind)
├── tailwind.config.ts              # Tailwind Konfiguration
├── tsconfig.json
└── vitest.config.ts                # Test-Konfiguration
```

### Ordner-Erklaerung

| Ordner | Zweck |
|--------|-------|
| `src/app/` | Next.js App Router Seiten |
| `src/components/ui/` | ShadCN/UI Basis-Komponenten (generiert) |
| `src/components/` | Projekt-spezifische Komponenten |
| `src/lib/` | Shared Utilities, Supabase Client |
| `src/types/` | TypeScript Typen und Interfaces |
| `docs/` | Projekt-Dokumentation |
| `docs/adr/` | Architecture Decision Records |

---

## 6. .gitignore

```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel/

# Test
coverage/
```

---

## 7. Checkliste fuer Projektstart

- [ ] GitHub Repository erstellen
- [ ] `pnpm create next-app` mit TypeScript + App Router + Tailwind
- [ ] ShadCN/UI initialisieren (`pnpm dlx shadcn@latest init`)
- [ ] Vitest einrichten
- [ ] `.env.example` anlegen
- [ ] `.gitignore` pruefen (`.env.local` enthalten)
- [ ] Vercel-Projekt verbinden (Import from GitHub)
- [ ] Environment Variables in Vercel setzen
- [ ] GitHub Actions CI-Workflow anlegen
- [ ] Branch Protection fuer `main` aktivieren
- [ ] Erster Deployment-Test (leere Next.js App)

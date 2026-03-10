# Security-Spezifikation: StaplerCup KPI-Dashboard

## Kontext

Internes Marketing-Dashboard zur Erfassung von Reichweiten-KPIs.
Keine sensiblen Daten, keine User-Daten, keine Finanzdaten.
Zugriff nur durch ein kleines internes Team.

---

## 1. MVP Security

### 1.1 Supabase Row Level Security (RLS)

Auch ohne Auth muessen RLS Policies aktiv sein, um die Datenbank
vor ungewolltem Zugriff ueber den oeffentlichen `anon`-Key zu schuetzen.

**Strategie: Anon-Key mit eingeschraenkten Rechten**

```sql
-- RLS aktivieren auf allen Tabellen
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE years ENABLE ROW LEVEL SECURITY;

-- MVP: Anon darf lesen und schreiben (internes Tool)
CREATE POLICY "anon_select" ON kpi_data
  FOR SELECT USING (true);

CREATE POLICY "anon_insert" ON kpi_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update" ON kpi_data
  FOR UPDATE USING (true);

-- Anon darf NICHT loeschen (Schutz vor Datenverlust)
-- DELETE hat keine Policy → wird geblockt
```

**Warum RLS trotz "kein Auth"?**
- Ohne RLS kann jeder mit dem `anon`-Key beliebige SQL-Operationen ausfuehren
- RLS beschraenkt auf die definierten Operationen (kein DELETE, kein Schema-Zugriff)
- Spaetere Auth-Integration wird deutlich einfacher

### 1.2 Environment Variables

```
# .env.local (NICHT committen)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Server-seitig (nur in API Routes verfuegbar)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Regeln:**
- `NEXT_PUBLIC_*` Variablen sind im Browser sichtbar — das ist OK fuer den `anon`-Key,
  da RLS die Zugriffe einschraenkt
- `SUPABASE_SERVICE_ROLE_KEY` darf NIE mit `NEXT_PUBLIC_` prefixed werden
- Der Service-Role-Key umgeht RLS und darf nur in Server-seitigen API Routes verwendet werden
- `.env.local` ist in `.gitignore` eingetragen (pruefen!)
- In Vercel: Environment Variables ueber das Dashboard setzen, nicht ueber Code

### 1.3 API-Route-Absicherung

Fuer Next.js API Routes (falls verwendet):

```typescript
// Validierung mit Zod fuer alle Eingaben
import { z } from 'zod';

const kpiInputSchema = z.object({
  year: z.number().int().min(2023).max(2030),
  metric: z.string().max(100),
  value: z.number().min(0).max(999_999_999),
  notes: z.string().max(2000).optional(),
});
```

**Massnahmen:**
- Input-Validierung mit Zod auf allen API Routes
- Keine dynamischen Queries — nur Supabase Client SDK verwenden
- Fehler-Responses ohne interne Details (kein Stack Trace, keine DB-Struktur)
- Rate Limiting ist im MVP nicht noetig (internes Tool, wenige User)

### 1.4 Next.js Security Headers

In `next.config.js`:

```javascript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

CSP wird im MVP nicht konfiguriert — der Aufwand steht in keinem
Verhaeltnis zum Risiko bei einem internen Tool ohne User-Input
der als HTML gerendert wird.

### 1.5 Frontend-Sicherheit

- Kein `dangerouslySetInnerHTML` — React escaped standardmaessig
- Notizen-Feld: Nur als Plain Text speichern und anzeigen
- Keine File-Uploads im MVP

---

## 2. Phase-2-Empfehlung: Auth mit Supabase Auth

Wenn in Phase 3 (laut PRD) Login hinzukommt:

### Empfohlener Ansatz

1. **Supabase Auth mit Email/Password** (einfachste Loesung fuer kleines Team)
2. Alternativ: **Magic Link** (kein Passwort-Management noetig)
3. Optional: **OAuth mit Google** (wenn Firmen-Google-Accounts vorhanden)

### Migration von "kein Auth" zu Auth

```sql
-- RLS Policies anpassen: Nur authentifizierte User
DROP POLICY "anon_select" ON kpi_data;
DROP POLICY "anon_insert" ON kpi_data;
DROP POLICY "anon_update" ON kpi_data;

CREATE POLICY "auth_select" ON kpi_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_insert" ON kpi_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_update" ON kpi_data
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### Aufwand

- Supabase Auth Setup: ~2h
- Login-Page (ShadCN Form): ~2h
- RLS Policy Migration: ~1h
- Middleware fuer geschuetzte Routes: ~1h
- **Gesamt: ~1 Tag**

---

## 3. OWASP-Check: Relevante Risiken

| # | Risiko | Relevanz | Status MVP | Massnahme |
|---|--------|----------|-----------|-----------|
| 1 | Injection | Mittel | Abgedeckt | Supabase SDK parametrisiert automatisch, Zod-Validierung |
| 2 | Broken Auth | Niedrig | Akzeptiert | Kein Auth im MVP (bewusstes Risiko, PRD-konform) |
| 3 | Sensitive Data Exposure | Niedrig | Abgedeckt | Keine sensiblen Daten, HTTPS via Vercel |
| 4 | XXE | Nicht relevant | — | Kein XML-Processing |
| 5 | Broken Access Control | Mittel | Teilweise | RLS aktiv, aber kein Auth = jeder mit URL hat Zugriff |
| 6 | Security Misconfiguration | Niedrig | Abgedeckt | Security Headers, kein Debug in Prod |
| 7 | XSS | Niedrig | Abgedeckt | React Auto-Escaping, kein dangerouslySetInnerHTML |
| 8 | Insecure Deserialization | Nicht relevant | — | Nur JSON ueber Supabase SDK |
| 9 | Vulnerable Components | Niedrig | Laufend | `pnpm audit` in CI einbauen |
| 10 | Insufficient Logging | Niedrig | Akzeptiert | Im MVP kein Logging noetig, Vercel hat Basic-Logs |

### Akzeptierte Risiken im MVP

1. **Kein Auth**: Jeder mit der URL kann Daten sehen und aendern.
   Risiko ist niedrig weil: internes Tool, URL nicht oeffentlich,
   Daten nicht vertraulich, kein DELETE moeglich.

2. **Kein Rate Limiting**: Theoretisch koennte jemand die API spammen.
   Risiko ist niedrig weil: URL intern, Vercel hat DDoS-Schutz.

---

## 4. Secrets-Management

### .env.local Struktur

```bash
# === Supabase ===
# Oeffentlich (im Browser sichtbar, durch RLS geschuetzt)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Server-seitig (NIE im Browser, umgeht RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### .gitignore Eintraege (Pflicht)

```
.env
.env.local
.env.*.local
```

### Vercel Environment Variables

- Alle Variablen ueber Vercel Dashboard setzen (Settings → Environment Variables)
- `NEXT_PUBLIC_*` fuer alle Environments (Preview + Production)
- `SUPABASE_SERVICE_ROLE_KEY` nur fuer Production
- Keine Secrets in `vercel.json` oder Build-Scripts

### .env.example (wird committet)

```bash
# Kopiere diese Datei nach .env.local und fuelle die Werte aus
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Zusammenfassung

| Bereich | MVP-Status | Prioritaet |
|---------|-----------|------------|
| RLS Policies | Muss | Hoch |
| .env.local / .gitignore | Muss | Hoch |
| Input-Validierung (Zod) | Muss | Hoch |
| Security Headers | Soll | Mittel |
| DELETE-Schutz (kein Policy) | Muss | Hoch |
| Auth | Phase 3 | — |
| Rate Limiting | Phase 3 | — |
| CSP Header | Phase 3 | — |
| Audit-Logging | Phase 3 | — |

**Kernaussage**: Fuer ein internes Marketing-Dashboard ohne sensible Daten
reichen RLS, Input-Validierung und sauberes Secrets-Management voellig aus.
Auth kann spaeter mit minimalem Aufwand nachgeruestet werden.

# Content & Translation

## Deine Rolle
Du bist der Content-Engineer im Team. Du schreibst UI-Texte,
verwaltest Uebersetzungen und sorgst fuer konsistente, benutzer-
freundliche Microcopy in der gesamten Anwendung.

## i18n Setup

### Dateistruktur
```
src/
├── locales/
│   ├── de.json          ← Deutsche Strings (oder Hauptsprache)
│   ├── en.json          ← Englische Strings
│   ├── fr.json          ← Weitere Sprachen
│   └── index.ts         ← Export und Typ-Definitionen
```

### Translation-Datei Format
```json
{
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Loeschen",
    "loading": "Wird geladen...",
    "error": "Etwas ist schiefgegangen"
  },
  "auth": {
    "login": {
      "title": "Anmelden",
      "email": "E-Mail-Adresse",
      "password": "Passwort",
      "submit": "Anmelden",
      "forgotPassword": "Passwort vergessen?",
      "noAccount": "Noch kein Konto? {{signupLink}}",
      "error": {
        "invalid": "E-Mail oder Passwort ist falsch",
        "locked": "Dein Konto wurde gesperrt. Versuche es in {{minutes}} Minuten erneut."
      }
    }
  }
}
```

### Konventionen
- Keys: camelCase, verschachtelt nach Feature
- Namespaces: `common`, `auth`, `dashboard`, `settings`, etc.
- Variablen: `{{variableName}}` Syntax
- Pluralisierung: `_one`, `_other` Suffix (oder Framework-spezifisch)

### Type Safety
```typescript
// locales/index.ts
import de from "./de.json";

export type TranslationKeys = typeof de;
// Ermoeglicht Autocomplete und Compile-Time Checks
```

## Microcopy-Regeln

### Buttons und Actions
| Statt | Besser | Warum |
|-------|--------|-------|
| OK | Speichern / Senden / Bestaetigen | Konkrete Aktion benennen |
| Abbrechen | Verwerfen / Zurueck | Klar was passiert |
| Hier klicken | [Link-Text der Ziel beschreibt] | a11y + Klarheit |
| Submit | Absenden / Registrieren | Deutsche UIs deutsch |
| Yes/No | Loeschen / Behalten | Aktion statt Antwort |

### Fehlermeldungen
```
Schlecht:  "Error 422: Validation failed"
Besser:   "Die E-Mail-Adresse ist ungueltig"
Optimal:  "Bitte gib eine gueltige E-Mail-Adresse ein (z.B. name@beispiel.de)"
```

Muster fuer gute Fehlermeldungen:
1. **Was** ist passiert (kurz)
2. **Warum** (wenn hilfreich)
3. **Was tun** (konkrete Loesung)

### Leere Zustaende
```
Schlecht:  "Keine Daten"
Besser:   "Noch keine Projekte vorhanden"
Optimal:  "Noch keine Projekte vorhanden. Erstelle dein erstes Projekt, um loszulegen."
```

### Bestaetigungen
```
Schlecht:  "Bist du sicher?"
Besser:   "Moechtest du 'Projektname' unwiderruflich loeschen?"
Optimal:  "Moechtest du 'Projektname' unwiderruflich loeschen?
           Alle zugehoerigen Daten werden entfernt."
```

### Ladezeiten
```
Kurz (< 2s):   Kein Text noetig (Skeleton/Spinner reicht)
Mittel (2-5s):  "Wird geladen..."
Lang (> 5s):    "Daten werden verarbeitet. Das kann einen Moment dauern."
Sehr lang:      Fortschrittsanzeige mit konkretem Status
```

## Uebersetzungs-Workflow

### Neue Strings hinzufuegen
1. String IMMER als Translation Key anlegen, nie hardcoded
2. Zuerst in der Hauptsprache anlegen
3. Dann in alle anderen Sprachen uebersetzen
4. Pruefen dass kein Key fehlt (Vollstaendigkeitscheck)

### Vollstaendigkeitscheck
Stelle sicher dass alle Sprach-Dateien die gleichen Keys haben:
```typescript
// Alle Keys aus der Referenzsprache muessen in jeder Sprache existieren
// Fehlende Keys melden, nicht mit leerem String fuellen
```

### Pluralisierung
```json
{
  "items": {
    "count_one": "{{count}} Element",
    "count_other": "{{count}} Elemente"
  },
  "remaining": {
    "count_one": "Noch {{count}} Versuch uebrig",
    "count_other": "Noch {{count}} Versuche uebrig"
  }
}
```

### Variablen und Formatierung
```json
{
  "greeting": "Hallo {{name}}",
  "date": "Erstellt am {{date, datetime}}",
  "price": "{{amount, currency}}",
  "fileSize": "{{size, filesize}}"
}
```

## Lokalisierung (l10n)

### Datumsformate
| Locale | Kurz | Lang |
|--------|------|------|
| de | 06.02.2026 | 6. Februar 2026 |
| en | 02/06/2026 | February 6, 2026 |
| fr | 06/02/2026 | 6 fevrier 2026 |

### Zahlenformate
| Locale | Zahl | Waehrung |
|--------|------|----------|
| de | 1.234,56 | 1.234,56 EUR |
| en | 1,234.56 | $1,234.56 |
| fr | 1 234,56 | 1 234,56 EUR |

### Regeln
- Immer `Intl.DateTimeFormat` und `Intl.NumberFormat` verwenden
- Nie manuell Datumsformate bauen
- Zeitzonen beruecksichtigen (UTC speichern, lokal anzeigen)
- Relative Zeitangaben ("vor 5 Minuten") wo sinnvoll

## Deutsche Sprache — Umlaute und Eszett

### Grundregel
Umlaute (ae, oe, ue, Ae, Oe, Ue) und Eszett (ss) werden in allen
UI-Texten und Uebersetzungen IMMER korrekt geschrieben. Nie als
ae/oe/ue/ss ersetzen — ausser in technischen Kontexten (siehe unten).

### Encoding
- Dateien: UTF-8 (sicherstellen in `.editorconfig` und IDE)
- Datenbank: UTF-8 / utf8mb4 (bei MySQL)
- API Responses: `Content-Type: application/json; charset=utf-8`
- HTML: `<meta charset="utf-8">`

### Wo Umlaute verwenden
| Kontext | Umlaute? | Beispiel |
|---------|----------|----------|
| UI-Texte / Microcopy | Ja | "Loeschen", "Aendern", "Oeffentlich" |
| Translation Keys | Nein (camelCase ASCII) | `deleteConfirmation`, `publicProfile` |
| URL-Slugs | Nein (SEO-Konvention) | `/oeffentliches-profil` statt `/öffentliches-profil` |
| Dateinamen | Nein (ASCII) | `oeffnungszeiten.ts` statt `öffnungszeiten.ts` |
| DB-Spalten | Nein (ASCII) | `public_profile` |
| Logmeldungen | Nein (ASCII-safe) | "User geloescht" |
| E-Mails / PDFs | Ja | "Sehr geehrte Frau Mueller" |

### Sortierung
Immer locale-aware sortieren, nie alphabetisch nach Byte-Wert:
```typescript
// RICHTIG
const sorted = items.sort((a, b) =>
  a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
);

// Oder mit Intl.Collator (performanter bei vielen Elementen)
const collator = new Intl.Collator('de', { sensitivity: 'base' });
const sorted = items.sort((a, b) => collator.compare(a.name, b.name));

// FALSCH — sortiert ae/oe/ue falsch ein
const sorted = items.sort((a, b) => a.name > b.name ? 1 : -1);
```

### Suche
Umlaut-insensitive Suche implementieren, damit User sowohl
"Muenchen" als auch "Muenchen" finden:
```typescript
// Normalisiere Suchbegriff und Daten fuer Vergleich
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Diakritische Zeichen entfernen
}
```

In der Datenbank: `unaccent`-Extension (PostgreSQL) oder
`COLLATE`-Einstellung fuer umlaut-insensitive Suche.

### Checkliste Deutsche Sprache
- [ ] UTF-8 Encoding in allen Dateien, DB und API
- [ ] Umlaute in UI-Texten korrekt (nicht als ae/oe/ue)
- [ ] URL-Slugs ohne Umlaute (ae/oe/ue/ss)
- [ ] Translation Keys ohne Umlaute (camelCase ASCII)
- [ ] Sortierung locale-aware (`Intl.Collator('de')`)
- [ ] Suche umlaut-insensitiv

## SEO-Texte (falls relevant)

### Meta Tags pro Seite
```json
{
  "meta": {
    "home": {
      "title": "Projektname — Kurzbeschreibung",
      "description": "Ein bis zwei Saetze die den Inhalt der Seite beschreiben. Max 155 Zeichen."
    },
    "login": {
      "title": "Anmelden — Projektname",
      "description": "Melde dich bei deinem Konto an."
    }
  }
}
```

### Regeln
- Title: Max 60 Zeichen, wichtigstes Keyword vorn
- Description: Max 155 Zeichen, Call-to-Action einbauen
- Pro Seite einzigartig
- Keine Keyword-Stuffing

## Konsistenz-Glossar

Definiere fuer jedes Projekt ein Glossar verbindlicher Begriffe:

```markdown
| Englisch | Deutsch | NICHT verwenden |
|----------|---------|-----------------|
| Save | Speichern | Sichern, Uebernehmen |
| Delete | Loeschen | Entfernen, Vernichten |
| Cancel | Abbrechen | Stornieren, Zurueck |
| Settings | Einstellungen | Optionen, Konfiguration |
| Dashboard | Dashboard | Uebersicht, Startseite |
| Sign up | Registrieren | Anmelden (Verwechslungsgefahr!) |
| Sign in | Anmelden | Einloggen |
| Profile | Profil | Konto, Account |
```

Regel: Glossar beim Projekt-Start definieren und konsequent einhalten.

## Checkliste vor Abgabe

- [ ] Alle Strings als Translation Keys (nichts hardcoded)
- [ ] Hauptsprache vollstaendig
- [ ] Alle Sprachen vollstaendig (kein Key fehlt)
- [ ] Pluralisierung korrekt
- [ ] Variablen in Strings funktionieren
- [ ] Fehlermeldungen benutzerfreundlich (Was + Warum + Was tun)
- [ ] Leere Zustaende haben hilfreiche Texte
- [ ] Konsistent mit Glossar
- [ ] SEO Meta Tags vorhanden (falls relevant)
- [ ] Keine abgeschnittenen Texte in der UI (laengere Sprachen beruecksichtigt)

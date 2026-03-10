# User Stories: StaplerCup KPI-Dashboard

## Uebersicht

| ID | Titel | Prioritaet |
|----|-------|-----------|
| US-001 | Dashboard mit KPI-Karten | MUST |
| US-002 | Jahresvergleich anzeigen | MUST |
| US-003 | Jahresauswahl | MUST |
| US-004 | Metriken manuell eingeben | MUST |
| US-005 | Metriken bearbeiten | MUST |
| US-006 | Daten persistent speichern | MUST |
| US-007 | Trend-Charts ueber mehrere Jahre | SHOULD |
| US-008 | Daten exportieren (CSV/PDF) | SHOULD |
| US-009 | Live-Zuschauer aufschluesseln | SHOULD |
| US-010 | Filterbare Ansichten | SHOULD |
| US-011 | Zugangsschutz (Login) | COULD |
| US-012 | Automatischer Social-Media-Import | COULD |
| US-013 | Zielwerte und Benchmarks | COULD |

---

## MUST — Pflicht fuer MVP

### US-001: Dashboard mit KPI-Karten

**Als** Marketing-Verantwortliche/r
**moechte ich** alle 10 KPIs auf einer Dashboard-Seite als Karten sehen
**damit** ich auf einen Blick den aktuellen Stand aller Reichweiten-Metriken erfasse.

#### Akzeptanzkriterien
- [ ] Das Dashboard zeigt 10 KPI-Karten: Social Media Follower gesamt, TikTok Follower, Instagram Follower, Facebook Follower, YouTube Abonnenten, Website-Besucher, Social Media Ad-Impressions, PR-Reichweite, Live-Zuschauer, Newsletter-Abonnenten
- [ ] Jede Karte zeigt den absoluten Wert fuer das ausgewaehlte Jahr
- [ ] Karten sind in einer uebersichtlichen Grid-Anordnung dargestellt
- [ ] Das Dashboard ist innerhalb von 2 Sekunden geladen
- [ ] Wenn fuer eine Metrik kein Wert vorhanden ist, wird ein Platzhalter angezeigt (z.B. "Keine Daten")

#### Abgrenzung
- Keine Diagramme oder Charts (siehe US-007)
- Keine Filterfunktion (siehe US-010)

#### Abhaengigkeiten
- Benoetigt: US-006 (Daten muessen gespeichert sein)

#### Prioritaet: MUST

---

### US-002: Jahresvergleich anzeigen

**Als** Marketing-Verantwortliche/r
**moechte ich** auf jeder KPI-Karte die Veraenderung zum Vorjahr sehen
**damit** ich sofort erkenne, ob sich eine Metrik positiv oder negativ entwickelt hat.

#### Akzeptanzkriterien
- [ ] Jede KPI-Karte zeigt die absolute Veraenderung zum Vorjahr (z.B. +1.200 oder -500)
- [ ] Jede KPI-Karte zeigt die prozentuale Veraenderung zum Vorjahr (z.B. +15,3% oder -8,2%)
- [ ] Positive Veraenderungen werden gruen dargestellt
- [ ] Negative Veraenderungen werden rot dargestellt
- [ ] Keine Veraenderung (0) wird neutral dargestellt
- [ ] Wenn kein Vorjahreswert vorhanden ist, wird kein Vergleich angezeigt (z.B. fuer das erste erfasste Jahr)
- [ ] Zahlen werden mit deutschem Zahlenformat angezeigt (Punkt als Tausendertrennzeichen, Komma als Dezimaltrennzeichen)

#### Abgrenzung
- Kein Vergleich ueber mehrere Jahre hinweg (siehe US-007)
- Kein Vergleich mit Zielwerten (siehe US-013)

#### Abhaengigkeiten
- Benoetigt: US-001, US-006

#### Prioritaet: MUST

---

### US-003: Jahresauswahl

**Als** Marketing-Verantwortliche/r
**moechte ich** das angezeigte Jahr wechseln koennen
**damit** ich die KPIs verschiedener Jahre einsehen und vergleichen kann.

#### Akzeptanzkriterien
- [ ] Es gibt ein Auswahlelement (Dropdown oder Tabs) zur Jahresauswahl
- [ ] Verfuegbare Jahre: ab 2023 bis zum aktuellen Jahr
- [ ] Beim Wechsel des Jahres aktualisieren sich alle KPI-Karten
- [ ] Der Jahresvergleich (US-002) bezieht sich immer auf das Vorjahr des ausgewaehlten Jahres
- [ ] Das aktuelle Jahr ist standardmaessig vorausgewaehlt
- [ ] Die Auswahl reagiert sofort (kein spuerbares Nachladen)

#### Abgrenzung
- Kein Mehrfachauswahl von Jahren (nur ein Jahr gleichzeitig)

#### Abhaengigkeiten
- Benoetigt: US-001

#### Prioritaet: MUST

---

### US-004: Metriken manuell eingeben

**Als** Marketing-Verantwortliche/r
**moechte ich** die KPI-Werte fuer ein bestimmtes Jahr manuell eingeben koennen
**damit** ich historische und aktuelle Daten im Dashboard hinterlegen kann.

#### Akzeptanzkriterien
- [ ] Es gibt eine Eingabeseite oder ein Modal mit einem Formular
- [ ] Fuer jedes Jahr (ab 2023) koennen alle 10 Metriken eingegeben werden
- [ ] Eingabefelder akzeptieren nur Ganzzahlen (keine Dezimalwerte)
- [ ] Eingabefelder haben eine Validierung (keine negativen Werte, kein Text)
- [ ] Nach dem Speichern erscheint eine Erfolgsmeldung
- [ ] Bei Validierungsfehlern werden verstaendliche Fehlermeldungen angezeigt
- [ ] Die eingegebenen Daten sind sofort im Dashboard sichtbar

#### Abgrenzung
- Kein CSV-Import (manuelle Eingabe reicht fuer MVP)
- Kein Bulk-Import fuer mehrere Jahre gleichzeitig

#### Abhaengigkeiten
- Benoetigt: US-006

#### Prioritaet: MUST

---

### US-005: Metriken bearbeiten

**Als** Marketing-Verantwortliche/r
**moechte ich** bereits eingegebene KPI-Werte korrigieren koennen
**damit** ich Tippfehler oder nachtraeglich aktualisierte Zahlen anpassen kann.

#### Akzeptanzkriterien
- [ ] Bestehende Werte koennen ueber das Eingabeformular (US-004) geaendert werden
- [ ] Beim Oeffnen des Formulars fuer ein Jahr mit bestehenden Daten werden die aktuellen Werte vorausgefuellt
- [ ] Aenderungen werden erst nach explizitem Speichern uebernommen
- [ ] Nach dem Speichern aktualisiert sich das Dashboard sofort
- [ ] Einzelne Felder koennen geleert werden (Metrik entfernen)

#### Abgrenzung
- Kein Aenderungsprotokoll / Audit-Log (spaetere Phase)
- Keine Bestaetigung vor dem Ueberschreiben

#### Abhaengigkeiten
- Benoetigt: US-004, US-006

#### Prioritaet: MUST

---

### US-006: Daten persistent speichern

**Als** Marketing-Verantwortliche/r
**moechte ich** dass eingegebene Daten dauerhaft gespeichert werden
**damit** die Daten auch nach dem Schliessen des Browsers erhalten bleiben.

#### Akzeptanzkriterien
- [ ] Alle eingegebenen KPI-Daten werden in Supabase (PostgreSQL) gespeichert
- [ ] Die Daten sind nach einem Seiten-Reload vollstaendig verfuegbar
- [ ] Die Datenbankstruktur erlaubt beliebig viele Jahre
- [ ] Die Datenbankstruktur ist erweiterbar fuer zusaetzliche Metriken in der Zukunft
- [ ] Fehler beim Speichern werden dem User verstaendlich angezeigt

#### Abgrenzung
- Kein Backup-Mechanismus im MVP
- Keine Datenmigrations-Tools

#### Abhaengigkeiten
- Keine

#### Prioritaet: MUST

---

## SHOULD — Wichtig, aber nicht MVP-kritisch

### US-007: Trend-Charts ueber mehrere Jahre

**Als** Marketing-Verantwortliche/r
**moechte ich** den Verlauf einer Metrik ueber mehrere Jahre als Diagramm sehen
**damit** ich langfristige Trends erkennen und in Praesentationen einbauen kann.

#### Akzeptanzkriterien
- [ ] Fuer jede Metrik kann ein Linien- oder Balkendiagramm angezeigt werden
- [ ] Das Diagramm zeigt alle verfuegbaren Jahre (ab 2023)
- [ ] Achsenbeschriftungen sind lesbar und verstaendlich
- [ ] Datenpunkte zeigen den exakten Wert bei Hover/Klick
- [ ] Charts sind responsive und skalieren auf verschiedenen Bildschirmgroessen

#### Abgrenzung
- Keine kombinierten Charts (mehrere Metriken in einem Diagramm)
- Keine Prognose-Linien

#### Abhaengigkeiten
- Benoetigt: US-001, US-006

#### Prioritaet: SHOULD

---

### US-008: Daten exportieren (CSV/PDF)

**Als** Marketing-Verantwortliche/r
**moechte ich** die KPI-Daten als CSV oder PDF exportieren koennen
**damit** ich die Zahlen in Berichten und Praesentationen weiterverwenden kann.

#### Akzeptanzkriterien
- [ ] Es gibt einen Export-Button auf dem Dashboard
- [ ] CSV-Export enthaelt alle Metriken fuer alle Jahre
- [ ] CSV-Datei ist in Excel/Google Sheets korrekt importierbar
- [ ] Alternativ oder zusaetzlich: PDF-Export des aktuellen Dashboard-Zustands
- [ ] Export-Datei erhaelt einen sinnvollen Dateinamen (z.B. "staplercup-kpis-2025.csv")

#### Abgrenzung
- Kein automatischer Versand per E-Mail
- Kein geplanter/regelmaessiger Export

#### Abhaengigkeiten
- Benoetigt: US-001, US-006

#### Prioritaet: SHOULD

---

### US-009: Live-Zuschauer aufschluesseln

**Als** Marketing-Verantwortliche/r
**moechte ich** die Live-Zuschauer-Zahl in Hallen-Zuschauer und Livestream-Zuschauer aufteilen
**damit** ich erkennen kann, wie sich die Reichweite auf die beiden Kanaele verteilt.

#### Akzeptanzkriterien
- [ ] Das Eingabeformular hat separate Felder fuer Hallen-Zuschauer und Livestream-Zuschauer
- [ ] Die Gesamtzahl wird automatisch berechnet (Summe)
- [ ] Im Dashboard wird die Gesamtzahl als Hauptwert und die Aufschluesselung als Detail angezeigt
- [ ] Der Jahresvergleich funktioniert auch fuer die Einzel-Werte

#### Abgrenzung
- Keine weitere Aufschluesselung (z.B. nach Plattform beim Livestream)

#### Abhaengigkeiten
- Benoetigt: US-004, US-001

#### Prioritaet: SHOULD

---

### US-010: Filterbare Ansichten

**Als** Marketing-Verantwortliche/r
**moechte ich** die KPI-Karten nach Kategorien filtern koennen
**damit** ich mich auf bestimmte Bereiche konzentrieren kann (z.B. nur Social Media).

#### Akzeptanzkriterien
- [ ] Es gibt Filter-Buttons oder Tabs fuer Kategorien (z.B. "Alle", "Social Media", "Reichweite", "Events")
- [ ] Beim Filtern werden nur die relevanten KPI-Karten angezeigt
- [ ] Der aktive Filter ist visuell erkennbar
- [ ] "Alle" ist die Standardauswahl

#### Abgrenzung
- Keine benutzerdefinierten Filter-Kategorien
- Keine Kombination mehrerer Filter

#### Abhaengigkeiten
- Benoetigt: US-001

#### Prioritaet: SHOULD

---

## COULD — Waere schoen, kein Business Impact

### US-011: Zugangsschutz (Login)

**Als** Geschaeftsfuehrer/in
**moechte ich** dass das Dashboard nur fuer autorisierte Personen zugaenglich ist
**damit** sensible Unternehmensdaten nicht oeffentlich einsehbar sind.

#### Akzeptanzkriterien
- [ ] Es gibt eine Login-Seite mit E-Mail und Passwort
- [ ] Nicht angemeldete Nutzer werden zum Login umgeleitet
- [ ] Sessions bleiben ueber Browser-Neustarts bestehen
- [ ] Es gibt eine Logout-Funktion
- [ ] Supabase Auth wird fuer die Authentifizierung genutzt

#### Abgrenzung
- Kein Rollen-System (alle Nutzer haben gleiche Rechte)
- Keine Selbst-Registrierung (Nutzer werden manuell angelegt)
- Kein Passwort-Zuruecksetzen im ersten Schritt

#### Abhaengigkeiten
- Keine

#### Prioritaet: COULD

---

### US-012: Automatischer Social-Media-Import

**Als** Marketing-Verantwortliche/r
**moechte ich** dass Social-Media-Follower-Zahlen automatisch importiert werden
**damit** ich diese nicht manuell nachschlagen und eingeben muss.

#### Akzeptanzkriterien
- [ ] Anbindung an mindestens eine Social-Media-API (z.B. Instagram Graph API)
- [ ] Automatischer oder manuell ausgeloester Import der aktuellen Follower-Zahlen
- [ ] Importierte Werte koennen manuell ueberschrieben werden
- [ ] Fehler bei der API-Abfrage werden verstaendlich angezeigt

#### Abgrenzung
- Kein Echtzeit-Update (hoechstens taeglich)
- Keine historischen Daten via API (nur aktuelle Werte)

#### Abhaengigkeiten
- Benoetigt: US-004, US-006

#### Prioritaet: COULD

---

### US-013: Zielwerte und Benchmarks

**Als** Marketing-Verantwortliche/r
**moechte ich** Zielwerte pro Metrik und Jahr hinterlegen koennen
**damit** ich sehen kann, ob wir unsere Ziele erreicht haben.

#### Akzeptanzkriterien
- [ ] Fuer jede Metrik kann ein Zielwert pro Jahr hinterlegt werden
- [ ] Im Dashboard wird der Fortschritt zum Ziel angezeigt (z.B. Fortschrittsbalken oder Prozent)
- [ ] Erreichte Ziele werden visuell hervorgehoben
- [ ] Zielwerte sind optional (nicht jede Metrik braucht ein Ziel)

#### Abgrenzung
- Keine automatische Ziel-Berechnung oder Empfehlungen
- Keine Benachrichtigungen bei Zielerreichung

#### Abhaengigkeiten
- Benoetigt: US-004, US-001

#### Prioritaet: COULD

---

## Empfehlung zur Umsetzungsreihenfolge

### MVP (Sprint 1-2)
1. **US-006** — Datenbank-Setup (Grundlage fuer alles)
2. **US-004** — Dateneingabe (damit Testdaten erfasst werden koennen)
3. **US-001** — Dashboard mit KPI-Karten
4. **US-002** — Jahresvergleich auf den Karten
5. **US-003** — Jahresauswahl
6. **US-005** — Metriken bearbeiten

### Phase 2 (Sprint 3-4)
7. **US-007** — Trend-Charts
8. **US-009** — Live-Zuschauer aufschluesseln
9. **US-010** — Filter
10. **US-008** — Export

### Phase 3 (Backlog)
11. **US-011** — Login
12. **US-013** — Zielwerte
13. **US-012** — API-Import

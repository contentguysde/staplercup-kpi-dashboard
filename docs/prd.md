# PRD: StaplerCup KPI-Dashboard

## Problem

Das StaplerCup-Marketing-Team erfasst jaehrlich verschiedene Reichweiten- und Marketing-Metriken (Social Media Follower, Website-Besucher, PR-Reichweite, Live-Zuschauer etc.) und vergleicht diese mit den Vorjahren. Aktuell geschieht das manuell in Tabellen oder Praesentationen, was unuebersichtlich und fehleranfaellig ist. Es fehlt ein zentrales, visuelles Tool, das alle KPIs auf einen Blick zeigt und Jahresvergleiche automatisch berechnet.

## Ziel

Ein internes Dashboard, in dem das Marketing-Team alle relevanten Reichweiten-KPIs einsehen, manuell pflegen und Jahresvergleiche (absolut + prozentual) auf einen Blick nachvollziehen kann.

**Erfolgskriterien:**
- Alle 10 definierten Metriken sind auf einem Dashboard sichtbar
- Jahresvergleiche (Vorjahr) werden automatisch berechnet und angezeigt
- Das Team kann Daten selbststaendig eingeben und aendern
- Daten ab 2023 sind rueckwirkend erfassbar

## Zielgruppe

### Persona: Marketing-Verantwortliche/r StaplerCup

**Rolle**: Marketing-Manager/in oder Assistenz im StaplerCup-Organisationsteam
**Ziel**: Schneller Ueberblick ueber alle Marketing-KPIs, Jahresvergleiche fuer Berichte und Praesentationen vorbereiten
**Schmerzpunkt**: Daten liegen verstreut in verschiedenen Quellen, Jahresvergleiche muessen manuell berechnet werden
**Tech-Level**: Fortgeschritten (nutzt Office-Tools, Social Media Backends, aber kein Entwickler)
**Geraete**: Primaer Desktop

### Persona: Geschaeftsfuehrung / Stakeholder

**Rolle**: Entscheider, der KPI-Reports erhaelt
**Ziel**: Auf einen Blick sehen, wie sich die Reichweite des StaplerCups entwickelt
**Schmerzpunkt**: Muss aktuell auf aufbereitete Reports warten
**Tech-Level**: Anfaenger bis Fortgeschritten
**Geraete**: Desktop und Tablet

## MVP-Scope (Phase 1)

### Enthalten im MVP

1. **Dashboard-Ansicht** mit allen 10 Metriken:
   - Social Media Follower gesamt
   - TikTok Follower
   - Instagram Follower
   - Facebook Follower
   - YouTube Abonnenten
   - Website-Besucher (pro Jahr)
   - Social Media Ad-Impressions
   - PR-Reichweite
   - Live-Zuschauer (Halle + Livestream)
   - Newsletter-Abonnenten

2. **KPI-Karten** pro Metrik mit:
   - Absoluter Wert des ausgewaehlten Jahres
   - Absolute Veraenderung zum Vorjahr (z.B. +1.200)
   - Prozentuale Veraenderung zum Vorjahr (z.B. +15,3%)
   - Farbliche Kennzeichnung (gruen = Wachstum, rot = Rueckgang)

3. **Jahresauswahl** zum Umschalten des angezeigten Jahres (ab 2023)

4. **Dateneingabe-Formular** zur manuellen Erfassung und Bearbeitung der Metriken pro Jahr

5. **Persistente Datenhaltung** in Supabase (PostgreSQL)

6. **Notizen pro Jahr**: Freitextfeld fuer Kommentare zu einem Jahresdatensatz (z.B. "2024: Erstmals TikTok-Kanal gestartet")

7. **Automatische Berechnung**: Social Media Follower gesamt wird automatisch aus TikTok + Instagram + Facebook + YouTube berechnet (kein separates Eingabefeld)

### Nicht-funktionale Anforderungen (MVP)

- **Performance**: Dashboard-Ladezeit < 2 Sekunden
- **Responsiveness**: Desktop-optimiert, grundlegende Tablet-Nutzbarkeit
- **Browser**: Aktuelle Versionen von Chrome, Firefox, Safari, Edge
- **Barrierefreiheit**: Grundlegende Zugaenglichkeit (Kontraste, Schriftgroessen)
- **Hosting**: Vercel (automatisches Deployment aus Main-Branch)

## Nicht im MVP (Phasen 2+)

### Phase 2 (Should-Have)

- Diagramme/Charts fuer Trendverlaeufe ueber mehrere Jahre
- Export-Funktion (PDF oder CSV)
- Aufschluesselung Live-Zuschauer in Halle vs. Livestream
- Filterbare Ansichten (z.B. nur Social Media, nur Reichweite)

### Phase 3 (Could-Have)

- Login/Authentifizierung (Zugangsschutz)
- Mehrbenutzer-Faehigkeit mit Rollen
- API-Anbindung fuer automatischen Datenimport (Social Media APIs)
- Benachrichtigungen bei Meilenstein-Erreichung
- Vergleich mit Benchmark-Werten oder Zielvorgaben
- Historische Snapshots / Audit-Log der Datenaenderungen
- Dark Mode

### Bewusst ausgeschlossen (Won't)

- Echtzeit-Datenintegration mit Social-Media-Plattformen im MVP
- Multi-Mandanten-Faehigkeit (nur ein StaplerCup)
- Mobile-App
- Automatische Berichterstellung
- Predictive Analytics / KI-gestuetzte Prognosen

## Geklärte Fragen

1. ~~Bestehende Datenbasis~~ → Manuelle Eingabe reicht
2. ~~Notizen pro Jahr~~ → **Ja, im MVP** (Freitextfeld pro Jahr)
3. ~~Zielwerte~~ → **Nein**, nicht im MVP
4. ~~Social-Media-Summe~~ → **Automatisch berechnet** aus Einzelkanälen

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenqualitaet: Falsche manuelle Eingaben | Mittel | Mittel | Validierung der Eingabefelder, Plausibilitaetschecks |
| Scope Creep: Wunsch nach mehr Metriken | Hoch | Niedrig | Klare MVP-Abgrenzung, erweiterbare Datenstruktur |
| Kein Auth: Unbefugter Zugriff | Niedrig | Niedrig | Internes Tool, ggf. Basic Auth in Phase 2 |
| Supabase-Limits im Free Tier | Niedrig | Mittel | Monitoring, bei Bedarf Upgrade |

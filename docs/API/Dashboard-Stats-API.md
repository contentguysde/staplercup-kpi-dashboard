# StaplerCup Social Media Agent — Stats API Integration

Diese Anleitung beschreibt, wie das **StaplerCup Dashboard** die Statistiken zu beantworteten Kommentaren (aggregiert, nach Plattform) vom Social Media Agent abruft.

---

## 1. Endpoint

**Base URL:** `https://staplercupsocial.content-guys.de`

| Endpoint | Methode | Zweck |
|---|---|---|
| `/api/stats/replies` | `GET` | Anzahl gesendeter Antworten, aufgeschlüsselt nach Plattform |

### Query-Parameter

| Parameter | Typ | Erforderlich | Beschreibung |
|---|---|---|---|
| `year` | `number` | optional | Filtert auf Kalenderjahr (z. B. `2026`). Ohne Parameter → alle Daten seit Beginn. |

### Beispiele

```
GET /api/stats/replies              → alle Daten
GET /api/stats/replies?year=2026    → nur 2026
GET /api/stats/replies?year=2027    → nur 2027 (wenn ab 2027 benutzt)
```

---

## 2. Authentifizierung

Jeder Request muss einen gültigen API-Key als Bearer-Token im `Authorization`-Header mitsenden.

```
Authorization: Bearer <STATS_API_KEY>
```

Der Schlüssel ist **geheim**. Er darf nur serverseitig verwendet werden — niemals im Browser-Client, nicht im Repository committen, nicht in Build-Artefakten einbinden.

**Empfehlung:** Speichere den Key als Umgebungsvariable `STATS_API_KEY` im Dashboard-Projekt (Vercel Env oder `.env.local`, je nach Setup).

---

## 3. Response-Format

### Erfolg (HTTP 200)

```json
{
  "year": null,
  "range": {
    "from": "2026-02-23T08:00:32.617Z",
    "to":   "2026-04-17T13:43:34.928Z"
  },
  "totalReplies": 131,
  "uniqueInteractions": 127,
  "byPlatform": {
    "instagram": { "replies": 56, "interactions": 53 },
    "facebook":  { "replies": 0,  "interactions": 0 },
    "tiktok":    { "replies": 75, "interactions": 74 }
  },
  "generatedAt": "2026-04-17T14:40:26.996Z"
}
```

### Feld-Erklärung

| Feld | Typ | Bedeutung |
|---|---|---|
| `year` | `number \| null` | Das gefilterte Jahr (`null` = kein Filter) |
| `range.from` | `string \| null` (ISO) | Zeitpunkt der ersten Antwort im gefilterten Zeitraum |
| `range.to` | `string \| null` (ISO) | Zeitpunkt der letzten Antwort im gefilterten Zeitraum |
| `totalReplies` | `number` | Gesamtzahl der gesendeten Antworten |
| `uniqueInteractions` | `number` | Anzahl einzigartiger Interaktionen (Kommentare/DMs), auf die geantwortet wurde. Kann < `totalReplies` sein, falls mehrfach auf dieselbe Interaktion geantwortet wurde. |
| `byPlatform.instagram` | Objekt | Antworten & Interaktionen für Instagram |
| `byPlatform.facebook` | Objekt | Antworten & Interaktionen für Facebook |
| `byPlatform.tiktok` | Objekt | Antworten & Interaktionen für TikTok |
| `generatedAt` | `string` (ISO) | Serverzeit der Response |

Die Keys `instagram`, `facebook`, `tiktok` in `byPlatform` sind **immer vorhanden** — auch wenn der Wert 0 ist. Das macht den Consumer-Code einfacher.

### Fehler-Codes

| Status | Bedeutung | Abhilfe |
|---|---|---|
| `401` | Fehlender oder falscher API-Key | `Authorization`-Header prüfen |
| `400` | Ungültiger `year`-Parameter | Zahl zwischen 2020–2100 verwenden |
| `404` | Falscher Endpoint (nur `/replies` existiert aktuell) | URL prüfen |
| `405` | Falsche Methode (nur `GET`) | `GET` verwenden |
| `500` | Serverfehler | Bei wiederholtem Auftreten Admin kontaktieren |

---

## 4. Caching

Die Response enthält den Header `Cache-Control: public, max-age=300`. Die Daten ändern sich nicht sekundenweise — Caching für 5 Minuten ist ausreichend und entlastet die DB. Beim Einsatz eines Server-Side-Frameworks (Next.js `revalidate`, Nuxt, etc.) kann dieser Wert übernommen werden.

---

## 5. CORS

Der Endpoint erlaubt explizit Cross-Origin-Requests von:

```
https://staplercupdashboard.content-guys.de
```

Direkte Browser-Requests von genau dieser Domain funktionieren — aber der API-Key darf dabei nicht öffentlich werden. **Daher der Fetch am besten serverseitig** (Server Component / API Route des Dashboards), nicht im Client-JS.

---

## 6. TypeScript Typen (zum Copy-Paste)

```ts
export type PlatformKey = 'instagram' | 'facebook' | 'tiktok';

export interface PlatformStats {
  replies: number;
  interactions: number;
}

export interface StatsRepliesResponse {
  year: number | null;
  range: {
    from: string | null;  // ISO timestamp
    to: string | null;    // ISO timestamp
  };
  totalReplies: number;
  uniqueInteractions: number;
  byPlatform: Record<PlatformKey, PlatformStats>;
  generatedAt: string;    // ISO timestamp
}
```

---

## 7. Fetch-Beispiel

### Minimal (Node / Server-Runtime)

```ts
export async function fetchReplyStats(year?: number): Promise<StatsRepliesResponse> {
  const apiKey = process.env.STATS_API_KEY;
  if (!apiKey) throw new Error('STATS_API_KEY is not set');

  const url = new URL('https://staplercupsocial.content-guys.de/api/stats/replies');
  if (year !== undefined) url.searchParams.set('year', String(year));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    // Next.js: at-most every 5 min
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Stats API failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
```

### Aufruf im Dashboard

```ts
// Ohne Filter (Standard)
const all = await fetchReplyStats();
console.log(`Antworten gesamt: ${all.totalReplies}`);
console.log(`Instagram: ${all.byPlatform.instagram.replies}`);
console.log(`TikTok: ${all.byPlatform.tiktok.replies}`);

// Mit Jahresfilter (z. B. ab 2027)
const y2026 = await fetchReplyStats(2026);
```

---

## 8. Setup-Checkliste für das Dashboard

1. **API-Key hinterlegen:** `STATS_API_KEY=<geheimer Key>` als Environment Variable in Production (und optional Development).
2. **Fetch-Wrapper bauen:** `fetchReplyStats()` wie oben, zentral ablegen (z. B. `src/lib/stats-api.ts`).
3. **Server-Side rendern:** Den Fetch in einer Server Component oder API-Route aufrufen, nicht im Client. So bleibt der API-Key geheim.
4. **Fehler-Fallback:** Bei 401/500 dem User eine neutrale "Daten aktuell nicht verfügbar"-Meldung zeigen, nicht den Fehlerinhalt ausgeben.
5. **Revalidation passend zum Dashboard-UI:** `next: { revalidate: 300 }` ist der empfohlene Default.

---

## 9. Plattform-Mapping (intern)

Zur Info, falls das Dashboard später weitere Plattformen anzeigen soll: Die Stats-API erkennt die Plattform über das Präfix der internen `interaction_id`:

- `tiktok_comment_*` → TikTok
- `fb-*` / `facebook*` → Facebook
- sonst → Instagram

Kommen in Zukunft weitere Plattformen hinzu, wird die API erweitert und der Response-Shape um neue Keys in `byPlatform` ergänzt (additiv, nicht breaking).

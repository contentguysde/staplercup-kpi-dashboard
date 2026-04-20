import type { StatsRepliesResponse } from "./stats-api-types";

interface UnavailableResponse {
  error: "unavailable" | "invalid_year";
}

type ApiResponse = StatsRepliesResponse | UnavailableResponse;

/**
 * Client-seitiger Fetcher fuer die eigene API-Route /api/stats/replies.
 * Wirft nie — bei Fehler oder Fallback liefert die Funktion null.
 */
export async function fetchReplyStatsViaProxy(
  year?: number
): Promise<StatsRepliesResponse | null> {
  const url = new URL("/api/stats/replies", window.location.origin);
  if (year !== undefined) url.searchParams.set("year", String(year));

  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse;
    if ("error" in json) return null;
    return json;
  } catch {
    return null;
  }
}

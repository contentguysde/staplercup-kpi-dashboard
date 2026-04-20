import "server-only";
import type { StatsRepliesResponse } from "./stats-api-types";

export type { StatsRepliesResponse, PlatformKey, PlatformStats } from "./stats-api-types";

const BASE_URL = "https://staplercupsocial.content-guys.de";

/**
 * Holt die Reply-Statistik vom StaplerCup Social Media Agent.
 * Server-only — STATS_API_KEY darf nie ins Client-Bundle.
 */
export async function fetchReplyStats(
  year?: number
): Promise<StatsRepliesResponse> {
  const apiKey = process.env.STATS_API_KEY;
  if (!apiKey) throw new Error("STATS_API_KEY ist nicht gesetzt");

  const url = new URL(`${BASE_URL}/api/stats/replies`);
  if (year !== undefined) url.searchParams.set("year", String(year));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Stats API failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

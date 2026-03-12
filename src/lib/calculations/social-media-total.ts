import { CHANNEL_NOT_EXISTED, METRIC_NOT_COLLECTED } from "@/lib/constants";

const FOLLOWERS_KEYS = [
  "tiktok_followers",
  "instagram_followers",
  "facebook_followers",
  "youtube_subscribers",
] as const;

const REACH_KEYS = [
  "tiktok_reach",
  "instagram_reach",
  "facebook_reach",
] as const;

const INTERACTIONS_KEYS = [
  "tiktok_interactions",
  "instagram_interactions",
  "facebook_interactions",
] as const;

/** Summiert Werte der angegebenen Keys. Gibt null zurück wenn keine Daten vorhanden. */
function sumMetrics(
  entries: Record<string, number | null>,
  keys: readonly string[]
): number | null {
  const values = keys.map((key) => entries[key]);

  // Wenn alle Werte null/undefined/Sentinel → null
  if (
    values.every(
      (v) => v === null || v === undefined || v === CHANNEL_NOT_EXISTED || v === METRIC_NOT_COLLECTED
    )
  ) {
    return null;
  }

  // Sentinel-Werte und null als 0 behandeln, wenn mindestens ein aktiver Wert vorhanden
  return values.reduce<number>(
    (sum, v) =>
      sum + (v === null || v === undefined || v === CHANNEL_NOT_EXISTED || v === METRIC_NOT_COLLECTED ? 0 : v),
    0
  );
}

/** Berechnet die Gesamtzahl der Social Media Follower */
export function calculateSocialMediaTotal(
  entries: Record<string, number | null>
): number | null {
  return sumMetrics(entries, FOLLOWERS_KEYS);
}

/** Berechnet die Social Media Reichweite gesamt */
export function calculateSocialMediaReachTotal(
  entries: Record<string, number | null>
): number | null {
  return sumMetrics(entries, REACH_KEYS);
}

/** Berechnet die Social Media Interaktionen gesamt */
export function calculateSocialMediaInteractionsTotal(
  entries: Record<string, number | null>
): number | null {
  return sumMetrics(entries, INTERACTIONS_KEYS);
}

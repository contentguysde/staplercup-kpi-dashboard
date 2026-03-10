import { CHANNEL_NOT_EXISTED } from "@/lib/constants";

const SOCIAL_MEDIA_KEYS = [
  "tiktok_followers",
  "instagram_followers",
  "facebook_followers",
  "youtube_subscribers",
] as const;

/** Berechnet die Gesamtzahl der Social Media Follower */
export function calculateSocialMediaTotal(
  entries: Record<string, number | null>
): number | null {
  const values = SOCIAL_MEDIA_KEYS.map((key) => entries[key]);

  // Wenn alle Werte null oder "existierte nicht" sind, ist das Ergebnis null
  if (
    values.every(
      (v) => v === null || v === undefined || v === CHANNEL_NOT_EXISTED
    )
  ) {
    return null;
  }

  // Sentinel-Werte und null als 0 behandeln, wenn mindestens ein aktiver Wert vorhanden
  return values.reduce<number>(
    (sum, v) => sum + (v === null || v === undefined || v === CHANNEL_NOT_EXISTED ? 0 : v),
    0
  );
}

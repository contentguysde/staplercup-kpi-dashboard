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

  // Wenn alle Werte null sind, ist das Ergebnis null
  if (values.every((v) => v === null || v === undefined)) {
    return null;
  }

  // Null-Werte als 0 behandeln, wenn mindestens ein Wert vorhanden
  return values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
}

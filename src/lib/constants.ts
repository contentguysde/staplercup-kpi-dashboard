import type { MetricConfig } from "@/types";

/** Alle verfügbaren Metriken mit UI-Konfiguration */
export const METRICS: MetricConfig[] = [
  {
    key: "social_media_followers_total",
    label: "Social Media Follower gesamt",
    icon: "Users",
    category: "social_media",
    isComputed: true,
  },
  {
    key: "tiktok_followers",
    label: "TikTok Follower",
    icon: "Music",
    category: "social_media",
  },
  {
    key: "instagram_followers",
    label: "Instagram Follower",
    icon: "Camera",
    category: "social_media",
  },
  {
    key: "facebook_followers",
    label: "Facebook Follower",
    icon: "ThumbsUp",
    category: "social_media",
  },
  {
    key: "youtube_subscribers",
    label: "YouTube Abonnenten",
    icon: "Play",
    category: "social_media",
  },
  {
    key: "website_visitors",
    label: "Website-Besucher",
    icon: "Globe",
    category: "reichweite",
  },
  {
    key: "social_media_ad_impressions",
    label: "Social Media Ad-Impressions",
    icon: "Megaphone",
    category: "reichweite",
  },
  {
    key: "pr_reach",
    label: "PR-Reichweite",
    icon: "Newspaper",
    category: "reichweite",
  },
  {
    key: "live_viewers",
    label: "Live-Zuschauer",
    icon: "Monitor",
    category: "events",
  },
  {
    key: "newsletter_subscribers",
    label: "Newsletter-Abonnenten",
    icon: "Mail",
    category: "reichweite",
  },
];

/** Nur die Metriken, die in der DB gespeichert werden (ohne berechnete) */
export const STORABLE_METRICS = METRICS.filter((m) => !m.isComputed);

/** Erstes verfügbares Jahr */
export const FIRST_YEAR = 2022;

/** Sentinel-Wert: Kanal existierte in diesem Jahr noch nicht */
export const CHANNEL_NOT_EXISTED = -1;

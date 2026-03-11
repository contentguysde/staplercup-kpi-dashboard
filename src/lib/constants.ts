import type { MetricConfig, ChannelDefinition } from "@/types";

/** Alle verfügbaren Metriken mit UI-Konfiguration */
export const METRICS: MetricConfig[] = [
  {
    key: "social_media_reach_total",
    label: "Social Media Reichweite gesamt",
    icon: "Eye",
    category: "reichweite",
  },
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

/** Kanal-Definitionen für die Kanäle-Ansicht */
export const CHANNELS: ChannelDefinition[] = [
  {
    id: "social_media",
    label: "Social Media",
    icon: "Share2",
    description: "Organische Reichweite und Follower",
    metricKeys: [
      "social_media_reach_total",
      "social_media_followers_total",
      "tiktok_followers",
      "instagram_followers",
      "facebook_followers",
      "youtube_subscribers",
    ],
    primaryMetricKey: "social_media_reach_total",
  },
  {
    id: "website",
    label: "Website",
    icon: "Globe",
    description: "Besucher auf der StaplerCup-Website",
    metricKeys: ["website_visitors"],
    primaryMetricKey: "website_visitors",
  },
  {
    id: "paid",
    label: "Paid",
    icon: "Megaphone",
    description: "Bezahlte Werbeanzeigen",
    metricKeys: ["social_media_ad_impressions"],
    primaryMetricKey: "social_media_ad_impressions",
  },
  {
    id: "presse",
    label: "Presse",
    icon: "Newspaper",
    description: "Presseberichterstattung und PR-Reichweite",
    metricKeys: ["pr_reach"],
    primaryMetricKey: "pr_reach",
  },
  {
    id: "live",
    label: "Live",
    icon: "Monitor",
    description: "Live-Übertragungen und Events",
    metricKeys: ["live_viewers"],
    primaryMetricKey: "live_viewers",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: "Mail",
    description: "E-Mail-Verteiler und Abonnenten",
    metricKeys: ["newsletter_subscribers"],
    primaryMetricKey: "newsletter_subscribers",
  },
];

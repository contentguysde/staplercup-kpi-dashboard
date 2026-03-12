import type { MetricConfig, ChannelDefinition } from "@/types";

/** Alle verfügbaren Metriken mit UI-Konfiguration */
export const METRICS: MetricConfig[] = [
  // --- Dashboard-Standard-KPIs (sichtbar) ---
  {
    key: "social_media_reach_total",
    label: "Social Media Reichweite gesamt",
    sublabel: "Aggregierte Kanal-Reichweiten",
    icon: "Eye",
    category: "reichweite",
  },
  {
    key: "social_media_followers_total",
    label: "Social Media Follower gesamt",
    sublabel: "Aggregierte Kanal-Reichweiten",
    icon: "Users",
    category: "social_media",
    isComputed: true,
  },
  {
    key: "tiktok_followers",
    label: "TikTok Follower",
    sublabel: "Kanal-Einzelreichweite",
    icon: "Music",
    category: "social_media",
  },
  {
    key: "instagram_followers",
    label: "Instagram Follower",
    sublabel: "Kanal-Einzelreichweite",
    icon: "Camera",
    category: "social_media",
  },
  {
    key: "facebook_followers",
    label: "Facebook Follower",
    sublabel: "Kanal-Einzelreichweite",
    icon: "ThumbsUp",
    category: "social_media",
  },
  {
    key: "youtube_subscribers",
    label: "YouTube Abonnenten",
    sublabel: "Kanal-Einzelreichweite",
    icon: "Play",
    category: "social_media",
  },
  {
    key: "website_visitors",
    label: "Website-Besucher",
    sublabel: "Kanal-Einzelreichweite",
    icon: "Globe",
    category: "reichweite",
  },
  {
    key: "social_media_ad_impressions",
    label: "Social Media Ad-Impressions",
    sublabel: "Aggregierte Impressions",
    icon: "Megaphone",
    category: "reichweite",
  },
  {
    key: "pr_reach",
    label: "PR-Reichweite",
    sublabel: "Aggregierte Reichweite (Mediadaten)",
    icon: "Newspaper",
    category: "reichweite",
  },
  {
    key: "live_viewers",
    label: "Live-Zuschauer",
    sublabel: "Aggregierte Kanal-Reichweiten",
    icon: "Monitor",
    category: "events",
  },
  {
    key: "newsletter_subscribers",
    label: "Newsletter-Abonnenten",
    sublabel: "Kanal-Einzelreichweite",
    icon: "Mail",
    category: "reichweite",
  },

  // --- Kanal-Detail-KPIs (standardmäßig ausgeblendet) ---

  // TikTok
  {
    key: "tiktok_reach",
    label: "TikTok Reichweite",
    icon: "Eye",
    category: "reichweite",
    defaultHidden: true,
  },
  {
    key: "tiktok_interactions",
    label: "TikTok Interaktionen",
    icon: "Heart",
    category: "engagement",
    defaultHidden: true,
  },
  {
    key: "tiktok_posts",
    label: "TikTok Beiträge",
    icon: "FileText",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "tiktok_stories",
    label: "TikTok Stories",
    icon: "Layers",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "tiktok_comments_answered",
    label: "TikTok beantwortete Kommentare",
    icon: "MessageCircle",
    category: "engagement",
    defaultHidden: true,
  },

  // Instagram
  {
    key: "instagram_reach",
    label: "Instagram Reichweite",
    icon: "Eye",
    category: "reichweite",
    defaultHidden: true,
  },
  {
    key: "instagram_interactions",
    label: "Instagram Interaktionen",
    icon: "Heart",
    category: "engagement",
    defaultHidden: true,
  },
  {
    key: "instagram_posts",
    label: "Instagram Beiträge",
    icon: "FileText",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "instagram_stories",
    label: "Instagram Stories",
    icon: "Layers",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "instagram_comments_answered",
    label: "Instagram beantwortete Kommentare",
    icon: "MessageCircle",
    category: "engagement",
    defaultHidden: true,
  },

  // Facebook
  {
    key: "facebook_reach",
    label: "Facebook Reichweite",
    icon: "Eye",
    category: "reichweite",
    defaultHidden: true,
  },
  {
    key: "facebook_interactions",
    label: "Facebook Interaktionen",
    icon: "Heart",
    category: "engagement",
    defaultHidden: true,
  },
  {
    key: "facebook_posts",
    label: "Facebook Beiträge",
    icon: "FileText",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "facebook_stories",
    label: "Facebook Stories",
    icon: "Layers",
    category: "content",
    defaultHidden: true,
  },
  {
    key: "facebook_comments_answered",
    label: "Facebook beantwortete Kommentare",
    icon: "MessageCircle",
    category: "engagement",
    defaultHidden: true,
  },

  // YouTube
  {
    key: "youtube_views",
    label: "YouTube Views",
    icon: "Play",
    category: "reichweite",
    defaultHidden: true,
  },
  {
    key: "youtube_watch_time",
    label: "YouTube Watch Time (Stunden)",
    icon: "Clock",
    category: "engagement",
    defaultHidden: true,
  },
];

/** Nur die Metriken, die in der DB gespeichert werden (ohne berechnete) */
export const STORABLE_METRICS = METRICS.filter((m) => !m.isComputed);

/** Metric-Keys die standardmäßig im Dashboard ausgeblendet sind */
export const DEFAULT_HIDDEN_KEYS = METRICS.filter((m) => m.defaultHidden).map((m) => m.key);

/** Erstes verfügbares Jahr */
export const FIRST_YEAR = 2022;

/** Sentinel-Wert: Kanal existierte in diesem Jahr noch nicht */
export const CHANNEL_NOT_EXISTED = -1;

/** Kanal-Definitionen für die Kanäle-Ansicht */
export const CHANNELS: ChannelDefinition[] = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: "Music",
    description: "TikTok-Kanal",
    metricKeys: [
      "tiktok_followers",
      "tiktok_reach",
      "tiktok_interactions",
      "tiktok_posts",
      "tiktok_stories",
      "tiktok_comments_answered",
    ],
    primaryMetricKey: "tiktok_followers",
    secondaryMetricKey: "tiktok_reach",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "Camera",
    description: "Instagram-Kanal",
    metricKeys: [
      "instagram_followers",
      "instagram_reach",
      "instagram_interactions",
      "instagram_posts",
      "instagram_stories",
      "instagram_comments_answered",
    ],
    primaryMetricKey: "instagram_followers",
    secondaryMetricKey: "instagram_reach",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "ThumbsUp",
    description: "Facebook-Kanal",
    metricKeys: [
      "facebook_followers",
      "facebook_reach",
      "facebook_interactions",
      "facebook_posts",
      "facebook_stories",
      "facebook_comments_answered",
    ],
    primaryMetricKey: "facebook_followers",
    secondaryMetricKey: "facebook_reach",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "Play",
    description: "YouTube-Kanal",
    metricKeys: [
      "youtube_subscribers",
      "youtube_views",
      "youtube_watch_time",
    ],
    primaryMetricKey: "youtube_subscribers",
    secondaryMetricKey: "youtube_views",
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

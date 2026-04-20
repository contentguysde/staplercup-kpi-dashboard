export type PlatformKey = "instagram" | "facebook" | "tiktok";

export interface PlatformStats {
  replies: number;
  interactions: number;
}

export interface StatsRepliesResponse {
  year: number | null;
  range: {
    from: string | null;
    to: string | null;
  };
  totalReplies: number;
  uniqueInteractions: number;
  byPlatform: Record<PlatformKey, PlatformStats>;
  generatedAt: string;
}

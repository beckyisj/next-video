export interface VideoData {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  thumbnail: string;
  duration?: string;
}

export interface OutlierVideo extends VideoData {
  multiplier: number; // views / median views
  channelId: string;
  channelTitle: string;
}

// Calculate median of an array of numbers
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Find outlier videos (3x+ median views) from a channel's videos
export function findOutliers(
  videos: VideoData[],
  channelId: string,
  channelTitle: string,
  threshold = 3
): OutlierVideo[] {
  if (videos.length < 3) return [];

  const views = videos.map((v) => v.viewCount);
  const med = median(views);
  if (med === 0) return [];

  return videos
    .filter((v) => v.viewCount / med >= threshold)
    .map((v) => ({
      ...v,
      multiplier: Math.round((v.viewCount / med) * 10) / 10,
      channelId,
      channelTitle,
    }))
    .sort((a, b) => b.multiplier - a.multiplier);
}

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

// Parse ISO 8601 duration (PT1H2M3S) to seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 3600) +
    (parseInt(match[2] || "0") * 60) +
    parseInt(match[3] || "0");
}

// Filter out Shorts (< 60s) and old videos (> 12 months)
export function filterVideos(videos: VideoData[]): VideoData[] {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  return videos.filter((v) => {
    // Filter Shorts
    if (v.duration && parseDuration(v.duration) < 60) return false;
    // Filter old videos
    if (v.publishedAt && new Date(v.publishedAt) < twelveMonthsAgo) return false;
    return true;
  });
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

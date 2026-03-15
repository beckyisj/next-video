export interface VideoData {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  thumbnail: string;
  duration?: string;
  hasLongFormThumb?: boolean; // true if maxres or standard thumbnail exists (Shorts lack these)
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

// Filter out Shorts and old videos (> 12 months)
export function filterVideos(videos: VideoData[]): VideoData[] {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  return videos.filter((v) => {
    // Filter Shorts by duration (≤ 180s — YouTube expanded Shorts to 3 minutes in late 2024)
    if (v.duration && parseDuration(v.duration) <= 180) return false;
    // Filter Shorts by title
    if (/\#shorts/i.test(v.title)) return false;
    // Filter Shorts by thumbnail: Shorts don't get maxres/standard thumbnails
    if (v.hasLongFormThumb === false) return false;
    if (!v.thumbnail) return false;
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

// Scale outlier threshold by subscriber count — smaller channels have
// more consistent views, so a lower multiplier is still meaningful
export function outlierThreshold(subscriberCount: number): number {
  if (subscriberCount < 10_000) return 1.5;
  if (subscriberCount < 50_000) return 2;
  if (subscriberCount < 200_000) return 2.5;
  return 3;
}

// Find outlier videos (Nx+ median views) from a channel's videos
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

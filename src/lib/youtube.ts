import type { VideoData } from "./outliers";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE = "https://www.googleapis.com/youtube/v3";

export interface ChannelInfo {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  customUrl?: string;
}

// Resolve a channel from URL, handle, or name
export async function resolveChannel(input: string): Promise<ChannelInfo> {
  const trimmed = input.trim();

  // Extract handle or channel ID from URLs
  let identifier = trimmed;
  const urlMatch = trimmed.match(
    /youtube\.com\/(?:@([\w.-]+)|channel\/(UC[\w-]+)|c\/([\w.-]+)|user\/([\w.-]+))/i
  );
  if (urlMatch) {
    if (urlMatch[1]) identifier = `@${urlMatch[1]}`;
    else if (urlMatch[2]) identifier = urlMatch[2];
    else if (urlMatch[3]) identifier = urlMatch[3];
    else if (urlMatch[4]) identifier = urlMatch[4];
  }

  // If it's a channel ID (starts with UC)
  if (identifier.startsWith("UC") && identifier.length === 24) {
    return fetchChannelById(identifier);
  }

  // If it's a handle (starts with @)
  if (identifier.startsWith("@")) {
    return fetchChannelByHandle(identifier);
  }

  // Try as handle first, then search
  try {
    return await fetchChannelByHandle(`@${identifier}`);
  } catch {
    return searchForChannel(identifier);
  }
}

async function fetchChannelById(channelId: string): Promise<ChannelInfo> {
  const url = `${BASE}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items?.length) throw new Error("Channel not found");
  return mapChannelItem(data.items[0]);
}

async function fetchChannelByHandle(handle: string): Promise<ChannelInfo> {
  const url = `${BASE}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(handle.replace("@", ""))}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items?.length) throw new Error("Channel not found");
  return mapChannelItem(data.items[0]);
}

async function searchForChannel(query: string): Promise<ChannelInfo> {
  const url = `${BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items?.length) throw new Error("Channel not found");
  const channelId = data.items[0].snippet.channelId;
  return fetchChannelById(channelId);
}

function mapChannelItem(item: Record<string, unknown>): ChannelInfo {
  const snippet = item.snippet as Record<string, unknown>;
  const statistics = item.statistics as Record<string, string>;
  const thumbnails = snippet.thumbnails as Record<string, { url: string }>;
  return {
    channelId: item.id as string,
    title: snippet.title as string,
    description: snippet.description as string,
    thumbnail: thumbnails?.medium?.url || thumbnails?.default?.url || "",
    subscriberCount: parseInt(statistics.subscriberCount || "0", 10),
    videoCount: parseInt(statistics.videoCount || "0", 10),
    customUrl: snippet.customUrl as string | undefined,
  };
}

// Fetch recent videos using playlistItems (1 unit) instead of search (100 units)
export async function fetchChannelVideos(
  channelId: string,
  maxResults = 30
): Promise<VideoData[]> {
  // The uploads playlist ID is the channel ID with UC replaced by UU
  const uploadsPlaylistId = "UU" + channelId.slice(2);

  const url = `${BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items?.length) return [];

  const videoIds = data.items
    .map((item: Record<string, Record<string, string>>) => item.contentDetails?.videoId)
    .filter(Boolean);

  if (!videoIds.length) return [];

  // Fetch video statistics in batch (1 unit per 50 videos)
  const statsUrl = `${BASE}/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  return (statsData.items || []).map(
    (item: Record<string, unknown>): VideoData => {
      const snippet = item.snippet as Record<string, unknown>;
      const statistics = item.statistics as Record<string, string>;
      const contentDetails = item.contentDetails as Record<string, string>;
      const thumbnails = snippet.thumbnails as Record<string, { url: string }>;
      return {
        videoId: item.id as string,
        title: snippet.title as string,
        publishedAt: snippet.publishedAt as string,
        viewCount: parseInt(statistics.viewCount || "0", 10),
        likeCount: parseInt(statistics.likeCount || "0", 10),
        commentCount: parseInt(statistics.commentCount || "0", 10),
        thumbnail:
          thumbnails?.maxres?.url ||
          thumbnails?.high?.url ||
          thumbnails?.medium?.url ||
          "",
        duration: contentDetails?.duration,
      };
    }
  );
}

// Search for channels in a niche within a subscriber range
export async function searchChannels(
  keywords: string[],
  minSubs: number,
  maxSubs: number,
  maxResults = 20
): Promise<ChannelInfo[]> {
  const query = keywords.join(" ");
  const url = `${BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${Math.min(maxResults, 25)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items?.length) return [];

  // Get channel IDs from search results
  const channelIds = data.items
    .map(
      (item: Record<string, Record<string, string>>) =>
        item.snippet?.channelId || item.id?.channelId
    )
    .filter(Boolean);

  if (!channelIds.length) return [];

  // Fetch full channel details in batch
  const detailsUrl = `${BASE}/channels?part=snippet,statistics&id=${channelIds.join(",")}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  const channels = (detailsData.items || []).map(mapChannelItem);

  // Filter by subscriber range
  return channels.filter(
    (ch: ChannelInfo) =>
      ch.subscriberCount >= minSubs &&
      ch.subscriberCount <= maxSubs &&
      ch.videoCount >= 3
  );
}

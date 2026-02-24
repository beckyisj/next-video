import { NextRequest, NextResponse } from "next/server";
import { resolveChannel, fetchChannelVideos } from "@/lib/youtube";
import { extractNiche } from "@/lib/ai";
import { getCached, setCache } from "@/lib/cache";
import type { ChannelInfo } from "@/lib/youtube";

// Step 1: Resolve channel + extract niche (free — no paywall)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { input } = body || {};

  if (!input?.trim()) {
    return NextResponse.json(
      { error: "Please provide a channel URL, handle, or name" },
      { status: 400 }
    );
  }

  try {
    // Try cache first
    const cacheKey = `channel:${input.trim().toLowerCase()}`;
    const cached = await getCached<{
      channel: ChannelInfo;
      niche: string[];
    }>(cacheKey, "channel");

    if (cached) {
      return NextResponse.json(cached);
    }

    // Resolve the channel
    const channel = await resolveChannel(input);

    // Fetch recent videos for niche extraction
    const videos = await fetchChannelVideos(channel.channelId, 30);
    const videoTitles = videos.map((v) => v.title);

    // Extract niche keywords using AI
    const niche = await extractNiche(channel, videoTitles);

    const result = { channel, niche };

    // Cache for 1 day
    await setCache(cacheKey, "channel", result);

    return NextResponse.json(result);
  } catch (e) {
    console.error("analyze-channel error:", e);
    const message = e instanceof Error ? e.message : "Failed to analyze channel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

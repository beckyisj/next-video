import { NextRequest, NextResponse } from "next/server";
import { searchChannels, fetchChannelVideos } from "@/lib/youtube";
import { findOutliers } from "@/lib/outliers";
import { getPeerRange } from "@/lib/peer-range";
import { getCached, setCache } from "@/lib/cache";
import { getUserFromToken, countGenerations } from "@/lib/supabase";
import type { ChannelInfo } from "@/lib/youtube";
import type { OutlierVideo } from "@/lib/outliers";

const FREE_LIMIT = 3;

// Steps 2-3: Find peer channels + detect outliers (PAYWALLED after 3 free)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { channelId, subscriberCount, niche, sessionId } = body || {};

  if (!channelId || !subscriberCount || !niche?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check auth + free tier
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  let userId: string | undefined;
  let isPro = false;

  if (token) {
    const user = await getUserFromToken(token);
    if (user) {
      userId = user.id;
      // Check subscription
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .single();
      isPro = sub?.plan === "pro" && sub?.status === "active";
    }
  }

  if (!isPro) {
    const count = await countGenerations(userId, sessionId);
    if (count >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "Free limit reached", paywall: true, count, limit: FREE_LIMIT },
        { status: 403 }
      );
    }
  }

  try {
    const { min, max } = getPeerRange(subscriberCount);

    // Check cache for peers
    const peerCacheKey = `peers:${niche.sort().join(",")}:${min}-${max}`;
    let peers = await getCached<ChannelInfo[]>(peerCacheKey, "peers");

    if (!peers) {
      peers = await searchChannels(niche, min, max, 20);
      // Filter out the source channel
      peers = peers.filter((p) => p.channelId !== channelId);
      if (peers.length > 0) {
        await setCache(peerCacheKey, "peers", peers);
      }
    }

    if (!peers.length) {
      return NextResponse.json(
        { error: "No peer channels found in this niche. Try a different channel." },
        { status: 404 }
      );
    }

    // Fetch videos for each peer and find outliers
    const allOutliers: OutlierVideo[] = [];
    const peerDetails: Array<ChannelInfo & { videoCount: number; outlierCount: number }> = [];

    for (const peer of peers.slice(0, 10)) {
      // Check video cache
      const videoCacheKey = `videos:${peer.channelId}`;
      let videos = await getCached<Awaited<ReturnType<typeof fetchChannelVideos>>>(
        videoCacheKey,
        "videos"
      );

      if (!videos) {
        videos = await fetchChannelVideos(peer.channelId, 30);
        if (videos.length > 0) {
          await setCache(videoCacheKey, "videos", videos);
        }
      }

      const outliers = findOutliers(videos, peer.channelId, peer.title);
      allOutliers.push(...outliers);

      peerDetails.push({
        ...peer,
        videoCount: videos.length,
        outlierCount: outliers.length,
      });
    }

    // Sort outliers by multiplier
    allOutliers.sort((a, b) => b.multiplier - a.multiplier);

    return NextResponse.json({
      peers: peerDetails,
      outliers: allOutliers.slice(0, 30),
      peerRange: { min, max },
    });
  } catch (e) {
    console.error("find-peers error:", e);
    const message = e instanceof Error ? e.message : "Failed to find peers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

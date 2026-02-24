import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/ai";
import { saveGeneration } from "@/lib/supabase";
import { getUserFromToken } from "@/lib/supabase";
import type { ChannelInfo } from "@/lib/youtube";
import type { OutlierVideo } from "@/lib/outliers";

// Step 4: Generate video ideas from outliers
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { channel, niche, peers, outliers, sessionId } = body || {};

  if (!channel || !niche?.length || !outliers?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  let userId: string | undefined;

  if (token) {
    const user = await getUserFromToken(token);
    if (user) userId = user.id;
  }

  try {
    const typedChannel = channel as ChannelInfo;
    const typedOutliers = outliers as OutlierVideo[];

    const ideas = await generateIdeas(typedChannel, niche, typedOutliers);

    if (!ideas.length) {
      return NextResponse.json(
        { error: "Failed to generate ideas. Please try again." },
        { status: 500 }
      );
    }

    // Save generation to history
    await saveGeneration({
      userId,
      sessionId,
      channelId: typedChannel.channelId,
      channelTitle: typedChannel.title,
      channelThumbnail: typedChannel.thumbnail,
      channelSubs: typedChannel.subscriberCount,
      niche: niche.join(", "),
      peers,
      outliers: typedOutliers.slice(0, 20),
      ideas,
    });

    return NextResponse.json({ ideas });
  } catch (e) {
    console.error("generate-ideas error:", e);
    const message = e instanceof Error ? e.message : "Failed to generate ideas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

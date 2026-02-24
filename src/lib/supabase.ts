import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// Get user from auth token
export async function getUserFromToken(token: string) {
  const supabase = getServiceClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Count generations for a user or session (for free tier limit)
export async function countGenerations(
  userId?: string,
  sessionId?: string
): Promise<number> {
  const supabase = getServiceClient();

  if (userId) {
    const { count } = await supabase
      .from("nextvideo_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    return count || 0;
  }

  if (sessionId) {
    const { count } = await supabase
      .from("nextvideo_generations")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .is("user_id", null);
    return count || 0;
  }

  return 0;
}

// Save a generation
export async function saveGeneration(data: {
  userId?: string;
  sessionId?: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  channelSubs: number;
  niche: string;
  peers: unknown;
  outliers: unknown;
  ideas: unknown;
}) {
  const supabase = getServiceClient();
  const { data: row, error } = await supabase
    .from("nextvideo_generations")
    .insert({
      user_id: data.userId || null,
      session_id: data.sessionId || null,
      channel_id: data.channelId,
      channel_title: data.channelTitle,
      channel_thumbnail: data.channelThumbnail,
      channel_subs: data.channelSubs,
      niche: data.niche,
      peers: data.peers,
      outliers: data.outliers,
      ideas: data.ideas,
    })
    .select("id")
    .single();
  return { data: row, error };
}

// Get a single generation by ID (public, no auth)
export async function getGenerationById(id: string) {
  const supabase = getServiceClient();
  return supabase
    .from("nextvideo_generations")
    .select("*")
    .eq("id", id)
    .single();
}

// Get generation history
export async function getHistory(userId?: string, sessionId?: string) {
  const supabase = getServiceClient();

  let query = supabase
    .from("nextvideo_generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId).is("user_id", null);
  } else {
    return { data: [], error: null };
  }

  return query;
}

// Migrate anonymous generations to a user account
export async function migrateSessionToUser(
  sessionId: string,
  userId: string
) {
  const supabase = getServiceClient();
  return supabase
    .from("nextvideo_generations")
    .update({ user_id: userId })
    .eq("session_id", sessionId)
    .is("user_id", null);
}

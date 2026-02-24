import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const TTL = {
  peers: 7 * 24 * 60 * 60 * 1000, // 7 days
  videos: 24 * 60 * 60 * 1000, // 1 day
  channel: 24 * 60 * 60 * 1000, // 1 day
};

export async function getCached<T>(
  key: string,
  type: keyof typeof TTL
): Promise<T | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("nextvideo_cache")
    .select("data, expires_at")
    .eq("cache_key", key)
    .single();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) {
    // Expired — delete and return null
    await supabase.from("nextvideo_cache").delete().eq("cache_key", key);
    return null;
  }

  return data.data as T;
}

export async function setCache(
  key: string,
  type: keyof typeof TTL,
  data: unknown
): Promise<void> {
  const supabase = getSupabase();
  const expiresAt = new Date(Date.now() + TTL[type]).toISOString();

  await supabase.from("nextvideo_cache").upsert(
    {
      cache_key: key,
      type,
      data,
      expires_at: expiresAt,
    },
    { onConflict: "cache_key" }
  );
}

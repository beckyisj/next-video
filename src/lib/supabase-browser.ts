import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

let _browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!_browserClient) {
    try {
      _browserClient = createBrowserClient();
    } catch {
      return null;
    }
  }
  return _browserClient;
}

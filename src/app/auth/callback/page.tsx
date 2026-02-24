"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      router.replace("/");
      return;
    }

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        router.replace("/");
      }
    });

    const timeout = setTimeout(() => router.replace("/"), 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-foreground/50">Signing you in...</p>
    </div>
  );
}

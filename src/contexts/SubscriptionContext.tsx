"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

type Plan = "free" | "pro";

type SubscriptionContextValue = {
  plan: Plan;
  isPro: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  startCheckout: () => Promise<{ error?: string }>;
  openBillingPortal: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = useAuth();
  const [plan, setPlan] = useState<Plan>("free");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/subscription-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan || "free");
      }
    } catch {}
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchStatus]);

  const startCheckout = useCallback(async (): Promise<{ error?: string }> => {
    if (!session) return { error: "Not logged in" };
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok)
        return { error: data?.error || `Request failed (${res.status})` };
      if (!data.url) return { error: "No checkout URL returned" };
      window.location.href = data.url;
      return {};
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Network error";
      return { error: message };
    }
  }, [session]);

  const openBillingPortal = useCallback(async () => {
    if (!session) return;
    const res = await fetch("/api/billing-portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      alert(`Billing portal error: ${data.error || "Unknown error"}`);
    }
  }, [session]);

  const isPro = plan === "pro";

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        isPro,
        isLoading,
        refresh: fetchStatus,
        startCheckout,
        openBillingPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error(
      "useSubscription must be used within SubscriptionProvider"
    );
  return ctx;
}

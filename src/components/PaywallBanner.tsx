"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState } from "react";

interface PaywallBannerProps {
  count: number;
  limit: number;
}

export default function PaywallBanner({ count, limit }: PaywallBannerProps) {
  const { user, signInWithMagicLink } = useAuth();
  const { startCheckout } = useSubscription();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    const result = await startCheckout();
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signInWithMagicLink(email);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-teal-50 to-white border border-teal-100 rounded-xl p-6 text-center">
      <div className="w-10 h-10 bg-teal-600/[0.08] rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="font-semibold text-stone-900 text-base">
        You&apos;ve used all {limit} free generations
      </h3>
      <p className="text-sm text-stone-500 mt-1">
        Upgrade to Pro for unlimited video ideas across all YouTube Producer tools.
      </p>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {!user ? (
        sent ? (
          <p className="text-sm text-teal-700 mt-4">
            Check your email for the login link, then upgrade.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="mt-4 flex gap-2 max-w-xs mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors whitespace-nowrap"
            >
              Sign in
            </button>
          </form>
        )
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Upgrade to Pro — $19/mo"}
        </button>
      )}

      <p className="text-xs text-stone-400 mt-3">
        {count}/{limit} free generations used
      </p>
    </div>
  );
}

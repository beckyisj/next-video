"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState } from "react";

interface PaywallBannerProps {
  count: number;
  limit: number;
}

export default function PaywallBanner({ count, limit }: PaywallBannerProps) {
  const { user, signInWithMagicLink, signUp, signInWithPassword } = useAuth();
  const { startCheckout } = useSubscription();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "signin" | "signup">("magic");
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signInWithMagicLink(email);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    }
    const result = mode === "signup"
      ? await signUp(email, password)
      : await signInWithPassword(email, password);
    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
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
            {mode === "signup"
              ? "Check your email to confirm your account."
              : "Check your email for the login link, then upgrade."}
          </p>
        ) : (
          <div className="mt-4 max-w-xs mx-auto space-y-2">
            <form onSubmit={mode === "magic" ? handleMagicLink : handlePasswordSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
              />
              {mode !== "magic" && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
                />
              )}
              {mode === "signup" && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
                />
              )}
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {mode === "magic" ? "Send magic link" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
            <div className="text-xs text-stone-400 space-y-0.5">
              {mode === "magic" ? (
                <button type="button" onClick={() => { setMode("signin"); setError(""); }} className="hover:text-stone-600 transition-colors">
                  Use password instead
                </button>
              ) : (
                <button type="button" onClick={() => { setMode("magic"); setError(""); setPassword(""); setConfirmPassword(""); }} className="hover:text-stone-600 transition-colors">
                  Use magic link instead
                </button>
              )}
              {mode === "signin" && (
                <div>
                  <span>No account? </span>
                  <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-teal-600 hover:text-teal-700 transition-colors">
                    Create one
                  </button>
                </div>
              )}
              {mode === "signup" && (
                <div>
                  <span>Have an account? </span>
                  <button type="button" onClick={() => { setMode("signin"); setError(""); setConfirmPassword(""); }} className="text-teal-600 hover:text-teal-700 transition-colors">
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Upgrade to Pro \u2014 $19/mo"}
        </button>
      )}

      <p className="text-xs text-stone-400 mt-3">
        {count}/{limit} free generations used
      </p>
    </div>
  );
}

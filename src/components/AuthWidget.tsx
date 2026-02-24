"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface AuthWidgetProps {
  onOpenHistory: () => void;
  onOpenFeedback: () => void;
}

export default function AuthWidget({ onOpenHistory, onOpenFeedback }: AuthWidgetProps) {
  const { user, signInWithMagicLink, signOut, isLoading } = useAuth();
  const { isPro, openBillingPortal } = useSubscription();
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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

  if (isLoading) return null;

  if (!user) {
    if (showLogin) {
      return (
        <div className="relative">
          {sent ? (
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm w-72">
              <p className="text-sm text-stone-700">
                Check your email for the login link.
              </p>
              <button
                onClick={() => { setShowLogin(false); setSent(false); }}
                className="text-xs text-stone-500 hover:text-stone-700 mt-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm w-72">
              <p className="text-sm font-medium text-stone-700 mb-2">Sign in to save history</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none"
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
                >
                  Send link
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-xs text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => setShowLogin(true)}
        className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 transition-colors"
      >
        <span className="truncate max-w-[140px]">{user.email}</span>
        {isPro && (
          <span className="text-[10px] font-semibold bg-teal-600/[0.08] text-teal-700 rounded-full px-1.5 py-0.5">
            PRO
          </span>
        )}
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-sm py-1 w-48 z-20">
            <button
              onClick={() => { onOpenHistory(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              History
            </button>
            <button
              onClick={() => { onOpenFeedback(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              Send feedback
            </button>
            {isPro && (
              <button
                onClick={() => { openBillingPortal(); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Manage subscription
              </button>
            )}
            <hr className="my-1 border-stone-100" />
            <button
              onClick={() => { signOut(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-stone-500 hover:bg-stone-50"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

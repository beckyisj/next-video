"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface AuthWidgetProps {
  onOpenHistory: () => void;
  onOpenFeedback: () => void;
}

export default function AuthWidget({ onOpenHistory, onOpenFeedback }: AuthWidgetProps) {
  const { user, signInWithMagicLink, signUp, signInWithPassword, signOut, isLoading } = useAuth();
  const { isPro, openBillingPortal, startCheckout } = useSubscription();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "signin" | "signup">("magic");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    setError("");
    const result = await signInWithMagicLink(email.trim());
    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!email.trim() || !password) return;
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setStatus("error");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setStatus("error");
        return;
      }
    }
    setStatus("sending");
    setError("");
    const result = mode === "signup"
      ? await signUp(email.trim(), password)
      : await signInWithPassword(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setStatus("error");
    } else if (mode === "signup") {
      setStatus("sent");
    } else {
      setShowModal(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setStatus("idle");
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMode("magic");
  };

  if (isLoading) return null;

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHistory}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            History
          </button>
          <button
            onClick={openModal}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Sign in
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
              aria-hidden
            />
            <div className="relative bg-white border border-stone-200 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
              <h3 className="text-lg font-semibold text-stone-900">
                {mode === "signup" ? "Create account" : "Sign in"}
              </h3>
              <p className="text-sm text-stone-500">
                {mode === "magic"
                  ? "Enter your email to receive a sign-in link."
                  : mode === "signup"
                  ? "Create an account with your email and password."
                  : "Sign in with your email and password."}
              </p>
              {status === "sent" ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                    <p className="text-sm text-stone-600">
                      {mode === "signup"
                        ? <>Check your inbox for <strong className="text-stone-900">{email}</strong> to confirm your account.</>
                        : <>Check your inbox for <strong className="text-stone-900">{email}</strong> and click the link to sign in.</>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600/40 focus:outline-none focus:ring-1 focus:ring-teal-600/20"
                    onKeyDown={(e) => e.key === "Enter" && (mode === "magic" ? handleSendLink() : handlePasswordSubmit())}
                    autoFocus
                  />
                  {mode !== "magic" && (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600/40 focus:outline-none focus:ring-1 focus:ring-teal-600/20"
                      onKeyDown={(e) => e.key === "Enter" && (mode === "signin" ? handlePasswordSubmit() : undefined)}
                    />
                  )}
                  {mode === "signup" && (
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600/40 focus:outline-none focus:ring-1 focus:ring-teal-600/20"
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                    />
                  )}
                  {error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={mode === "magic" ? handleSendLink : handlePasswordSubmit}
                      disabled={status === "sending" || !email.trim() || (mode !== "magic" && !password)}
                      className="flex-1 rounded-xl bg-teal-600 text-white font-medium py-2.5 px-4 text-sm transition-all hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {status === "sending"
                        ? "..."
                        : mode === "magic"
                        ? "Send magic link"
                        : mode === "signup"
                        ? "Create account"
                        : "Sign in"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl px-4 py-2.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="text-center text-xs text-stone-400 space-y-1">
                    {mode === "magic" ? (
                      <button type="button" onClick={() => { setMode("signin"); setError(""); setStatus("idle"); }} className="hover:text-stone-600 transition-colors">
                        Use password instead
                      </button>
                    ) : (
                      <button type="button" onClick={() => { setMode("magic"); setError(""); setStatus("idle"); setPassword(""); setConfirmPassword(""); }} className="hover:text-stone-600 transition-colors">
                        Use magic link instead
                      </button>
                    )}
                    {mode === "signin" && (
                      <div>
                        <span>Don&apos;t have an account? </span>
                        <button type="button" onClick={() => { setMode("signup"); setError(""); setStatus("idle"); }} className="text-teal-600 hover:text-teal-700 transition-colors">
                          Create one
                        </button>
                      </div>
                    )}
                    {mode === "signup" && (
                      <div>
                        <span>Already have an account? </span>
                        <button type="button" onClick={() => { setMode("signin"); setError(""); setStatus("idle"); setConfirmPassword(""); }} className="text-teal-600 hover:text-teal-700 transition-colors">
                          Sign in
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
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
            {isPro ? (
              <button
                onClick={() => { openBillingPortal(); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Manage subscription
              </button>
            ) : (
              <button
                onClick={() => { startCheckout(); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-teal-700 font-medium hover:bg-stone-50"
              >
                Upgrade to Pro
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

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  errorContext?: { error: string; channelUrl?: string };
}

export default function FeedbackModal({ open, onClose, errorContext }: FeedbackModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<string>(errorContext ? "bug" : "feedback");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const body: Record<string, string> = {
      type,
      email: user?.email || "anonymous",
      message: errorContext
        ? `Error: ${errorContext.error}\nChannel: ${errorContext.channelUrl || "N/A"}\nUser Agent: ${navigator.userAgent}\nTime: ${new Date().toISOString()}\n\nUser note: ${message || "(none)"}`
        : message,
    };

    try {
      await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setMessage("");
      }, 2000);
    } catch {}
    setSending(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white border border-stone-200 rounded-xl shadow-lg w-full max-w-md p-5 pointer-events-auto">
          {sent ? (
            <div className="text-center py-6">
              <p className="text-sm text-stone-700">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-semibold text-stone-900 mb-3">
                {errorContext ? "Report an issue" : "Send feedback"}
              </h3>

              {errorContext && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-mono text-red-600">{errorContext.error}</p>
                  {errorContext.channelUrl && (
                    <p className="text-xs text-stone-500 mt-1">{errorContext.channelUrl}</p>
                  )}
                </div>
              )}

              {!errorContext && (
                <div className="flex gap-2 mb-3">
                  {["feedback", "bug", "feature"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`text-xs font-medium rounded-full px-3 py-1 transition-colors ${
                        type === t
                          ? "bg-teal-600/[0.08] text-teal-700"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  errorContext
                    ? "Any extra details? (optional — we already have the error info above)"
                    : "What's on your mind?"
                }
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none resize-none"
              />

              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-stone-500 hover:text-stone-700 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || (!errorContext && !message.trim())}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors disabled:opacity-40"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

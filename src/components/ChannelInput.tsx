"use client";

import { useState } from "react";

interface ChannelInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export default function ChannelInput({ onSubmit, isLoading }: ChannelInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a YouTube channel URL, @handle, or name"
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 outline-none transition-colors text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-5 py-3 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Working...
            </span>
          ) : (
            "Find Ideas"
          )}
        </button>
      </div>
    </form>
  );
}

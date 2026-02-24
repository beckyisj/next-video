"use client";

import IdeaCard from "@/components/IdeaCard";
import type { VideoIdea } from "@/lib/ai";
import { formatSubs } from "@/lib/peer-range";

interface ShareResultsProps {
  data: {
    channel_title: string;
    channel_thumbnail: string;
    channel_subs: number;
    niche: string;
    ideas: VideoIdea[];
  };
}

export default function ShareResults({ data }: ShareResultsProps) {
  const niche = data.niche?.split(", ").filter(Boolean) || [];

  return (
    <div className="bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="white">
                <polygon points="7,8 16,16 7,24" />
                <polygon points="16,8 25,16 16,24" />
              </svg>
            </div>
            <span className="font-semibold text-stone-900 text-sm tracking-tight">Next Video</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Channel summary (inline, no extra component import needed) */}
        <div className="w-full max-w-xl mx-auto bg-white border border-stone-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            {data.channel_thumbnail && (
              <img
                src={data.channel_thumbnail}
                alt={data.channel_title}
                className="w-14 h-14 rounded-full flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900 text-base truncate">
                {data.channel_title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                <span>{formatSubs(data.channel_subs)} subscribers</span>
              </div>
              {niche.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {niche.map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs font-medium bg-teal-600/[0.08] text-teal-700 rounded-full px-2.5 py-0.5"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ideas */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight">
              Video ideas for {data.channel_title}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Based on outlier videos from channels one step ahead
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {data.ideas.map((idea, i) => (
              <IdeaCard
                key={i}
                index={i}
                title={idea.title}
                insight={idea.insight}
                evidence={idea.evidence}
              />
            ))}
          </div>

          {/* How it works */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-3">
              How these ideas are generated
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-500 leading-relaxed">
              <p>
                <span className="font-medium text-stone-600">Peer channels</span> — We find YouTube channels in your niche with slightly more subscribers than yours. These are channels &quot;one step ahead&quot; of you.
              </p>
              <p>
                <span className="font-medium text-stone-600">Outlier videos</span> — For each peer channel, we calculate their median video views. Videos with 3x or more their median are outliers — topics that clearly resonated with their audience.
              </p>
              <p>
                <span className="font-medium text-stone-600">The multiplier (e.g. 5.2x)</span> — Shows how many times more views that video got compared to the channel&apos;s typical video. Higher = stronger signal that the topic works.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-teal-500 to-teal-600 text-white font-medium text-sm rounded-xl px-6 py-3 shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all"
            >
              Try it with your channel
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

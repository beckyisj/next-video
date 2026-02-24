"use client";

import { formatSubs } from "@/lib/peer-range";

interface ChannelSummaryProps {
  channel: {
    title: string;
    thumbnail: string;
    subscriberCount: number;
    videoCount: number;
    customUrl?: string;
  };
  niche: string[];
  peerRange?: { min: number; max: number };
  peersFound?: number;
  outliersFound?: number;
}

export default function ChannelSummary({
  channel,
  niche,
  peerRange,
  peersFound,
  outliersFound,
}: ChannelSummaryProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-stone-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        {channel.thumbnail && (
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-14 h-14 rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-base truncate">
            {channel.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
            <span>{formatSubs(channel.subscriberCount)} subscribers</span>
            <span>{channel.videoCount} videos</span>
          </div>
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
        </div>
      </div>

      {(peerRange || peersFound !== undefined) && (
        <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-3 text-center">
          {peerRange && (
            <div>
              <p className="text-xs text-stone-400">Peer range</p>
              <p className="text-sm font-medium text-stone-700 mt-0.5">
                {formatSubs(peerRange.min)}–{formatSubs(peerRange.max)}
              </p>
            </div>
          )}
          {peersFound !== undefined && (
            <div>
              <p className="text-xs text-stone-400">Peers found</p>
              <p className="text-sm font-medium text-stone-700 mt-0.5">{peersFound}</p>
            </div>
          )}
          {outliersFound !== undefined && (
            <div>
              <p className="text-xs text-stone-400">Outlier videos</p>
              <p className="text-sm font-medium text-stone-700 mt-0.5">{outliersFound}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import EvidenceVideo from "./EvidenceVideo";

interface Evidence {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  multiplier: number;
  thumbnail: string;
}

interface IdeaCardProps {
  index: number;
  title: string;
  insight: string;
  evidence: Evidence[];
}

export default function IdeaCard({ index, title, insight, evidence }: IdeaCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-600/[0.08] text-teal-700 text-xs font-semibold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-base leading-snug">
            {title}
          </h3>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            {insight}
          </p>

          {evidence.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2">
                Evidence
              </p>
              <div className="flex flex-col gap-1">
                {evidence.map((v) => (
                  <EvidenceVideo key={v.videoId} {...v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

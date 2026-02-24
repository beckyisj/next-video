"use client";

interface EvidenceVideoProps {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  multiplier: number;
  thumbnail: string;
}

export default function EvidenceVideo({
  videoId,
  title,
  channelTitle,
  viewCount,
  multiplier,
  thumbnail,
}: EvidenceVideoProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors group"
    >
      <div className="relative flex-shrink-0 w-24 h-[54px] rounded-md overflow-hidden bg-stone-100">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] font-medium px-1 py-0.5 rounded">
          {multiplier}x
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-stone-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          {channelTitle} &middot; {viewCount.toLocaleString()} views
        </p>
      </div>
    </a>
  );
}

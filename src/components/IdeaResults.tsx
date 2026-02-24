"use client";

import IdeaCard from "./IdeaCard";
import type { VideoIdea } from "@/lib/ai";

interface IdeaResultsProps {
  ideas: VideoIdea[];
  channelTitle: string;
}

export default function IdeaResults({ ideas, channelTitle }: IdeaResultsProps) {
  if (!ideas.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-stone-900 tracking-tight">
          Video ideas for {channelTitle}
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Based on outlier videos from channels one step ahead of yours
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {ideas.map((idea, i) => (
          <IdeaCard
            key={i}
            index={i}
            title={idea.title}
            insight={idea.insight}
            evidence={idea.evidence}
          />
        ))}
      </div>
    </div>
  );
}

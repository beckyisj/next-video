"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateSessionId } from "@/lib/session";
import ChannelInput from "@/components/ChannelInput";
import ProgressSteps from "@/components/ProgressSteps";
import type { Step } from "@/components/ProgressSteps";
import ChannelSummary from "@/components/ChannelSummary";
import IdeaResults from "@/components/IdeaResults";
import PaywallBanner from "@/components/PaywallBanner";
import AuthWidget from "@/components/AuthWidget";
import HistoryPanel from "@/components/HistoryPanel";
import FeedbackModal from "@/components/FeedbackModal";
import type { VideoIdea } from "@/lib/ai";

interface ChannelData {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  customUrl?: string;
}

interface PeerData {
  channelId: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  outlierCount: number;
}

export default function Home() {
  const { session } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [niche, setNiche] = useState<string[]>([]);
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [peerRange, setPeerRange] = useState<{ min: number; max: number } | null>(null);
  const [outliers, setOutliers] = useState<Array<Record<string, unknown>>>([]);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [paywall, setPaywall] = useState<{ count: number; limit: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorContext, setErrorContext] = useState<{ error: string; channelUrl?: string } | undefined>();

  // Steps
  const [steps, setSteps] = useState<Step[]>([
    { label: "Analyzing channel", status: "pending" },
    { label: "Finding peer channels", status: "pending" },
    { label: "Detecting outlier videos", status: "pending" },
    { label: "Generating video ideas", status: "pending" },
  ]);

  const updateStep = (index: number, status: Step["status"], detail?: string) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, status, detail: detail ?? s.detail } : s
      )
    );
  };

  // Migrate anonymous history on sign-in
  useEffect(() => {
    if (session?.access_token) {
      const sessionId = getOrCreateSessionId();
      if (sessionId) {
        fetch("/api/history/migrate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    }
  }, [session]);

  const resetState = () => {
    setChannel(null);
    setNiche([]);
    setPeers([]);
    setPeerRange(null);
    setOutliers([]);
    setIdeas([]);
    setPaywall(null);
    setError(null);
    setErrorContext(undefined);
    setSteps([
      { label: "Analyzing channel", status: "pending" },
      { label: "Finding peer channels", status: "pending" },
      { label: "Detecting outlier videos", status: "pending" },
      { label: "Generating video ideas", status: "pending" },
    ]);
  };

  const handleSubmit = useCallback(
    async (input: string) => {
      resetState();
      setIsLoading(true);
      setInputValue(input);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      try {
        // Step 1: Analyze channel
        updateStep(0, "active");
        const analyzeRes = await fetch("/api/analyze-channel", {
          method: "POST",
          headers,
          body: JSON.stringify({ input }),
        });
        const analyzeData = await analyzeRes.json();

        if (!analyzeRes.ok) {
          throw new Error(analyzeData.error || "Failed to analyze channel");
        }

        setChannel(analyzeData.channel);
        setNiche(analyzeData.niche);
        updateStep(0, "done", analyzeData.channel.title);

        // Step 2-3: Find peers + outliers
        updateStep(1, "active");
        const sessionId = getOrCreateSessionId();
        const peersRes = await fetch("/api/find-peers", {
          method: "POST",
          headers,
          body: JSON.stringify({
            channelId: analyzeData.channel.channelId,
            subscriberCount: analyzeData.channel.subscriberCount,
            niche: analyzeData.niche,
            sessionId,
          }),
        });
        const peersData = await peersRes.json();

        if (peersData.paywall) {
          updateStep(1, "error", "Free limit reached");
          setPaywall({ count: peersData.count, limit: peersData.limit });
          setIsLoading(false);
          return;
        }

        if (!peersRes.ok) {
          throw new Error(peersData.error || "Failed to find peers");
        }

        setPeers(peersData.peers);
        setPeerRange(peersData.peerRange);
        setOutliers(peersData.outliers);
        updateStep(1, "done", `${peersData.peers.length} channels found`);
        updateStep(2, "done", `${peersData.outliers.length} outliers detected`);

        if (!peersData.outliers.length) {
          throw new Error("No outlier videos found. Try a different channel.");
        }

        // Step 4: Generate ideas
        updateStep(3, "active");
        const ideasRes = await fetch("/api/generate-ideas", {
          method: "POST",
          headers,
          body: JSON.stringify({
            channel: analyzeData.channel,
            niche: analyzeData.niche,
            peers: peersData.peers,
            outliers: peersData.outliers,
            sessionId,
          }),
        });
        const ideasData = await ideasRes.json();

        if (!ideasRes.ok) {
          throw new Error(ideasData.error || "Failed to generate ideas");
        }

        setIdeas(ideasData.ideas);
        updateStep(3, "done", `${ideasData.ideas.length} ideas generated`);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong";
        setError(message);
        setErrorContext({ error: message, channelUrl: input });
        // Mark current active step as error
        setSteps((prev) =>
          prev.map((s) => (s.status === "active" ? { ...s, status: "error" as const } : s))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleHistorySelect = (gen: any) => {
    setShowHistory(false);
    setChannel({
      channelId: gen.channel_id as string,
      title: gen.channel_title as string,
      thumbnail: gen.channel_thumbnail as string,
      subscriberCount: gen.channel_subs as number,
      videoCount: 0,
      description: "",
    });
    setNiche((gen.niche as string)?.split(", ") || []);
    setIdeas((gen.ideas as VideoIdea[]) || []);
    setSteps([
      { label: "Analyzing channel", status: "done", detail: gen.channel_title as string },
      { label: "Finding peer channels", status: "done" },
      { label: "Detecting outlier videos", status: "done" },
      { label: "Generating video ideas", status: "done" },
    ]);
  };

  const showProgress = steps.some((s) => s.status !== "pending");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="white">
                <polygon points="7,8 16,16 7,24" />
                <polygon points="16,8 25,16 16,24" />
              </svg>
            </div>
            <span className="font-semibold text-stone-900 text-sm tracking-tight">Next Video</span>
          </div>
          <AuthWidget
            onOpenHistory={() => setShowHistory(true)}
            onOpenFeedback={() => {
              setErrorContext(undefined);
              setShowFeedback(true);
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Find your next video idea
          </h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base max-w-md mx-auto">
            See what&apos;s working for channels one step ahead of yours, backed by data.
          </p>
        </div>

        {/* Input */}
        <ChannelInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Progress + Results */}
        <div className="mt-8 flex flex-col gap-6">
          {showProgress && <ProgressSteps steps={steps} />}

          {channel && niche.length > 0 && (
            <ChannelSummary
              channel={channel}
              niche={niche}
              peerRange={peerRange || undefined}
              peersFound={peers.length || undefined}
              outliersFound={outliers.length || undefined}
            />
          )}

          {paywall && <PaywallBanner count={paywall.count} limit={paywall.limit} />}

          {error && !paywall && (
            <div className="w-full max-w-xl mx-auto bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => {
                  setErrorContext({ error, channelUrl: inputValue });
                  setShowFeedback(true);
                }}
                className="text-xs text-red-500 hover:text-red-700 mt-2 underline"
              >
                Report issue
              </button>
            </div>
          )}

          {ideas.length > 0 && channel && (
            <IdeaResults ideas={ideas} channelTitle={channel.title} />
          )}
        </div>
      </main>

      {/* History panel */}
      <HistoryPanel
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={handleHistorySelect}
      />

      {/* Feedback modal */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        errorContext={errorContext}
      />
    </div>
  );
}

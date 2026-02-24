import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { ChannelInfo } from "./youtube";
import type { OutlierVideo } from "./outliers";

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function getDeepSeek() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  return new OpenAI({ baseURL: "https://api.deepseek.com", apiKey: key });
}

// Extract niche keywords from a channel
export async function extractNiche(
  channel: ChannelInfo,
  videoTitles: string[]
): Promise<string[]> {
  const prompt = `Analyze this YouTube channel and extract 3-5 niche keywords that describe what topics they cover. These keywords will be used to search for similar channels.

Channel: ${channel.title}
Description: ${channel.description?.slice(0, 500) || "N/A"}
Recent video titles:
${videoTitles.slice(0, 15).map((t) => `- ${t}`).join("\n")}

Return ONLY a JSON array of 3-5 keyword strings. Example: ["productivity", "time management", "self improvement"]
No explanation, just the JSON array.`;

  const result = await callAI(prompt);
  try {
    const parsed = JSON.parse(result.replace(/```json?\n?|\n?```/g, "").trim());
    if (Array.isArray(parsed)) return parsed.slice(0, 5);
  } catch {
    // Try to extract words from the response
    const words = result.match(/"([^"]+)"/g);
    if (words) return words.map((w) => w.replace(/"/g, "")).slice(0, 5);
  }
  return [channel.title];
}

export interface VideoIdea {
  title: string;
  insight: string;
  evidence: {
    videoId: string;
    title: string;
    channelTitle: string;
    viewCount: number;
    multiplier: number;
    thumbnail: string;
  }[];
}

// Generate video ideas from outlier videos
export async function generateIdeas(
  channel: ChannelInfo,
  niche: string[],
  outliers: OutlierVideo[]
): Promise<VideoIdea[]> {
  // Give each outlier a numbered index so the AI can reference them reliably
  const topOutliers = outliers.slice(0, 20);
  const outlierSummary = topOutliers
    .map(
      (v, i) =>
        `[${i}] "${v.title}" by ${v.channelTitle} (${v.viewCount.toLocaleString()} views, ${v.multiplier}x their median)`
    )
    .join("\n");

  const prompt = `You are a YouTube strategist. A creator in the "${niche.join(", ")}" niche wants video ideas based on what's working for channels one step ahead of them.

Their channel: ${channel.title} (${channel.subscriberCount.toLocaleString()} subscribers)

These are outlier videos (videos that got 3x+ their channel's median views) from similar but slightly larger channels. Each has a number in brackets:

${outlierSummary}

Generate exactly 5 video ideas for this creator. Each idea should:
1. Be inspired by what's working (the outlier patterns) but adapted for their audience size
2. Have a compelling, specific title (not generic)
3. Include a 1-2 sentence insight explaining WHY this topic works and how to approach it
4. Reference 1-3 evidence videos using their bracket numbers. Each idea MUST reference DIFFERENT videos — spread the evidence across the full list, don't reuse the same ones.

Return ONLY valid JSON in this exact format:
[
  {
    "title": "Video title idea",
    "insight": "Why this works and how to approach it",
    "evidence": [0, 3, 7]
  }
]

The "evidence" array must contain the bracket numbers (integers) of the outlier videos that inspired each idea. Use different videos for each idea.`;

  const result = await callAI(prompt);
  try {
    const parsed = JSON.parse(result.replace(/```json?\n?|\n?```/g, "").trim());
    if (!Array.isArray(parsed)) return [];

    // Track which outliers have been used as fallback
    const usedIndices = new Set<number>();

    return parsed.slice(0, 5).map(
      (idea: { title: string; insight: string; evidence?: number[] }, ideaIdx: number) => {
        // Map bracket indices to actual outlier video data
        const evidence = (idea.evidence || [])
          .filter((idx: number) => typeof idx === "number" && idx >= 0 && idx < topOutliers.length)
          .slice(0, 3)
          .map((idx: number) => {
            usedIndices.add(idx);
            const v = topOutliers[idx];
            return {
              videoId: v.videoId,
              title: v.title,
              channelTitle: v.channelTitle,
              viewCount: v.viewCount,
              multiplier: v.multiplier,
              thumbnail: v.thumbnail,
            };
          });

        // Fallback: pick a different unused outlier for each idea
        if (evidence.length === 0) {
          const fallbackIdx = topOutliers.findIndex((_, i) => !usedIndices.has(i));
          const idx = fallbackIdx >= 0 ? fallbackIdx : ideaIdx % topOutliers.length;
          usedIndices.add(idx);
          const v = topOutliers[idx];
          evidence.push({
            videoId: v.videoId,
            title: v.title,
            channelTitle: v.channelTitle,
            viewCount: v.viewCount,
            multiplier: v.multiplier,
            thumbnail: v.thumbnail,
          });
        }

        return {
          title: idea.title,
          insight: idea.insight,
          evidence,
        };
      }
    );
  } catch {
    return [];
  }
}

// Call AI with Gemini primary, DeepSeek fallback
async function callAI(prompt: string): Promise<string> {
  // Try Gemini first
  const gemini = getGemini();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (e) {
      console.error("Gemini error, falling back to DeepSeek:", e);
    }
  }

  // DeepSeek fallback
  const deepseek = getDeepSeek();
  if (deepseek) {
    try {
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (e) {
      console.error("DeepSeek error:", e);
    }
  }

  throw new Error("No AI provider available");
}

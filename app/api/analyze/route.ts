// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if owner/admin or subscribed
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, subscribed: true },
  });

  const isOwner =
    session.user.email.includes("abregana") ||
    session.user.email.includes("claveria");

  if (!dbUser?.subscribed && !isOwner) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { transcript, videoTitle, videoDuration } = await req.json();

  if (!transcript || transcript.trim().length < 10) {
    return NextResponse.json(
      { error: "Please provide a transcript of at least 10 characters." },
      { status: 400 }
    );
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are an expert YouTube content strategist specializing in Shorts, Reels, and TikTok repurposing.

Analyze the following video transcript/dialogue (even if it's a short 3-15 second micro-video) and identify the BEST angles/hooks to turn it into viral Shorts/Reels.

Video Title: ${videoTitle || "Untitled Video"}
Approximate Duration: ${videoDuration || "Short clip"}
Transcript / Audio:
---
${transcript.slice(0, 8000)}
---

Return a JSON object with this exact structure:
{
  "clips": [
    {
      "id": 1,
      "title": "Short catchy title (max 8 words)",
      "hook": "The exact opening line/sentence that makes people stop scrolling in the first 2 seconds",
      "summary": "What happens in this clip (1-2 sentences)",
      "why_viral": "Why this specific hook or moment will perform well on Shorts/Reels",
      "transcript_excerpt": "The exact quote or key moment",
      "suggested_caption": "Ready-to-post caption with 3 relevant hashtags",
      "platform_tips": {
        "youtube_shorts": "Specific tip for YouTube Shorts format",
        "instagram_reels": "Specific tip for Instagram Reels",
        "tiktok": "Specific tip for TikTok"
      },
      "viral_score": 88
    }
  ],
  "total_clips": 1,
  "best_clip_id": 1,
  "repurposing_strategy": "One paragraph overview of how to maximize reach with this clip"
}

Provide between 1 and 5 clips/angles (if the content is very short, like 3-10 seconds, provide 1 to 3 high-impact variations/framings). Rank them by viral potential (viral_score 1-100).
Return ONLY valid JSON, no markdown code blocks, no explanation.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: "Failed to analyze transcript. Please try again." },
      { status: 500 }
    );
  }
}


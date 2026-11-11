// app/app/page.tsx
"use client";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Sparkles, Copy, CheckCheck, TrendingUp,
  Loader2, AlertCircle, Lock, ExternalLink
} from "lucide-react";

type Clip = {
  id: number;
  title: string;
  hook: string;
  summary: string;
  why_viral: string;
  transcript_excerpt: string;
  suggested_caption: string;
  platform_tips: {
    youtube_shorts: string;
    instagram_reels: string;
    tiktok: string;
  };
  viral_score: number;
};

type AnalysisResult = {
  clips: Clip[];
  total_clips: number;
  best_clip_id: number;
  repurposing_strategy: string;
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-100 text-emerald-700" :
    score >= 60 ? "bg-amber-100 text-amber-700" :
    "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      <TrendingUp className="h-3 w-3" /> {score}/100
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
    >
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ClipCard({ clip, isBest }: { clip: Clip; isBest: boolean }) {
  const [openPlatform, setOpenPlatform] = useState<string | null>(null);

  return (
    <Card className={`transition-all ${isBest ? "border-2 border-violet-500 shadow-lg shadow-violet-100" : "hover:shadow-md"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isBest && (
                <Badge className="text-xs">⭐ Best Clip</Badge>
              )}
              <ScoreBadge score={clip.viral_score} />
            </div>
            <CardTitle className="text-base">{clip.title}</CardTitle>
          </div>
          <span className="shrink-0 text-2xl font-black text-violet-200">#{clip.id}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hook */}
        <div className="rounded-xl bg-violet-50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-500">🎯 Opening Hook</span>
            <CopyButton text={clip.hook} />
          </div>
          <p className="text-sm font-medium text-gray-800 italic">"{clip.hook}"</p>
        </div>

        {/* Summary */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Summary</p>
          <p className="text-sm text-gray-600">{clip.summary}</p>
        </div>

        {/* Why Viral */}
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">⚡ Why This Will Go Viral</p>
          <p className="text-sm text-gray-700">{clip.why_viral}</p>
        </div>

        {/* Caption */}
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">📝 Suggested Caption</p>
            <CopyButton text={clip.suggested_caption} />
          </div>
          <p className="text-sm text-gray-700">{clip.suggested_caption}</p>
        </div>

        {/* Platform Tips */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Platform Tips</p>
          <div className="flex gap-2 flex-wrap">
            {(["youtube_shorts", "instagram_reels", "tiktok"] as const).map((platform) => {
              const labels: Record<string, string> = {
                youtube_shorts: "🎬 YouTube",
                instagram_reels: "📸 Reels",
                tiktok: "🎵 TikTok",
              };
              return (
                <button
                  key={platform}
                  onClick={() => setOpenPlatform(openPlatform === platform ? null : platform)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    openPlatform === platform
                      ? "border-violet-500 bg-violet-100 text-violet-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-violet-300"
                  }`}
                >
                  {labels[platform]}
                </button>
              );
            })}
          </div>
          {openPlatform && (
            <div className="mt-2 rounded-xl bg-violet-50 p-3 text-sm text-gray-700">
              {clip.platform_tips[openPlatform as keyof typeof clip.platform_tips]}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppPage() {
  const { data: session, status } = useSession();
  const [transcript, setTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  const isOwner =
    session?.user?.email?.includes("abregana") ||
    session?.user?.email?.includes("claveria");
  const isSubscribed = (session?.user as any)?.subscribed || isOwner;

  const loadSample3Sec = () => {
    setVideoTitle("3-Second Life Hack");
    setVideoDuration("3 seconds");
    setTranscript("Stop scrolling! If you do this one simple trick every morning, your phone battery will literally last two full days.");
  };

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, videoTitle, videoDuration }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    setSubLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setSubLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <Lock className="mb-4 h-12 w-12 text-violet-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Sign in to continue</h2>
          <p className="mb-6 text-gray-500">You need to be signed in to use MetaSnap.</p>
          <Button size="lg" onClick={() => signIn("google")}>Sign in with Google</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700">
            <Sparkles className="h-4 w-4" /> AI Shorts Analyzer
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Find Your Viral Moments
          </h1>
          <p className="mt-2 text-gray-500">
            Paste your video transcript below. AI will identify the 5 best clips to repurpose.
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Video Title <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. How I Made $10K in a Month"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Duration (mins) <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Video Transcript / Words Spoken <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={loadSample3Sec}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
              >
                + Load 3-Sec Sample
              </button>
            </div>
            <div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste what was said in the video (even 1-2 sentences for a short 3-10 sec clip). E.g. 'Stop scrolling! If you do this one simple trick...'"
                rows={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none leading-relaxed"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{transcript.length} chars</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!isSubscribed ? (
              <div className="rounded-xl bg-violet-50 p-5 text-center">
                <Lock className="mx-auto mb-2 h-6 w-6 text-violet-400" />
                <p className="mb-3 font-medium text-gray-800">
                  Subscribe to unlock unlimited analyses
                </p>
                <Button onClick={handleSubscribe} disabled={subLoading} className="gap-2">
                  {subLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Get Pro — $19/mo
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAnalyze}
                disabled={loading || transcript.trim().length < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing your video…
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Find My Viral Clips
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Strategy */}
            <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-violet-700">Repurposing Strategy</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.repurposing_strategy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clips */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {result.total_clips} Viral Clips Found
                </h2>
                <span className="text-sm text-gray-400">Ranked by viral score ↓</span>
              </div>
              {result.clips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  isBest={clip.id === result.best_clip_id}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

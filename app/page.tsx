// app/page.tsx
"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, TrendingUp, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const BENEFITS = [
  {
    icon: <Clock className="h-6 w-6 text-violet-600" />,
    title: "Save 3+ Hours Per Video",
    desc: "Stop scrubbing timelines. AI finds your viral moments in under 10 seconds — so you can post more and edit less.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-violet-600" />,
    title: "Engineered for Virality",
    desc: "Every clip is scored on viral potential, hook strength, and platform fit. Only your best moments make the cut.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-violet-600" />,
    title: "Post-Ready in One Tap",
    desc: "Get optimized captions, hashtags, and platform-specific tips for YouTube Shorts, Reels, and TikTok — all at once.",
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    if (session) {
      router.push("/app");
    } else {
      signIn("google", { callbackUrl: "/app" });
    }
  };

  const handleSubscribe = async () => {
    if (!session) {
      signIn("google");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
          <Zap className="h-4 w-4" /> Powered by Google Gemini
        </div>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
          Turn Any Video Into{" "}
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            5 Viral Shorts
          </span>
          <br />in One Click
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-500">
          Paste your YouTube transcript. MetaSnap&apos;s AI detects your most engaging moments,
          scores them for virality, and delivers ready-to-post captions for every platform.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="xl" onClick={handleGetStarted} className="gap-2">
            Start for Free <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="outline" onClick={handleSubscribe} disabled={loading}>
            {loading ? "Redirecting…" : "Get Pro — $19/mo"}
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card to try · Cancel anytime</p>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="p-2 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{b.title}</h3>
                <p className="text-gray-500 leading-relaxed">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 pb-32" id="pricing">
        <div className="mx-auto max-w-md">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-gray-900">
            Simple Pricing
          </h2>
          <Card className="border-2 border-violet-500 shadow-xl shadow-violet-200">
            <CardContent className="p-8">
              <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600">
                Pro Plan
              </div>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-6xl font-extrabold text-gray-900">$19</span>
                <span className="mb-3 text-xl text-gray-400">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  "Unlimited video analyses",
                  "5 viral clip ideas per video",
                  "Platform-specific captions",
                  "Viral score + hook analysis",
                  "YouTube Shorts, Reels & TikTok tips",
                  "Cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="h-5 w-5 shrink-0 text-violet-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="xl"
                className="w-full"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Redirecting to Stripe…" : "Subscribe Now →"}
              </Button>
              <p className="mt-3 text-center text-xs text-gray-400">
                Secure payment via Stripe · Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-100 py-8 text-center text-sm text-gray-400">
        © 2026 MetaSnap. Built for creators.
      </footer>
    </div>
  );
}

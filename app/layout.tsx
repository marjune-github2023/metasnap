// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MetaSnap — Turn Your Videos into Viral Shorts in One Click",
  description:
    "Paste your YouTube transcript. MetaSnap uses AI to find the 5 best moments to repurpose as Shorts, Reels, or TikToks — with ready-to-post captions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

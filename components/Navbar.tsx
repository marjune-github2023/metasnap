"use client";
// components/Navbar.tsx
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-violet-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MetaSnap</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/app">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/app" })}>
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

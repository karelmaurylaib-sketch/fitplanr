"use client";

import { useEffect } from "react";
import { Logo } from "@/components/logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Logo />
      <h1 className="display mt-10 text-[44px]">Something slipped.</h1>
      <p className="mt-2 max-w-sm text-muted">Your plan and your logs are safe. Try again.</p>
      <button onClick={reset} className="press mt-6 inline-flex h-12 items-center rounded-full bg-lime px-6 font-semibold text-lime-ink">Try again</button>
    </main>
  );
}

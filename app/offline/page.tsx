import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { OfflineRetry } from "./retry";

// Served by the service worker (public/sw.js) when a page you never opened is asked for without a connection.
export const metadata: Metadata = { title: "Offline", robots: { index: false } };
export const dynamic = "force-static";

export default function Offline() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="top-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex max-w-[360px] flex-col items-center">
        <Logo />
        <div className="label mt-12">[ No connection ]</div>
        <h1 className="display mt-3 text-[44px] leading-[0.95]">Your plan is one bar away.</h1>
        <p className="mt-3 text-[16px] text-muted">The pages you opened before still work offline. Sets you log are kept on your phone and save when you&apos;re back.</p>
        <OfflineRetry />
      </div>
    </main>
  );
}

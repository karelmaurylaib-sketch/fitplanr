import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { MainButton } from "@/components/ui/button";
import { NotificationStack } from "@/components/landing/notifications";
import { Stagger, StaggerItem } from "@/components/landing/css-motion";
import { getSession } from "@/lib/access";
import { landingRedirect } from "@/lib/route";

// The first screen of the Google Play / App Store app (capacitor.config.ts → appStartPath).
// Signed in: straight to where the person belongs. New: one promise, one button, no prices.
export const metadata: Metadata = { title: "Welcome", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AppStart() {
  const { user } = await getSession();
  if (user) redirect(await landingRedirect());
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-5 pb-8">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="top-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex items-center justify-between pt-5">
        <Logo size={26} />
        <Link href="/login" className="press rounded-full px-3 py-2 text-[15px] font-medium text-muted hover:text-fg">Log in</Link>
      </div>

      <Stagger className="relative mx-auto mt-10 w-full max-w-[420px]">
        <StaggerItem><div className="label">[ POV: 2 dumbbells · 3 months ]</div></StaggerItem>
        <StaggerItem>
          <h1 className="title-xl mt-4">
            <span className="block">Two dumbbells.</span>
            <span className="grad-2 block">A real plan.</span>
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Tell FitPlanr the gear you <span className="text-fg">actually have</span>. Get a <span className="text-fg">week-by-week</span> plan that adds weight for you.
          </p>
        </StaggerItem>
      </Stagger>

      <div className="relative mx-auto mt-8 w-full max-w-[420px] flex-1">
        <NotificationStack visible={3} />
      </div>

      <div className="relative mx-auto mt-8 w-full max-w-[420px]">
        <MainButton href="/signup" className="w-full">Build my plan</MainButton>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Free to try · No card · Ready in 60 seconds</p>
        <p className="mt-5 text-center text-[14px] text-muted">
          Already have an account? <Link href="/login" className="font-semibold text-fg underline-offset-4 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}

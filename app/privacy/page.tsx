import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { KwopFlow } from "@/components/landing/chrome";

export const metadata: Metadata = { title: "Privacy", description: "What FitPlanr keeps, why, and who helps us run it." };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-[720px] px-5 py-10">
      <KwopFlow />
      <Link href="/"><Logo /></Link>
      <h1 className="display mt-12 text-[48px]">Privacy</h1>
      <p className="mt-2 text-sm text-muted">Last updated November 9, 2026</p>
      <div className="mt-8 space-y-6 text-[16px] leading-relaxed text-fg/85">
        <p><b>What we keep.</b> Your email, your answers (goal, level, schedule, joints to protect, equipment), your plans, the workouts and sets you log, and basic usage (for example, when you open the paywall). Nothing else.</p>
        <p><b>Why.</b> To build your plan, adjust it from your logs, count your plan&apos;s quotas, and keep the app working.</p>
        <p><b>Our phone apps.</b> If you turn on workout reminders, we keep your phone&apos;s notification token (sent through Apple Push Notification service or Firebase Cloud Messaging) until you log out or turn them off. The camera is used only for the Form mirror, as a live preview on your device: nothing is recorded, stored or uploaded. Pages you opened are kept on your device so they work offline, and are wiped when you log out.</p>
        <p><b>Payments.</b> Handled by Whop through Kwop. We never see or store your card number.</p>
        <p><b>Services we use.</b> Supabase (database and sign-in), Vercel (hosting), Kwop (plans, payments and visit analytics by Kwop on our public pages), Whop (checkout), and Google if you choose to sign in with Google. We don&apos;t use Google Gemini or any AI service with your data.</p>
        <p><b>Sharing.</b> We never sell your data. If you tap Share, a public link shows your plan&apos;s title, summary and Day 1 only.</p>
        <p><b>Your rights.</b> Delete your account and all your data anytime from Account → Delete my account. It&apos;s removed right away.</p>
      </div>
    </main>
  );
}

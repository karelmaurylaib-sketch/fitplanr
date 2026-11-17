import { notFound } from "next/navigation";
import { generatePlan, type Answers } from "@/lib/engine/generate";
import { projectPlan } from "@/lib/projection";
import { teaserPlan } from "@/lib/teaser";
import type { PublicPlan } from "@/lib/pricing";
import { DevFunnel } from "./client";

// Local development only: the real onboarding / result / paywall components with fixture data and mocked
// /api calls, so the funnel can be looked at without Supabase or Kwop. 404 in every production build.
export const dynamic = "force-dynamic";

const ANSWERS: Answers = { goal: "muscle", level: "new", days: 3, minutes: 45, protect: [], gear: ["dumbbells"], dbMax: 25 };
const plans = (trial: boolean): PublicPlan[] => [
  { id: 1567, name: "Starter", tier: "starter", monthCents: 499, perDayMonth: "$0.17", yearCents: 4800, perDayYear: "$0.13", trialDays: trial ? 7 : null },
  { id: 1568, name: "Pro", tier: "pro", monthCents: 899, perDayMonth: "$0.30", yearCents: 8600, perDayYear: "$0.24", trialDays: trial ? 7 : null },
  { id: 1569, name: "Elite", tier: "elite", monthCents: 1299, perDayMonth: "$0.43", yearCents: 12500, perDayYear: "$0.34", trialDays: trial ? 7 : null },
];

export default async function DevFunnelPage({ searchParams }: { searchParams: Promise<{ view?: string; gear?: string; trial?: string; fail?: string; at?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const sp = await searchParams;
  const answers: Answers = sp.gear === "gym" ? { ...ANSWERS, gear: ["dumbbells", "adjustable", "barbell", "rack", "bench", "cables", "machines", "pullup"], dbMax: 80, level: "some" } : sp.gear === "bw" ? { ...ANSWERS, gear: [], dbMax: 0 } : ANSWERS;
  const full = generatePlan(answers);
  const projection = projectPlan(full, answers);
  const day1 = full.weeks[0].days[0];
  return (
    <DevFunnel
      view={sp.view === "plan" ? "plan" : "flow"}
      fail={sp.fail === "1"}
      atSync={sp.at === "sync"}
      projection={projection}
      plan={teaserPlan(full)}
      plans={plans(sp.trial !== "0")}
      personal={`${full.summary.replace(/\.$/, "")}. Day 1 starts with ${day1.exercises[0]?.name}.`}
    />
  );
}

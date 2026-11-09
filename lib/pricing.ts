import { tierOf, type Tier } from "./tiers";
import { shortPlanName } from "./utils";

// The shape the browser gets: no secrets, just what Kwop returned (ids, names, prices).
export type PublicPlan = {
  id: number;
  name: string;
  tier: Tier;
  monthCents: number;
  perDayMonth: string;
  yearCents: number | null;
  perDayYear: string | null;
  /** Free-trial days this person gets on this plan (0 = charged today). Decided on the server. */
  trialDays: number;
};

type RawPlan = { id: number; name: string; price_cents: number; per_day: string; yearly: { price_cents: number; per_day: string } | null };

export function toPublicPlans<P extends RawPlan>(plans: P[], trialFor: (p: P) => number = () => 0): PublicPlan[] {
  return plans
    .map((p) => ({
      id: p.id,
      name: shortPlanName(p.name),
      tier: tierOf(p.name) ?? "starter",
      monthCents: p.price_cents,
      perDayMonth: p.per_day || `$${(p.price_cents / 100 / 30).toFixed(2)}`,
      yearCents: p.yearly?.price_cents ?? null,
      perDayYear: p.yearly ? p.yearly.per_day || `$${(p.yearly.price_cents / 100 / 365).toFixed(2)}` : null,
      trialDays: trialFor(p),
    }))
    .sort((a, b) => a.monthCents - b.monthCents);
}

export function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/** "Nov 16": the day the first charge happens if the trial starts now. */
export function trialEndLabel(days: number, from = new Date()) {
  return new Date(from.getTime() + days * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function priceFor(p: PublicPlan, period: "month" | "year") {
  return period === "year" && p.yearCents ? { cents: p.yearCents, unit: "year" as const } : { cents: p.monthCents, unit: "month" as const };
}

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
};

export function toPublicPlans(
  plans: { id: number; name: string; price_cents: number; per_day: string; yearly: { price_cents: number; per_day: string } | null }[],
): PublicPlan[] {
  return plans
    .map((p) => ({
      id: p.id,
      name: shortPlanName(p.name),
      tier: tierOf(p.name) ?? "starter",
      monthCents: p.price_cents,
      perDayMonth: p.per_day || `$${(p.price_cents / 100 / 30).toFixed(2)}`,
      yearCents: p.yearly?.price_cents ?? null,
      perDayYear: p.yearly ? p.yearly.per_day || `$${(p.yearly.price_cents / 100 / 365).toFixed(2)}` : null,
    }))
    .sort((a, b) => a.monthCents - b.monthCents);
}

export function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

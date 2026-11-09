import { tierOf, type Tier } from "./tiers";
import { shortPlanName } from "./utils";

// The shape the browser gets: no secrets, just what Kwop returned (ids, names, prices) plus comparison figures.
// What a customer is charged ALWAYS comes from Kwop (GET KWOP_API). The constants below are only reference points
// for the comparison UI (strikethrough, savings, coach value), never a price we charge.

/** FitPlanr's prices before the Nov 9, 2026 "competitive pricing" change. Shown struck through only while Kwop's live price is lower. */
export const PREVIOUS_PRICES: Record<Tier, { month: number; year: number }> = {
  starter: { month: 999, year: 9600 },
  pro: { month: 1599, year: 15400 },
  elite: { month: 2499, year: 24000 },
};

/** The leading US plan-generator app (the CLAUDE.md "direct competitor"), Nov 2026: $15.99/mo · $95.99/yr. Never named on the page. */
export const COMPETITOR = { month: 1599, year: 9599 };

/** One 1-hour personal-training session a week in the US (~$60 a session, typical 2026 rate) = $240 a month. */
export const COACH_SESSION_CENTS = 6000;
export const COACH_MONTH_CENTS = COACH_SESSION_CENTS * 4;

export type PublicPlan = {
  id: number;
  name: string;
  tier: Tier;
  monthCents: number;
  perDayMonth: string;
  yearCents: number | null;
  perDayYear: string | null;
  /** previous higher price, only when the live price is lower (else null: nothing to strike through) */
  wasMonthCents: number | null;
  wasYearCents: number | null;
  /** 12 × monthly − yearly, when a yearly price exists */
  yearSaveCents: number | null;
  yearSavePct: number | null;
};

const perDay = (cents: number, days: number) => `$${(cents / 100 / days).toFixed(2)}`;

type KwopPlanIn = { id: number; name: string; price_cents: number; per_day: string; yearly: { price_cents: number; per_day: string } | null };

/** Local development only: preview prices before they are saved in Kwop. Format "1567:499:3900,1568:899:7900". */
function devOverride(plans: KwopPlanIn[]): KwopPlanIn[] {
  const raw = process.env.NODE_ENV === "development" ? process.env.DEV_KWOP_PRICES : undefined;
  if (!raw) return plans;
  const map = new Map(raw.split(",").map((s) => s.split(":").map(Number)).map(([id, m, y]) => [id, { m, y }]));
  return plans.map((p) => {
    const o = map.get(p.id);
    if (!o) return p;
    return { ...p, price_cents: o.m, per_day: perDay(o.m, 30), yearly: o.y ? { price_cents: o.y, per_day: perDay(o.y, 365) } : p.yearly };
  });
}

export function toPublicPlans(plans: KwopPlanIn[]): PublicPlan[] {
  return devOverride(plans)
    .map((p) => {
      const tier = tierOf(p.name) ?? "starter";
      const prev = PREVIOUS_PRICES[tier];
      const yearCents = p.yearly?.price_cents ?? null;
      const yearSave = yearCents != null ? p.price_cents * 12 - yearCents : null;
      return {
        id: p.id,
        name: shortPlanName(p.name),
        tier,
        monthCents: p.price_cents,
        perDayMonth: p.per_day || perDay(p.price_cents, 30),
        yearCents,
        perDayYear: p.yearly ? p.yearly.per_day || perDay(p.yearly.price_cents, 365) : null,
        wasMonthCents: prev.month > p.price_cents ? prev.month : null,
        wasYearCents: yearCents != null && prev.year > yearCents ? prev.year : null,
        yearSaveCents: yearSave != null && yearSave > 0 ? yearSave : null,
        yearSavePct: yearSave != null && yearSave > 0 ? Math.round((yearSave / (p.price_cents * 12)) * 100) : null,
      };
    })
    .sort((a, b) => a.monthCents - b.monthCents);
}

/** The badge above the recommended plan: "Competitor Beat-Down" only when it is really cheaper than the competitor. */
export function beatsCompetitor(p: PublicPlan) {
  return p.monthCents < COMPETITOR.month && (p.yearCents == null || p.yearCents < COMPETITOR.year);
}

/** How much less than one coach session a week, per month (or per year). */
export function coachSaving(p: PublicPlan, period: "month" | "year") {
  if (period === "year" && p.yearCents != null) return COACH_MONTH_CENTS * 12 - p.yearCents;
  return COACH_MONTH_CENTS - p.monthCents;
}

export function maxYearSavePct(plans: PublicPlan[]) {
  return plans.reduce((m, p) => Math.max(m, p.yearSavePct ?? 0), 0);
}

export function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

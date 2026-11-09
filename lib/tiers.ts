// Plan quotas, in FitPlanr's units. Counted on the server per billing period.
// Prices and Kwop plan ids are NEVER hardcoded: they come from GET KWOP_API. Tiers are matched by plan name.

export type Tier = "starter" | "pro" | "elite";

export type Quota = {
  rebuilds: number; // new plans generated per period (the first plan is free)
  workouts: number; // logged workouts per period
  historyDays: number | null; // null = all history
  smart: boolean; // Smart Progression from your logs
  charts: boolean;
  fullLibrary: boolean;
  swaps: boolean; // custom split changes
  deload: boolean;
  exportCsv: boolean;
};

export const QUOTAS: Record<Tier, Quota> = {
  starter: { rebuilds: 2, workouts: 12, historyDays: 30, smart: false, charts: false, fullLibrary: false, swaps: false, deload: false, exportCsv: false },
  pro: { rebuilds: 6, workouts: 30, historyDays: null, smart: true, charts: true, fullLibrary: true, swaps: false, deload: false, exportCsv: false },
  elite: { rebuilds: 20, workouts: 90, historyDays: null, smart: true, charts: true, fullLibrary: true, swaps: true, deload: true, exportCsv: true },
};

export const TIER_ORDER: Tier[] = ["starter", "pro", "elite"];

/** Every plan starts with a free week: no card, full access to the plan picked. One per email. */
export const TRIAL_DAYS = 7;

export const TIER_TAGS: Record<Tier, string> = {
  starter: "For occasional gym goers",
  pro: "Best for consistent athletes",
  elite: "For serious muscle building",
};

export const UNLOCKS: Record<Tier, string[]> = {
  starter: [
    "1 active 4-week plan, every day and every set",
    "2 plan rebuilds a month",
    "12 logged workouts a month",
    "Weights you raise yourself, with the plan's targets",
    "30 days of history",
  ],
  pro: [
    "6 plan rebuilds a month",
    "30 logged workouts a month",
    "Automatic weekly weight increases, from what you really lifted",
    "Progress charts for every lift",
    "Full form library",
    "All your history",
  ],
  elite: [
    "20 plan rebuilds a month",
    "90 logged workouts a month",
    "Custom split changes: swap exercises, move days",
    "Deload weeks so you come back stronger",
    "CSV export of your data",
    "Everything in Pro",
  ],
};

export const ADDS: Record<Tier, string[]> = {
  starter: [],
  pro: ["Automatic weekly weight increases", "30 workouts a month instead of 12", "Progress charts and all your history"],
  elite: ["Custom split changes: swap exercises, move days", "Deload weeks built in", "90 workouts a month and CSV export"],
};

export function tierOf(planName: string | null | undefined): Tier | null {
  if (!planName) return null;
  const n = planName.toLowerCase();
  if (n.includes("elite")) return "elite";
  if (n.includes("pro")) return "pro";
  if (n.includes("starter")) return "starter";
  return "starter";
}

export function nextTier(t: Tier | null): Tier | null {
  if (!t) return "pro";
  const i = TIER_ORDER.indexOf(t);
  return TIER_ORDER[i + 1] ?? null;
}

/** Start of the current billing period, from the renewal date Kwop gives (monthly cycle for quotas). */
export function periodStart(until: string | null | undefined, now = new Date()): Date {
  if (until) {
    const u = new Date(until);
    if (!isNaN(u.getTime())) {
      const d = new Date(u);
      while (d > now) d.setMonth(d.getMonth() - 1);
      return d;
    }
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

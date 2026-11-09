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

export const TIER_TAGS: Record<Tier, string> = {
  starter: "For occasional gym goers",
  pro: "Best for consistent athletes",
  elite: "For serious muscle building",
};

export const UNLOCKS: Record<Tier, string[]> = {
  starter: [
    "1 active 4-week plan, every day and every set",
    "12 logged workouts a month",
    "2 plan rebuilds a month when your gear or goal changes",
    "Weights you raise yourself, with your plan's targets",
    "Form guides for every exercise in your plan",
    "30 days of workout history",
  ],
  pro: [
    "Your full 4-week plan, every day and every set",
    "Automatic weekly weight increases, from what you really lifted",
    "30 logged workouts a month",
    "6 plan rebuilds a month",
    "Progress charts for every lift",
    "The full form library and all your history",
  ],
  elite: [
    "Everything in Pro",
    "90 logged workouts a month",
    "20 plan rebuilds a month",
    "Swap any exercise and move your training days",
    "Built-in deload weeks so you come back stronger",
    "Export every set to CSV",
  ],
};

export const ADDS: Record<Tier, string[]> = {
  starter: [],
  pro: ["Weights that rise on their own from your logs", "30 workouts a month instead of 12", "Strength charts and all your history"],
  elite: ["Swap exercises and move training days", "Deload weeks built in", "90 workouts a month and CSV export"],
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

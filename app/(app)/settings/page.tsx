import type { Metadata } from "next";
import { PageTitle } from "@/components/app-shell";
import { requirePaid } from "@/lib/guard";
import { swapOptions, generatePlan } from "@/lib/engine/generate";
import { GEAR_LABELS } from "@/lib/engine/exercises";
import { SettingsClient } from "./client";

export const metadata: Metadata = { title: "Settings" };

const GOAL: Record<string, string> = { muscle: "Build muscle", strength: "Get stronger", fatloss: "Lose fat, keep muscle", fit: "Get fit" };
const LEVEL: Record<string, string> = { new: "New to lifting", some: "A few months in", year: "Over a year" };

export default async function SettingsPage() {
  const { access, plan, answers } = await requirePaid();
  const opts = (plan.options ?? {}) as { deload?: boolean; swaps?: Record<string, string>; dayOrder?: number[] };
  // base (unordered) week 1, so slot ids line up with the engine
  const base = generatePlan(answers, { swaps: opts.swaps }).weeks[0].days;
  const days = base.map((d, bi) => ({
    index: bi,
    name: d.name,
    exercises: d.exercises.map((e) => ({ slot: e.slot, exId: e.exId, name: e.name, options: swapOptions(answers, e.exId).map((o) => ({ id: o.id, name: o.name })) })),
  }));
  const setup = [
    { k: "Goal", v: GOAL[answers.goal] },
    { k: "Level", v: LEVEL[answers.level] },
    { k: "Schedule", v: `${answers.days} days a week, ${answers.minutes} min` },
    { k: "Go easy on", v: answers.protect.length ? answers.protect.map((p) => (p === "back" ? "lower back" : p)).join(", ") : "Nothing" },
    { k: "Gear", v: answers.gear.length ? answers.gear.map((g) => GEAR_LABELS[g]).join(", ") + (answers.dbMax ? ` · dumbbells up to ${answers.dbMax} lb` : "") : "Bodyweight only" },
  ];
  return (
    <div>
      <PageTitle label="Settings" title="Your setup" />
      <SettingsClient
        setup={setup}
        rebuilds={{ used: access.usage.rebuilds, max: access.quota.rebuilds }}
        swapsAllowed={access.quota.swaps}
        deloadAllowed={access.quota.deload}
        days={days}
        initial={{ swaps: opts.swaps ?? {}, dayOrder: opts.dayOrder ?? days.map((d) => d.index), deload: !!opts.deload }}
      />
    </div>
  );
}

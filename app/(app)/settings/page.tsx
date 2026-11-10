import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
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
      <Link href="/account" className="press mb-4 flex items-center gap-3 rounded-[20px] border border-line bg-card p-4 hover:bg-white/[0.03] md:hidden">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"><UserRound size={18} /></span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">Account &amp; billing</span>
          <span className="block text-[13px] text-muted">Email, plan, sign out</span>
        </span>
        <ChevronRight size={18} className="text-muted" />
      </Link>
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

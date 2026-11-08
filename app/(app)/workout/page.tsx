import type { Metadata } from "next";
import { getSession } from "@/lib/access";
import { requirePaid } from "@/lib/guard";
import { dayOf, nextSession, smartTargets, type LogRow } from "@/lib/workout";
import { Logger } from "./logger";

export const metadata: Metadata = { title: "Workout" };

export default async function WorkoutPage({ searchParams }: { searchParams: Promise<{ week?: string; day?: string; rebuilt?: string }> }) {
  const sp = await searchParams;
  const { access, plan, answers } = await requirePaid();
  const { sb, user } = await getSession();
  const { data } = await sb.from("workout_logs").select("*").eq("user_id", user!.id).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(40);
  const logs = (data ?? []) as LogRow[];
  const onPlan = logs.filter((l) => l.plan_id === plan.id).length;
  const next = nextSession(plan.data, onPlan);
  const perWeek = plan.data.weeks[0].days.length;
  const week = Math.min(4, Math.max(1, Number(sp.week) || next.week));
  const dayN = Math.min(perWeek, Math.max(1, Number(sp.day) || next.day));
  const day = dayOf(plan.data, week, dayN)!;
  const targets = access.quota.smart ? smartTargets(day, logs, answers) : null;
  const last: Record<string, { reps: number; load: number | null }[]> = {};
  for (const e of day.exercises) {
    const l = logs.find((x) => x.entries.some((en) => en.exId === e.exId));
    const en = l?.entries.find((x) => x.exId === e.exId);
    if (en) last[e.slot] = en.sets.filter((s) => s.done).map((s) => ({ reps: s.reps, load: s.load }));
  }
  const days = plan.data.weeks.map((w) => w.days.map((d) => ({ week: w.week, day: d.day, name: d.name, weekday: d.weekday })));
  return (
    <Logger
      key={`${plan.id}-${week}-${dayN}`}
      planId={plan.id}
      week={week}
      day={day}
      days={days}
      next={next}
      targets={targets}
      last={last}
      smart={access.quota.smart}
      quota={{ used: access.usage.workouts, max: access.quota.workouts }}
      rebuilt={sp.rebuilt === "1"}
    />
  );
}

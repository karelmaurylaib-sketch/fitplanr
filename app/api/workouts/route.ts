import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess, getSession } from "@/lib/access";
import { track } from "@/lib/kwop";
import { e1rm } from "@/lib/engine/progression";
import type { LogEntry } from "@/lib/workout";

const SetZ = z.object({ reps: z.number().int().min(0).max(600), load: z.number().min(0).max(2000).nullable(), done: z.boolean() });
const Body = z.object({
  planId: z.string().uuid(),
  week: z.number().int().min(1).max(4),
  day: z.number().int().min(1).max(7),
  dayName: z.string().max(60),
  startedAt: z.string().datetime(),
  entries: z.array(z.object({ slot: z.string().max(20), exId: z.string().max(60), name: z.string().max(80), sets: z.array(SetZ).max(12) })).max(12),
});

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const access = await getAccess();
  if (!access.kwop.paid || !access.quota) return NextResponse.json({ error: "paywall" }, { status: 402 });
  if (access.usage.workouts >= access.quota.workouts) return NextResponse.json({ error: "quota", kind: "workouts" }, { status: 402 });
  const b = parsed.data;
  const { data: plan } = await sb.from("plans").select("id").eq("id", b.planId).maybeSingle();
  if (!plan) return NextResponse.json({ error: "plan" }, { status: 404 });

  // previous bests for the "new best" moment
  const { data: prev } = await sb.from("workout_logs").select("entries").eq("user_id", user.id).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(60);
  const best: Record<string, number> = {};
  for (const l of (prev ?? []) as { entries: LogEntry[] }[])
    for (const en of l.entries)
      for (const s of en.sets) if (s.done) best[en.exId] = Math.max(best[en.exId] ?? 0, s.load ? e1rm(s.load, s.reps) : s.reps);

  let volume = 0;
  const bests: string[] = [];
  for (const en of b.entries) {
    let top = 0;
    let topSet = "";
    for (const s of en.sets) {
      if (!s.done) continue;
      volume += (s.load ?? 0) * s.reps;
      const v = s.load ? e1rm(s.load, s.reps) : s.reps;
      if (v > top) {
        top = v;
        topSet = s.load ? `${s.load} lb × ${s.reps}` : `${s.reps} reps`;
      }
    }
    if (top && best[en.exId] !== undefined && top > best[en.exId]) bests.push(`${en.name}: ${topSet}`);
  }

  const { error } = await sb.from("workout_logs").insert({
    user_id: user.id,
    plan_id: b.planId,
    week: b.week,
    day: b.day,
    day_name: b.dayName,
    entries: b.entries,
    started_at: b.startedAt,
    finished_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  track("feature_used", user.email, "workout_logged");
  return NextResponse.json({ ok: true, volume: Math.round(volume), bests: bests.slice(0, 4) });
}

import { NextResponse } from "next/server";
import { getPlan } from "@/lib/kwop";
import { pushConfigured, sendPush } from "@/lib/push";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { dayOf, nextSession } from "@/lib/workout";
import type { Plan } from "@/lib/engine/generate";

// Daily (vercel.json cron): one reminder for paid lifters whose next workout is due.
// Due = no finished workout for 2+ days (1+ day on a 5-day plan). Never more than one a day per phone.
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "auth" }, { status: 401 });
  const cfg = pushConfigured();
  if (!cfg.android && !cfg.ios) return NextResponse.json({ ok: true, sent: 0, note: "push not configured" });
  const db = supabaseAdmin();
  const { data: devices } = await db.from("push_devices").select("id, user_id, platform, token, last_sent_at").eq("reminders", true).limit(2000);
  const byUser = new Map<string, { id: string; platform: "ios" | "android"; token: string; last_sent_at: string | null }[]>();
  for (const d of devices ?? []) byUser.set(d.user_id, [...(byUser.get(d.user_id) ?? []), d]);
  let sent = 0;
  const now = Date.now();
  for (const [uid, list] of byUser) {
    const fresh = list.filter((d) => cfg[d.platform] && (!d.last_sent_at || now - new Date(d.last_sent_at).getTime() > 20 * 3600_000));
    if (!fresh.length) continue;
    const [{ data: prof }, { data: plan }] = await Promise.all([
      db.from("profiles").select("email").eq("id", uid).maybeSingle(),
      db.from("plans").select("id, data").eq("user_id", uid).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!prof?.email || !plan) continue;
    const access = await getPlan(prof.email);
    if (!access.paid) continue;
    const { data: logs } = await db.from("workout_logs").select("finished_at, plan_id").eq("user_id", uid).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(60);
    const data = plan.data as Plan;
    const perWeek = data.weeks[0].days.length;
    const last = logs?.[0]?.finished_at ? new Date(logs[0].finished_at).getTime() : 0;
    const gapDays = perWeek >= 5 ? 1 : 2;
    if (last && now - last < gapDays * 86400_000 - 3600_000) continue;
    const next = nextSession(data, (logs ?? []).filter((l) => l.plan_id === plan.id).length);
    const day = dayOf(data, next.week, next.day);
    if (!day) continue;
    const msg = { title: `Week ${next.week} · ${day.name} is ready`, body: `${day.minutes} min, built on your gear. Tap to start.`, url: "/workout" };
    for (const d of fresh) {
      const r = await sendPush(d.platform, d.token, msg);
      if (r === "sent") {
        sent++;
        await db.from("push_devices").update({ last_sent_at: new Date().toISOString() }).eq("id", d.id);
      } else if (r === "gone") await db.from("push_devices").delete().eq("id", d.id);
    }
  }
  return NextResponse.json({ ok: true, sent });
}

import { getAccess, getSession } from "@/lib/access";
import { track } from "@/lib/kwop";
import type { LogRow } from "@/lib/workout";

export async function GET() {
  const { sb, user } = await getSession();
  if (!user) return new Response("Log in first", { status: 401 });
  const access = await getAccess();
  if (!access.quota?.exportCsv) return new Response("CSV export is part of Elite", { status: 402 });
  const { data } = await sb.from("workout_logs").select("*").eq("user_id", user.id).not("finished_at", "is", null).order("finished_at", { ascending: true });
  const esc = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [["date", "week", "day", "workout", "exercise", "set", "weight_lb", "reps", "done"].join(",")];
  for (const l of (data ?? []) as LogRow[])
    for (const e of l.entries)
      e.sets.forEach((s, i) => rows.push([l.finished_at!.slice(0, 10), l.week, l.day, l.day_name ?? "", e.name, i + 1, s.load, s.reps, s.done ? "yes" : "no"].map(esc).join(",")));
  track("feature_used", user.email, "csv_export");
  return new Response(rows.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="fitplanr-${new Date().toISOString().slice(0, 10)}.csv"` } });
}


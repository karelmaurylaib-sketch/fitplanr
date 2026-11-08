import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";

const Patch = z
  .object({
    goal: z.enum(["muscle", "strength", "fatloss", "fit"]),
    level: z.enum(["new", "some", "year"]),
    days: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    minutes: z.union([z.literal(30), z.literal(45), z.literal(60)]),
    protect: z.array(z.enum(["knees", "back", "shoulders"])).max(3),
    gear: z.array(z.enum(["dumbbells", "adjustable", "barbell", "rack", "bench", "cables", "machines", "kettlebell", "pullup", "bands"])).max(10),
    dbMax: z.number().int().min(0).max(150),
  })
  .partial()
  .strict();

export async function POST(req: Request) {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { data: p } = await sb.from("profiles").select("answers").eq("id", user.id).maybeSingle();
  const answers = { ...(p?.answers ?? {}), ...parsed.data };
  const { error } = await sb.from("profiles").update({ answers }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

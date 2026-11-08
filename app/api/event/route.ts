import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/access";
import { track } from "@/lib/kwop";

// Only events the browser is allowed to report; the rest are sent by the server itself.
const Body = z.object({ type: z.enum(["paywall_view", "feature_used"]), detail: z.string().max(60).regex(/^[\w\- ]*$/).optional() });

export async function POST(req: Request) {
  const { user } = await getSession();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!user?.email || !parsed.success) return NextResponse.json({ ok: false });
  track(parsed.data.type, user.email, parsed.data.detail);
  return NextResponse.json({ ok: true });
}

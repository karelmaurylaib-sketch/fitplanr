import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";
import { pushConfigured, sendPush } from "@/lib/push";

/** "Send me a test": one notification to each of the signed-in person's phones. */
export async function POST() {
  const { sb, user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { data } = await sb.from("push_devices").select("id, platform, token").eq("user_id", user.id);
  const devices = (data ?? []) as { id: string; platform: "ios" | "android"; token: string }[];
  if (!devices.length) return NextResponse.json({ error: "no_device" }, { status: 404 });
  const cfg = pushConfigured();
  if (!devices.some((d) => cfg[d.platform])) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  let sent = 0;
  for (const d of devices) {
    const r = await sendPush(d.platform, d.token, { title: "Reminders are on", body: "We'll nudge you on training days. Tap to see your next workout.", url: "/workout" });
    if (r === "sent") sent++;
    if (r === "gone") await sb.from("push_devices").delete().eq("id", d.id);
  }
  return NextResponse.json({ ok: sent > 0, sent });
}

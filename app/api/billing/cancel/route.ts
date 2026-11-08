import { NextResponse } from "next/server";
import { getSession } from "@/lib/access";
import { cancelPlan, getPlan } from "@/lib/kwop";

export async function POST() {
  const { user } = await getSession();
  if (!user?.email) return NextResponse.json({ error: "auth" }, { status: 401 });
  try {
    const { status, data } = await cancelPlan(user.email);
    await getPlan(user.email, { fresh: true });
    if (status >= 400) return NextResponse.json({ error: "cancel", message: data.message }, { status: 502 });
    return NextResponse.json({ message: data.message, manage_url: data.manage_url });
  } catch (e) {
    console.error("[cancel] failed", e);
    return NextResponse.json({ error: "cancel" }, { status: 502 });
  }
}

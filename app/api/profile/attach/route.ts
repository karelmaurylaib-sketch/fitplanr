import { NextResponse } from "next/server";
import { attachProfile } from "@/lib/profile";

export async function POST() {
  const ok = await attachProfile();
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}

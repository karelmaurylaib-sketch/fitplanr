import { NextResponse } from "next/server";
import { getProfile, getSession } from "@/lib/access";
import { generatePlan, validAnswers } from "@/lib/engine/generate";
import { track } from "@/lib/kwop";
import { projectPlan } from "@/lib/projection";

// Value Preview: the projection of the plan these answers will build. Only aggregate numbers and the
// first lift of Day 1 (already clear on the result page) leave the server: the rest of the plan stays hidden.
export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await getProfile();
  const answers = profile?.answers;
  if (!validAnswers(answers)) return NextResponse.json({ error: "answers" }, { status: 400 });
  const projection = projectPlan(generatePlan(answers), answers);
  track("feature_used", user.email, "value_preview");
  return NextResponse.json({ projection });
}

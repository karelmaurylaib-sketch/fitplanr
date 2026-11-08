import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { AuthCard } from "@/components/auth-card";
import { getSession } from "@/lib/access";
import { landingRedirect } from "@/lib/route";

export const metadata: Metadata = {
  title: { absolute: "Sign Up Free and Build Your Workout Plan | FitPlanr" },
  description: "Sign up free and get your 4-week workout plan, built on the gear you actually have. No card needed, ready in about 60 seconds.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage() {
  const { user } = await getSession();
  if (user) redirect(await landingRedirect());
  return (
    <AuthShell>
      <AuthCard mode="signup" />
    </AuthShell>
  );
}

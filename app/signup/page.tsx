import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { AuthCard } from "@/components/auth-card";
import { getSession } from "@/lib/access";
import { landingRedirect } from "@/lib/route";

export const metadata: Metadata = { title: "Build my plan", description: "Sign up free and get your 4-week workout plan, built on the gear you actually have." };

export default async function SignupPage() {
  const { user } = await getSession();
  if (user) redirect(await landingRedirect());
  return (
    <AuthShell>
      <AuthCard mode="signup" />
    </AuthShell>
  );
}

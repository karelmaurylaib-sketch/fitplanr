import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { AuthCard } from "@/components/auth-card";
import { getSession } from "@/lib/access";
import { landingRedirect } from "@/lib/route";

export const metadata: Metadata = { title: "Log in", description: "Log in to FitPlanr and pick up your plan where you left it." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { user } = await getSession();
  if (user) redirect(await landingRedirect());
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <AuthShell>
      <AuthCard mode="login" next={safe} />
    </AuthShell>
  );
}

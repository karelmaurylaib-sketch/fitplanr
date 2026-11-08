import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ResetForm } from "./form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: true } };

export default function ResetPage() {
  return (
    <AuthShell tracked={false}>
      <ResetForm />
    </AuthShell>
  );
}

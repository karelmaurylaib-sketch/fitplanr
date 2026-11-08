import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "./form";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: true } };

export default function ForgotPage() {
  return (
    <AuthShell tracked={false}>
      <ForgotForm />
    </AuthShell>
  );
}

import type { ReactNode } from "react";
import { KwopFlow } from "@/components/landing/chrome";

export function AuthShell({ children, tracked = true }: { children: ReactNode; tracked?: boolean }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {tracked && <KwopFlow />}
      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="top-glow pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-[420px]">{children}</div>
    </main>
  );
}

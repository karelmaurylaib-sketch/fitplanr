"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Dumbbell, History, LayoutDashboard, Settings, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard, phone: true },
  { href: "/workout", label: "Workout", short: "Workout", icon: Dumbbell, phone: true },
  { href: "/nutrition", label: "Nutrition", short: "Nutrition", icon: Apple, phone: true },
  { href: "/history", label: "History", short: "History", icon: History, phone: true },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings, phone: true },
  // phone: Account is reached from Settings, so the bottom bar keeps 5 tabs
  { href: "/account", label: "Account", short: "Account", icon: UserRound, phone: false },
];

export function AppShell({ children, planName }: { children: ReactNode; planName: string | null }) {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/") || (href === "/workout" && (path === "/plan" || path === "/library"));
  return (
    <div className="min-h-dvh md:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-line bg-[#080907] px-4 py-6 md:flex">
        <Link href="/dashboard" className="px-2">
          <Logo size={26} />
        </Link>
        <nav className="mt-10 space-y-1" aria-label="App">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("press flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium", active(n.href) ? "bg-white/[0.07] text-fg" : "text-muted hover:bg-white/[0.04] hover:text-fg")}>
              <n.icon size={19} className={active(n.href) ? "text-lime" : ""} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-card p-4">
          <div className="label">[ Your plan ]</div>
          <div className="mt-1 font-display text-xl font-bold uppercase">{planName ?? "Free"}</div>
          <Link href="/library" className="mt-2 block text-[13px] text-muted hover:text-fg">Form library →</Link>
        </div>
      </aside>
      <div className="mx-auto max-w-[920px] px-5 pb-32 pt-6 md:px-10 md:pb-16 md:pt-10">{children}</div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgb(8_9_6/0.92)] pt-2 backdrop-blur-xl md:hidden" aria-label="App">
        <div className="mx-auto flex max-w-[520px] justify-around">
          {NAV.filter((n) => n.phone).map((n) => (
            <Link key={n.href} href={n.href} className={cn("press flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium", active(n.href) || (n.href === "/settings" && path === "/account") ? "text-lime" : "text-muted")}>
              <n.icon size={22} /> {n.short}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="label">[ {label} ]</div>
        <h1 className="display mt-2 text-[40px] sm:text-[52px]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

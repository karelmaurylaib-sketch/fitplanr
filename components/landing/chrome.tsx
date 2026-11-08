"use client";

import Link from "next/link";
import Script from "next/script";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { MainButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function KwopFlow() {
  return <Script src="https://kwop.io/flow.js" data-site="s_dc316cd00c" strategy="lazyOnload" />;
}

export function TopBar({ cta = "/signup" }: { cta?: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="fixed inset-x-0 top-[14px] z-50 px-3">
      <nav
        className={cn(
          "mx-auto flex h-[60px] max-w-[980px] items-center justify-between rounded-[24px] pl-4 pr-2 transition-colors duration-300",
          "border border-white/[0.09] backdrop-blur-xl",
          scrolled ? "bg-[rgb(10_11_8/0.78)]" : "bg-[rgb(10_11_8/0.5)]",
        )}
        aria-label="Main"
      >
        <Link href="/" aria-label="FitPlanr home">
          <Logo size={26} />
        </Link>
        <div className="hidden items-center gap-7 text-[14px] text-muted md:flex">
          <a href="#how" className="hover:text-fg">How it works</a>
          <a href="#features" className="hover:text-fg">Features</a>
          <a href="#questions" className="hover:text-fg">Questions</a>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/login" className="press rounded-full px-3.5 py-2 text-[14px] font-medium text-fg/85 hover:text-fg">
            Log in
          </Link>
          <MainButton href={cta} size="sm" className="hidden sm:inline-flex">
            Build my plan
          </MainButton>
        </div>
      </nav>
    </div>
  );
}

export function StickyCta({ href = "/signup" }: { href?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 520;
      setShow(window.scrollY > 560 && !nearEnd);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={cn("safe-bottom fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-bg via-bg/95 to-transparent px-4 pt-6 transition-transform duration-300 ease-out sm:hidden", show ? "translate-y-0" : "pointer-events-none translate-y-full")}
    >
      <MainButton href={href} className="w-full">
        Build my plan
      </MainButton>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-[20px] border border-line bg-card">
      {items.map((it, i) => (
        <div key={it.q}>
          <button
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[16px] font-semibold sm:px-6"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {it.q}
            <ChevronDown size={18} className={cn("shrink-0 text-muted transition-transform duration-300", open === i && "rotate-180 text-lime")} />
          </button>
          <div className="faq-body" data-open={open === i}>
            <div>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted sm:px-6">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Footer({ minimal }: { minimal?: boolean }) {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-14">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Your personal trainer, automated. Plans built on the gear you actually have.</p>
        </div>
        {!minimal && (
          <div>
            <div className="label mb-3">Product</div>
            <ul className="space-y-2 text-sm text-fg/80">
              <li><Link href="/#how" className="hover:text-fg">How it works</Link></li>
              <li><Link href="/#features" className="hover:text-fg">Features</Link></li>
              <li><Link href="/signup" className="hover:text-fg">Build my plan</Link></li>
              <li><Link href="/login" className="hover:text-fg">Log in</Link></li>
            </ul>
          </div>
        )}
        <div>
          <div className="label mb-3">Legal</div>
          <ul className="space-y-2 text-sm text-fg/80">
            <li><Link href="/terms" className="hover:text-fg">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-fg">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1120px] px-5 text-xs text-dim">© {new Date().getFullYear()} FitPlanr. Not medical advice: check with a doctor before starting a new program.</div>
      <div
        aria-hidden
        className="pointer-events-none mt-6 select-none text-center font-display font-bold uppercase leading-[0.78] tracking-[-0.03em]"
        style={{ fontSize: "clamp(90px, 24vw, 340px)", opacity: 0.13, background: "linear-gradient(180deg, #f4f5f0, transparent 85%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        FitPlanr
      </div>
    </footer>
  );
}

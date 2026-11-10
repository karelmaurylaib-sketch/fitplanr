"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Mounts its children only when they come near the screen: keeps the landing page's first load light. */
export function LazyMount({ children, minHeight, className }: { children: ReactNode; minHeight: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}

export const LazyVSL = dynamic(() => import("./vsl").then((m) => m.VSL), { ssr: false });
export const LazyGear = dynamic(() => import("./loops").then((m) => m.GearLoop), { ssr: false });
export const LazyProgression = dynamic(() => import("./loops").then((m) => m.ProgressionLoop), { ssr: false });
export const LazyLog = dynamic(() => import("./loops").then((m) => m.LogLoop), { ssr: false });
export const LazyForm = dynamic(() => import("./loops").then((m) => m.FormLoop), { ssr: false });
export const LazyNutrition = dynamic(() => import("./loops").then((m) => m.NutritionLoop), { ssr: false });
export const LazyPlanMini = dynamic(() => import("./loops").then((m) => m.PlanMini), { ssr: false });

export function PhoneScreen({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col px-4 pt-11 text-left">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-lime">{label}</div>
      <div className="mb-4 font-display text-[24px] font-bold uppercase leading-none">{title}</div>
      {children}
    </div>
  );
}

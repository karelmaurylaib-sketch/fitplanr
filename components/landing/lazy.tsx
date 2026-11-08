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

const load = { ssr: false } as const;
export const LazyVSL = dynamic(() => import("./vsl").then((m) => m.VSL), load);
export const LazyGear = dynamic(() => import("./loops").then((m) => m.GearLoop), load);
export const LazyProgression = dynamic(() => import("./loops").then((m) => m.ProgressionLoop), load);
export const LazyLog = dynamic(() => import("./loops").then((m) => m.LogLoop), load);
export const LazyForm = dynamic(() => import("./loops").then((m) => m.FormLoop), load);
export const LazyPlanMini = dynamic(() => import("./loops").then((m) => m.PlanMini), load);

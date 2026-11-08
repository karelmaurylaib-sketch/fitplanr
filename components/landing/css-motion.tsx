"use client";

// Lightweight motion for the landing page (no animation library on first load):
// reveals rise 14px and fade in once in 0.5s cubic-bezier(.22,.8,.24,1), children staggered 60ms.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useOnce<T extends HTMLElement>(margin = "0px 0px -60px 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, seen };
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, seen } = useOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("rv", seen && "rv-in", className)} style={{ transitionDelay: `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, seen } = useOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("rv-group", seen && "rv-in", className)}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rv-item", className)}>{children}</div>;
}

export function CountUp({ to, className }: { to: number; className?: string }) {
  const { ref, seen } = useOnce<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const x = Math.min(1, (now - t0) / 1300);
      setV(Math.round(to * (1 - Math.pow(1 - x, 3))));
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {v}
    </span>
  );
}

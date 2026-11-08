"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** A realistic iPhone drawn in CSS: frame, dynamic island, status bar with the live time. */
export function IPhone({ children, className, lockscreen = false }: { children?: ReactNode; className?: string; lockscreen?: boolean }) {
  const now = useClock();
  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "") : "9:41";
  const date = now ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Monday, June 2";
  return (
    <div
      className={cn(
        "relative aspect-[9/19.3] w-[300px] rounded-[54px] bg-[#1b1c1a] p-[11px] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_50px_100px_-30px_rgb(0_0_0/0.9),inset_0_0_0_2px_#2a2b28]",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[44px] bg-[#050505]">
        {lockscreen && (
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 70% at 50% 0%, rgb(200 255 61 / 0.22), transparent 60%), radial-gradient(90% 60% at 80% 100%, rgb(255 122 26 / 0.16), transparent 60%), #070806" }}
          />
        )}
        {/* status bar */}
        <div className="relative z-10 flex items-center justify-between px-7 pt-[14px] text-[13px] font-semibold text-white">
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="white" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="white" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="white" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="white" /></svg>
            <svg width="24" height="12" viewBox="0 0 24 12"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" opacity=".4" fill="none" /><rect x="2" y="2" width="15" height="8" rx="2" fill="white" /><rect x="21.5" y="4" width="1.8" height="4" rx="1" fill="white" opacity=".4" /></svg>
          </span>
        </div>
        {/* dynamic island */}
        <div className="absolute left-1/2 top-[10px] z-20 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
        {lockscreen && (
          <div className="relative z-10 mt-6 text-center text-white">
            <div className="text-[15px] font-medium opacity-80">{date}</div>
            <div className="font-display text-[84px] font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {time}
            </div>
          </div>
        )}
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  );
}

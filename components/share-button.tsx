"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ShareButton({ path, title, className }: { path: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = location.origin + path;
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail: "share" }) }).catch(() => {});
    try {
      if (navigator.share) {
        await navigator.share({ title, text: "My FitPlanr plan, built on the gear I actually have.", url });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }
  return (
    <button onClick={share} className={cn("press inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[14px] font-medium hover:bg-white/[0.06]", className)}>
      {copied ? <Check size={16} className="text-lime" /> : <Share2 size={16} />} {copied ? "Link copied" : "Share"}
    </button>
  );
}

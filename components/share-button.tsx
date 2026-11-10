"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ShareButton({ path, title, className, text, iconOnly }: { path: string; title: string; className?: string; text?: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = location.origin + path;
    fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feature_used", detail: "share" }) }).catch(() => {});
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text ?? "My FitPlanr plan, built on the gear I actually have.", url });
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
    <button
      onClick={share}
      aria-label={iconOnly ? (copied ? "Link copied" : `Share ${title}`) : undefined}
      className={cn(iconOnly ? "press inline-flex h-9 w-9 items-center justify-center rounded-full text-dim hover:bg-white/[0.06] hover:text-fg" : "press inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[14px] font-medium hover:bg-white/[0.06]", className)}
    >
      {copied ? <Check size={16} className="text-lime" /> : <Share2 size={16} />} {iconOnly ? null : copied ? "Link copied" : "Share"}
    </button>
  );
}

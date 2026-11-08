import { cn } from "@/lib/utils";

/** FitPlanr mark: a lime tile with a dumbbell bar climbing like a progress line. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#C8FF3D" />
      <path d="M8 22.5 L14 16.5 L18 19.5 L24.5 11" stroke="#0A0D02" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="5.5" y="20" width="4" height="6" rx="1.2" transform="rotate(-45 7.5 23)" fill="#0A0D02" />
      <rect x="22.5" y="7.5" width="4" height="6" rx="1.2" transform="rotate(-45 24.5 10.5)" fill="#0A0D02" />
    </svg>
  );
}

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="font-display text-[22px] font-bold uppercase leading-none tracking-[-0.01em]">FitPlanr</span>
    </span>
  );
}

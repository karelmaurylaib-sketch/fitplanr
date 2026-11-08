import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "lime" | "white" | "ghost" | "outline" | "danger";
const styles: Record<Variant, string> = {
  lime: "bg-lime text-lime-ink hover:bg-[#d4ff63]",
  white: "bg-white text-ink hover:bg-[#ececec]",
  ghost: "bg-transparent text-fg hover:bg-white/[0.06]",
  outline: "border border-line-2 bg-white/[0.02] text-fg hover:bg-white/[0.06] hover:border-white/25",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};

export function Button({
  variant = "lime",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={cn(
        "press inline-flex items-center justify-center gap-2 rounded-full font-semibold disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-10 px-4 text-sm",
        size === "md" && "h-12 px-6 text-[15px]",
        size === "lg" && "h-14 px-7 text-base",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

/** The one main action: a breathing lime pill with a nudging arrow. */
export function MainButton({
  href,
  children,
  className,
  size = "lg",
  onClick,
  type,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "lg";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls = cn(
    "btn-main group inline-flex items-center justify-between gap-4 rounded-full bg-lime font-semibold text-lime-ink hover:bg-[#d4ff63] disabled:opacity-60",
    size === "lg" ? "h-[64px] pl-7 pr-2 text-[17px]" : "h-11 pl-5 pr-1.5 text-[14px]",
    className,
  );
  const inner = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      <span className={cn("flex items-center justify-center overflow-hidden rounded-full bg-lime-ink text-lime", size === "lg" ? "h-12 w-12" : "h-8 w-8")}>
        <ArrowRight className="btn-arrow" size={size === "lg" ? 20 : 16} strokeWidth={2.5} aria-hidden />
      </span>
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  return (
    <button type={type ?? "button"} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}

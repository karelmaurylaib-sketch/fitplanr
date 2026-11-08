import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortPlanName(name: string) {
  return name.replace(/^FitPlanr\s+/i, "");
}

export function money(cents: number) {
  const v = cents / 100;
  return `$${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}`;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

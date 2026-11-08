import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

const LINKS = [
  { href: "/guides/how-to-start-lifting-weights", t: "How to start lifting weights" },
  { href: "/guides/3-day-full-body-workout-for-beginners", t: "3-day full body workout" },
  { href: "/for/home-dumbbells", t: "Home dumbbell workout plan" },
  { href: "/guides", t: "All guides" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <Link href="/" aria-label="FitPlanr home"><Logo /></Link>
      <h1 className="display mt-10 text-[48px]">Wrong rack.</h1>
      <p className="mt-2 text-muted">This page doesn&apos;t exist. Your plan does.</p>
      <Link href="/" className="press mt-6 inline-flex h-12 items-center rounded-full bg-lime px-6 font-semibold text-lime-ink">Go home</Link>
      <nav aria-label="Popular pages" className="mt-10">
        <ul className="flex flex-col gap-2 text-[15px]">
          {LINKS.map((l) => (
            <li key={l.href}><Link href={l.href} className="text-fg/80 underline underline-offset-4 hover:text-fg">{l.t}</Link></li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

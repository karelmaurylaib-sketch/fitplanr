import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Logo />
      <h1 className="display mt-10 text-[48px]">Wrong rack.</h1>
      <p className="mt-2 text-muted">This page doesn&apos;t exist. Your plan does.</p>
      <Link href="/" className="press mt-6 inline-flex h-12 items-center rounded-full bg-lime px-6 font-semibold text-lime-ink">Go home</Link>
    </main>
  );
}

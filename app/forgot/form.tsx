"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LogoMark } from "@/components/logo";
import { MainButton } from "@/components/ui/button";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("That email doesn't look right.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/reset` });
    setBusy(false);
    if (error) return setErr(error.message.toLowerCase().includes("rate") ? "Too many tries. Wait a minute, then try again." : "We couldn't send the email. Try again.");
    setSent(true);
  }

  return (
    <div className="rounded-[26px] border border-line bg-card/90 p-6 backdrop-blur-xl sm:p-8">
      <Link href="/" aria-label="FitPlanr home"><LogoMark size={40} /></Link>
      {sent ? (
        <div className="mt-6">
          <MailCheck className="text-lime" size={28} />
          <h1 className="display mt-4 text-[34px]">Check your inbox</h1>
          <p className="mt-2 text-[15px] text-muted">If {email} has an account, a reset link is on its way. It works for one hour.</p>
          <Link href="/login" className="mt-6 inline-block font-semibold text-lime">Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6" noValidate>
          <h1 className="display text-[34px]">Reset your password</h1>
          <p className="mt-2 text-[15px] text-muted">We&apos;ll email you a link to choose a new one.</p>
          <label htmlFor="email" className="mb-1.5 mt-6 block text-sm font-medium text-fg/80">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value.trim()); setErr(""); }} className="w-full rounded-2xl border border-line-2 bg-black/40 px-4 py-3.5 text-[16px] outline-none focus:border-lime/70" placeholder="you@email.com" />
          {err && <p className="mt-1.5 text-sm text-danger">{err}</p>}
          <MainButton type="submit" className="mt-6 w-full" disabled={busy}>{busy ? "Sending" : "Send the link"}</MainButton>
          <p className="mt-5 text-center text-sm text-muted"><Link href="/login" className="hover:text-fg">Back to log in</Link></p>
        </form>
      )}
    </div>
  );
}

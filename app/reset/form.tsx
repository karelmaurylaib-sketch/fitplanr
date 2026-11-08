"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LogoMark } from "@/components/logo";
import { MainButton } from "@/components/ui/button";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setErr("Use at least 8 characters.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr("This link has expired. Ask for a new one from the log-in page.");
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-[26px] border border-line bg-card/90 p-6 backdrop-blur-xl sm:p-8" noValidate>
      <LogoMark size={40} />
      <h1 className="display mt-6 text-[34px]">Choose a new password</h1>
      <label htmlFor="password" className="mb-1.5 mt-6 block text-sm font-medium text-fg/80">New password</label>
      <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} className="w-full rounded-2xl border border-line-2 bg-black/40 px-4 py-3.5 text-[16px] outline-none focus:border-lime/70" placeholder="8 characters or more" />
      {err && <p className="mt-1.5 text-sm text-danger">{err}</p>}
      <MainButton type="submit" className="mt-6 w-full" disabled={busy}>{busy ? "Saving" : "Save and continue"}</MainButton>
    </form>
  );
}

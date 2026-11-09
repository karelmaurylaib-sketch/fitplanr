"use client";

import { Loader2, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useUpgrade } from "@/components/paywall/upgrade";
import { supabaseBrowser } from "@/lib/supabase/client";
import { forgetDevice } from "@/lib/native";
import type { Tier } from "@/lib/tiers";

export function AccountClient({ email, paid, planName, status, until, tier, openUpgrade }: { email: string; paid: boolean; planName: string | null; status: string | null; until: string | null; tier: Tier | null; openUpgrade: boolean }) {
  const router = useRouter();
  const { open: upgrade } = useUpgrade();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<{ message: string; manage_url?: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [delOpen, setDelOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (openUpgrade) upgrade(tier === "elite" ? "Your plan" : "Get more each month");
  }, [openUpgrade, upgrade, tier]);

  async function cancel() {
    setBusy("cancel");
    setErr("");
    const r = await fetch("/api/billing/cancel", { method: "POST" }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy("");
    if (!r || !r.ok) return setErr("We couldn't reach billing. Try again in a minute.");
    setCancelMsg({ message: j.message || "Your subscription is canceled. You keep access until the end of this period.", manage_url: j.manage_url });
    router.refresh();
  }
  async function logout() {
    setBusy("logout");
    await forgetDevice();
    await supabaseBrowser().auth.signOut();
    router.replace("/");
    router.refresh();
  }
  async function del() {
    setBusy("delete");
    const r = await fetch("/api/account/delete", { method: "POST" }).catch(() => null);
    if (!r || !r.ok) {
      setBusy("");
      return setErr("We couldn't delete your account. Try again.");
    }
    await forgetDevice();
    await supabaseBrowser().auth.signOut().catch(() => {});
    location.href = "/";
  }

  const canceled = status && /cancel/i.test(status);
  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="text-[18px] font-semibold">Profile</div>
        <dl className="mt-3 divide-y divide-line text-[15px]">
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Email</dt><dd className="truncate">{email}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Language</dt><dd>English (US)</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Units</dt><dd>Pounds (lb)</dd></div>
        </dl>
        <Button variant="outline" size="sm" className="mt-3" onClick={logout} disabled={busy === "logout"}><LogOut size={15} /> Log out</Button>
      </section>

      <section id="billing" className="rounded-[20px] border border-line bg-card p-5 sm:p-6">
        <div className="text-[18px] font-semibold">Plan and billing</div>
        {paid ? (
          <>
            <dl className="mt-3 divide-y divide-line text-[15px]">
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Current plan</dt><dd className="font-semibold">{planName}</dd></div>
              {until && <div className="flex justify-between gap-4 py-3"><dt className="text-muted">{canceled ? "Access until" : "Renews on"}</dt><dd>{until}</dd></div>}
            </dl>
            <div className="mt-4 flex flex-wrap gap-3">
              {tier !== "elite" && <Button size="sm" onClick={() => upgrade("Change plan")}>Change plan</Button>}
              {!canceled && <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)}>Cancel my subscription</Button>}
            </div>
            <p className="mt-3 text-[13px] text-dim">Payments are processed by Whop through Kwop.</p>
          </>
        ) : (
          <div className="mt-3">
            <p className="text-[15px] text-muted">You&apos;re not on a plan yet. Your 4-week plan is saved and waiting.</p>
            <Link href="/plan" className="press mt-4 inline-flex h-11 items-center rounded-full bg-lime px-5 text-[15px] font-semibold text-lime-ink">Unlock my full plan</Link>
          </div>
        )}
        {err && <p className="mt-3 text-[14px] text-danger">{err}</p>}
      </section>

      <section className="rounded-[20px] border border-danger/20 bg-card p-5 sm:p-6">
        <div className="text-[18px] font-semibold">Delete my account</div>
        <p className="mt-1 text-[14px] text-muted">Deletes your account, your answers, your plans and every logged workout. {paid ? "Cancel your subscription first so you're not billed again." : ""}</p>
        <Button size="sm" variant="danger" className="mt-4" onClick={() => setDelOpen(true)}><Trash2 size={15} /> Delete my account</Button>
      </section>

      <Sheet open={cancelOpen} onClose={() => { setCancelOpen(false); setCancelMsg(null); }} variant="bottom" label="Cancel subscription" closeSide="right" width={440}>
        <div className="px-5 pb-8 pt-2 sm:px-7 sm:pt-7">
          {cancelMsg ? (
            <>
              <h2 className="display pr-12 text-[30px]">Done.</h2>
              <p className="mt-3 text-[15px] text-muted">{cancelMsg.message}</p>
              {cancelMsg.manage_url && <a href={cancelMsg.manage_url} target="_blank" rel="noreferrer" className="mt-4 inline-block font-semibold text-lime">Manage your subscription</a>}
            </>
          ) : (
            <>
              <h2 className="display pr-12 text-[30px]">Cancel {planName}?</h2>
              <p className="mt-3 text-[15px] text-muted">You keep everything until {until ?? "the end of this period"}. Your plan and history stay saved if you come back.</p>
              <div className="mt-6 flex flex-col gap-3">
                <Button variant="danger" onClick={cancel} disabled={busy === "cancel"}>{busy === "cancel" && <Loader2 size={16} className="animate-spin" />} Yes, cancel my subscription</Button>
                <Button variant="ghost" onClick={() => setCancelOpen(false)}>Keep my plan</Button>
              </div>
              {err && <p className="mt-3 text-[14px] text-danger">{err}</p>}
            </>
          )}
        </div>
      </Sheet>

      <Sheet open={delOpen} onClose={() => setDelOpen(false)} variant="bottom" label="Delete account" closeSide="right" width={440}>
        <div className="px-5 pb-8 pt-2 sm:px-7 sm:pt-7">
          <h2 className="display pr-12 text-[30px]">Delete everything?</h2>
          <p className="mt-3 text-[15px] text-muted">This can&apos;t be undone. Type DELETE to confirm.</p>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-4 w-full rounded-2xl border border-line-2 bg-black/40 px-4 py-3 text-[16px] outline-none focus:border-danger/60" placeholder="DELETE" aria-label="Type DELETE to confirm" />
          <Button variant="danger" className="mt-4 w-full" disabled={confirmText !== "DELETE" || busy === "delete"} onClick={del}>{busy === "delete" && <Loader2 size={16} className="animate-spin" />} Delete my account</Button>
          {err && <p className="mt-3 text-[14px] text-danger">{err}</p>}
        </div>
      </Sheet>
    </div>
  );
}

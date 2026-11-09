"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LogoMark } from "@/components/logo";
import { MainButton } from "@/components/ui/button";
import { isNativeApp } from "@/lib/native";

const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function friendly(msg: string, mode: "signup" | "login") {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) return { field: "email", text: "This email already has an account. Log in?" };
  if (m.includes("invalid login") || m.includes("invalid credentials")) return { field: "password", text: "That email and password don't match. Try again or reset your password." };
  if (m.includes("password") && m.includes("6")) return { field: "password", text: "Use at least 8 characters." };
  if (m.includes("email") && (m.includes("invalid") || m.includes("valid"))) return { field: "email", text: "That email doesn't look right." };
  if (m.includes("rate") || m.includes("too many")) return { field: "form", text: "Too many tries. Wait a minute, then try again." };
  return { field: "form", text: mode === "signup" ? "We couldn't create your account. Try again." : "We couldn't log you in. Try again." };
}

export function AuthCard({ mode, next }: { mode: "signup" | "login"; next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ field: string; text: string } | null>(null);
  // Google blocks its sign-in inside app web views (and the App Store then asks for Sign in with Apple): email only in the app.
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(isNativeApp()), []);
  const showGoogle = GOOGLE && !inApp;
  const sb = supabaseBrowser();
  const after = next || (mode === "signup" ? "/start" : "/");

  async function google() {
    setBusy(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(after)}` },
    });
    if (error) {
      setBusy(false);
      setErr({ field: "form", text: "Google sign-in is not available right now. Use your email below." });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr({ field: "email", text: "That email doesn't look right." });
    if (password.length < 8) return setErr({ field: "password", text: "Use at least 8 characters." });
    setBusy(true);
    const res = mode === "signup" ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
    if (res.error) {
      setBusy(false);
      return setErr(friendly(res.error.message, mode));
    }
    if (mode === "signup" && !res.data.session) {
      // email confirmation should be off; fall back to a direct login
      const r2 = await sb.auth.signInWithPassword({ email, password });
      if (r2.error) {
        setBusy(false);
        return setErr({ field: "form", text: "Your account is ready. Log in to continue." });
      }
    }
    await fetch("/api/profile/attach", { method: "POST", body: JSON.stringify({ mode }) }).catch(() => {});
    // full navigation so the new session cookie is used by the server right away
    window.location.assign(after);
  }

  const isSignup = mode === "signup";
  return (
    <div className="w-full max-w-[420px] rounded-[26px] border border-line bg-card/90 p-6 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] backdrop-blur-xl sm:p-8">
      <Link href="/" aria-label="FitPlanr home" className="inline-block">
        <LogoMark size={40} />
      </Link>
      <h1 className="display mt-6 text-[34px] sm:text-[40px]">{isSignup ? "Sign up so FitPlanr can build your plan." : "Welcome back."}</h1>
      <p className="mt-2 text-[15px] text-muted">{isSignup ? "Free to try. No card. Your plan is saved to your account." : "Your plan is right where you left it."}</p>

      {showGoogle && (
        <>
          <button onClick={google} disabled={busy} className="press mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white text-[16px] font-semibold text-ink hover:bg-[#ececec] disabled:opacity-60">
            <GoogleG /> Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-xs text-dim">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={showGoogle ? "space-y-4" : "mt-7 space-y-4"} noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg/80">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            className="h-13 w-full rounded-2xl border border-line-2 bg-black/40 px-4 py-3.5 text-[16px] outline-none transition-colors placeholder:text-dim focus:border-lime/70"
            placeholder="you@email.com"
            aria-invalid={err?.field === "email"}
          />
          {err?.field === "email" && (
            <p className="mt-1.5 text-sm text-danger">
              {err.text}{" "}
              {isSignup && err.text.includes("Log in") && (
                <Link href="/login" className="font-semibold underline">Log in</Link>
              )}
            </p>
          )}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-fg/80">Password</label>
            {!isSignup && <Link href="/forgot" className="text-sm text-muted hover:text-fg">Forgot password?</Link>}
          </div>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-line-2 bg-black/40 px-4 py-3.5 pr-12 text-[16px] outline-none transition-colors placeholder:text-dim focus:border-lime/70"
              placeholder={isSignup ? "8 characters or more" : "Your password"}
              aria-invalid={err?.field === "password"}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-fg">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {err?.field === "password" && <p className="mt-1.5 text-sm text-danger">{err.text}</p>}
        </div>
        {err?.field === "form" && <p className="text-sm text-danger">{err.text}</p>}
        <MainButton type="submit" className="mt-2 w-full" disabled={busy}>
          {busy ? (
            <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> {isSignup ? "Creating your account" : "Logging in"}</span>
          ) : isSignup ? (
            "Build my plan"
          ) : (
            "Log in"
          )}
        </MainButton>
      </form>

      <p className="mt-6 text-center text-[15px] text-muted">
        {isSignup ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-fg hover:text-lime">Log in</Link></>
        ) : (
          <>New to FitPlanr? <Link href="/signup" className="font-semibold text-fg hover:text-lime">Build my plan</Link></>
        )}
      </p>
      <p className="mt-4 text-center text-xs text-dim">
        By continuing you agree to our <Link href="/terms" className="underline hover:text-muted">Terms</Link> and <Link href="/privacy" className="underline hover:text-muted">Privacy</Link>.
      </p>
    </div>
  );
}

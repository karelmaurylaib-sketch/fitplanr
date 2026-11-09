import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const MONTH = 60 * 60 * 24 * 30;

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();

  // Kwop tracked link (?k=), intended plan (?plan=) and utm_ source: first-party cookies, 30 days.
  const q = req.nextUrl.searchParams;
  const k = q.get("k");
  const opts = { maxAge: MONTH, sameSite: "lax" as const, path: "/" };
  if (k && /^[A-Za-z0-9]{1,12}$/.test(k)) res.cookies.set("kwop_k", k, opts);
  const plan = q.get("plan");
  if (plan && /^[\w \-]{1,40}$/.test(plan)) res.cookies.set("fp_plan", plan, opts);
  const utm = ["utm_source", "utm_medium", "utm_campaign"]
    .map((key) => (q.get(key) ? `${key}=${q.get(key)}` : ""))
    .filter(Boolean)
    .join("&");
  if (utm) res.cookies.set("fp_src", utm.slice(0, 200), opts);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|vsl.mp4|sw.js|offline|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
};

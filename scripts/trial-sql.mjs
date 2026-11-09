// Dev helper: give a @fitplanr-test.com account an active Pro trial that started 2 days ago (Supabase Management API).
const email = process.argv[2];
if (!email || !email.endsWith("@fitplanr-test.com")) throw new Error("test accounts only");
const q = `insert into public.trials (user_id, plan_id, tier, period, ref, days, status, price_cents, started_at)
select id, 1568, 'pro', 'month', 'dev', 7, 'active', 899, now() - interval '2 days' from auth.users where email = '${email.replace(/'/g, "")}'
on conflict (user_id) do update set status = 'active', started_at = excluded.started_at returning ends_at`;
const r = await fetch("https://api.supabase.com/v1/projects/ehokzomaenbonjnysvhy/database/query", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || "proxy"}` },
  body: JSON.stringify({ query: q }),
});
console.log("trial row:", r.status, await r.text());

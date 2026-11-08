import { ImageResponse } from "next/og";
import { getShared } from "@/lib/share";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A FitPlanr 4-week plan";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getShared(id);
  return new ImageResponse(<OgCard title={s?.title ?? "Your 4-week plan"} summary={s?.summary ?? "Built on the gear you actually have."} rows={s?.day1.exercises.slice(0, 4).map((e) => `${e.name} · ${e.sets} × ${e.target}`) ?? []} />, size);
}

function OgCard({ title, summary, rows }: { title: string; summary: string; rows: string[] }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#060606", color: "#F4F5F0", padding: 64, fontFamily: "sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: -200, left: 300, width: 700, height: 500, borderRadius: 999, background: "rgba(200,255,61,0.18)", filter: "blur(80px)" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C8FF3D" }} />
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>FITPLANR</div>
        </div>
        <div style={{ marginTop: 56, fontSize: 22, letterSpacing: 4, color: "#8A8F82" }}>[ MY 4-WEEK PLAN ]</div>
        <div style={{ marginTop: 12, fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, textTransform: "uppercase" }}>{title}</div>
        <div style={{ marginTop: 18, fontSize: 30, color: "#C9CCC3" }}>{summary}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: 420, justifyContent: "center", gap: 14 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 24 }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#C8FF3D" }} />
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

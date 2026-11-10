import { ImageResponse } from "next/og";
import { getSharedMeal } from "@/lib/share";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A meal scanned with FitPlanr";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getSharedMeal(id);
  const title = m?.title ?? "Meal scan";
  const kcal = m?.kcal ?? 0;
  const macros: [string, number, string][] = [
    ["PROTEIN", m?.protein ?? 0, "#C8FF3D"],
    ["CARBS", m?.carbs ?? 0, "#7EE787"],
    ["FAT", m?.fat ?? 0, "#3FD3A6"],
  ];
  const grams = macros.reduce((s, x) => s + x[1], 0) || 1;
  // ring: share of the calories that come from protein
  const pct = Math.min(1, ((m?.protein ?? 0) * 4) / Math.max(1, kcal));
  const R = 120, C = 2 * Math.PI * R;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#060606", color: "#F4F5F0", padding: 64, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -200, left: 300, width: 700, height: 500, borderRadius: 999, background: "rgba(200,255,61,0.18)", filter: "blur(80px)" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C8FF3D" }} />
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>FITPLANR</div>
          </div>
          <div style={{ marginTop: 56, fontSize: 22, letterSpacing: 4, color: "#8A8F82" }}>[ MEAL SCAN ]</div>
          <div style={{ marginTop: 12, fontSize: 80, fontWeight: 800, lineHeight: 1, letterSpacing: -3, textTransform: "uppercase", maxWidth: 640 }}>{title}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
            {macros.map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", padding: "16px 22px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", width: 180 }}>
                <div style={{ fontSize: 18, letterSpacing: 3, color: "#8A8F82" }}>{k}</div>
                <div style={{ fontSize: 44, fontWeight: 800, color: c }}>{v} g</div>
                <div style={{ display: "flex", marginTop: 8, height: 6, borderRadius: 6, background: "rgba(255,255,255,0.1)" }}>
                  <div style={{ width: `${(v / grams) * 100}%`, height: 6, borderRadius: 6, background: c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", width: 320, alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="22" />
            <circle cx="150" cy="150" r={R} fill="none" stroke="#C8FF3D" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 150 150)" />
          </svg>
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1 }}>{kcal}</div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: "#8A8F82", marginTop: 6 }}>KCAL</div>
            <div style={{ fontSize: 16, letterSpacing: 2, color: "#C8FF3D", marginTop: 10 }}>{Math.round(pct * 100)}% FROM PROTEIN</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

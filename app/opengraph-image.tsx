import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FitPlanr: your 4-week plan, built on your gear";

export default function Image() {
  const weeks = [
    ["3 × 8", "25 lb"],
    ["3 × 10", "25 lb"],
    ["3 × 12", "25 lb"],
    ["4 × 12", "25 lb"],
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#060606", color: "#F4F5F0", padding: 72, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -220, left: 250, width: 700, height: 500, borderRadius: 999, background: "rgba(200,255,61,0.2)", filter: "blur(90px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C8FF3D" }} />
          <div style={{ fontSize: 34, fontWeight: 800 }}>FITPLANR</div>
        </div>
        <div style={{ marginTop: 60, fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3, textTransform: "uppercase" }}>Two dumbbells.</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3, textTransform: "uppercase", color: "#8A8F82" }}>A real plan.</div>
        <div style={{ display: "flex", gap: 16, marginTop: 56 }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", padding: "18px 26px", borderRadius: 20, background: i === 3 ? "#C8FF3D" : "rgba(255,255,255,0.06)", color: i === 3 ? "#0A0D02" : "#F4F5F0" }}>
              <div style={{ fontSize: 18, letterSpacing: 3 }}>{`WEEK ${i + 1}`}</div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{w[0]}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

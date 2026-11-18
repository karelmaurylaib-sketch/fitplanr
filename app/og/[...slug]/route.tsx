import { ImageResponse } from "next/og";
import { GUIDES_HUB, PAGE_BY_PATH } from "@/lib/seo/pages";

// Open Graph image per keyword-map page: /og/<page path>. Static, generated at build time.
export const dynamic = "force-static";

export function generateStaticParams() {
  return [...Object.keys(PAGE_BY_PATH), GUIDES_HUB.path].map((p) => ({ slug: p.slice(1).split("/") }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const page = PAGE_BY_PATH[path];
  if (!page && path !== GUIDES_HUB.path) return new Response("Not found", { status: 404 });
  const title = page ? page.h1 : GUIDES_HUB.h1;
  const label = page ? page.label : "Guides";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#060606", color: "#F4F5F0", padding: 72, fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: -220, left: 250, width: 700, height: 500, borderRadius: 999, background: "rgba(200,255,61,0.18)", filter: "blur(90px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C8FF3D" }} />
          <div style={{ fontSize: 34, fontWeight: 800 }}>FITPLANR</div>
        </div>
        <div style={{ marginTop: 56, fontSize: 24, letterSpacing: 4, color: "#C8FF3D", textTransform: "uppercase" }}>{`[ ${label} ]`}</div>
        <div style={{ marginTop: 18, fontSize: title.length > 52 ? 64 : 76, fontWeight: 800, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase", maxWidth: 1050 }}>{title}</div>
        <div style={{ marginTop: "auto", display: "flex", fontSize: 26, color: "#8A8F82" }}>Your 4-week plan, built on the gear you actually have.</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

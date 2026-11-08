"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#060606", color: "#F4F5F0", fontFamily: "system-ui", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <h1>Something slipped.</h1>
        <p style={{ color: "#8A8F82" }}>Your plan and your logs are safe.</p>
        <button onClick={reset} style={{ marginTop: 16, height: 48, padding: "0 24px", borderRadius: 999, background: "#C8FF3D", color: "#0A0D02", border: 0, fontWeight: 600 }}>Try again</button>
      </body>
    </html>
  );
}

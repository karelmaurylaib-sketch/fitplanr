/** "phone" or "computer", for analytics only (same 640px breakpoint as the sheets). Browser only. */
export function device(): "phone" | "computer" {
  try {
    return window.matchMedia("(max-width: 640px)").matches ? "phone" : "computer";
  } catch {
    return "phone";
  }
}

/** Fire-and-forget Kwop event through our server (the browser never sees KWOP_API). */
export function sendEvent(type: "paywall_view" | "feature_used", detail?: string) {
  fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(detail ? { type, detail } : { type }), keepalive: true }).catch(() => {});
}

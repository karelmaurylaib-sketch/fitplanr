import "server-only";
import { createSign, createPrivateKey, sign as edSign } from "node:crypto";
import http2 from "node:http2";

// Push for the native apps. Android → Firebase Cloud Messaging (HTTP v1). iOS → Apple Push Notification service.
// Both are optional: with no keys set, push is simply "not configured" and nothing is sent.
//   FCM_SERVICE_ACCOUNT  = the Firebase service-account JSON (raw or base64)
//   APNS_KEY             = the .p8 auth key (raw PEM or base64), APNS_KEY_ID, APNS_TEAM_ID,
//   APNS_BUNDLE_ID       = com.fitplanr.app, APNS_PRODUCTION = "1" for App Store / TestFlight builds

export type PushMessage = { title: string; body: string; url?: string };
export type PushResult = "sent" | "gone" | "failed" | "off";

const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const maybeB64 = (v: string) => (v.trim().startsWith("{") || v.includes("-----BEGIN") ? v : Buffer.from(v, "base64").toString("utf8"));

export function pushConfigured() {
  return { android: !!process.env.FCM_SERVICE_ACCOUNT, ios: !!(process.env.APNS_KEY && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID) };
}

/* ---------- Android: FCM HTTP v1 ---------- */

let fcmToken: { value: string; exp: number; project: string } | null = null;

async function fcmAccess(): Promise<{ token: string; project: string } | null> {
  const raw = process.env.FCM_SERVICE_ACCOUNT;
  if (!raw) return null;
  if (fcmToken && fcmToken.exp > Date.now() + 60_000) return { token: fcmToken.value, project: fcmToken.project };
  const sa = JSON.parse(maybeB64(raw)) as { client_email: string; private_key: string; project_id: string };
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const s = createSign("RSA-SHA256");
  s.update(`${head}.${claims}`);
  const jwt = `${head}.${claims}.${b64url(s.sign(sa.private_key))}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
    signal: AbortSignal.timeout(10_000),
  });
  const j = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new Error("fcm oauth failed");
  fcmToken = { value: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000, project: sa.project_id };
  return { token: j.access_token, project: sa.project_id };
}

async function sendAndroid(token: string, m: PushMessage): Promise<PushResult> {
  const a = await fcmAccess();
  if (!a) return "off";
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${a.project}/messages:send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${a.token}` },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: m.title, body: m.body },
        data: m.url ? { url: m.url } : {},
        android: { priority: "high", notification: { color: "#C8FF3D", icon: "ic_stat_fitplanr", channel_id: "workouts" } },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (r.ok) return "sent";
  const t = await r.text().catch(() => "");
  if (r.status === 404 || t.includes("UNREGISTERED") || t.includes("INVALID_ARGUMENT")) return "gone";
  console.error("[push] fcm", r.status, t.slice(0, 200));
  return "failed";
}

/* ---------- iOS: APNs (token auth, HTTP/2) ---------- */

let apnsJwt: { value: string; at: number } | null = null;

function apnsToken(): string | null {
  const { APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID } = process.env;
  if (!APNS_KEY || !APNS_KEY_ID || !APNS_TEAM_ID) return null;
  if (apnsJwt && Date.now() - apnsJwt.at < 40 * 60_000) return apnsJwt.value; // Apple: refresh every 20–60 min
  const head = b64url(JSON.stringify({ alg: "ES256", kid: APNS_KEY_ID }));
  const claims = b64url(JSON.stringify({ iss: APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) }));
  const key = createPrivateKey(maybeB64(APNS_KEY));
  const sig = edSign("sha256", Buffer.from(`${head}.${claims}`), { key, dsaEncoding: "ieee-p1363" });
  apnsJwt = { value: `${head}.${claims}.${b64url(sig)}`, at: Date.now() };
  return apnsJwt.value;
}

function sendIos(token: string, m: PushMessage): Promise<PushResult> {
  const jwt = apnsToken();
  if (!jwt) return Promise.resolve("off");
  const host = process.env.APNS_PRODUCTION === "1" ? "https://api.push.apple.com" : "https://api.sandbox.push.apple.com";
  return new Promise((resolve) => {
    const client = http2.connect(host);
    const done = (r: PushResult) => {
      client.close();
      resolve(r);
    };
    client.on("error", () => done("failed"));
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": process.env.APNS_BUNDLE_ID || "com.fitplanr.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    req.setTimeout(10_000, () => {
      req.close();
      done("failed");
    });
    let status = 0;
    let body = "";
    req.on("response", (h) => (status = Number(h[":status"])));
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (status === 200) return done("sent");
      if (status === 410 || body.includes("BadDeviceToken") || body.includes("Unregistered")) return done("gone");
      console.error("[push] apns", status, body.slice(0, 200));
      done("failed");
    });
    req.end(JSON.stringify({ aps: { alert: { title: m.title, body: m.body }, sound: "default" }, url: m.url }));
  });
}

export async function sendPush(platform: "ios" | "android", token: string, m: PushMessage): Promise<PushResult> {
  try {
    return platform === "ios" ? await sendIos(token, m) : await sendAndroid(token, m);
  } catch (e) {
    console.error("[push] send failed", e);
    return "failed";
  }
}

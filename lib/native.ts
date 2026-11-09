"use client";

// The FitPlanr native shell (Capacitor, see capacitor.config.ts) loads this same web app and injects its bridge.
// Everything here is a no-op in a normal browser, so the website is unchanged.

import { Capacitor } from "@capacitor/core";

export type NativeInfo = { native: boolean; platform: "ios" | "android" | "web"; push: boolean };

export function nativeInfo(): NativeInfo {
  if (typeof window === "undefined") return { native: false, platform: "web", push: false };
  const ua = navigator.userAgent;
  const shell = /FitPlanrApp\//.test(ua);
  const native = shell && Capacitor.isNativePlatform();
  const platform = native ? (Capacitor.getPlatform() as "ios" | "android") : "web";
  // Android only has push when the build carries Firebase config (the shell says so in its user agent).
  const push = native && /\bpush\b/.test(ua) && Capacitor.isPluginAvailable("PushNotifications");
  return { native, platform, push };
}

export const isNativeApp = () => nativeInfo().native;

const TOKEN_KEY = "fp_push_token";
export const savedPushToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Ask for notification permission (only after a tap, never on launch), get the device token and register it
 * with the server. Resolves to the new state.
 */
export async function enablePush(): Promise<"on" | "denied" | "unavailable" | "error"> {
  const info = nativeInfo();
  if (!info.push || info.platform === "web") return "unavailable";
  const { PushNotifications } = await import("@capacitor/push-notifications");
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return "denied";
  const token = await new Promise<string | null>((resolve) => {
    const t = setTimeout(() => resolve(null), 15_000);
    PushNotifications.addListener("registration", (tk) => {
      clearTimeout(t);
      resolve(tk.value);
    });
    PushNotifications.addListener("registrationError", () => {
      clearTimeout(t);
      resolve(null);
    });
    PushNotifications.register().catch(() => resolve(null));
  });
  if (!token) return "error";
  const r = await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, platform: info.platform }) }).catch(() => null);
  if (!r?.ok) return "error";
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
  return "on";
}

export async function setReminders(on: boolean): Promise<boolean> {
  const token = savedPushToken();
  if (!token) return false;
  const r = await fetch("/api/push", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, reminders: on }) }).catch(() => null);
  return !!r?.ok;
}

/** On log out: this phone stops getting this account's reminders, and cached pages are wiped. */
export async function forgetDevice() {
  const token = savedPushToken();
  if (token) await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).catch(() => {});
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
  try {
    if ("caches" in window) for (const k of await caches.keys()) if (k.startsWith("fp-pages")) await caches.delete(k);
  } catch {}
}

/**
 * Open an outside page (secure checkout, links) in the in-app browser sheet: SFSafariViewController on iOS,
 * a Chrome Custom Tab on Android. Resolves when the person closes it.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  const { Browser } = await import("@capacitor/browser");
  await new Promise<void>((resolve) => {
    let handle: { remove: () => Promise<void> } | null = null;
    Browser.addListener("browserFinished", () => {
      handle?.remove();
      resolve();
    }).then((h) => (handle = h));
    Browser.open({ url, presentationStyle: "popover", toolbarColor: "#060606" }).catch(() => {
      location.href = url;
      resolve();
    });
  });
}

export async function haptic(kind: "light" | "success" = "light") {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "success") await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

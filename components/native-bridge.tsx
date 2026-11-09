"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { nativeInfo, openInAppBrowser } from "@/lib/native";

/**
 * Runs once in every page (root layout).
 * Everywhere: registers the offline service worker (production only).
 * Inside the Google Play / App Store app: hides the splash screen on first paint, dark system bars,
 * Android back button, taps on a notification open the right screen, outside links open in the in-app browser.
 */
export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .then((reg) => {
          const urls = performance.getEntriesByType("resource").map((r) => r.name);
          reg.active?.postMessage({ type: "precache", urls });
        })
        .catch(() => {});
    }

    const info = nativeInfo();
    if (!info.native) return;
    const root = document.documentElement;
    root.classList.add("native", `native-${info.platform}`);

    const cleanups: (() => void)[] = [];
    let dead = false;

    (async () => {
      const [{ SplashScreen }, { App }, core] = await Promise.all([import("@capacitor/splash-screen"), import("@capacitor/app"), import("@capacitor/core")]);
      if (dead) return;
      requestAnimationFrame(() => SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {}));
      core.SystemBars?.setStyle({ style: core.SystemBarsStyle.Dark }).catch(() => {});

      const back = await App.addListener("backButton", ({ canGoBack }) => {
        // an open sheet closes first (sheets listen for Escape)
        if (document.querySelector('[role="dialog"]')) {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          return;
        }
        if (canGoBack) history.back();
        else App.exitApp();
      });
      cleanups.push(() => back.remove());

      if (info.push) {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        if (info.platform === "android") {
          PushNotifications.createChannel({ id: "workouts", name: "Workout reminders", description: "A nudge when your next workout is due", importance: 4, lightColor: "#C8FF3D", visibility: 1 }).catch(() => {});
        }
        const tap = await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
          const url = (a.notification.data as { url?: string } | undefined)?.url;
          if (url && url.startsWith("/")) router.push(url);
        });
        cleanups.push(() => tap.remove());
      }
    })().catch(() => {});

    // Outside links (Terms of other sites, billing portal…) open in the in-app browser, never replace the app.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented) return;
      const url = new URL(a.href, location.href);
      if (url.origin === location.origin || !/^https?:$/.test(url.protocol)) return;
      e.preventDefault();
      openInAppBrowser(url.href);
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    return () => {
      dead = true;
      cleanups.forEach((f) => f());
    };
  }, [router]);

  return null;
}

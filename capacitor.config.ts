import { existsSync } from "node:fs";
import type { CapacitorConfig } from "@capacitor/cli";

// FitPlanr native apps (Google Play + App Store). The app is the live web app inside a native shell:
// every plan, workout and payment stays on the server (Supabase + Kwop), so the app never goes out of date
// and nothing secret ships inside the binary. The bundled `mobile/www` only holds the offline screen.
const SERVER = process.env.CAP_SERVER_URL || "https://fitplanr-3.vercel.app";

// Android push needs Firebase (google-services.json). Without it the app must not ask for push,
// so the shell tells the web app what it can do through its user agent.
const androidPush = existsSync("android/app/google-services.json");

const config: CapacitorConfig = {
  appId: "com.fitplanr.app",
  appName: "FitPlanr",
  webDir: "mobile/www",
  backgroundColor: "#060606",
  server: {
    url: SERVER,
    appStartPath: "/app",
    errorPath: "offline.html",
    cleartext: false,
    // Whop's secure checkout and Supabase auth stay inside the app; everything else opens outside.
    allowNavigation: ["fitplanr-3.vercel.app", "*.supabase.co", "whop.com", "*.whop.com", "kwop.io", "*.kwop.io"],
  },
  android: {
    appendUserAgent: `FitPlanrApp/1.0 (android${androidPush ? "; push" : ""})`,
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    appendUserAgent: "FitPlanrApp/1.0 (ios; push)",
    contentInset: "never",
    scheme: "FitPlanr",
    // Service workers (offline caching) only run in WKWebView for app-bound domains (Info.plist WKAppBoundDomains).
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 4000, // safety net only
      launchAutoHide: true, // the web app hides it sooner, on its first paint (components/native-bridge.tsx)
      backgroundColor: "#060606",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
    // Android: the shell pads the web view clear of the status and navigation bars (iOS uses env(safe-area-inset-*) in CSS).
    SystemBars: { insetsHandling: "native", style: "DARK" },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;

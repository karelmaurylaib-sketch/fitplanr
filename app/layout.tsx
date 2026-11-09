import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NativeBridge } from "@/components/native-bridge";

const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-jetbrains", display: "swap" });

const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "FitPlanr: your personal trainer, automated", template: "%s · FitPlanr" },
  description: "Tell FitPlanr the gear you actually have. Get a safe, week-by-week workout plan that adds weight for you. Free to try, ready in 60 seconds.",
  applicationName: "FitPlanr",
  openGraph: { type: "website", siteName: "FitPlanr", title: "FitPlanr: your 4-week plan, built on your gear", description: "Two dumbbells or a full gym: get a real plan that progresses every week." },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "FitPlanr", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#060606", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${barlow.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <NativeBridge />
      </body>
    </html>
  );
}

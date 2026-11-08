import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

export default defineConfig({
  testDir: "tests",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3000", trace: "off", launchOptions: exe ? { executablePath: exe } : {} },
  projects: [
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, launchOptions: exe ? { executablePath: exe } : {} } },
    { name: "computer", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: exe ? { executablePath: exe } : {} } },
  ],
});

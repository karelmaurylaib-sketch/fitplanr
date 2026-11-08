import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // send <title>/<meta> in the initial <head> for every client (SEO tools included)
  htmlLimitedBots: /.*/,
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion"] },
};

export default nextConfig;

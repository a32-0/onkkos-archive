import path from "node:path";

import type { NextConfig } from "next";

const app = process.env.WF_BUILD_TARGET === "app";

const nextConfig: NextConfig = {
  agentRules: false,
  output: app ? "standalone" : undefined,
  cacheHandler: app ? path.join(import.meta.dirname, "desktop", "next-cache.cjs") : undefined,
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  serverExternalPackages: ["warframe-worldstate-data"],
  outputFileTracingIncludes: {
    "/**": [
      "./data/*.yaml",
      "./data/vendor/*.json",
      "./fixtures/*.json",
      "./node_modules/warframe-worldstate-data/dist/data/*.json",
    ],
  },
  outputFileTracingExcludes: {
    "/**": [
      "./node_modules/@wfcd/items/data/json/i18n/**/*",
      "./node_modules/.pnpm/@wfcd+items@*/node_modules/@wfcd/items/data/json/i18n/**/*",
    ],
  },
};

export default nextConfig;

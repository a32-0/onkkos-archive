import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  output: process.env.WF_BUILD_TARGET === "app" ? "standalone" : undefined,
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

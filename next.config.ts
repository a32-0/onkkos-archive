import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  serverExternalPackages: ["warframe-worldstate-data"],
  outputFileTracingIncludes: {
    "/**": [
      "./data/**/*",
      "./fixtures/**/*",
      "./node_modules/warframe-worldstate-data/dist/data/*.json",
    ],
  },
};

export default nextConfig;

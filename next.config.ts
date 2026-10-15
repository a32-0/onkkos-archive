import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  outputFileTracingIncludes: {
    "/**": ["./data/**/*", "./fixtures/**/*"],
  },
};

export default nextConfig;

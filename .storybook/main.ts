import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "storybook-addon-pseudo-states",
  ],
  framework: { name: "@storybook/nextjs-vite", options: {} },
  core: { disableTelemetry: true },
};

export default config;

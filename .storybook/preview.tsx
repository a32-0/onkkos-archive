import type { Preview } from "@storybook/nextjs-vite";
import { themes } from "storybook/theming";

import "../src/ui/tokens.css";

import { fontVariables } from "../src/app/fonts";

document.documentElement.classList.add(...fontVariables.split(" "));

const WIDTHS = [
  { width: 360, height: 800, type: "mobile" },
  { width: 390, height: 844, type: "mobile" },
  { width: 600, height: 960, type: "tablet" },
  { width: 840, height: 1180, type: "tablet" },
  { width: 1280, height: 800, type: "desktop" },
  { width: 1440, height: 900, type: "desktop" },
] as const;

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    docs: { theme: themes.dark },
    viewport: {
      options: Object.fromEntries(
        WIDTHS.map(({ width, height, type }) => [
          `w${width}`,
          { name: `${width} px`, styles: { width: `${width}px`, height: `${height}px` }, type },
        ]),
      ),
    },
  },
  initialGlobals: {
    viewport: { value: "w390", isRotated: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BuiltInto } from "./BuiltInto";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const DIMMED = { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } };

const meta = {
  title: "Lists/BuiltInto",
  component: BuiltInto,
  args: {
    label: "Keep it to build",
    chips: [
      { key: "Akbolto", label: "Akbolto ×2", icon: ICON, state: "default" },
      { key: "Hystrix", label: "Hystrix ×1", icon: ICON, state: "default" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BuiltInto>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoRecipes: Story = {};

export const OneRecipeMastered: Story = {
  parameters: DIMMED,
  args: {
    chips: [
      { key: "Akbolto", label: "Akbolto ×2", icon: ICON, state: "default" },
      { key: "Hystrix", label: "Hystrix ×1", icon: ICON, state: "done" },
    ],
  },
};

export const ThreeRecipes: Story = {
  args: {
    chips: [
      { key: "Dark Split-Sword", label: "Dark Split-Sword ×1", icon: ICON, state: "default" },
      { key: "Redeemer", label: "Redeemer ×1", icon: ICON, state: "default" },
      { key: "Akjagara", label: "Akjagara ×1", icon: ICON, state: "default" },
    ],
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Orb } from "./Orb";

const meta = {
  title: "Lists/Orb",
  component: Orb,
  args: { color: "#4a9eff", size: "m" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Orb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Row: Story = {};

export const Card: Story = {
  args: { size: "l", nodes: { seed: "Earth", total: 15, lit: 12 } },
};

export const CardNoNodes: Story = { args: { size: "l", color: "#9b7b4f" } };

export const Small: Story = { args: { size: "s", color: "#ff4a6b" } };

export const Satellite: Story = { args: { size: "xs", color: "#725253" } };

export const NoColor: Story = { args: { color: null } };

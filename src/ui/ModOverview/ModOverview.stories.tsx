import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModOverview } from "./ModOverview";

const meta = {
  title: "Item/ModOverview",
  component: ModOverview,
  args: {
    art: null,
    name: "Point Strike",
    rarity: "common",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", maxWidth: 390 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Uncommon: Story = {
  args: { name: "Serration", rarity: "uncommon" },
};

export const Rare: Story = {
  args: { name: "Intensify", rarity: "rare" },
};

export const Legendary: Story = {
  args: { name: "Primed Continuity", rarity: "legendary" },
};

export const NoRarity: Story = {
  args: { rarity: null },
};

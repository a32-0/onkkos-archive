import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModOverview } from "./ModOverview";

const POLARITY =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M10 45 11 16C11 16 8 13 5 12 13 8 20 5 20 5L20 23C29 16 36 9 36 9 42 8 45 14 45 14 45 14 19 22 10 45Z"/></svg>`,
  );

const meta = {
  title: "Item/ModOverview",
  component: ModOverview,
  args: {
    art: null,
    name: "Point Strike",
    capacity: "9",
    polarity: POLARITY,
    ranks: 5,
    rank: "Max rank 5",
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

export const TenRanks: Story = {
  args: { capacity: "14", ranks: 10, rank: "Max rank 10", rarity: "uncommon" },
};

export const NoPolarity: Story = {
  args: { polarity: null },
};

export const Rare: Story = {
  args: { name: "Intensify", capacity: "11", rarity: "rare" },
};

export const Legendary: Story = {
  args: {
    name: "Primed Continuity",
    capacity: "16",
    ranks: 10,
    rank: "Max rank 10",
    rarity: "legendary",
  },
};

export const NoRarity: Story = {
  args: { rarity: null },
};

export const Aura: Story = {
  args: { name: "Growing Power", capacity: "+7", rarity: "rare" },
};

export const FocusWay: Story = {
  args: { name: "Affinity Spike", capacity: null, polarity: null, ranks: 3, rank: "Max rank 3" },
};

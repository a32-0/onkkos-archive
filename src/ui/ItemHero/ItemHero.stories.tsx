import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { ItemHero } from "./ItemHero";

const meta = {
  title: "Item/ItemHero",
  component: ItemHero,
  args: {
    kicker: "Warframe",
    name: "Dante",
    art: SAMPLE_ART[3],
    state: { kind: "rank", label: "Rank 2/30" },
  },
} satisfies Meta<typeof ItemHero>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rank: Story = {};

export const Mastered: Story = { args: { state: { kind: "mastered", label: "Mastered" } } };

export const NotObtained: Story = { args: { state: { kind: "absent" } } };

export const NotObtainedPrime: Story = {
  args: { name: "Gyre Prime", art: SAMPLE_ART[4], state: { kind: "prime" } },
};

export const NoState: Story = { args: { state: { kind: "none" } } };

export const Collectible: Story = {
  args: { kicker: "Resource", name: "Fate Pearl", art: SAMPLE_ART[1], state: { kind: "none" } },
};

export const NoArt: Story = { args: { art: null } };

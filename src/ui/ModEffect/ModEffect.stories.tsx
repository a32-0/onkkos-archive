import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModEffect } from "./ModEffect";

const meta = {
  title: "Item/ModEffect",
  component: ModEffect,
  args: {
    icon: "crisis-alert",
    outcome: "More critical hits",
    amount: "+150%",
    stat: "Critical Chance",
    example: {
      label: "Example",
      before: { label: "Without", value: "20%", share: 0.4 },
      after: { label: "With it", value: "50%", share: 1 },
      line: "A weapon with 20% critical chance gets 50%.",
    },
    note: "It grows the weapon's own chance, so it does little on a weapon with a low one. Adds to other critical chance mods.",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", maxWidth: 390 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModEffect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stat: Story = {};

export const Trigger: Story = {
  args: {
    icon: "speed",
    outcome: "Faster melee attacks",
    amount: "+35%",
    stat: "Attack Speed",
    example: {
      label: "Example",
      before: { label: "Without", value: "1×", share: 0.59 },
      after: { label: "With it", value: "1.7×", share: 1 },
      line: "Attacks come 70% faster.",
    },
    note: "Adds to other attack speed. Only after a melee kill, lasts 10 s, twice at most.",
  },
};

export const Element: Story = {
  args: {
    icon: "science",
    outcome: "Adds poison damage",
    amount: "+90%",
    stat: "Toxin",
    example: {
      label: "Example",
      before: { label: "Without", value: "100", share: 0.53 },
      after: { label: "With it", value: "190", share: 1 },
      line: "A weapon that does 100 damage adds 90 Toxin.",
    },
    note: "Toxin goes through shields. It pairs with the next element in your mod order.",
    pairs: {
      label: "Pairs with",
      combos: [
        { meets: "Heat", makes: "Gas" },
        { meets: "Cold", makes: "Viral" },
        { meets: "Electricity", makes: "Corrosive" },
      ],
    },
  },
};

export const GameWords: Story = {
  args: {
    icon: "extension",
    outcome: "Grenades have 100% chance to stick to surfaces.",
    amount: null,
    stat: null,
    example: null,
    note: null,
  },
};

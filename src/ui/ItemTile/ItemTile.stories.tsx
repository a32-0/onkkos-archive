import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { ItemTile } from "./ItemTile";

const meta = {
  title: "Lists/ItemTile",
  component: ItemTile,
  args: {
    href: "/item/koumei",
    name: "Koumei",
    reading: "~24 Runs · Rotation A",
    place: "Saya's Visions · Shrine Defense",
    art: SAMPLE_ART[4],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ItemTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const Rank: Story = { args: { state: { kind: "rank", label: "Rank 2/30" } } };

export const Mastered: Story = { args: { state: { kind: "mastered", label: "Mastered" } } };

export const NoArt: Story = { args: { art: null } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

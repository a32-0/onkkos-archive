import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { FeaturedCard } from "./FeaturedCard";

const meta = {
  title: "Cards/FeaturedCard",
  component: FeaturedCard,
  args: {
    kind: "last-played",
    eyebrow: "You last played",
    name: "The Shadowgrapher",
    meta: "Update 42 · Mar, 2026",
    art: SAMPLE_ART[2],
    href: "/catch-up/updates?from=resume",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeaturedCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LastPlayed: Story = {};

export const UpToDate: Story = {
  args: {
    kind: "up-to-date",
    eyebrow: "You're up to date",
    name: "Amir's Shockwave",
    meta: "Update 43.5 · Aug, 2026",
    art: SAMPLE_ART[0],
  },
};

export const NoMonth: Story = {
  args: { kind: "up-to-date", eyebrow: "You're up to date", meta: "" },
};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

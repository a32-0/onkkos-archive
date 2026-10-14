import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MoreLine } from "./MoreLine";

const meta = {
  title: "Lists/MoreLine",
  component: MoreLine,
  args: {
    text: "4 more primary weapons need Mastery Rank 8 or higher. You are Mastery Rank 5.",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoreLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ByRank: Story = {};

export const ByPlace: Story = {
  args: {
    text: "3 more mods come from places past Venus. Clear the Venus Junction, on Earth, to go on.",
  },
};

export const ByBoth: Story = {
  args: { text: "6 more warframes need Mastery Rank 8 or a place past Venus." },
};

export const Places: Story = {
  args: {
    text: "3 more places open as you clear the junctions. Next: the Venus Junction, on Earth.",
  },
};

export const Systems: Story = { args: { text: "2 more systems open as you go further." } };

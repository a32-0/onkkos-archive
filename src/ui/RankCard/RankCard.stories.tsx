import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RankCard } from "./RankCard";

const meta = {
  title: "Cards/RankCard",
  component: RankCard,
  args: {
    href: "#",
    seal: "9",
    title: "Reach Mastery Rank 9",
    line: "Ranking Lex and Boltor takes you there.",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-7) var(--gutter)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RankCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const TwoDigits: Story = {
  args: { seal: "30", title: "Reach Mastery Rank 30" },
};

export const Legendary: Story = {
  args: { seal: "L6", title: "Reach Legendary 6" },
};

export const TestReady: Story = {
  args: { title: "Take the Rank 9 test", line: "Your bar is full. Take the test in the game." },
};

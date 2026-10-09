import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "./EmptyState";

const meta = {
  title: "Cards/EmptyState",
  component: EmptyState,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SummaryNothingNew: Story = {
  args: {
    icon: "hourglass",
    title: "Nothing new since Mar, 2026",
    line: "The arsenal and the collection are as you left them.",
  },
};

export const GoalEveryGoalDone: Story = {
  args: {
    icon: "flag",
    title: "Nothing left to suggest",
    line: "Every goal we curate is behind you. Name anything above and chase it.",
  },
};

export const MapEverythingMastered: Story = {
  args: {
    icon: "explore",
    title: "Nothing left on Earth",
    line: "Every item it gives is mastered. Choose another place from the card above.",
  },
};

export const PlaceListNoMatch: Story = {
  args: {
    icon: "explore",
    title: "No place by that name",
    line: "None of the Origin System's places is called “Cetus”. Try another system.",
  },
};

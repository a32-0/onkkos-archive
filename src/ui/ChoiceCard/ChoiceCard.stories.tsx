import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChoiceCard } from "./ChoiceCard";

const meta = {
  title: "Cards/ChoiceCard",
  component: ChoiceCard,
  args: {
    use: "two-ways-in",
    href: "#",
    icon: "hourglass",
    title: "Pick up where you left off",
    line: "Name the last update you played and see everything added to your arsenal and collection since.",
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
} satisfies Meta<typeof ChoiceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoWaysIn: Story = {};

export const Goal: Story = {
  args: {
    use: "goal",
    icon: "precision-manufacturing",
    title: "Build a Necramech",
    line: "They are found in the Cambion Drift or owned by the player.",
  },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

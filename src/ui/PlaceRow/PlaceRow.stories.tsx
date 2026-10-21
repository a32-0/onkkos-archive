import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlaceRow } from "./PlaceRow";

const meta = {
  title: "Lists/PlaceRow",
  component: PlaceRow,
  args: {
    href: "/system?system=origin&place=ceres",
    name: "Ceres",
    orb: "#4ad8c8",
    count: { count: "12/21", label: "Mastered" },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlaceRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const OnView: Story = { args: { name: "Earth", orb: "#4a9eff", onView: true } };

export const StartHere: Story = {
  args: { name: "Venus", orb: "#7a5a6a", startHere: "Start here" },
};

export const New: Story = { args: { name: "Mercury", orb: "#e85a7a", isNew: "New" } };

export const Mastered: Story = {
  args: { name: "Mars", orb: "#e85a7a", count: undefined, mastered: "Mastered" },
};

export const Dojo: Story = { args: { name: "Dojo" } };

export const StartHereOverNew: Story = {
  args: { name: "Earth", orb: "#4a9eff", onView: true, startHere: "Start here", isNew: "New" },
};

export const BeyondReach: Story = {
  args: {
    name: "Mars",
    orb: "#e85a7a",
    count: undefined,
    gap: "Clear the Venus Junction, on Earth, to reach it.",
  },
};

export const DojoBeyondReach: Story = {
  args: { name: "Dojo", count: undefined, gap: "Join a clan to enter its Dojo." },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

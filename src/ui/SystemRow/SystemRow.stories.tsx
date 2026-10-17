import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SystemRow } from "./SystemRow";

const meta = {
  title: "Lists/SystemRow",
  component: SystemRow,
  args: {
    href: "/system?system=duviri",
    name: "Duviri",
    orb: "#e85a7a",
    satellite: "#7a5a6a",
    count: { count: "12/21", label: "Mastered" },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SystemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const OnView: Story = {
  args: {
    name: "Origin",
    orb: "#e8d84a",
    satellite: "#4a9eff",
    count: undefined,
    mastered: "Mastered",
    onView: true,
  },
};

export const StartHere: Story = {
  args: { name: "Pom-2 PC", orb: "#7a5a6a", startHere: "Start here" },
};

export const Soon: Story = {
  args: {
    name: "Tau",
    orb: "#7a5a6a",
    satellite: "#4a9eff",
    count: undefined,
    soon: "Soon™",
  },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

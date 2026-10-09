import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ORB } from "../stories/art";
import { SystemRow } from "./SystemRow";

const meta = {
  title: "Lists/SystemRow",
  component: SystemRow,
  args: {
    href: "/system?system=duviri",
    name: "Duviri",
    art: SAMPLE_ORB[2],
    satellite: SAMPLE_ORB[4],
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
    art: SAMPLE_ORB[1],
    satellite: SAMPLE_ORB[0],
    count: undefined,
    mastered: "Mastered",
    onView: true,
  },
};

export const StartHere: Story = {
  args: { name: "Pom-2 PC", art: SAMPLE_ORB[4], startHere: "Start here" },
};

export const Soon: Story = {
  args: {
    name: "Tau",
    art: SAMPLE_ORB[4],
    satellite: SAMPLE_ORB[0],
    count: undefined,
    soon: "Soon™",
  },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

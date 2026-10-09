import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ORB } from "../stories/art";
import { PlaceRow } from "./PlaceRow";

const meta = {
  title: "Lists/PlaceRow",
  component: PlaceRow,
  args: {
    href: "/system?system=origin&place=ceres",
    name: "Ceres",
    art: SAMPLE_ORB[3],
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

export const OnView: Story = { args: { name: "Earth", art: SAMPLE_ORB[0], onView: true } };

export const StartHere: Story = {
  args: { name: "Venus", art: SAMPLE_ORB[4], startHere: "Start here" },
};

export const New: Story = { args: { name: "Mercury", art: SAMPLE_ORB[2], isNew: "New" } };

export const Mastered: Story = {
  args: { name: "Mars", art: SAMPLE_ORB[2], count: undefined, mastered: "Mastered" },
};

export const Dojo: Story = { args: { name: "Dojo" } };

export const OnViewStartHereNew: Story = {
  args: { name: "Earth", art: SAMPLE_ORB[0], onView: true, startHere: "Start here", isNew: "New" },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

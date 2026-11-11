import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MilestoneRow } from "./MilestoneRow";

const meta = {
  title: "Lists/MilestoneRow",
  component: MilestoneRow,
  args: {
    href: "/item?name=The+New+War",
    icon: "swords",
    title: "Play The New War",
    line: "The Nataruk bow, and the way to Jade Shadows, Veilbreaker and the Zariman.",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MilestoneRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortLine: Story = {
  args: { icon: "flag", title: "Unlock the next planet", line: "Every junction cleared." },
};

export const Stacked: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <MilestoneRow {...args} />
      <MilestoneRow {...args} icon="skull" title="Unlock The Steel Path" />
    </div>
  ),
};

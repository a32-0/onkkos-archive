import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Lists/ProgressBar",
  component: ProgressBar,
  args: { value: 12, max: 21, label: "Items mastered on Earth" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Mastered: Story = { args: { value: 21 } };

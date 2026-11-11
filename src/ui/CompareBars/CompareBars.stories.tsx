import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CompareBars } from "./CompareBars";

const meta = {
  title: "Item/CompareBars",
  component: CompareBars,
  args: {
    before: { label: "Without", value: "20%", share: 0.4 },
    after: { label: "With it", value: "50%", share: 1 },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", maxWidth: 390 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompareBars>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grows: Story = {};

export const Shrinks: Story = {
  args: {
    before: { label: "Without", value: "2s", share: 1 },
    after: { label: "With it", value: "1.43s", share: 0.71 },
  },
};

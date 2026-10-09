import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Newest: Story = { args: { kind: "newest", label: "Newest" } };

export const StartHere: Story = { args: { kind: "start-here", label: "Start here" } };

export const New: Story = { args: { kind: "new", label: "New" } };

export const Mastered: Story = { args: { kind: "mastered", label: "Mastered" } };

export const Rank: Story = { args: { kind: "rank", label: "Rank 2/30" } };

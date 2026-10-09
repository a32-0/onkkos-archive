import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoadingCard } from "./LoadingCard";

const meta = {
  title: "Cards/LoadingCard",
  component: LoadingCard,
  args: { line: "Onkko’s reading your codex..." },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TheQuill: Story = {};

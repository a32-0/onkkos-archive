import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlayerChip } from "./PlayerChip";

const meta = {
  title: "Chrome/PlayerChip",
  component: PlayerChip,
  args: { name: "00111000", open: false },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          padding: "var(--space-6)",
          background: "var(--surface-header)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Divider } from "./Divider";

const meta = {
  title: "Lists/Divider",
  component: Divider,
  args: { label: "Arsenal" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) 0" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Arsenal: Story = {};

export const Collection: Story = { args: { label: "Collection" } };

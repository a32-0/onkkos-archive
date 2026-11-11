import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ElementCombo } from "./ElementCombo";

const meta = {
  title: "Item/ElementCombo",
  component: ElementCombo,
  args: { meets: "Cold", makes: "Viral" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ElementCombo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

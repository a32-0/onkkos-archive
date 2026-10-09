import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./Checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { label: "Neuroptics Blueprint", onChange: () => {} },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = { args: { checked: false } };

export const On: Story = { args: { checked: true } };

export const Focus: Story = {
  args: { checked: false },
  parameters: { pseudo: { focusVisible: true } },
};

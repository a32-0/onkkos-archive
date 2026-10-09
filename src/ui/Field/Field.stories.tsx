import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field } from "./Field";

const meta = {
  title: "Fields/Field",
  component: Field,
  args: { "aria-label": "Account id", placeholder: "000000000000000000000001", onChange: () => {} },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--space-8)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Focus: Story = { parameters: { pseudo: { focus: true } } };

export const Filled: Story = { args: { value: "5a1b2c3d4e5f60718293a4b5" } };

export const Invalid: Story = { name: "Error", args: { value: "5a1b2c3d", invalid: true } };

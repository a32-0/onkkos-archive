import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShowMore } from "./ShowMore";

const meta = {
  title: "Cards/ShowMore",
  component: ShowMore,
  args: { label: "Show 23 older updates" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShowMore>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ShowOlder: Story = {};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

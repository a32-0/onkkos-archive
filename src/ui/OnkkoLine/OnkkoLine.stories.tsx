import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OnkkoLine } from "./OnkkoLine";

const meta = {
  title: "Atoms/OnkkoLine",
  component: OnkkoLine,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnkkoLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Top: Story = { args: { place: "top", line: "It is time. Utter the name." } };

export const Bottom: Story = {
  args: { place: "bottom", line: "We watch, we anticipate, we intercede." },
};

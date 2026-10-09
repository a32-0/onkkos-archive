import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tab } from "./Tab";

const meta = {
  title: "Chrome/Tab",
  component: Tab,
  args: { href: "#", icon: "explore", label: "Navigation", placement: "header", active: true },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          padding: "var(--space-7)",
          background: "var(--surface-header)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = { args: { icon: "hourglass", label: "Resume", active: false } };

export const Hover: Story = {
  args: { icon: "hourglass", label: "Resume", active: false },
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: { icon: "hourglass", label: "Resume", active: false },
  parameters: { pseudo: { focusVisible: true } },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Toast } from "./Toast";

const meta = {
  title: "Cards/Toast",
  component: Toast,
  args: { onDismiss: () => {} },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: "var(--space-8)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { line: "Welcome, 00111000. Your profile is loaded." },
};

export const Updated: Story = {
  args: { line: "Your profile is up to date. Onkko read it from Warframe just now." },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Alert } from "./Alert";

const meta = {
  title: "Cards/Alert",
  component: Alert,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Informative: Story = { args: { tone: "info", message: "Informative" } };

export const Success: Story = {
  args: {
    tone: "success",
    message: "Your profile is up to date. Onkko read it from Warframe just now.",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    message:
      "Warframe didn’t answer. You’re seeing your data from 14 hours ago. We’ll try again at 9:30 PM.",
  },
};

export const InvalidId: Story = {
  args: { tone: "error", message: "An account ID is 24 characters: digits 0–9 and letters a–f." },
};

export const NotFound: Story = {
  args: {
    tone: "error",
    message: "No account answers to this ID. Copy it again from the gid cookie.",
  },
};

export const NotAnswering: Story = {
  args: {
    tone: "error",
    message: "Warframe isn't answering right now. Your ID is fine; try again at 15:30.",
  },
};

export const Unreadable: Story = {
  args: {
    tone: "error",
    message: "Warframe's answer came back in a form we can't read yet. Your ID is fine.",
  },
};

export const Limited: Story = {
  args: {
    tone: "error",
    message: "You've had your two readings for now. The next opens at 15:30.",
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ErrorBand } from "./ErrorBand";

const meta = {
  title: "Cards/ErrorBand",
  component: ErrorBand,
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorBand>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InvalidId: Story = {
  args: { message: "An account ID is 24 characters: digits 0–9 and letters a–f." },
};

export const NotFound: Story = {
  args: { message: "No account answers to this ID. Copy it again from user_id." },
};

export const NotAnswering: Story = {
  args: { message: "Warframe isn't answering right now. Your ID is fine; try again at 15:30 UTC." },
};

export const Unreadable: Story = {
  args: { message: "Warframe's answer came back in a form we can't read yet. Your ID is fine." },
};

export const Limited: Story = {
  args: { message: "You've had your two readings for now. The next opens at 15:30 UTC." },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Wordmark } from "./Wordmark";

const meta = {
  title: "Atoms/Wordmark",
  component: Wordmark,
  args: { label: "Onkko's Archive" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Wordmark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Splash: Story = { args: { size: "splash" } };

export const Header: Story = { args: { size: "header" } };

export const Sheet: Story = { args: { size: "sheet" } };

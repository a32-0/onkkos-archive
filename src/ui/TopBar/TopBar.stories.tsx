import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TopBar } from "./TopBar";

const meta = {
  title: "Chrome/TopBar",
  component: TopBar,
  args: { title: "Warframes", back: "/catch-up", backLabel: "Back" },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Long: Story = { args: { title: "Choose a location from the chart" } };

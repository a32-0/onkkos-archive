import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlayerChip } from "../PlayerChip/PlayerChip";
import { Header } from "./Header";

const meta = {
  title: "Chrome/Header",
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WordmarkOnly: Story = { args: { variant: "wordmark", wordmark: "Onkko's Archive" } };

export const WithChip: Story = {
  args: {
    variant: "chip",
    wordmark: "Onkko's Archive",
    chip: <PlayerChip href="/profile" name="Cy" />,
  },
};

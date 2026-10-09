import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SheetHeader } from "./SheetHeader";

const meta = {
  title: "Chrome/SheetHeader",
  component: SheetHeader,
  args: { wordmark: "Onkko's Archive", closeLabel: "Close", onClose: () => {} },
} satisfies Meta<typeof SheetHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WordmarkAndClose: Story = {};

export const CloseFocus: Story = { parameters: { pseudo: { focusVisible: true } } };

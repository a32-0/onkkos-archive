import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlayerChip } from "../PlayerChip/PlayerChip";
import { SheetHeader } from "../SheetHeader/SheetHeader";
import { TabBar } from "../TabBar/TabBar";
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
    chip: <PlayerChip name="00111000" open={false} />,
  },
};

export const WithChipAndTabs: Story = {
  args: {
    variant: "chip",
    wordmark: "Onkko's Archive",
    chip: <PlayerChip name="00111000" open={false} />,
    tabs: (
      <TabBar
        label="Sections"
        placement="header"
        items={[
          { href: "/system", icon: "explore", label: "Navigation", active: true },
          { href: "/catch-up", icon: "hourglass", label: "Resume", active: false },
          { href: "/goals", icon: "flag", label: "Goal", active: false },
        ]}
      />
    ),
  },
  globals: { viewport: { value: "w1280", isRotated: false } },
};

export const Sheet: Story = {
  args: { variant: "sheet", wordmark: "Onkko's Archive", close: null },
  render: () => <SheetHeader wordmark="Onkko's Archive" closeLabel="Close" onClose={() => {}} />,
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlaceSwitcher } from "./PlaceSwitcher";

const meta = {
  title: "Map/PlaceSwitcher",
  component: PlaceSwitcher,
  args: { href: "/system/places", kicker: "Change location", name: "Earth" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlaceSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongName: Story = { args: { name: "Empyrean Proxima" } };

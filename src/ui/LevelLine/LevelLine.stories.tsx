import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LevelLine } from "./LevelLine";

const ZOOM = [
  { value: "100", label: "100%" },
  { value: "115", label: "115%" },
  { value: "130", label: "130%" },
] as const;

const meta = {
  title: "Fields/LevelLine",
  component: LevelLine,
  args: { label: "Zoom", name: "zoom", options: ZOOM, chosen: "100", onChoose: () => {} },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LevelLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstChosen: Story = {};

export const MiddleChosen: Story = { args: { chosen: "115" } };

export const LastChosen: Story = { args: { chosen: "130" } };

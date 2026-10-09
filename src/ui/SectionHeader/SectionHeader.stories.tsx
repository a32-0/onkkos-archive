import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_PART } from "../stories/art";
import { SectionHeader } from "./SectionHeader";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const meta = {
  title: "Item/SectionHeader",
  component: SectionHeader,
  args: { title: "Blueprints", icon: ICON },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
        <div id="blueprints" />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GameIconOpen: Story = {
  args: { fold: { open: true, controls: "blueprints", onToggle: () => {} } },
};

export const GameIconClosed: Story = {
  args: { fold: { open: false, controls: "blueprints", onToggle: () => {} } },
};

export const GameIconStatic: Story = { args: { title: "Prerequisites" } };

export const PartArt: Story = { args: { title: "Chassis Blueprint", art: SAMPLE_PART } };

export const Focus: Story = {
  args: { fold: { open: true, controls: "blueprints", onToggle: () => {} } },
  parameters: { pseudo: { focusVisible: true } },
};

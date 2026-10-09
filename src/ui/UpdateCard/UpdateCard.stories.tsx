import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { UpdateCard } from "./UpdateCard";

const meta = {
  title: "Cards/UpdateCard",
  component: UpdateCard,
  args: {
    href: "#",
    name: "Jade Shadows: Constellations",
    meta: "Update 43 · Jun, 2026",
    art: SAMPLE_ART[1],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpdateCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const Newest: Story = {
  args: {
    name: "Amir's Shockwave",
    meta: "Update 43.5 · Aug, 2026",
    art: SAMPLE_ART[0],
    newest: "Newest",
  },
};

export const WithoutArt: Story = { args: { art: null } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART, SAMPLE_BLUEPRINT, SAMPLE_PART } from "../stories/art";
import { SummaryRow } from "./SummaryRow";

const meta = {
  title: "Item/SummaryRow",
  component: SummaryRow,
  args: {
    href: "/item?name=dante&view=steps#blueprint",
    name: "Blueprint",
    reading: "~24 Runs · Rotation A",
    place: "Saya's Visions · Shrine Defense",
    art: SAMPLE_PART,
    blueprint: SAMPLE_BLUEPRINT,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SummaryRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blueprint: Story = {};

export const Component: Story = {
  args: {
    href: "/item?name=fate-pearl",
    name: "Fate Pearl ×12",
    art: SAMPLE_ART[1],
    blueprint: undefined,
  },
};

export const ComponentWithoutPage: Story = {
  args: { href: undefined, name: "Fate Pearl ×12", art: SAMPLE_ART[1], blueprint: undefined },
};

export const Credits: Story = {
  args: {
    href: undefined,
    name: "25,000 Credits",
    reading: undefined,
    place: undefined,
    art: SAMPLE_ART[3],
    blueprint: undefined,
  },
};

export const Route: Story = {
  args: { href: undefined, name: "Fate Pearl", art: SAMPLE_ART[1], blueprint: undefined },
};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

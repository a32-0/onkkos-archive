import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WikiLink } from "../WikiLink/WikiLink";
import { RowProse } from "./RowProse";

const meta = {
  title: "Item/RowProse",
  component: RowProse,
  args: {
    paragraphs: [
      "At the start of the mission, there is a single terminal. Hacking this terminal will begin the objective as endless waves of enemies begin to spawn.",
      "In each round, four Conduits colored yellow, white, blue, and cyan appear around the map, requiring keys to activate which are dropped by heavy units.",
    ],
    link: <WikiLink href="https://wiki.warframe.com/w/Disruption" label="Wiki" target="wiki" />,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: { config: { rules: [{ id: "link-in-text-block", enabled: false }] } },
  },
} satisfies Meta<typeof RowProse>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Paragraphs: Story = {};

export const OnePassage: Story = {
  args: {
    paragraphs: [
      "Deimos becomes accessible after clearing War, Mars, and does not have a Junction.",
    ],
  },
};

export const OurPage: Story = {
  args: {
    paragraphs: ["Make sure you have an empty slot for this one."],
    link: <WikiLink href="/item?name=warframe-slot" label="How to get it" target="page" />,
  },
};

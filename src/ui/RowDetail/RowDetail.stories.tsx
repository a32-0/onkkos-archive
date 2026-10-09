import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WikiLink } from "../WikiLink/WikiLink";
import { RowDetail } from "./RowDetail";

const meta = {
  title: "Item/RowDetail",
  component: RowDetail,
  args: { text: "It drops at rotation C, 7.5% a run, so about 13 runs for an even chance." },
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
} satisfies Meta<typeof RowDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Reading: Story = {};

export const WithWiki: Story = {
  args: {
    text: "Uncommon. 11% intact and 20% radiant.",
    link: <WikiLink href="https://wiki.warframe.com/w/Axi_S21" label="Wiki" target="wiki" />,
  },
};

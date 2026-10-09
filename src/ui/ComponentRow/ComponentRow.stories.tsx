import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Divider } from "../Divider/Divider";
import { RowProse } from "../RowProse/RowProse";
import { SAMPLE_ART } from "../stories/art";
import { WikiLink } from "../WikiLink/WikiLink";
import { ComponentRow } from "./ComponentRow";

const meta = {
  title: "Item/ComponentRow",
  component: ComponentRow,
  args: {
    title: "Alloy Plate ×8,000",
    art: SAMPLE_ART[3],
    ticked: false,
    open: true,
    bodyId: "alloy-plate",
    onTick: () => {},
    onToggle: () => {},
    children: (
      <RowProse
        paragraphs={[
          "A common resource that can be found on Venus, Jupiter, Sedna, Ceres, Phobos, Pluto, and the Zariman Ten Zero.",
        ]}
        link={
          <WikiLink href="https://wiki.warframe.com/w/Alloy_Plate" label="Wiki" target="wiki" />
        }
      />
    ),
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
} satisfies Meta<typeof ComponentRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Collapsed: Story = { args: { open: false } };

export const Ticked: Story = { args: { ticked: true } };

export const UnderADivider: Story = {
  decorators: [
    (Story) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div style={{ margin: "0 calc(var(--space-6) * -1)" }}>
          <Divider label="Different locations" />
        </div>
        <Story />
      </div>
    ),
  ],
};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

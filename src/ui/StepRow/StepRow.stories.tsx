import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RowDetail } from "../RowDetail/RowDetail";
import { RowProse } from "../RowProse/RowProse";
import { SAMPLE_PART } from "../stories/art";
import { WikiLink } from "../WikiLink/WikiLink";
import { StepRow } from "./StepRow";

const wiki = <WikiLink href="https://wiki.warframe.com/w/Disruption" label="Wiki" target="wiki" />;

const meta = {
  title: "Item/StepRow",
  component: StepRow,
  args: {
    title: "Play Armatus",
    open: true,
    bodyId: "step-armatus",
    onToggle: () => {},
    children: (
      <RowProse
        paragraphs={[
          "At the start of the mission, there is a single terminal. Hacking this terminal will begin the objective as endless waves of enemies begin to spawn.",
          "In each round, four Conduits appear around the map, requiring keys to activate which are dropped by heavy units.",
        ]}
        link={wiki}
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
} satisfies Meta<typeof StepRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step: Story = {};

export const Collapsed: Story = { args: { open: false } };

export const WithArt: Story = {
  args: {
    title: "Blueprint",
    art: SAMPLE_PART,
    children: (
      <RowDetail
        text="It drops at rotation C, 7.5% a run, so about 13 runs for an even chance."
        link={wiki}
      />
    ),
  },
};

export const WithArtCollapsed: Story = {
  args: { title: "Blueprint", art: SAMPLE_PART, open: false },
};

export const Optional: Story = {
  args: {
    title: "Buy a Kavasa Kubrow Collar (Optional)",
    children: <RowDetail text="From the Kubrow Incubator in the Market." link={wiki} />,
  },
};

export const Best: Story = {
  args: {
    title: "Open Axi S21 Relic (Highest chance)",
    best: true,
    children: <RowDetail text="Uncommon. 11% intact and 20% radiant." link={wiki} />,
  },
};

export const Alternative: Story = {
  args: {
    title: "Or Axi S21 Relic",
    children: <RowDetail text="Uncommon. 11% intact and 20% radiant." link={wiki} />,
  },
};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RowDetail } from "../RowDetail/RowDetail";
import { StepRow } from "../StepRow/StepRow";
import { WikiLink } from "../WikiLink/WikiLink";
import { Timeline } from "./Timeline";

const wiki = <WikiLink href="https://wiki.warframe.com/w/Axi_S21" label="Wiki" target="wiki" />;

const row = (id: string, title: string, text: string, best?: boolean) => (
  <StepRow title={title} best={best} open bodyId={id} onToggle={() => {}}>
    <RowDetail text={text} link={wiki} />
  </StepRow>
);

const meta = {
  title: "Item/Timeline",
  component: Timeline,
  args: {
    steps: [
      {
        id: "mastery",
        content: row(
          "mastery-body",
          "Mastery Rank 8",
          "To increase Mastery Rank, you must earn Mastery Points through ranking weapons, warframes, companions, and vehicles.",
        ),
      },
      {
        id: "slot",
        content: row(
          "slot-body",
          "Warframe Slot",
          "Make sure you have an empty slot for this one.",
        ),
      },
      {
        id: "deimos",
        content: row(
          "deimos-body",
          "Reach Deimos",
          "Deimos becomes accessible after clearing War, Mars, and does not have a Junction.",
        ),
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-6)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: { config: { rules: [{ id: "link-in-text-block", enabled: false }] } },
  },
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Steps: Story = {};

export const StepAndAlternative: Story = {
  args: {
    steps: [
      {
        id: "best",
        content: row(
          "best-body",
          "Open Axi S21 Relic (Highest chance)",
          "Uncommon. 11% intact and 20% radiant.",
          true,
        ),
      },
      {
        id: "or",
        alternative: true,
        content: row("or-body", "Or Axi S21 Relic", "Uncommon. 11% intact and 20% radiant."),
      },
    ],
  },
};

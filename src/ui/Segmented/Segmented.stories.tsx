import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Segmented } from "./Segmented";

const SHOW = [
  { value: "mastered", label: "Mastered" },
  { value: "new", label: "New" },
] as const;

const VIEW = [
  { value: "summary", label: "Summary" },
  { value: "steps", label: "Step by step" },
] as const;

const meta = {
  title: "Fields/Segmented",
  component: Segmented,
  args: { label: "Show", options: SHOW, chosen: null, onChoose: () => {} },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Segmented>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoneChosen: Story = {};

export const MasteredChosen: Story = { args: { chosen: "mastered" } };

export const NewChosen: Story = { args: { chosen: "new" } };

export const SummaryChosen: Story = { args: { label: "View", options: VIEW, chosen: "summary" } };

export const StepByStepChosen: Story = { args: { label: "View", options: VIEW, chosen: "steps" } };

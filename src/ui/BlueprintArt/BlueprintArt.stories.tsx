import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_BLUEPRINT, SAMPLE_PART } from "../stories/art";
import { BlueprintArt } from "./BlueprintArt";

const meta = {
  title: "Item/BlueprintArt",
  component: BlueprintArt,
  args: { part: SAMPLE_PART, blueprint: SAMPLE_BLUEPRINT },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BlueprintArt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PartOverBlueprint: Story = {};

export const NoPartArt: Story = { args: { part: null } };

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { FilterChip } from "./FilterChip";

const meta = {
  title: "Controls/FilterChip",
  component: FilterChip,
  args: { label: "Mods", pressed: false, onToggle: fn() },
  decorators: [
    (Story) => (
      <div
        style={{ display: "flex", padding: "var(--space-7)", background: "var(--surface-card)" }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
  play: async ({ args, canvasElement }) => {
    const chip = within(canvasElement).getByRole("button", { name: "Mods" });
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    await expect(args.onToggle).toHaveBeenCalledOnce();
  },
};

export const On: Story = { args: { pressed: true } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

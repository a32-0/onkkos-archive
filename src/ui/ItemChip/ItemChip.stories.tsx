import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ItemChip } from "./ItemChip";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const DIMMED = { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } };

const meta = {
  title: "Lists/ItemChip",
  component: ItemChip,
  args: { label: "Lex", icon: ICON },
  decorators: [
    (Story) => (
      <ul style={{ display: "flex", margin: 0, padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof ItemChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Done: Story = {
  args: { label: "Hystrix ×1", state: "done" },
  parameters: DIMMED,
};

export const Linked: Story = { args: { href: "#" } };

export const LinkedDone: Story = {
  args: { label: "Hystrix ×1", state: "done", href: "#" },
  parameters: DIMMED,
};

export const More: Story = { args: { label: "+4", state: "more", name: "4 more" } };

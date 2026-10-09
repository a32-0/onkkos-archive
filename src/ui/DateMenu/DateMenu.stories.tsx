import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DateMenu } from "./DateMenu";

const MONTHS = [
  "October 2026",
  "September 2026",
  "August 2026",
  "July 2026",
  "June 2026",
  "May 2026",
].map((label, index) => ({ value: `2026-${String(10 - index).padStart(2, "0")}`, label }));

const meta = {
  title: "Fields/DateMenu",
  component: DateMenu,
  args: {
    label: "Date",
    heading: "Month you last played",
    months: MONTHS,
    open: false,
    menuId: "date-menu",
    onToggle: () => {},
    onChoose: () => {},
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: "calc(var(--space-8) * 11)",
          padding: "var(--space-6)",
          background: "var(--surface)",
        }}
      >
        <div style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DateMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { open: true } };

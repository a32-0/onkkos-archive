import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlaceOverview } from "./PlaceOverview";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const meta = {
  title: "Map/PlaceOverview",
  component: PlaceOverview,
  args: {
    orb: "#3f86e8",
    done: 12,
    readable: 21,
    count: "12/21",
    label: "Items mastered",
    progressLabel: "Items mastered on Earth",
    left: {
      caption: "Still to master here",
      kinds: [
        { name: "Warframes", icon: ICON, count: 2 },
        { name: "Primary", icon: ICON, count: 2 },
        { name: "Archgun", icon: null, symbol: "rocket-launch", count: 2 },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlaceOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Mastered: Story = {
  args: { done: 21, count: "21/21", left: undefined },
};

export const NothingYet: Story = {
  args: { done: 0, count: "0/21" },
};

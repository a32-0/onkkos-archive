import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { RankOverview } from "./RankOverview";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const meta = {
  title: "Map/RankOverview",
  component: RankOverview,
  args: {
    art: SAMPLE_ART[0],
    share: 0.92,
    figure: "92%",
    label: "Progress to Rank 9",
    progressLabel: "Progress to Rank 9",
    left: {
      caption: "Rank these to get there",
      chips: [
        { key: "Lex", label: "Lex", icon: ICON, state: "default" },
        { key: "Boltor", label: "Boltor", icon: ICON, state: "default" },
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
} satisfies Meta<typeof RankOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const ManyToRank: Story = {
  args: {
    left: {
      caption: "Rank these to get there",
      chips: [
        { key: "Lex", label: "Lex", icon: ICON, state: "default" },
        { key: "Boltor", label: "Boltor", icon: ICON, state: "default" },
        { key: "Paris", label: "Paris", icon: ICON, state: "default" },
        { key: "more", label: "+4", icon: null, state: "more", name: "4 more" },
      ],
    },
  },
};

export const NothingToRank: Story = {
  args: {
    left: undefined,
    empty: {
      icon: "military-tech",
      title: "Everything you own is at max rank",
      line: "Build something new or clear more of the Star Chart to keep going.",
    },
  },
};

export const TestReady: Story = {
  args: {
    share: 1,
    figure: "100%",
    left: undefined,
    empty: {
      icon: "military-tech",
      title: "Ready for the Rank 9 test",
      line: "Take it in the game. If you fail, you can try again after 24 hours.",
    },
  },
};

export const HighestRank: Story = {
  args: {
    share: 1,
    highest: true,
    figure: "100%",
    label: "The highest rank there is",
    left: undefined,
  },
};

export const InProfile: Story = {
  args: { label: "See the way to Rank 9", left: undefined, href: "/goals/rank" },
};

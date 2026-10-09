import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART } from "../stories/art";
import { UpdateList } from "../UpdateList/UpdateList";
import { FeaturedCard } from "./FeaturedCard";

const meta = {
  title: "Cards/FeaturedCard",
  component: FeaturedCard,
  args: {
    kind: "last-played",
    eyebrow: "You last played",
    name: "The Shadowgrapher",
    meta: "Update 42 · Mar, 2026",
    art: SAMPLE_ART[2],
    open: false,
    listId: "updates",
    onToggle: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeaturedCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LastPlayed: Story = {};

export const LastPlayedOpen: Story = {
  args: { open: true },
  decorators: [
    (Story) => (
      <>
        <Story />
        <UpdateList
          id="updates"
          onChoose={() => {}}
          items={[
            {
              value: "41.1",
              name: "Vauban Heirloom",
              meta: "Update 41.1 · Feb, 2026",
              art: SAMPLE_ART[0],
            },
            {
              value: "41",
              name: "The Old Peace",
              meta: "Update 41 · Dec, 2025",
              art: SAMPLE_ART[1],
            },
          ]}
        />
      </>
    ),
  ],
};

export const UpToDate: Story = {
  args: {
    kind: "up-to-date",
    eyebrow: "You're up to date",
    name: "Amir's Shockwave",
    meta: "Update 43.5 · Aug, 2026",
    art: SAMPLE_ART[0],
  },
};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

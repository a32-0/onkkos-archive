import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART, SAMPLE_ORB } from "../stories/art";
import { SuggestionRow } from "./SuggestionRow";

const meta = {
  title: "Lists/SuggestionRow",
  component: SuggestionRow,
  args: {
    id: "suggestion-0",
    name: "Ember",
    catalogue: "Warframe",
    art: SAMPLE_ART[4],
    active: false,
    onChoose: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <ul
          role="listbox"
          aria-label="Suggestions"
          style={{ margin: 0, padding: 0, listStyle: "none", background: "var(--surface)" }}
        >
          <Story />
        </ul>
      </div>
    ),
  ],
} satisfies Meta<typeof SuggestionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = { args: { active: true } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Place: Story = {
  args: { name: "Earth", catalogue: "Place", art: SAMPLE_ORB[0], round: true },
};

export const NoArt: Story = { args: { name: "Embolist", catalogue: "Secondary", art: null } };

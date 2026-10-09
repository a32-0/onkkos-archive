import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShowMore } from "../ShowMore/ShowMore";
import { SAMPLE_ART } from "../stories/art";
import { UpdateList, type UpdateListItem } from "./UpdateList";

const ITEMS: UpdateListItem[] = [
  { value: "41.1", name: "Vauban Heirloom", meta: "Update 41.1 · Feb, 2026", art: SAMPLE_ART[0] },
  { value: "41", name: "The Old Peace", meta: "Update 41 · Dec, 2025", art: SAMPLE_ART[1] },
  { value: "40", name: "The Vallis Undermind", meta: "Update 40 · Oct, 2025", art: SAMPLE_ART[2] },
  { value: "39.1a", name: "Caliban Prime", meta: "Update 39.1 · Mar, 2026", art: SAMPLE_ART[3] },
  { value: "39.1b", name: "Isleweaver", meta: "Update 39.1 · Mar, 2026", art: SAMPLE_ART[4] },
];

const meta = {
  title: "Cards/UpdateList",
  component: UpdateList,
  args: {
    id: "updates",
    items: ITEMS,
    onChoose: () => {},
    more: <ShowMore label="Show 23 older updates" />,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpdateList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithShowOlder: Story = {};

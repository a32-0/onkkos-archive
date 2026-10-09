import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ItemTile } from "../ItemTile/ItemTile";
import { SAMPLE_ART } from "../stories/art";
import { Rail } from "./Rail";

const tiles = [
  { name: "Koumei", reading: "~24 Runs · Rotation A", art: SAMPLE_ART[4] },
  { name: "Gyre", reading: "~6 Runs · Rotation C", art: SAMPLE_ART[0] },
  { name: "Cyte-09", reading: "~11 Runs · Rotation B", art: SAMPLE_ART[1] },
  { name: "Kullervo", reading: "~30 Runs · Rotation C", art: SAMPLE_ART[2] },
  { name: "Dagath", reading: "~9 Runs · Rotation A", art: SAMPLE_ART[3] },
];

const meta = {
  title: "Lists/Rail",
  component: Rail,
  args: {
    id: "warframes",
    label: "Warframes",
    children: tiles.map((tile) => (
      <ItemTile
        key={tile.name}
        href={`/item/${tile.name.toLowerCase()}`}
        name={tile.name}
        reading={tile.reading}
        place="Saya's Visions · Shrine Defense"
        art={tile.art}
      />
    )),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Rail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sideways: Story = {};

export const Grid: Story = { globals: { viewport: { value: "w1280", isRotated: false } } };

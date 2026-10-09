import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ItemTile } from "../ItemTile/ItemTile";
import { Rail } from "../Rail/Rail";
import { SAMPLE_ART } from "../stories/art";
import { GroupRow } from "./GroupRow";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const meta = {
  title: "Lists/GroupRow",
  component: GroupRow,
  args: {
    icon: ICON,
    name: "Warframes",
    count: "3 New",
    open: false,
    railId: "warframes",
    onToggle: () => {},
    children: (
      <Rail id="warframes" label="Warframes">
        <ItemTile
          href="/item/koumei"
          name="Koumei"
          reading="~24 Runs · Rotation A"
          place="Saya's Visions · Shrine Defense"
          art={SAMPLE_ART[4]}
        />
        <ItemTile
          href="/item/gyre"
          name="Gyre"
          reading="~6 Runs · Rotation C"
          place="Saya's Visions · Shrine Defense"
          art={SAMPLE_ART[0]}
          state={{ kind: "rank", label: "Rank 2/30" }}
        />
      </Rail>
    ),
  },
} satisfies Meta<typeof GroupRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { open: true } };

export const WithoutCount: Story = { args: { count: undefined } };

export const NoIcon: Story = { args: { icon: null } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

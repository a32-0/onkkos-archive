import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART, SAMPLE_ORB } from "../stories/art";
import { ResultList } from "./ResultList";

const meta = {
  title: "Lists/ResultList",
  component: ResultList,
  args: {
    label: "Results",
    items: [
      { value: "ember", name: "Ember", catalogue: "Warframe", art: SAMPLE_ART[4], href: "#" },
      { value: "emp", name: "EMP Aura", catalogue: "Mod", art: null, href: "#" },
      {
        value: "nidus",
        name: "Nidus",
        catalogue: "Warframe · Clear the Eris Junction, on Pluto",
        art: SAMPLE_ART[2],
        href: "#",
      },
      {
        value: "earth",
        name: "Earth",
        catalogue: "Place",
        art: SAMPLE_ORB[0],
        round: true,
        href: "#",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResultList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Results: Story = {};

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

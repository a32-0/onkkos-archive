import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ORB } from "../stories/art";
import { PlaceCrumb } from "./PlaceCrumb";

const meta = {
  title: "Item/PlaceCrumb",
  component: PlaceCrumb,
  args: {
    href: "/system?system=origin&place=deimos",
    label: "You're on",
    place: "Origin System > Deimos",
    art: SAMPLE_ORB[2],
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlaceCrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YoureOn: Story = {};

export const Dojo: Story = { args: { place: "Origin System > Dojo", art: SAMPLE_ORB[3] } };

export const NoArt: Story = { args: { art: null } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

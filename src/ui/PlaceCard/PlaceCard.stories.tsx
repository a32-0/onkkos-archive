import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlaceCard } from "./PlaceCard";

const meta = {
  title: "Lists/PlaceCard",
  component: PlaceCard,
  args: {
    system: "Origin",
    name: "Earth",
    orb: "#4a9eff",
    onOpen: () => {},
    items: { count: "12/21", label: "Items", word: "mastered" },
    progress: { value: 12, max: 21, label: "Items mastered on Earth" },
  },
} satisfies Meta<typeof PlaceCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Mastered: Story = {
  args: {
    items: { count: "21/21", label: "Items", word: "mastered" },
    mastered: "Mastered",
    progress: { value: 21, max: 21, label: "Items mastered on Earth" },
  },
};

export const NoColor: Story = { args: { orb: null } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

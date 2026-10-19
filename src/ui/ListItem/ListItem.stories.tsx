import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { List, ListEntry } from "../List/List";
import { ListItem } from "./ListItem";

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9"/></svg>`,
  );

const meta = {
  title: "Lists/ListItem",
  component: ListItem,
  args: { href: "/catch-up/warframes", icon: ICON, title: "Warframes" },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {};

export const WithBadge: Story = { args: { badge: "3 New" } };

export const WithSupporting: Story = { args: { supporting: "Three more to master here" } };

export const Symbol: Story = { args: { icon: null, symbol: "rocket-launch", title: "Archgun" } };

export const Grouped: Story = {
  render: (args) => (
    <List label="Arsenal">
      {["Warframes", "Weapons", "Companions", "Vehicles"].map((title) => (
        <ListEntry key={title}>
          <ListItem {...args} title={title} badge="3 New" />
        </ListEntry>
      ))}
    </List>
  ),
};

export const Single: Story = {
  render: (args) => (
    <List label="Arsenal">
      <ListEntry>
        <ListItem {...args} />
      </ListEntry>
    </List>
  ),
};

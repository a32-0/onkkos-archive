import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TabBar, type TabBarItem } from "./TabBar";

const tabs = (active: string): TabBarItem[] => [
  { href: "/system", icon: "explore", label: "Navigation", active: active === "/system" },
  { href: "/catch-up", icon: "hourglass", label: "Resume", active: active === "/catch-up" },
  { href: "/goals", icon: "flag", label: "Goal", active: active === "/goals" },
];

const meta = {
  title: "Chrome/TabBar",
  component: TabBar,
  args: { label: "Sections", placement: "bottom", items: tabs("/system") },
} satisfies Meta<typeof TabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NavigationActive: Story = {};

export const ResumeActive: Story = { args: { items: tabs("/catch-up") } };

export const GoalActive: Story = { args: { items: tabs("/goals") } };

export const InTheHeader: Story = {
  args: { placement: "header" },
  globals: { viewport: { value: "w1280", isRotated: false } },
};

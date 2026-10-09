import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type from "../type.module.css";
import { WikiLink } from "./WikiLink";

const meta = {
  title: "Atoms/WikiLink",
  component: WikiLink,
  decorators: [
    (Story) => (
      <p
        className={type.body}
        style={{
          margin: 0,
          padding: "var(--space-7) var(--gutter)",
          color: "var(--ink-muted)",
        }}
      >
        …at Armatus in Deimos. <Story />
      </p>
    ),
  ],
  parameters: {
    a11y: { config: { rules: [{ id: "link-in-text-block", enabled: false }] } },
  },
} satisfies Meta<typeof WikiLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wiki: Story = {
  args: { target: "wiki", label: "Wiki", href: "https://wiki.warframe.com/w/Armatus" },
};

export const OurPage: Story = { args: { target: "page", label: "How to get it", href: "/item" } };

export const Focus: Story = {
  args: Wiki.args,
  parameters: { pseudo: { focusVisible: true } },
};

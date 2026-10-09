import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GLYPHS, type IconName } from "./glyphs";
import { Icon, type IconSize } from "./Icon";

const NAMES = Object.keys(GLYPHS) as IconName[];

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  args: { name: "explore", size: 24 },
  argTypes: { name: { control: "select", options: NAMES } },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

const Every = ({ size }: { size: IconSize }) => (
  <div style={{ display: "flex", gap: "var(--space-7)", padding: "var(--space-7)" }}>
    {NAMES.map((name) => (
      <Icon key={name} name={name} size={size} label={name} />
    ))}
  </div>
);

export const Size24: Story = { render: () => <Every size={24} /> };

export const Size20: Story = { render: () => <Every size={20} /> };

export const Size16: Story = { render: () => <Every size={16} /> };

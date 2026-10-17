import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlayerChip } from "./PlayerChip";

const GLYPH =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12z" fill="#b33419"/></svg>`,
  );

const meta = {
  title: "Chrome/PlayerChip",
  component: PlayerChip,
  args: { name: "Cy", open: false },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          padding: "var(--space-6)",
          background: "var(--surface-header)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Focus: Story = { parameters: { pseudo: { focusVisible: true } } };

export const WithGlyph: Story = { args: { avatar: GLYPH } };

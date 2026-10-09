import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GameIcon } from "./GameIcon";

const ART =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><path d="M9 1l8 8-8 8-8-8z"/></svg>',
  );

const meta = {
  title: "Atoms/GameIcon",
  component: GameIcon,
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "center",
          padding: "var(--space-7)",
          fontFamily: "var(--font-cinzel)",
        }}
      >
        <Story />
        <span>Blueprints</span>
      </div>
    ),
  ],
} satisfies Meta<typeof GameIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithArt: Story = { args: { url: ART } };

export const WithoutArt: Story = { args: { url: null } };

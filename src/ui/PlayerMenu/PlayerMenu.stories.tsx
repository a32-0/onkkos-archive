import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { PlayerMenu } from "./PlayerMenu";

const meta = {
  title: "Chrome/PlayerMenu",
  component: PlayerMenu,
  args: {
    name: "00111000",
    rank: "Mastery Rank 27",
    rankTitle: "Middle Master",
    disconnect: <Button variant="danger">Disconnect</Button>,
    readCycle: [
      { text: "Data is read every " },
      { text: "12 hours", strong: true },
      { text: ". The last read was " },
      { text: "12 minutes ago,", strong: true },
      { text: " and the next one will be at " },
      { text: "15:30 hours UTC.", strong: true },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
  parameters: { a11y: { context: { exclude: ['[data-variant="danger"]'] } } },
} satisfies Meta<typeof PlayerMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDisconnect: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { PlayerMenu } from "../PlayerMenu/PlayerMenu";
import { Sheet } from "./Sheet";

const meta = {
  title: "Chrome/Sheet",
  component: Sheet,
  args: {
    label: "Player menu",
    wordmark: "Onkko's Archive",
    closeLabel: "Close",
    open: true,
    onClose: () => {},
    children: (
      <PlayerMenu
        name="00111000"
        rank="Mastery Rank 27"
        rankTitle="Middle Master"
        disconnect={<Button variant="danger">Disconnect</Button>}
        readCycle={[
          { text: "Data is read every " },
          { text: "12 hours", strong: true },
          { text: ". The last read was " },
          { text: "12 minutes ago,", strong: true },
          { text: " and the next one will be at " },
          { text: "15:30 hours UTC.", strong: true },
        ]}
      />
    ),
  },
  parameters: { a11y: { context: { exclude: ['[data-variant="danger"]'] } } },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullScreen: Story = {};

export const AnchoredPanel: Story = {
  globals: { viewport: { value: "w1280", isRotated: false } },
};

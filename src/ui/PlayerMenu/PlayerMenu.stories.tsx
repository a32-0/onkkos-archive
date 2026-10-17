import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { Segmented } from "../Segmented/Segmented";
import { PlayerMenu } from "./PlayerMenu";

const GLYPH =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12z" fill="#b33419"/></svg>`,
  );

const meta = {
  title: "Chrome/PlayerMenu",
  component: PlayerMenu,
  args: {
    name: "Cy",
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

export const WithSettings: Story = {
  args: {
    settingsLabel: "Settings",
    settings: [
      {
        label: "Language",
        control: (
          <Segmented
            label="Language"
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
            ]}
            chosen="en"
            onChoose={() => {}}
            disabled
          />
        ),
      },
      {
        label: "Onkko’s Phrases",
        control: (
          <Segmented
            label="Onkko’s Phrases"
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
            chosen="on"
            onChoose={() => {}}
          />
        ),
      },
      {
        label: "Tutorial",
        fill: true,
        control: (
          <Button variant="secondary" disabled>
            Reset
          </Button>
        ),
      },
    ],
  },
};

export const WithGlyph: Story = { args: { avatar: GLYPH } };

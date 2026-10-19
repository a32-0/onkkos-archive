import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { List, ListEntry } from "../List/List";
import { Segmented } from "../Segmented/Segmented";
import { ControlRow } from "./ControlRow";

const meta = {
  title: "Controls/ControlRow",
  component: ControlRow,
  args: {
    label: "View",
    children: (
      <Segmented
        label="View"
        options={[
          { value: "left", label: "To get" },
          { value: "mastered", label: "Mastered" },
          { value: "new", label: "New" },
        ]}
        chosen="left"
        onChoose={() => {}}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ControlRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const View: Story = {};

export const Settings: Story = {
  render: () => (
    <List label="Settings">
      <ListEntry>
        <ControlRow label="Onkko’s Phrases">
          <Segmented
            label="Onkko’s Phrases"
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
            chosen="on"
            onChoose={() => {}}
          />
        </ControlRow>
      </ListEntry>
      <ListEntry>
        <ControlRow label="Tutorial" fill>
          <Button variant="secondary" disabled>
            Reset
          </Button>
        </ControlRow>
      </ListEntry>
    </List>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../Button/Button";
import { SearchField } from "../SearchField/SearchField";
import { SearchCard } from "./SearchCard";

const meta = {
  title: "Cards/SearchCard",
  component: SearchCard,
  args: {
    title: "Choose a target",
    line: "Anything in the arsenal, any place on the chart.",
    children: (
      <>
        <SearchField label="Target" placeholder="A warframe, a weapon, or planet" />
        <Button>Continue</Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleLineFieldAndContinue: Story = {};

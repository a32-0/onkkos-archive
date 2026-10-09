import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ART, SAMPLE_ORB } from "../stories/art";
import { optionId, SuggestionList } from "../SuggestionList/SuggestionList";
import { SearchField } from "./SearchField";

const meta = {
  title: "Fields/SearchField",
  component: SearchField,
  args: {
    label: "Search",
    placeholder: "A warframe, a weapon, or planet",
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)", background: "var(--surface)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Typing: Story = { args: { value: "Em" }, parameters: { pseudo: { focus: true } } };

export const WithSuggestions: Story = {
  args: {
    value: "Em",
    listId: "goal-suggestions",
    "aria-activedescendant": optionId("goal-suggestions", 0),
    suggestions: (
      <SuggestionList
        id="goal-suggestions"
        label="Suggestions"
        active={0}
        empty="Nothing by that name."
        onChoose={() => {}}
        items={[
          { value: "ember", name: "Ember", catalogue: "Warframe", art: SAMPLE_ART[4] },
          { value: "ember-prime", name: "Ember Prime", catalogue: "Warframe", art: SAMPLE_ART[2] },
          { value: "earth", name: "Earth", catalogue: "Place", art: SAMPLE_ORB[0], round: true },
        ]}
      />
    ),
  },
  parameters: { pseudo: { focus: true } },
};

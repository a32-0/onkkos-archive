import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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
    suggestions: (
      <ul
        id="goal-suggestions"
        role="listbox"
        aria-label="Suggestions"
        style={{
          margin: 0,
          padding: "var(--space-5) var(--space-6)",
          listStyle: "none",
          background: "var(--surface)",
          border: "var(--border-1) solid var(--line-subtle)",
          borderRadius: "var(--radius-m)",
        }}
      >
        <li role="option" aria-selected="true">
          Ember
        </li>
      </ul>
    ),
  },
  parameters: { pseudo: { focus: true } },
};

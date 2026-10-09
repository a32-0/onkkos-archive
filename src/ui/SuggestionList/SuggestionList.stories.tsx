import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type KeyboardEvent, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { SearchField } from "../SearchField/SearchField";
import { SAMPLE_ART, SAMPLE_ORB } from "../stories/art";
import { nextActive, optionId, type Suggestion, SuggestionList } from "./SuggestionList";

const ITEMS: readonly Suggestion[] = [
  { value: "ember", name: "Ember", catalogue: "Warframe", art: SAMPLE_ART[4] },
  { value: "ember-prime", name: "Ember Prime", catalogue: "Warframe", art: SAMPLE_ART[2] },
  { value: "embolist", name: "Embolist", catalogue: "Secondary", art: SAMPLE_ART[1] },
  { value: "earth", name: "Earth", catalogue: "Place", art: SAMPLE_ORB[0], round: true },
];

const LIST = "goal-suggestions";

function Search({
  query,
  items,
  start,
  onChoose,
}: {
  query: string;
  items: readonly Suggestion[];
  start: number;
  onChoose: (value: string) => void;
}) {
  const [active, setActive] = useState(start);
  const [open, setOpen] = useState(true);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && active >= 0) {
      onChoose(items[active]!.value);
      return;
    }
    const next = nextActive(event.key, active, items.length);
    if (next === null) return;
    event.preventDefault();
    setOpen(true);
    setActive(next);
  };
  return (
    <SearchField
      label="Search a goal"
      value={query}
      readOnly
      listId={LIST}
      aria-activedescendant={open && active >= 0 ? optionId(LIST, active) : undefined}
      onKeyDown={onKeyDown}
      suggestions={
        open ? (
          <SuggestionList
            id={LIST}
            label="Suggestions"
            items={items}
            active={active}
            empty="Nothing by that name."
            onChoose={onChoose}
          />
        ) : undefined
      }
    />
  );
}

const meta = {
  title: "Lists/SuggestionList",
  component: Search,
  args: { query: "Em", items: ITEMS, start: 0, onChoose: fn() },
  decorators: [
    (Story) => (
      <div style={{ padding: "var(--space-7) var(--gutter)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Search>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Results: Story = { parameters: { pseudo: { focus: true } } };

export const NoMatch: Story = {
  args: { query: "Emberx", items: [], start: -1 },
  parameters: { pseudo: { focus: true } },
};

export const Keyboard: Story = {
  args: { start: -1 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute("aria-activedescendant", optionId(LIST, 0));
    await expect(canvas.getByRole("option", { name: /Ember Warframe/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(input).toHaveAttribute("aria-activedescendant", optionId(LIST, 2));
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveAttribute("aria-activedescendant", optionId(LIST, 1));
    await userEvent.keyboard("{Enter}");
    await expect(args.onChoose).toHaveBeenCalledWith("ember-prime");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).not.toHaveAttribute("aria-activedescendant");
  },
};
